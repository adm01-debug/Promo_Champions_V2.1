import { z } from 'zod';

export const leadSchema = z.object({
  nome: z.string().min(1),
  email: z.string().email().optional(),
  telefone: z.string().optional(),
  empresa: z.string().optional(),
  cargo: z.string().optional(),
  origem: z.enum(['site', 'indicacao', 'linkedin', 'evento', 'cold_call', 'outro']).optional(),
  status: z.enum(['novo', 'contatado', 'qualificado', 'proposta', 'negociacao', 'ganho', 'perdido']).default('novo'),
  valor_estimado: z.coerce.number().positive().optional(),
  responsavel_id: z.string().uuid().optional(),
});

export const oportunidadeSchema = z.object({
  titulo: z.string().min(1),
  lead_id: z.string().uuid().optional(),
  cliente_id: z.string().uuid().optional(),
  valor: z.coerce.number().positive(),
  probabilidade: z.coerce.number().min(0).max(100).default(50),
  data_fechamento_prevista: z.string().optional(),
  etapa: z.enum(['prospeccao', 'qualificacao', 'proposta', 'negociacao', 'fechamento']).default('prospeccao'),
  responsavel_id: z.string().uuid().optional(),
});

export const salesproImportTemplates = {
  leads: [
    { key: 'nome', label: 'Nome', example: 'João Silva' },
    { key: 'email', label: 'E-mail', example: 'joao@empresa.com' },
    { key: 'telefone', label: 'Telefone', example: '(11) 99999-9999' },
    { key: 'empresa', label: 'Empresa', example: 'Empresa LTDA' },
    { key: 'origem', label: 'Origem', example: 'site' },
  ],
  oportunidades: [
    { key: 'titulo', label: 'Título', example: 'Projeto X' },
    { key: 'valor', label: 'Valor', example: '50000.00' },
    { key: 'probabilidade', label: 'Probabilidade %', example: '70' },
    { key: 'etapa', label: 'Etapa', example: 'proposta' },
  ],
};

export const salesproFilterConfigs = {
  leads: [
    { key: 'status', label: 'Status', type: 'select' as const, options: [
      { value: 'novo', label: 'Novo' },
      { value: 'contatado', label: 'Contatado' },
      { value: 'qualificado', label: 'Qualificado' },
      { value: 'proposta', label: 'Proposta' },
      { value: 'ganho', label: 'Ganho' },
      { value: 'perdido', label: 'Perdido' },
    ]},
    { key: 'origem', label: 'Origem', type: 'select' as const, options: [
      { value: 'site', label: 'Site' },
      { value: 'indicacao', label: 'Indicação' },
      { value: 'linkedin', label: 'LinkedIn' },
      { value: 'evento', label: 'Evento' },
    ]},
  ],
  oportunidades: [
    { key: 'etapa', label: 'Etapa', type: 'select' as const, options: [
      { value: 'prospeccao', label: 'Prospecção' },
      { value: 'qualificacao', label: 'Qualificação' },
      { value: 'proposta', label: 'Proposta' },
      { value: 'negociacao', label: 'Negociação' },
      { value: 'fechamento', label: 'Fechamento' },
    ]},
  ],
};
