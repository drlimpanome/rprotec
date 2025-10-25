import { FormField } from '@/types/stepper.types';

import { classification, diligences, physicalDelivery, processing } from './constants';

export const NewJudicialDiligence: FormField[] = [
  {
    type: 'select',
    size: 4,
    label: 'TIPO DE DILIGÊNCIA',
    required: true,
    options: diligences.map((x, index) => ({ value: `0${index + 1}`, label: x })),
    dbColumn: 'diligencetype',
  },
  {
    type: 'text',
    size: 4,
    label: 'VARA/COMPETÊNCIA',
    required: true,
    dbColumn: 'competence',
  },
  {
    type: 'date',
    size: 4,
    label: 'DATA LIMITE',
    required: true,
    dbColumn: 'deadline',
  },
  {
    type: 'select',
    size: 4,
    label: 'TRAMITAÇÃO',
    required: true,
    options: processing.map((x, index) => ({ label: x, value: `0${index + 1}` })),
    dbColumn: 'processing',
  },
  {
    type: 'select',
    size: 2,
    label: 'ENTREGA FÍSICA',
    required: true,
    options: physicalDelivery.map((x, index) => ({ label: x, value: `0${index + 1}` })),
    dbColumn: 'physicaldelivery',
  },
  {
    type: 'select',
    size: 2,
    label: 'Tipo de Processo',
    required: true,
    options: [
      { label: 'Processo Principal', value: 'Processo Principal' },
      { label: 'Processo incidental', value: 'Processo incidental' },
    ],
    dbColumn: 'type',
  },
  {
    type: 'select',
    size: 4,
    label: 'Solicitar Certidão',
    required: false,
    options: [
      { label: 'Sim', value: 'sim' },
      { label: 'Não', value: 'nao' },
    ],
    dbColumn: 'requestcertificate',
  },
  {
    type: 'text',
    size: 12,
    label: 'DESCRIÇÃO',
    required: true,
    dbColumn: 'textrequest',
  },
];

export const NewExtraJudicialDiligence: FormField[] = [
  {
    type: 'select',
    size: 8,
    label: 'TIPO DE DILIGÊNCIA',
    required: true,
    options: diligences.map((x, index) => ({ value: `0${index + 1}`, label: x })),
    dbColumn: 'diligencetype',
  },
  {
    type: 'date',
    size: 4,
    label: 'DATA LIMITE',
    required: true,
    dbColumn: 'deadline',
  },
  {
    type: 'select',
    size: 4,
    label: 'TRAMITAÇÃO',
    required: true,
    options: processing.map((x, index) => ({ label: x, value: `0${index + 1}` })),
    dbColumn: 'processing',
  },
  {
    type: 'select',
    size: 4,
    label: 'ENTREGA FÍSICA',
    required: true,
    options: physicalDelivery.map((x, index) => ({ label: x, value: `0${index + 1}` })),
    dbColumn: 'physicaldelivery',
  },
  {
    type: 'select',
    size: 4,
    label: 'Solicitar Certidão',
    required: false,
    options: [
      { label: 'Sim', value: 'sim' },
      { label: 'Não', value: 'nao' },
    ],
    dbColumn: 'requestcertificate',
  },
  {
    type: 'text',
    size: 12,
    label: 'DESCRIÇÃO',
    required: true,
    dbColumn: 'textrequest',
  },
];

export const NewJudicialAudience: FormField[] = [
  {
    type: 'select',
    size: 6,
    label: 'TIPO',
    required: true,
    options: classification.map(({ nome }, index) => ({ label: nome, value: `0${index + 1}` })),
    dbColumn: 'diligencetype',
  },
  {
    type: 'text',
    size: 3,
    label: 'VARA/COMPETÊNCIA',
    required: true,
    dbColumn: 'competence',
  },
  {
    type: 'mask',
    mask: 'time',
    size: 3,
    label: 'HORÁRIO DA AUDIENCIA',
    required: true,
    dbColumn: 'period',
  },
  {
    type: 'text',
    size: 6,
    label: 'ALÇADA PRA ACORDO',
    required: false,
    dbColumn: 'agreement',
  },
  {
    type: 'select',
    size: 6,
    label: 'TRAMITAÇÃO',
    required: false,
    options: processing.map((x, index) => ({ label: x, value: `0${index + 1}` })),
    dbColumn: 'processing',
  },
  {
    type: 'select',
    size: 6,
    label: 'GERAR DILIGÊNCIA DE PREPOSTO',
    required: true,
    options: physicalDelivery.map((x, index) => ({ label: x, value: `0${index + 1}` })),
    dbColumn: 'physicaldelivery',
  },
  {
    type: 'date',
    size: 6,
    label: 'DATA',
    required: true,
    dbColumn: 'audiencedate',
  },
  {
    type: 'text',
    size: 12,
    label: 'DESCRIÇÃO',
    required: true,
    dbColumn: 'textrequest',
  },
];

export const NewExtraJudicialAudience: FormField[] = [
  {
    type: 'text',
    size: 6,
    label: 'ALÇADA PRA ACORDO',
    required: false,
    dbColumn: 'agreement',
  },
  {
    type: 'select',
    size: 6,
    label: 'TRAMITAÇÃO',
    required: false,
    options: processing.map((x, index) => ({ label: x, value: `0${index + 1}` })),
    dbColumn: 'processing',
  },
  {
    type: 'select',
    size: 6,
    label: 'GERAR DILIGÊNCIA DE PREPOSTO',
    required: true,
    options: physicalDelivery.map((x, index) => ({ label: x, value: `0${index + 1}` })),
    dbColumn: 'physicaldelivery',
  },
  {
    type: 'date',
    size: 6,
    label: 'DATA',
    required: true,
    dbColumn: 'audiencedate',
  },
  {
    type: 'text',
    size: 12,
    label: 'DESCRIÇÃO',
    required: true,
    dbColumn: 'textrequest',
  },
];

export const NewDuoDiligence: FormField[] = [
  {
    type: 'text',
    size: 12,
    label: 'DESCRIÇÃO',
    required: true,
    dbColumn: 'textrequest',
  },
];
