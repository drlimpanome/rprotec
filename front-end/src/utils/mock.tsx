import dayjs from '@/utils/dayjs-config';

import { ReviewData } from '@/types/list';

export const mockList: ReviewData = [
  {
    protocol: '2024110100001',
    status: 'aguardando pagamento',
    client: {
      name: 'Logs client',
    },
    creationDate: new Date(),
  },
  {
    protocol: '2024110100002',
    status: 'pagamento aprovado',
    client: {
      name: 'Logs client',
    },
    creationDate: new Date(),
  },
  {
    protocol: '2024110100003',
    status: 'em analise',
    client: {
      name: 'Logs client',
    },
    creationDate: new Date(),
  },
];

export const mockObjectList: ReviewData = {
  id: '1',
  list_name: 'Lista de Clientes - 2024/10/28',
  username: 'johndoe',
  phone: '+55 11 98765-4321',
  email: 'johndoe@example.com',
  listData: [
    { nome: 'Maria Silva', cpf: '123.456.789-01' },
    { nome: 'João Pereira', cpf: '234.567.890-12' },
    { nome: 'Ana Costa', cpf: '345.678.901-23' },
    { nome: 'Carlos Souza', cpf: '456.789.012-34' },
    { nome: 'Fernanda Lima', cpf: '567.890.123-45' },
  ],
  creationDate: dayjs().subtract(10, 'days').toDate(),
  status: 'aguardando pagamento',
  protocol: '202411010001',
  client: {
    name: 'Client Company SA',
    email: 'client@example.com',
    phone: '+55 11 98765-0000',
  },
};
