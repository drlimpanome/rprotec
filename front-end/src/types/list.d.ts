export interface listData {
  nome: string;
  cpf: string;
}

export interface ReviewData {
  id?: string;
  list_name: string;
  username: string;
  phone: string;
  email: string;
  listData: listData[];
  creationDate: Date;
  status: ListStatus;
  protocol: string;
  pix_key?: string;
  comprovanteUrl: any;
  group_payment_total?: number;
  affiliateId?: string;
  statusHistory?: {
    status: ListStatus;
    updated_at: Date;
  }[];
  group_payment_id?: number;
  price: number;
  listGroup?: {
    expires_at: Date;
    id: number;
    name: string;
    status: ListStatus;
    statusHistory: {
      status: ListStatus;
      updated_at: Date;
    }[];
    admin: boolean;
  };
  client?: {
    name: string;
    price_consult: number;
    email: string;
    phone: string;
    affiliateId?: string;
    responsible?: string;
  };
}

export interface ReviewPageProps {
  data?: ReviewData;
  onConfirm: (updatedData: ReviewData) => void;
  onCancel: () => void;
  isEditing?: boolean;
  currentUser: User;
}

export type ListStatus =
  | 'aguardando pagamento'
  | 'pagamento confirmado'
  | 'pagamento aprovado afiliado'
  | 'Aguardando confirmação do pagamento'
  | 'Aguardando aprovação do pagamento'
  | 'Aguardando confirmação do envio'
  | 'Pagamento confirmado'
  | 'em analise'
  | 'pagamento aprovado'
  | 'finalizada'
  | 'erro'
  | 'cancelada'
  | 'aguardando pagamento'
  | 'pagamento aprovado'
  | 'aguardando protocolar'
  | 'decisão judicial'
  | 'spc'
  | 'boa vista'
  | 'cenprot sp'
  | 'cenprot br'
  | 'quod'
  | 'serasa'
  | 'finalizada'
  | 'erro'
  | 'cancelada';

export const StatusMap: ListStatus[] = [
  'aguardando pagamento',
  'pagamento aprovado',
  'aguardando protocolar',
  'decisão judicial',
  'pagamento aprovado afiliado',
  'Aguardando confirmação do envio',
  'em analise',
  'pagamento aprovado',
  'finalizada',
  'spc',
  'boa vista',
  'cenprot sp',
  'cenprot br',
  'quod',
  'serasa',
  'finalizada',
  'erro',
  'cancelada',
];

export type ListGroupData = {
  id: number;
  price: number;
  name: string;
  status: ListStatus;
  expires_at: string | null;
  statusHistory: {
    status: ListStatus;
    updated_at: Date;
  }[];
  lists: {
    id: number;
    creation_date: Date;
    list_name: string;
    client?: {
      name: string;
      username: string;
      phone: string;
      email: string;
      price_consult: number;
      responsible?: string;
    };
    protocol: string;
    creationDate: Date;
    status: ListStatus;
    listData: { nome: string; cpf: string }[];
  }[];
};
