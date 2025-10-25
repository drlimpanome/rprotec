import { Request, Response } from "express";
import { apiRequest } from "../utils/apiRequest";
import {
  CobrancaPixResponse,
  CriarCobrancaPixParams,
  PixQrCodeResponse,
  StatusPagamentoResponse,
} from "../types/payment";
import List from "../models/list";
import Client from "../models/client";
import { S3 } from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import ServiceFormSubmission from "../models/submission_group";
import { S3Controller } from "./s3.controler";
import StatusHistory from "../models/status_history";
import logger from "../utils/logger";

export const createPaymentPix = async (
  req: any,
  res: Response
): Promise<any> => {
  const { valor, descricao, listId, serviceId } = req.body;
  const clientId = req.user.id;
  const role = req.user.role;

  try {
    let existingEntity: any;
    let token;

    if (serviceId) {
      existingEntity = await ServiceFormSubmission.findOne({
        where: { id: serviceId },
        attributes: ["service_payment_id"],
        include: [
          {
            model: Client,
            as: "user",
            attributes: ["id", "affiliateId"],
            include: [
              {
                model: Client,
                as: "affiliate",
                attributes: ["id", "api_key"],
              },
            ],
          },
        ],
      });
      token = existingEntity?.user?.affiliate?.api_key;
    } else if (listId && role == 3) {
      existingEntity = await List.findOne({
        where: { id: listId },
        attributes: ["list_payment_id"],
        include: [
          {
            model: Client,
            as: "client",
            attributes: ["id", "affiliateId"],
            include: [
              {
                model: Client,
                as: "affiliate",
                attributes: ["id", "api_key"],
              },
            ],
          },
        ],
      });
      token = existingEntity?.client?.affiliate?.api_key;
    } else if (listId && role == 2) {
      existingEntity = await List.findOne({
        where: { id: listId },
        attributes: ["list_payment_id"],
        include: [
          {
            model: Client,
            as: "client",
            attributes: ["id", "affiliateId"],
            include: [
              {
                model: Client,
                as: "affiliate",
                attributes: ["id", "api_key"],
              },
            ],
          },
        ],
      });

      token = process.env.API_PAYMENT_KEY;
    }

    if (!token && role == 3) {
      return res.status(400).json({
        message: "O cliente não cadastrou um método de recebimento.",
        detalhes: "Por favor, contate o suporte.",
      });
    }

    const cobranca = await criarCobranca(
      valor,
      token,
      existingEntity?.protocol
    );

    console.log(cobranca);

    if (serviceId) {
      await ServiceFormSubmission.update(
        { service_payment_id: cobranca.id },
        { where: { id: serviceId } }
      );
    } else if (listId) {
      await List.update(
        { list_payment_id: cobranca.id },
        { where: { id: listId } }
      );
    }

    // const qrCode = await obterQrCodePix(cobranca.id, token);

    // console.log("qrCode:", qrCode);
    res.status(201).json({
      cobranca,
      qrCode: cobranca.encodedImage,
    });
  } catch (error: any) {
    console.log("Erro ao processar a cobrança via Pix:", error?.response?.data);
    res.status(500).json({ erro: "Erro ao processar a cobrança via Pix." });
  }
};

// Função para criar ou obter cliente no Asaas
async function criarOuObterCliente(
  userId: string,
  token?: string
): Promise<string> {
  try {
    // Verifica se o cliente já existe no Asaas
    const user = await Client.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error("Usuário não encontrado no sistema.");
    }

    // Aqui, supondo que o usuário tenha os campos necessários para criar o cliente
    const clienteData = {
      name: user.username,
      email: user.email,
      cpfCnpj: user.document,
      phone: user.phone,
    };

    const existingCustomer = await apiRequest<any>({
      url: `/customers?cpfCnpj=${clienteData.cpfCnpj}`,
      method: "GET",
      token,
    });

    if (existingCustomer.data?.[0]?.id) {
      console.log(
        "Cliente existente no Asaas:",
        existingCustomer.data?.[0]?.id
      );
      return existingCustomer.data?.[0]?.id; // Retorna o ID do cliente existente no Asaas
    }

    const cliente = await apiRequest<any>({
      url: "/customers",
      method: "POST",
      data: clienteData,
      token,
    });

    console.log("cliente:", cliente);

    return cliente.id; // Retorna o ID do cliente criado no Asaas
  } catch (error: any) {
    console.log(error.message);
    throw new Error("Erro ao criar ou obter cliente no Asaas.");
  }
}

// Função para criar a cobrança no Asaas
async function criarCobranca(
  valor: number,
  token?: string,
  protocol?: string
): Promise<CobrancaPixResponse> {
  const cobrancaData = {
    value: valor,
    allowsMultiplePayments: false,
    externalReference: protocol,
  };

  return await apiRequest<CobrancaPixResponse>({
    url: "/pix/qrCodes/static",
    method: "POST",
    data: cobrancaData,
    token,
  });
}

// Função para obter o QR Code Pix de uma cobrança
async function obterQrCodePix(
  paymentId: string,
  token?: string
): Promise<PixQrCodeResponse> {
  return await apiRequest<PixQrCodeResponse>({
    url: `/payments/${paymentId}/pixQrCode`,
    method: "GET",
    token,
  });
}

export const checkPaymentStatus = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { idLista } = req.params;
  const { type } = req.query;

  console.log(type, idLista);

  try {
    const existingEntity =
      type === "service"
        ? await ServiceFormSubmission.findOne({
            where: { id: idLista },
            attributes: ["status"],
          })
        : await List.findOne({
            where: { id: idLista },
            attributes: ["status"],
          });

    if (!existingEntity) {
      return res.status(404).json({ error: "entity item not found" });
    }

    res.status(200).json({ status: existingEntity?.status });
  } catch (error) {
    res.status(500).json({ error: "Erro ao verificar o status do pagamento." });
  }
};

export const createWebhook = async (token: string): Promise<any> => {
  try {
    const response = await apiRequest<any>({
      url: "/webhooks",
      method: "POST",
      data: {
        name: "Premium - webhook",
        url: "https://www.premiumexpress.info/api/cobranca/webhook",
        email: "dedebarbos@hotmail.com",
        enabled: true,
        interrupted: false,
        authToken: null,
        sendType: "SEQUENTIALLY",
        events: ["PAYMENT_CONFIRMED", "PAYMENT_CREATED"],
      },
      token,
    });

    return response;
  } catch (error: any) {
    console.error("Erro ao criar webhook no Asaas:", error.message);
    throw new Error("Erro ao criar webhook no Asaas.");
  }
};

// Webhook endpoint para receber notificações do Asaas
export const handleWebhook = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { event, payment } = req.body;

  if (!event || !payment) {
    return res.status(200).json({ error: "Evento ou pagamento inválido" });
  }

  try {
    // Verifica o tipo de evento (exemplo: "PAYMENT_CONFIRMED")
    if (event === "PAYMENT_RECEIVED") {
      const paymentId = payment.pixQrCodeId;

      if (paymentId === null || paymentId === undefined || paymentId === "") {
        return res.status(200).json({ error: "paymentId ausente ou inválido" });
      }

      const list = await List.findOne({
        where: { list_payment_id: paymentId },
      });

      const service = await ServiceFormSubmission.findOne({
        where: { service_payment_id: paymentId },
      });

      if (!list && !service) {
        return res
          .status(200)
          .json({ error: "Nenhuma entidade encontrada para o pagamento" });
      }

      if (list) {
        logger.info("List and status history updated successfully", {
          list_id: list.id,
          data: {
            ...req.body,
            list_protocol: list.protocol,
            list_qrcode: list.list_payment_id,
          },
        });
        await List.update(
          {
            status: list?.affiliateId
              ? "pagamento confirmado"
              : "pagamento aprovado",
            payed: true,
          },
          { where: { list_payment_id: paymentId } } // Assumindo que o `paymentId` mapeia diretamente para uma lista
        );

        await StatusHistory.create({
          list_id: list.id,
          status: list?.affiliateId
            ? "pagamento confirmado"
            : "pagamento aprovado",
        });
      } else if (service) {
        await ServiceFormSubmission.update(
          {
            status: service?.affiliate_id
              ? "pagamento confirmado"
              : "pagamento aprovado",
          },
          { where: { service_payment_id: paymentId } }
        );

        await StatusHistory.create({
          submission_id: service.id,
          status: service?.affiliate_id
            ? "pagamento confirmado"
            : "pagamento aprovado",
        });
      }

      return res
        .status(200)
        .json({ message: "Pagamento confirmado e processado com sucesso" });
    } else if (event === "PAYMENT_REJECTED" || event === "PAYMENT_FAILED") {
      const paymentId = payment.id;

      await List.update(
        { status: "erro no pagamento" },
        { where: { list_payment_id: paymentId } }
      );

      await ServiceFormSubmission.update(
        { status: "erro no pagamento" },
        { where: { service_payment_id: paymentId } }
      );
    }

    res
      .status(200)
      .json({ message: "Evento recebido, sem alterações necessárias" });
  } catch (error) {
    console.error("Erro ao processar o webhook:", error);
    res.status(404).json({ error: "Erro ao processar o webhook" });
  }
};

const s3Controller = new S3Controller();

export const payByPix = async (req: any, res: Response): Promise<any> => {
  try {
    // Verifica se o arquivo foi enviado
    if (!req.file) {
      return res.status(400).json({ message: "Nenhum arquivo enviado." });
    }

    const file = req.file; // Arquivo enviado via FormData
    let { id } = req.body; // ID da submissão ou lista (pode ser número ou JSON string)
    const { type } = req.query; // Tipo de comprovante (service ou list)
    const role = req.user.role;

    // Verifica se o ID foi fornecido
    if (!id) {
      return res.status(400).json({ message: "ID é obrigatório." });
    }

    // Converte `id` para um array caso seja JSON
    try {
      id = JSON.parse(id);
    } catch (e) {
      console.log(e);
      id = [id]; // Se falhar, assume que `id` é um único número e coloca dentro de um array
    }

    if (typeof id == "number" && !Array.isArray(id)) {
      id = [id];
    }

    console.log(id);

    // Verifica se `id` agora é um array
    if (!Array.isArray(id)) {
      return res
        .status(400)
        .json({ message: "ID deve ser um número ou um array de números." });
    }

    // Verifica se o tipo é válido
    if (type !== "service" && type !== "list") {
      return res.status(400).json({ message: "Tipo de comprovante inválido." });
    }

    // Define a pasta do S3 com base no tipo
    const folder =
      type === "service" ? "servicos/comprovantes" : "listas/comprovantes";

    // Gera um nome único para o arquivo no S3
    const fileName = `${uuidv4()}-${file.originalname}`;

    // Salva o arquivo no S3
    const fileKey = await s3Controller.saveFile(folder, fileName, file.buffer);

    // **Gerar um group_payment_id único** apenas se for um pagamento múltiplo
    let groupPaymentId: number | null = null;
    if (id.length > 1) {
      // Obtém o maior `group_payment_id` atual e adiciona 1
      const maxGroupPayment: any = await ServiceFormSubmission.max(
        "group_payment_id"
      );
      console.log(maxGroupPayment);
      groupPaymentId = maxGroupPayment ? maxGroupPayment + 1 : 1;
    }

    console.log(id, groupPaymentId);

    // Atualiza o status e salva o comprovante no banco de dados
    if (type === "service") {
      // Atualiza múltiplos registros na tabela `ServiceFormSubmission`
      const updatedSubmission = await ServiceFormSubmission.update(
        {
          comprovanteUrl: fileKey,
          status:
            role === 2
              ? "Aguardando aprovação do pagamento"
              : "Aguardando confirmação do pagamento",
          ...(groupPaymentId && { group_payment_id: groupPaymentId }), // Adiciona apenas se for múltiplo
        },
        { where: { id: id } } // Suporta múltiplos IDs
      );

      // Se nenhum registro foi atualizado
      if (updatedSubmission[0] === 0) {
        return res
          .status(404)
          .json({ message: "Nenhuma submissão encontrada." });
      }

      await id.forEach(async (ids: any) => {
        await StatusHistory.create({
          submission_id: ids,
          status:
            role === 2
              ? "Aguardando aprovação do pagamento"
              : "Aguardando confirmação do pagamento",
        });
      });
    } else if (type === "list") {
      // Atualiza múltiplos registros na tabela `List`
      const updatedList = await List.update(
        {
          comprovanteUrl: fileKey,
          status:
            role === 2
              ? "Aguardando aprovação do pagamento"
              : "Aguardando confirmação do pagamento",
          ...(groupPaymentId && { group_payment_id: groupPaymentId }), // Adiciona apenas se for múltiplo
        },
        { where: { id: id } } // Suporta múltiplos IDs
      );

      // Se nenhum registro foi atualizado
      if (updatedList[0] === 0) {
        return res.status(404).json({ message: "Nenhuma lista encontrada." });
      }

      await id.forEach(async (ids: any) => {
        await StatusHistory.create({
          list_id: ids,
          status:
            role === 2
              ? "Aguardando aprovação do pagamento"
              : "Aguardando confirmação do pagamento",
        });
      });
    }

    // Retorna o link do comprovante e a confirmação de sucesso
    res.status(200).json({
      message: "Comprovante enviado com sucesso!",
      comprovanteUrl: fileKey,
      groupPaymentId: groupPaymentId || null, // Retorna null se for pagamento único
      success: true,
    });
  } catch (error) {
    console.error("Erro ao processar o pagamento:", error);
    res.status(500).json({ message: "Erro ao processar o pagamento." });
  }
};

export const aproveComprovante = async (
  req: any,
  res: Response
): Promise<any> => {
  const { id } = req.params; // ID da submissão ou lista
  const { type, group_payment_id } = req.query; // Tipo de comprovante (service ou list)
  const role = req.user.role;
  const idUser = req.user.id;

  const whereClause = group_payment_id
    ? { group_payment_id: group_payment_id }
    : { id: id };

  try {
    if (type === "service") {
      const submissions = await ServiceFormSubmission.findAll({
        where: whereClause,
      });

      if (!submissions.length) {
        return res.status(404).json({ message: "Submissão não encontrada." });
      }

      // Atualizar todas as submissões encontradas
      await Promise.all(
        submissions.map(async (submission) => {
          submission.status =
            role === 1
              ? "Pagamento aprovado"
              : "Aguardando confirmação do envio";
          submission.confirmed_affiliate_list = submission.affiliate_id ? 1 : 0;
          await submission.save();

          await StatusHistory.create({
            submission_id: submission.id,
            status:
              role === 1
                ? "Pagamento aprovado"
                : "Aguardando confirmação do envio",
          });

          if (role === 2) {
            await StatusHistory.create({
              submission_id: submission.id,
              status: "Aguardando confirmação do envio",
            });
          }
        })
      );
    } else if (type === "list") {
      const lists = await List.findAll({ where: whereClause });

      if (!lists.length) {
        return res.status(404).json({ message: "Lista não encontrada." });
      }

      logger.info("Aprovando pagamento manualmente", {
        list_id: id,
        client_id: idUser,
        data: lists[0].protocol,
      });

      // Atualizar todas as listas encontradas
      await Promise.all(
        lists.map(async (list) => {
          list.status =
            role === 1
              ? "Pagamento aprovado"
              : "Aguardando confirmação do envio";
          list.confirmed_affiliate_list = list.affiliateId ? 1 : 0;
          list.payed = true;
          await list.save();

          await StatusHistory.create({
            list_id: list.id,
            status:
              role === 1
                ? "Pagamento aprovado"
                : "Aguardando confirmação do envio",
          });

          if (role === 2) {
            await StatusHistory.create({
              list_id: list.id,
              status: "Aguardando confirmação do envio",
            });
          }
        })
      );
    }

    // Retorna o link do comprovante e a confirmação de sucesso
    res.status(200).json({
      message: "Comprovante aprovado com sucesso!",
      success: true,
    });
  } catch (error) {
    console.error("Erro ao aprovar o comprovante:", error);
    res.status(500).json({
      message: "Erro ao aprovar o comprovante.",
    });
  }
};

export const generatePaymentLinkOrQrcode = async (
  req: any,
  res: Response
): Promise<any> => {
  try {
    const admin = await Client.findByPk(2);
    console.log(admin);
    return res.status(200).json({ pix_key: admin?.pix_key });
  } catch (error) {
    console.error("Erro ao gerar link ou QR Code:", error);
    res.status(500).json({ message: "Erro ao gerar link ou QR Code." });
  }
};
