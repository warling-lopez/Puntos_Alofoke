import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';

@Injectable()
export class OpenaiService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OpenaiService.name);
  private readonly intervalMs = 1.5 * 60 * 1000; // 2 minutos
  private intervalHandle: NodeJS.Timeout | null = null;
  private readonly filePath = path.join(process.cwd(), 'superchats.json');
  private client: OpenAI | null = null;
  private lastSentAt = 0;
  private readonly lastSentFile = path.join(process.cwd(), 'openai-last-sent.json');
  private readonly analysisFile = path.join(process.cwd(), 'superchats-analysis.json');

  async onModuleInit(): Promise<void> {
    this.logger.log('Inicializando OpenAI service...');
    this.loadLastSentFromDisk();

    await this.runOnce().catch((err) => this.logger.error('runOnce error', err));

    this.intervalHandle = setInterval(() => {
      this.runOnce().catch((err) => this.logger.error('runOnce error', err));
    }, this.intervalMs);

    this.logger.log(`OpenAI polling configurado cada ${this.intervalMs} ms`);
  }

  private async runOnce(): Promise<void> {
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

      const fileText = fs.readFileSync(this.filePath, 'utf-8');

      const systemPrompt = `{
  "teams": [
    {"id":"TeamSaltamonte","name":"Carlos","description":"Carlos, El Saltamontes","keywords":["saltamonte","saltamontes","carlos"]},
    {"id":"TeamJLexis","name":"J Lexis","description":"J Lexis, El Nene de Puerto Rico","keywords":["jlexis","jlexi","jlaxis","j alexis","nene","los nenes"]},
    {"id":"TeamFlores","name":"Michael Flores","description":"Michael Flores","keywords":["flores","michael","maicol","maikel","los boris"]},
    {"id":"TeamFruta","name":"La Fruta","description":"La Fruta","keywords":["fruta","la fruta"]},
    {"id":"TeamPollito","name":"Pollito Tropical","description":"Pollito Tropical","keywords":["pollito","pollo","pollito tropical"]},
    {"id":"TeamGrace","name":"Grace Bon","description":"Grace Bon","keywords":["grace","gracie","panama"]},
    {"id":"TeamPerversa","name":"La Perversa","description":"La Perversa (Gigi)","keywords":["perversa","perve","gigi"]},
    {"id":"TeamInsuperable","name":"La Insuperable","description":"La Insuperable","keywords":["insuperable","la insu"]},
    {"id":"TeamDiosa","name":"Diosa Canales","description":"Diosa Canales","keywords":["diosa","diosa canales","danii","dani"]},
    {"id":"TeamPichardo","name":"Pichardo","description":"Pichardo","keywords":["pichardo"]},
    {"id":"TeamShadow","name":"Shadow Blow","description":"Shadow Blow","keywords":["shadow","shadow blow"]},
    {"id":"TeamJD","name":"JD","description":"JD (Con Su Flow)","keywords":["jd","jd con su flow"]},
    {"id":"TeamDianabel","name":"Dianabel Gómez","description":"Dianabel Gómez","keywords":["dianabel","anabel"]},
    {"id":"TeamPepita","name":"Cara de Pepita","description":"Cara de Pepita","keywords":["pepita","care pepita","cara de pepita"]},
    {"id":"TeamAlo","name":"Capitán Alo","description":"Capitán Alo","keywords":["alo","capitán alo","captain alo"]},
    {"id":"TeamNola","name":"Mami Nola","description":"Mami Nola","keywords":["nola","mami nola"]},
    {"id":"TeamPapotico","name":"Papotico","description":"Papotico","keywords":["papotico"]}
  ],
  "rules": [
    "Identifica para cada mensaje qué equipo(s) se mencionan usando coincidencias por keywords (case-insensitive).",
    "Extrae el monto donado (símbolos: $, COP, DOP, ARS, PEN, EUR, MXN, CHF, etc.).",
    "Convierte montos a puntos: 1 USD = 1 punto. Factores por defecto: DOP->0.017, COP->0.00025, MXN->0.056, EUR->1.0, ARS->0.006. Si no se identifica moneda, asumir USD.",
    "Si aparecen N equipos en un mensaje, divide los puntos equitativamente entre ellos (decimales permitidos).",
    "Acumula puntos por equipo (no repitas equipos en salida).",
    "Normaliza equipos usando el campo 'id' y devuelve también 'name'.",
    "Responde SOLO con un JSON válido y NADA más (sin texto explicativo ni fences).",
    "Redondea 'points' a 2 decimales en la salida."
  ]
  ,
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
            "id": { "type": "string" },
            "name": { "type": "string" },
            "points": { "type": "number" }
          },
          "required": ["id", "name", "points"]
        }
      }
    },
    "required": ["results"]
  },
  "example_output": {
    "results": [
      {"id":"TeamFruta","name":"La Fruta","points":47.24},
      {"id":"TeamSaltamonte","name":"Carlos","points":10.5}
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
        max_tokens: 1200,
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
    } catch (err) {
      this.logger.error('Error en runOnce de OpenaiService', err as any);
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
   * Normaliza la respuesta parseada del modelo a un arreglo de objetos {id,name,points}.
   * Maneja varias formas comunes que el modelo puede devolver (array, objeto con key-values,
   * propiedades 'teams' o 'response'). Devuelve puntos redondeados a 2 decimales y suma
   * duplicados por 'id'.
   */
  private normalizeParsedResult(parsed: any): Array<{ id: string; name: string; points: number }> {
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
          arr.push({ id: v.id ?? k, name: v.name ?? v.team ?? k, points: v.points ?? v.score ?? v.value ?? 0 });
        } else {
          // primitive value (number)
          arr.push({ id: k, name: k, points: v });
        }
      }
      items = arr;
    }

    if (!Array.isArray(items)) return [];

    const out: Array<{ id: string; name: string; points: number }> = [];
    for (const it of items) {
      if (!it) continue;
      const id = it.id ?? it.team ?? it[0] ?? null;
      const name = it.name ?? it.teamName ?? id ?? 'unknown';
      let points: any = it.points ?? it.score ?? it.value ?? it.puntos ?? 0;

      if (typeof points === 'string') {
        // try to extract first numeric occurrence
        const m = points.match(/-?\d+[\.,]?\d*/);
        if (m) {
          points = m[0].replace(',', '.');
        }
      }

      points = Number(points);
      if (isNaN(points)) points = 0;

      if (!id) continue; // skip entries without id

      // round to 2 decimals
      points = Math.round(points * 100) / 100;

      out.push({ id: String(id), name: String(name), points });
    }

    // Accumulate duplicates by id
    const map: Record<string, { id: string; name: string; points: number }> = {};
    for (const o of out) {
      if (!map[o.id]) map[o.id] = { ...o };
      else map[o.id].points = Math.round((map[o.id].points + o.points) * 100) / 100;
    }

    return Object.values(map);
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
}
