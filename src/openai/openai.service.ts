import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';

@Injectable()
export class OpenaiService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OpenaiService.name);
  // Ejecutar cada 5 minutos para leer el archivo que escribe YoutubeChatService
  private readonly intervalMs = 2 * 60 * 1000; // 5 minutos
  private intervalHandle: NodeJS.Timeout | null = null;
  private readonly filePath = path.join(process.cwd(), 'superchats.json');
  private client: OpenAI | null = null;
  private lastSentAt = 0;
  private readonly lastSentFile = path.join(process.cwd(), 'openai-last-sent.json');
  private readonly analysisFile = path.join(process.cwd(), 'superchats-analysis.json');

  async onModuleInit(): Promise<void> {
    this.logger.log('Inicializando OpenAI service...');
    this.loadLastSentFromDisk();

    // Esperar 15 segundos antes del primer runOnce para dar tiempo a que
    // YoutubeChatService haga su primer flush (que ocurre a los 2 minutos de inicio)
    setTimeout(() => {
      this.runOnce().catch((err) => this.logger.error('runOnce error', err));
    }, 15000);

    this.intervalHandle = setInterval(() => {
      this.runOnce().catch((err) => this.logger.error('runOnce error', err));
    }, this.intervalMs);

    this.logger.log(`OpenAI polling configurado cada ${this.intervalMs} ms (inicio diferido 15s)`);
  }

  private async runOnce(): Promise<void> {
    const lockFile = path.join(process.cwd(), 'superchats.lock');
    
    try {
      if (!process.env.OPENAI_API_KEY) {
        this.logger.warn('OPENAI_API_KEY no configurada — omitiendo llamada a OpenAI');
        return;
      }

      if (!fs.existsSync(this.filePath)) {
        this.logger.warn(`${this.filePath} no existe — esperando al siguiente ciclo`);
        return;
      }

      // Verificar cambios en el archivo
      const stat = fs.statSync(this.filePath);
      const mtime = stat.mtimeMs || 0;
      if (mtime <= this.lastSentAt) {
        this.logger.log('No hay cambios en superchats.json desde el último envío');
        return;
      }

      // Crear lock file para indicar que estamos leyendo/procesando
      fs.writeFileSync(lockFile, JSON.stringify({ pid: process.pid, timestamp: Date.now() }), 'utf-8');
      this.logger.log('🔒 Lock adquirido para leer superchats.json');

      const fileText = fs.readFileSync(this.filePath, 'utf-8');

      const systemPrompt = `{
  "teams": [
    {"id":"TeamSaltamonte","name":"Carlos","description":"Carlos, El Saltamontes","keywords":["saltamonte","saltamontes","carlos","montesquieu","montesquie","montecruz","montecris","carlos el saltamontes","sensei","maestro","loco","onvee"]},
    {"id":"TeamJLexis","name":"J Lexis","description":"J Lexis, El Nene de Puerto Rico","keywords":["jlexis","jlexi","jlaxis","j alexis","nene","los nenes","el nene","jalexis","jalexi","jalaxis","jhalexis","nenes de pr","nenes pr","elnene"]},
    {"id":"TeamFlores","name":"Michael Flores","description":"Michael Flores","keywords":["flores","michael","maicol","maikel","los boris","bori","boris","michael flores","maikel flores","helicopter","bestia","maikol"]},
    {"id":"TeamFruta","name":"La Fruta","description":"La Fruta","keywords":["fruta","la fruta","frutas","fruits","frutaa","piraña","piranha","no te tire","pariguayo"]},
    {"id":"TeamPollito","name":"Pollito Tropical","description":"Pollito Tropical","keywords":["pollito","pollo","pollito tropical","polli","pollio","patria y vida","cuba libre"]},
    {"id":"TeamGrace","name":"Grace Bon","description":"Grace Bon","keywords":["grace","gracie","panama","gracie bon","grace bon","grecie","greicy","greisi","boom","bum"]},
    {"id":"TeamPerversa","name":"La Perversa","description":"La Perversa (Gigi)","keywords":["perversa","perve","gigi","la perversa","perver","perverza","perve perve"]},
    {"id":"TeamInsuperable","name":"La Insuperable","description":"La Insuperable","keywords":["insuperable","la insu","insu","luna","la luna","team luna"]},
    {"id":"TeamDiosa","name":"Diosa Canales","description":"Diosa Canales","keywords":["diosa","diosa canales","danii","dani","daniii","dany","venezuela","vzla"]},
    {"id":"TeamPichardo","name":"Pichardo","description":"Pichardo","keywords":["pichardo","pichardo pichardo"]},
    {"id":"TeamShadow","name":"Shadow Blow","description":"Shadow Blow","keywords":["shadow","shadow blow"]},
    {"id":"TeamJD","name":"JD","description":"JD (Con Su Flow)","keywords":["jd","jd con su flow","con su flow","flow","psicologo","psicólogo"]},
    {"id":"TeamDianabel","name":"Dianabel Gómez","description":"Dianabel Gómez","keywords":["dianabel","anabel","dianabel gomez","diana","dianabel gómez","barranco","downsbel"]},
    {"id":"TeamPepita","name":"Cara de Pepita","description":"Cara de Pepita","keywords":["pepita","care pepita","cara de pepita","carepepita","caradepepita","cara pepita","soledad"]},
    {"id":"TeamAlo","name":"Capitán Alo","description":"Capitán Alo","keywords":["alo","capitán alo","captain alo","capitan alo","alo alo"]},
    {"id":"TeamNola","name":"Mami Nola","description":"Mami Nola","keywords":["nola","mami nola","maminola","mami nolas"]},
    {"id":"TeamPapotico","name":"Papotico","description":"Papotico","keywords":["papotico","papoticoico","papo tico","estervido"]}
  ],
  "rules": [
    "Identifica para cada mensaje qué equipo(s) se mencionan usando coincidencias por keywords (case-insensitive).",
    "Extrae el monto donado y su moneda (símbolos: $, COP, DOP, ARS, PEN, EUR, MXN, CHF, USD, etc.).",
    "NO conviertas el monto a puntos. Devuelve el monto original y el tipo de moneda identificado.",
    "Si no se identifica moneda claramente, asumir USD.",
    "Si aparecen N equipos en un mensaje, divide el monto equitativamente entre ellos (decimales permitidos).",
    "NO acumules ni sumes montos. Devuelve cada asignación por mensaje individual.",
    "Normaliza equipos usando el campo 'id' y devuelve también 'name'.",
    "Responde SOLO con un JSON válido y NADA más (sin texto explicativo ni fences).",
    "Redondea 'amount' a 2 decimales en la salida."
  ],
  "output_schema": {
    "description": "Estructura exacta que debe devolver la respuesta del modelo",
    "type": "object",
    "properties": {
      "updatedAt": { "type": "string", "format": "date-time" },
      "model": { "type": "string" },
      "results": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "messageId": { "type": "string", "description": "ID o referencia del mensaje original" },
            "id": { "type": "string" },
            "name": { "type": "string" },
            "amount": { "type": "number" },
            "currency": { "type": "string" }
          },
          "required": ["id", "name", "amount", "currency"]
        }
      }
    },
    "required": ["results"]
  },
  "example_output": {
    "results": [
      {"messageId":"msg_001","id":"TeamFruta","name":"La Fruta","amount":50.00,"currency":"USD"},
      {"messageId":"msg_002","id":"TeamSaltamonte","name":"Carlos","amount":500.00,"currency":"DOP"},
      {"messageId":"msg_003","id":"TeamFruta","name":"La Fruta","amount":25000.00,"currency":"COP"}
    ]
  }
}`;

      const userPrompt = fileText;

      this.logger.log('Enviando superchats.json a OpenAI...');

      if (!this.client) {
        this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      }

      const res = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      });

      const content = res.choices?.[0]?.message?.content;
      if (!content) {
        this.logger.warn('OpenAI devolvió respuesta vacía');
        return;
      }

      this.logger.log('Respuesta cruda de OpenAI:');
      this.logger.log(content);

      const cleaned = this.sanitizeModelOutput(content);
      let parsedResult: any = null;

      try {
        parsedResult = JSON.parse(cleaned);
      } catch (err) {
        // Intentar extraer JSON balanceado (objeto o array) e intentar parsearlo
        try {
          const maybeJson = this.extractBalancedJson(cleaned);
          parsedResult = JSON.parse(maybeJson);
        } catch (err2) {
          this.logger.warn('No se pudo parsear la respuesta como JSON');
        }
      }

      if (parsedResult) {
        // Normalizar a formato solicitado: [{ id, name, points }, ...]
        const normalized = this.normalizeParsedResult(parsedResult);
        const payload = {
          updatedAt: new Date().toISOString(),
          model: 'gpt-4o-mini',
          results: normalized,
        };
        fs.writeFileSync(this.analysisFile, JSON.stringify(payload, null, 2), 'utf-8');
        this.logger.log(`✅ Respuesta guardada en ${this.analysisFile}`);
        this.logger.log('Formato guardado (primeros items):');
        this.logger.log(JSON.stringify(normalized.slice(0, 5), null, 2));
      }

      // Actualizar marca de tiempo
      const mtime2 = stat.mtimeMs || Date.now();
      this.lastSentAt = mtime2;
      this.saveLastSentToDisk();
      this.logger.log(`Último envío: ${new Date(this.lastSentAt).toISOString()}`);
      
      // Liberar lock
      try {
        if (fs.existsSync(lockFile)) {
          fs.unlinkSync(lockFile);
          this.logger.log('🔓 Lock liberado');
        }
      } catch (unlockErr) {
        this.logger.warn('No se pudo eliminar lock file', unlockErr);
      }
    } catch (err) {
      this.logger.error('Error en runOnce de OpenaiService', err as any);
      
      // Asegurar que liberamos el lock incluso si hay error
      try {
        if (fs.existsSync(lockFile)) {
          fs.unlinkSync(lockFile);
          this.logger.log('🔓 Lock liberado (después de error)');
        }
      } catch (unlockErr) {
        // ignorar
      }
    }
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Deteniendo OpenAI service...');
    if (this.intervalHandle) clearInterval(this.intervalHandle);
  }

  private sanitizeModelOutput(s: string): string {
    if (!s) return s;
    return s
      .replace(/```(?:json)?/gi, '')
      .replace(/```/g, '')
      .replace(/\uFFFD/g, '')
      .replace(/^json\s*/i, '')
      .trim();
  }

  /**
   * Normaliza la respuesta parseada del modelo a un arreglo de objetos
   * { messageId?, id, name, amount, currency }.
   * Maneja varias formas comunes que el modelo puede devolver (array,
   * objeto con key-values, propiedades 'results'/'response'/'teams').
   * NO acumula montos — devuelve una entrada por asignación (por mensaje).
   */
  private normalizeParsedResult(parsed: any): Array<{ messageId?: string; id: string; name: string; amount: number; currency: string }> {
    if (!parsed) return [];

    // Detect common containers (prefer explicit 'results' returned by the model)
    let items: any = parsed;
    if (Array.isArray(parsed)) items = parsed;
    else if (parsed.results && Array.isArray(parsed.results)) items = parsed.results;
    else if (parsed.response && Array.isArray(parsed.response)) items = parsed.response;
    else if (parsed.teams && Array.isArray(parsed.teams)) items = parsed.teams;

    // If it's an object (not array), convert to array of entries
    if (!Array.isArray(items) && typeof items === 'object') {
      const arr: any[] = [];
      for (const k of Object.keys(items)) {
        const v = items[k];
        if (v && typeof v === 'object') {
          arr.push({
            messageId: v.messageId ?? v.msgId ?? k,
            id: v.id ?? k,
            name: v.name ?? v.team ?? k,
            amount: v.amount ?? v.value ?? v.points ?? 0,
            currency: v.currency ?? v.cur ?? 'USD',
          });
        } else {
          // primitive value (number)
          arr.push({ messageId: k, id: k, name: k, amount: v, currency: 'USD' });
        }
      }
      items = arr;
    }

    if (!Array.isArray(items)) return [];

    const out: Array<{ messageId?: string; id: string; name: string; amount: number; currency: string }> = [];
    for (const it of items) {
      if (!it) continue;
      const messageId = it.messageId ?? it.msgId ?? null;
      const id = it.id ?? it.team ?? null;
      const name = it.name ?? it.teamName ?? id ?? 'unknown';
      let amount: any = it.amount ?? it.value ?? it.points ?? it.puntos ?? 0;
      let currency: any = it.currency ?? it.cur ?? 'USD';

      if (typeof amount === 'string') {
        // try to extract first numeric occurrence
        const m = amount.match(/-?\d+[\.,]?\d*/);
        if (m) amount = m[0].replace(',', '.');
      }

      amount = Number(amount);
      if (isNaN(amount)) amount = 0;

      if (!id) continue; // skip entries without id

      // round to 2 decimals
      amount = Math.round(amount * 100) / 100;
      currency = String(currency).toUpperCase();

      out.push({ messageId: messageId ?? undefined, id: String(id), name: String(name), amount, currency });
    }

    // NO acumulamos montos aquí; devolvemos cada asignación por mensaje
    return out;
  }

  /**
   * Extrae el primer JSON balanceado (objeto o array) del texto s.
   * Intenta respetar strings y escapes. Si no encuentra cierre completo, intenta añadir cierres faltantes.
   */
  private extractBalancedJson(s: string): string {
    if (!s) return s;
    const firstBrace = s.search(/[\[{]/);
    if (firstBrace === -1) return s;
    const opening = s[firstBrace];
    const pairs: Record<string, string> = { '{': '}', '[': ']' };
    const closingChar = pairs[opening];

    const stack: string[] = [];
    let inString = false;
    let escape = false;
    let i = firstBrace;
    for (; i < s.length; i++) {
      const ch = s[i];
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === '\\') {
        escape = true;
        continue;
      }
      if (ch === '"') {
        inString = !inString;
        continue;
      }
      if (inString) continue;
      if (ch === '{' || ch === '[') {
        stack.push(ch);
      } else if (ch === '}' || ch === ']') {
        if (stack.length === 0) {
          // unmatched closing, ignore
          continue;
        }
        const last = stack[stack.length - 1];
        if ((last === '{' && ch === '}') || (last === '[' && ch === ']')) {
          stack.pop();
          if (stack.length === 0) {
            // balanced found from firstBrace to i
            return s.slice(firstBrace, i + 1);
          }
        } else {
          // mismatched, pop anyway
          stack.pop();
        }
      }
    }

    // If we reach here, we didn't find a full balance. Try to close what we have.
    if (stack.length > 0) {
      const closers = stack.reverse().map((op) => pairs[op]).join('');
      return s.slice(firstBrace) + closers;
    }
    return s.slice(firstBrace);
  }

  private loadLastSentFromDisk() {
    try {
      if (!fs.existsSync(this.lastSentFile)) return;
      const txt = fs.readFileSync(this.lastSentFile, 'utf-8');
      const parsed = JSON.parse(txt);
      this.lastSentAt = Number(parsed?.lastSentAt) || 0;
      this.logger.log(`openai-last-sent cargado: ${new Date(this.lastSentAt).toISOString()}`);
    } catch (err) {
      this.logger.debug('No se pudo cargar openai-last-sent.json', (err as any)?.message ?? err);
    }
  }

  private saveLastSentToDisk() {
    try {
      fs.writeFileSync(this.lastSentFile, JSON.stringify({ lastSentAt: this.lastSentAt }, null, 2), 'utf-8');
    } catch (err) {
      this.logger.debug('No se pudo escribir openai-last-sent.json', (err as any)?.message ?? err);
    }
  }

  /**
   * Método público para leer y devolver el contenido actual de superchats-analysis.json
   * Útil para endpoints que expongan los resultados del análisis de OpenAI.
   */
  public getAnalysis(): any {
    try {
      if (!fs.existsSync(this.analysisFile)) {
        return {
          error: 'Analysis file not found',
          message: 'No analysis has been generated yet. Wait for the first processing cycle.',
        };
      }

      const content = fs.readFileSync(this.analysisFile, 'utf-8');
      const parsed = JSON.parse(content);
      return parsed;
    } catch (err) {
      this.logger.error('Error al leer superchats-analysis.json', err as any);
      return {
        error: 'Failed to read analysis file',
        message: (err as any)?.message ?? 'Unknown error',
      };
    }
  }
}
