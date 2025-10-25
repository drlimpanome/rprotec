export interface User {
  id: string;
  username?: string;
  created_at?: Date;
  email?: string;
  role?: 1 | 2 | 3;
  active?: boolean;
  phone?: string;
  cep?: string;
  address?: string;
  phone_fixed?: string;
  document?: string;
  price_consult?: number;
  api_key?: string;
  uses_pix: boolean;
  pix_key?: string;
  responsible?: string;
  services: {
    id: number;
    cost: number;
    service: {
      name: string;
    };
  }[];

  [key: string]: unknown;
}
