export interface listData {
  nome: string;
  cpf: string;
}

export interface ReviewData {
  list_group_id?: number;
  id?: string;
  list_name: string;
  username: string;
  phone: string;
  email: string;
  listData: listData[];
  creationDate: Date;
  price: number;
  status: ListStatus;
  status_history: any;
  comprovanteUrl: any;
  protocol: string;
  affiliateId?: number;
  group_payment_total?: number;
  group_payment_id?: string;
  names_quantity: number;
  listGroup: {
    expires_at: Date;
    id: number;
    name: string;
    status: ListStatus;
  };
  statusHistory: {
    status: string;
    updated_at: Date;
  }[];
  client?: {
    name: string;
    email: string;
    phone: string;
    price_consult: number;
    affiliateId?: number;
    responsible?: string;
  };
  pix_key?: string;
}

export interface ReviewPageProps {
  data?: ReviewData;
  onConfirm: (updatedData: ReviewData) => void;
  onCancel: () => void;
  isEditing?: boolean;
  currentUser: User;
}

export type ListStatus =
  | "aguardando pagamento"
  | "em analise"
  | "pagamento aprovado"
  | "finalizada"
  | "erro"
  | "cancelada"
  | "aguardando pagamento"
  | "pagamento aprovado"
  | "em analise"
  | "aguardando protocolar"
  | "decisão judicial"
  | "spc"
  | "boa vista"
  | "cenprot sp"
  | "cenprot br"
  | "quod"
  | "serasa"
  | "finalizada"
  | "erro"
  | "cancelada";
