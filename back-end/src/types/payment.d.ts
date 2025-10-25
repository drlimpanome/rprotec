// src/types/payment.ts
export interface CriarCobrancaRequest extends Request {
  body: {
    clienteId: string;
    valor: number;
    descricao: string;
  };
}

export interface CriarCobrancaPixParams {
  addressKey: string;
  description: string;
  value: number;
  format: "ALL";
  expirationDate: string;
  expirationSeconds: null;
  allowsMultiplePayments: boolean;
}

export interface CobrancaPixResponse {
  id: string;
  encodedImage: string;
  payload: string;
  allowsMultiplePayments: true;
  expirationDate: string;
  externalReference: null;
}

export interface PixQrCodeResponse {
  encodedImage: string;
  payload: string;
}

export interface StatusPagamentoResponse {
  id: string;
  status: string;
  value: number;
  paymentDate?: string;
  dueDate: string;
}
