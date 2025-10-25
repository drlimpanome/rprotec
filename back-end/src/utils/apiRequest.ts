import axios, { AxiosResponse, Method } from "axios";

const ASAAS_API_URL = "https://api.asaas.com/v3";

const ASAAS_ACCESS_TOKEN = process.env.API_PAYMENT_KEY;

interface ApiRequestParams<T> {
  url: string;
  method: Method;
  data?: any;
  responseType?: { new (): T };
  headers?: Record<string, string>;
  token?: string;
}

// Função utilitária para requisições com tratamento centralizado de erros
export async function apiRequest<T>({
  url,
  method,
  data,
  headers = {},
  token,
}: ApiRequestParams<T>): Promise<T> {
  try {
    console.log(
      process.env.ENVIROMENT,
      "🚀 ~ file: apiRequest.ts:20 ~ apiRequest ~ url:",
      `${ASAAS_API_URL}${url}`,
      "ASAAS_ACCESS_TOKEN",
      ASAAS_ACCESS_TOKEN,
      "token",
      token
    );
    const response: AxiosResponse<T> = await axios({
      url: `${ASAAS_API_URL}${url}`,
      method,
      data,
      headers: {
        "Content-Type": "application/json",
        access_token:
          process.env.ENVIROMENT === "DEV" ? ASAAS_ACCESS_TOKEN : token,
        ...headers,
      },
    });

    return response.data;
  } catch (error: any) {
    throw error;
  }
}
