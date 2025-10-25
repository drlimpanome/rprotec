import { Request, Response } from "express";
import Client from "../models/client";
import UserService from "../models/user_services";
import Service from "../models/service";
import bcrypt from "bcrypt";
import { createWebhook } from "./payment.controller";

export const getClients = async (req: Request, res: Response) => {
  try {
    const clientId = (req as any).user.id; // O ID do cliente foi inserido no middleware de autenticação
    const role = (req as any).user.role; // O ID do cliente foi inserido no middleware de autenticação

    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * pageSize;

    let where = {};
    if (role === 2) {
      where = {
        affiliateId: clientId,
      };
    }

    // Fetch clients with pagination and include associated services
    const { rows: customers, count: totalItens } = await Client.findAndCountAll(
      {
        where,
        order: [["created_at", "DESC"]],
        limit: pageSize,
        offset,
        attributes: [
          "id",
          "username",
          "document",
          "email",
          "phone_fixed",
          "responsible",
          "address",
          "cep",
          "created_at",
          "active",
        ],
        include: [
          {
            model: UserService,
            as: "services",
            include: [{ model: Service, as: "service", attributes: ["name"] }],
          },
        ],
      }
    );

    const totalPages = Math.ceil(totalItens / pageSize);

    res.json({
      customers,
      totalPages,
      totalItens,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message:
        "Erro ao buscar clientes. Por favor, tente novamente mais tarde.",
      detalhes: "Ocorreu um problema ao acessar a base de dados.",
    });
  }
};

export const getAffiliates = async (req: Request, res: Response) => {
  try {
    const clientId = (req as any).user.id; // O ID do cliente foi inserido no middleware de autenticação
    const role = (req as any).user.role; // O ID do cliente foi inserido no middleware de autenticação

    let where = {};
    if (role === 2) {
      where = {
        affiliateId: clientId,
      };
    } else if (role == 1) {
      where = {
        affiliateId: null,
      };
    }

    // Fetch clients with pagination and include associated services
    const customers = await Client.findAll({
      where,
      attributes: ["id", "username"],
      include: [
        {
          model: UserService,
          as: "services",
          include: [{ model: Service, as: "service", attributes: ["name"] }],
        },
      ],
    });

    res.json({
      customers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message:
        "Erro ao buscar clientes. Por favor, tente novamente mais tarde.",
      detalhes: "Ocorreu um problema ao acessar a base de dados.",
    });
  }
};

export const createClient = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const {
      username,
      email,
      phone,
      password,
      services,
      document,
      cep,
      address,
      phone_fixed,
      responsible,
    } = req.body;

    const clientId = (req as any).user.id; // O ID do cliente foi inserido no middleware de autenticação
    const role = (req as any).user.role; // O ID do cliente foi inserido no middleware de autenticação

    console.log(req.body);

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Dados obrigatórios ausentes.",
        detalhes: "Por favor, forneça 'username', 'email' e 'password'.",
      });
    }

    const existingClient = await Client.findOne({ where: { email } });
    if (existingClient) {
      return res.status(409).json({
        message: "Erro de criação.",
        detalhes: "Um cliente com este email já existe.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newClient = await Client.create({
      username,
      email,
      phone,
      document,
      password: hashedPassword,
      active: true,
      cep,
      address,
      phone_fixed,
      role: role === 1 ? 2 : 2,
      affiliateId: role === 1 ? null : clientId,
      uses_pix: false,
      responsible,
    });

    await UserService.create({
      client_id: newClient.id,
      service_id: 1,
      cost: 300,
    });

    if (services) {
      await handleUserServices(newClient.id, services);
    }

    res.status(201).json({
      message: "Cliente criado com sucesso.",
      cliente: newClient,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erro ao criar cliente. Por favor, tente novamente mais tarde.",
      detalhes: "Ocorreu um problema ao acessar a base de dados.",
    });
  }
};

export const affiliateConfig = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { fee, apikey, uses_pix, pix_key } = req.body;
    console.log(req.body);

    const id = (req as any).user.id;

    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).json({ message: "Cliente não encontrado." });
    }

    if (apikey && apikey !== client.api_key) {
      if (process.env.ENVIROMENT !== "DEV") {
        const response = await createWebhook(apikey);
        if (!response) {
          return res
            .status(404)
            .json({ message: "Erro ao validar sua chave." });
        }
      }
    }

    client.price_consult = fee || client.price_consult;
    client.api_key = apikey || client.api_key;
    client.uses_pix = uses_pix;
    client.pix_key = pix_key || client.pix_key;

    await client.save();

    res.status(200).json({
      message: "Cliente atualizado com sucesso.",
      cliente: client,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message:
        "Erro ao atualizar cliente. Por favor, tente novamente mais tarde.",
      detalhes: "Ocorreu um problema ao acessar a base de dados.",
    });
  }
};

export const updateClient = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const {
      username,
      email,
      phone,
      password,
      services,
      document,
      cep,
      address,
      phone_fixed,
      responsible,
    } = req.body;

    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).json({ message: "Cliente não encontrado." });
    }

    client.username = username || client.username;
    client.email = email || client.email;
    client.phone = phone || client.phone;
    client.document = document || client.document;
    client.cep = cep || client.cep;
    client.address = address || client.address;
    client.phone_fixed = phone_fixed || client.phone_fixed;
    client.responsible = responsible || client.responsible;

    if (password) {
      client.password = await bcrypt.hash(password, 10);
    }

    await client.save();

    if (services) {
      await handleUserServices(client.id, services);
    }

    res.status(200).json({
      message: "Cliente atualizado com sucesso.",
      cliente: client,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message:
        "Erro ao atualizar cliente. Por favor, tente novamente mais tarde.",
      detalhes: "Ocorreu um problema ao acessar a base de dados.",
    });
  }
};

// Helper function to handle UserService entries based on the services object
const handleUserServices = async (
  clientId: number,
  services: Record<string, { checked: boolean; cost: number }>
) => {
  for (const [serviceName, serviceDetails] of Object.entries(services)) {
    const existingService = await Service.findOne({
      where: { name: serviceName },
    });

    if (!existingService) {
      console.error(
        `Serviço "${serviceName}" não encontrado. Certifique-se de que o serviço exista.`
      );
      continue;
    }

    const existingUserService = await UserService.findOne({
      where: { client_id: clientId, service_id: existingService.id },
    });

    if (serviceDetails.checked) {
      if (existingUserService) {
        // Atualiza se já existir
        await existingUserService.update({ cost: serviceDetails.cost });
      } else {
        // Cria se não existir
        await UserService.create({
          client_id: clientId,
          service_id: existingService.id,
          cost: serviceDetails.cost,
        });
      }
    } else if (existingUserService) {
      // Remove se não estiver marcado e existir
      await UserService.destroy({
        where: { client_id: clientId, service_id: existingService.id },
      });
    }
  }
};

// Função para buscar o perfil do cliente autenticado
export const getClientProfile = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const clientId = (req as any).user.id; // O ID do cliente foi inserido no middleware de autenticação

    // Procura o cliente pelo ID
    const client = await Client.findByPk(clientId, {
      attributes: [
        "id",
        "username",
        "email",
        "phone",
        "role",
        "active",
        "document",
        "cep",
        "address",
        "phone_fixed",
        "price_consult",
        "api_key",
        "uses_pix",
        "pix_key",
        "responsible",
      ],
      include: [
        {
          model: UserService,
          as: "services",
          attributes: ["id", "service_id", "cost"],
        },
      ],
    });

    if (!client) {
      return res.status(404).json({ message: "Cliente não encontrado." });
    }

    console.log(client);

    res.json(client);
  } catch (error) {
    console.error("Erro ao buscar perfil do cliente:", error);
    res.status(500).json({ message: "Erro ao buscar perfil do cliente." });
  }
};

export const toggleClientStatus = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;

  try {
    const client = await Client.findByPk(id);

    if (!client) {
      return res.status(404).json({ message: "Cliente não encontrado." });
    }

    client.active = !client.active; // Alterna o status
    await client.save();

    res.status(200).json({
      message: "Status do cliente atualizado com sucesso.",
      active: client.active,
    });
  } catch (error) {
    console.error("Erro ao atualizar status do cliente:", error);
    res.status(500).json({ message: "Erro ao atualizar status do cliente." });
  }
};
