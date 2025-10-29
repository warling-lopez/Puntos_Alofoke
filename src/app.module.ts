import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PuntosController } from './puntos/puntos.controller';
import { PuntosService } from './puntos/puntos.service';
import { YoutubeChatService } from './puntos/youtube-chat.service';
import { OpenaiService } from './openai/openai.service';

@Module({
  imports: [],
  controllers: [AppController, PuntosController],
  providers: [AppService, PuntosService, YoutubeChatService, OpenaiService],
})
export class AppModule {}
