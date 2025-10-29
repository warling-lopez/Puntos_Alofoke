import { Injectable } from '@nestjs/common';

@Injectable()
export class PuntosService {

    Obtener():string{
        return "Hola desde obtener"
    }
}
