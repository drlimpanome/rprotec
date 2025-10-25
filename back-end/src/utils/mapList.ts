import { ReviewData } from "../types/list";
import List from "../models/list";

export const transformListToReviewData = (list: any): ReviewData => ({
  id: list.id?.toString(),
  list_name: list.list_name,
  statusHistory: list.statusHistory,
  username: list.client?.username || "",
  phone: list.client?.phone || "",
  email: list.client?.email || "",
  listData:
    list.listData?.map((item: any) => ({
      nome: item.nome,
      cpf: item.cpf,
    })) || [],
  creationDate: list.creation_date,
  status: list.status as ReviewData["status"],
  protocol: list.protocol,
  listGroup: list.listGroup,
  comprovanteUrl: list.comprovanteUrl,
  group_payment_id: list.group_payment_id,
  affiliateId: list.affiliateId,
  price: list.price,
  names_quantity: list.names_quantity,
  status_history: list.statusHistory,
  client: list.client
    ? {
        name: list.client.username,
        email: list.client.email,
        phone: list.client.phone,
        price_consult: list.client.price_consult,
        affiliateId: list.client.affiliateId,
        responsible: list.client.responsible,
      }
    : undefined,
});
