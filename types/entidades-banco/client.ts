import { Categoria } from './categoria';

export interface Client {
    id: string;
    nome: string;
    cnpj: string;
    telefone?: string;
    drive_folder_id?: string;
    categoria?: Categoria;
    created_at?: string;
    updated_at?: string;
}
