import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { LiveChat } from 'youtube-chat';

@Injectable()
export class YoutubeChatService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(YoutubeChatService.name);
  private liveChat: any;
  private buffer: Array<any> = [];
  private intervalHandle: NodeJS.Timeout | null = null;
  private readonly windowMs = 2 * 60 * 1000; // 2 minutes
  private readonly outputFile = path.join(process.cwd(), 'superchats.json');
  private readonly videoId = process.env.YT_VIDEO_ID || 'lFnZPGwGttc';

  async onModuleInit(): Promise<void> {
    this.logger.log('Inicializando YoutubeChatService...');
    await this.start();
  }

  private async start() {
    try {
      // Usamos la importación estática de la librería (asegúrate de instalarla)
      this.liveChat = new LiveChat({ liveId: this.videoId });

      this.liveChat.on('start', () => {
        this.logger.log('✅ Conectado al chat en vivo de YouTube');
      });

      this.liveChat.on('chat', (chatItem: any) => {
        if (chatItem?.superchat) {
          const { author, superchat, message } = chatItem;

          const messageText =
            message
              ?.map((m: any) => {
                if (m.text) return m.text;
                if (m.emojiText) return m.emojiText;
                if (m.alt) return m.alt;
                return '';
              })
              .join('') || '(sin mensaje)';

          // Guardamos sólo lo que pediste: monto y mensaje (mensaje con emojis concatenados)
          const item = {
            amount: superchat?.amount || null,
            message: messageText,
          };

          this.buffer.push(item);
          this.logger.log(`💰 (${item.amount}): ${item.message}`);
        }
      });


      this.liveChat.on('error', (err: any) => {
        this.logger.error('❌ Error en liveChat', err?.message ?? err);
      });

      const ok = await this.liveChat.start();
      if (!ok) {
        this.logger.warn('LiveChat.start() devolvió false — revisa los errores emitidos.');
      }

      // Primer flush programado cada windowMs
      this.intervalHandle = setInterval(() => this.flush(), this.windowMs);
      this.logger.log(`YoutubeChatService: buffer window set to ${this.windowMs} ms`);
    } catch (err) {
      this.logger.error('No se pudo iniciar el LiveChat', err as any);
    }
  }

  private flush() {
    try {
      const payload = {
        updatedAt: new Date().toISOString(),
        items: this.buffer,
      };

      fs.writeFileSync(this.outputFile, JSON.stringify(payload, null, 2), 'utf-8');
      this.logger.log(`Wrote ${this.buffer.length} items to ${this.outputFile}`);

      // reset buffer for next window
      this.buffer = [];
    } catch (err) {
      this.logger.error('Error al escribir el JSON', err as any);
    }
  }

  /**
   * Devuelve una copia del buffer actual (no vacía el buffer).
   * Útil para endpoints que quieran mostrar en tiempo real lo recibido
   * aunque aún no se haya escrito en disco.
   */
  public  getSnapshot() {
    return {
      updatedAt: new Date().toISOString(),
      items: this.buffer.slice(),
    };
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Deteniendo YoutubeChatService...');
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }

    // Flush remaining messages
    if (this.buffer.length > 0) {
      this.flush();
    }

    try {
      if (this.liveChat && typeof this.liveChat.stop === 'function') {
        await this.liveChat.stop();
        this.logger.log('LiveChat stopped');
      }
    } catch (err) {
      this.logger.error('Error al detener LiveChat', err as any);
    }
  }
}
