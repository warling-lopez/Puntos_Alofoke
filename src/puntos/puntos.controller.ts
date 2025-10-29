import { Controller, Get } from '@nestjs/common';
import { PuntosService } from './puntos.service';
import * as fs from 'fs';
import * as path from 'path';
import { YoutubeChatService } from './youtube-chat.service';

@Controller('puntos')
export class PuntosController {

    constructor(
        private readonly PuntoService: PuntosService,
        private readonly youtubeChatService: YoutubeChatService,
    ){}

    @Get()
    hello(): string{
        return this.PuntoService.Obtener()
    }

    @Get('superchats')
    async getSuperchats(): Promise<any>{
        const file = path.join(process.cwd(), 'superchats.json');
        if (fs.existsSync(file)){
            const raw = fs.readFileSync(file, 'utf-8');
            try{
                return JSON.parse(raw);
            }catch{
                return { raw };
            }
        }

        // Fallback: devolver el snapshot en memoria si el servicio está activo
        if (this.youtubeChatService && typeof this.youtubeChatService.getSnapshot === 'function'){
            return this.youtubeChatService.getSnapshot();
        }

        return { items: [] };
    }

}
