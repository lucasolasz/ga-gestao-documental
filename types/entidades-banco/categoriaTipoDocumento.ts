import { Categoria } from './categoria';
import { TipoDocumento } from './tipoDocumento';

export interface CategoriaTipoDocumento {
    categoria: Categoria;
    tipo_documento: TipoDocumento;
    created_at?: string;
}
