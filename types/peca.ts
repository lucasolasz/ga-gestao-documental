export interface Peca {
    id: number;
    codigo: string;
    codigo_generico?: string;
    descricao: string;
    descricao_norm?: string;
    marca?: string;
    fabricante?: string;
    categoria?: string;
    grupo_similaridade?: string;
    aplicacao?: string;
    estoque?: number;
    preco_custo?: number;
    preco_venda?: number;
}
