import { User } from './user';

export interface FormField {
  id: number;
  service_id: number;
  serviceForm_id: number;
  label: string;
  type: 'text' | 'file' | 'date'; // Adicione mais tipos conforme necessário
  required: boolean;
  answer?: string;
}

export interface Answer {
  id: number;
  service_id: number;
  form_field_id: number;
  user_id: number;
  service_form_submission_id: number;
  answer: string;
  submission_group: string;
  created_at: string; // Se precisar manipular datas, pode usar `Date`
  updated_at: string;
  formField: FormField;
  invalid_reason: string;
}

export interface ServiceFormSubmission {
  id: number;
  user_id: number;
  protocol: string;
  service_form_id: number;
  price: number;
  status: string;
  created_at: string;
  updated_at: string;
  answers: Answer[];
  user: User;
  pix_key: string;
  group_payment_id: number;
  group_payment_total?: number;
  comprovanteUrl?: any;
  affiliate_id?: string;
  serviceForm: {
    name: string;
  };
}
