import { Request, Response } from "express";
import List from "../models/list";
import Client from "../models/client";
import { ReviewData, listData } from "../types/list";
import NamesList from "../models/name_list";
import { transformListToReviewData } from "../utils/mapList";
import ListGroup from "../models/list_group";
import StatusHistory from "../models/status_history";
import UserService from "../models/user_services";
import { Op, Sequelize } from "sequelize";
import { S3Controller } from "./s3.controler";

// Protocol generation function
const generateProtocol = async (): Promise<string> => {
  const datePrefix = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\..+/, "")
    .replace("T", "_");
  const listCount = await List.count();
  return `${datePrefix}-${listCount + 1}`;
};

// Main function that decides between admin and client behavior
export const createOrUpdateList = async (
  req: any,
  res: Response
): Promise<void> => {
  const clientRole = req.user.role;
  if (clientRole === 1) {
    await createOrUpdateAdmin(req, res);
  } else {
    await createOrUpdateClient(req, res);
  }
};

// Client-specific function (retains current behavior)
const createOrUpdateClient = async (req: any, res: Response): Promise<any> => {
  try {
    const {
      id,
      list_name,
      status,
      creationDate,
      list_group_id,
      listData,
      protocol,
    }: ReviewData & { listData: listData[] } = req.body;
    const clientId = req.user.id;
    const clientRole = req.user.role;

    if (!list_name || !status || !listData || !Array.isArray(listData)) {
      res.status(400).json({
        message: "Dados obrigatórios ausentes.",
        detalhes: "Por favor, forneça 'list_name', 'status' e 'listData'.",
      });
      return;
    }

    let list: any;
    let created = false;

    if (id) {
      list = await List.findOne({ where: { id, client_id: clientId } });
      if (list) {
        list.list_name = list_name;
        list.creation_date = creationDate || new Date();
        list.status = status;
        list.protocol = protocol || list.protocol;
        await list.save();
        await NamesList.destroy({ where: { list_id: list.id } });
      } else {
        created = true;
      }
    }

    let price = 0;

    const user = await Client.findByPk((req as any).user.id, {
      include: [
        {
          model: Client,
          as: "affiliate", // Nome da associação definida na model
          attributes: ["price_consult", "pix_key", "uses_pix"], // Apenas os atributos necessários
        },
      ],
    });

    const userService = await UserService.findOne({
      where: {
        client_id: clientId,
        service_id: 1, // Assuming the service ID is always 1
      },
    });

    if (!userService) {
      res.status(404).json({
        message: "Serviço não encontrado.",
        detalhes:
          "Nenhum serviço foi encontrado para o cliente e ID fornecidos.",
      });
      return;
    }

    price = userService.cost;

    price = price * listData.length;

    if (!id || created) {
      list = await List.create({
        list_name,
        creation_date: creationDate || new Date(),
        status,
        list_group_id,
        protocol: protocol || (await generateProtocol()),
        client_id: clientId,
        affiliateId: user?.affiliateId,
        price,
        names_quantity: listData.length,
      });
      created = true;
    }

    const namesListEntries = listData.map((item) => ({
      nome: item.nome,
      cpf: item.cpf,
      list_id: list.id,
    }));

    await NamesList.bulkCreate(namesListEntries);

    if (created) {
      await StatusHistory.create({
        list_id: list.id,
        list_group_id,
        status,
        submission_id: null,
      });
    }

    res.status(created ? 201 : 200).json({
      message: created
        ? "Lista criada com sucesso."
        : "Lista atualizada com sucesso.",
      id: list.id,
      protocol: list.protocol,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message:
        "Erro ao processar a lista. Por favor, tente novamente mais tarde.",
      detalhes: "Ocorreu um problema ao acessar a base de dados.",
    });
  }
};

// Admin-specific function (new behavior)
const createOrUpdateAdmin = async (req: any, res: Response): Promise<void> => {
  try {
    const {
      id,
      list_name,
      creationDate,
      listData,
      protocol,
    }: ReviewData & { listData: listData[] } = req.body;

    if (!list_name || !listData || !Array.isArray(listData)) {
      res.status(400).json({
        message: "Dados obrigatórios ausentes.",
        detalhes: "Por favor, forneça 'list_name' e 'listData'.",
      });
      return;
    }

    let list: any;
    let created = false;

    // Create a new ListGroup with `admin: true` if creating a new list
    const listGroup = await ListGroup.create({
      name: `${list_name} - Admin Group`,
      expires_at: new Date(), // You might want to set a meaningful date
      status: "pagamento aprovado",
      admin: true,
    });

    if (id) {
      list = await List.findOne({ where: { id } });
      if (list) {
        list.list_name = list_name;
        list.creation_date = creationDate || new Date();
        list.status = "pagamento aprovado";
        list.protocol = protocol || list.protocol;
        list.list_group_id = listGroup.id;
        await list.save();
        await NamesList.destroy({ where: { list_id: list.id } });
      } else {
        created = true;
      }
    }

    if (!id || created) {
      list = await List.create({
        list_name,
        creation_date: creationDate || new Date(),
        status: "pagamento aprovado",
        list_group_id: listGroup.id,
        protocol: protocol || (await generateProtocol()),
        client_id: req.user.id,
        price: 0,
        names_quantity: listData.length,
      });
      created = true;
    }

    const namesListEntries = listData.map((item) => ({
      nome: item.nome,
      cpf: item.cpf,
      list_id: list.id,
    }));

    await NamesList.bulkCreate(namesListEntries);

    await StatusHistory.create({
      list_id: list.id,
      status: "pagamento aprovado",
    });

    res.status(created ? 201 : 200).json({
      message: created
        ? "Lista criada com sucesso (Admin)."
        : "Lista atualizada com sucesso (Admin).",
      id: list.id,
      protocol: list.protocol,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message:
        "Erro ao processar a lista para admin. Por favor, tente novamente mais tarde.",
      detalhes: "Ocorreu um problema ao acessar a base de dados.",
    });
  }
};

export const getListByProtocol = async (
  req: any,
  res: Response
): Promise<void> => {
  try {
    const s3Controller = new S3Controller();
    const { protocol } = req.params;
    const clientId = req.user.id;
    const clientRole = req.user.role;

    let whereCondition: any = {
      ...(protocol && { protocol }),
    };

    if (clientRole === 1) {
    } else if (clientRole === 2) {
      // Role 2: Listas do próprio cliente e de afiliados
      whereCondition = {
        ...whereCondition,
        [Op.or]: [{ client_id: clientId }, { affiliateId: clientId }],
      };
    } else if (clientRole === 3) {
      // Role 3: Apenas listas do próprio cliente
      whereCondition.client_id = clientId;
    }

    const list = await List.findOne({
      where: whereCondition,
      include: [
        {
          model: NamesList,
          as: "listData",
          attributes: ["nome", "cpf"],
        },
        {
          model: Client,
          as: "client",
          attributes: ["username", "email", "phone"],
        },
        {
          model: ListGroup,
          as: "listGroup",
        },
        {
          model: StatusHistory,
          as: "statusHistory",
        },
      ],
    });

    if (!list) {
      res.status(404).json({
        message: "Lista não encontrada.",
        detalhes: "Nenhuma lista foi encontrada para o protocolo fornecido.",
      });
      return;
    }

    let price_consult = 0;
    let pix_key = null;

    if (clientRole === 3) {
      const clientService = await Client.findByPk((req as any).user.id, {
        include: [
          {
            model: Client,
            as: "affiliate", // Nome da associação definida na model
            attributes: ["price_consult", "pix_key", "uses_pix"], // Apenas os atributos necessários
          },
        ],
      });
      if (clientService) {
        price_consult = clientService.affiliate?.price_consult || 0;
        pix_key = clientService.affiliate?.uses_pix
          ? clientService.affiliate?.pix_key
          : null;
      }
    } else if (clientRole === 1) {
      price_consult = 0;
    } else {
      const userService = await UserService.findOne({
        where: {
          client_id: list.client_id,
          service_id: 1,
        },
      });

      if (!userService) {
        res.status(404).json({
          message: "Serviço não encontrado.",
          detalhes:
            "Nenhum serviço foi encontrado para o cliente e ID fornecidos.",
        });
        return;
      }

      price_consult = userService.cost;
    }

    let group_payment_total = null;

    if (list.group_payment_id) {
      const allLists = await List.findAll({
        where: { group_payment_id: list.group_payment_id },
      });

      if (allLists.length > 0) {
        const total = allLists.reduce((acc, list) => acc + list.price, 0);
        group_payment_total = total;
      }
    }

    const responseData = {
      ...transformListToReviewData(list),
    };
    if (responseData.client) {
      responseData.client.price_consult = price_consult;
    }

    if (pix_key) {
      responseData.pix_key = pix_key;
    }

    if (clientRole == 2) {
      const admin = await Client.findByPk(2, {
        attributes: ["pix_key"],
      });
      responseData.pix_key = admin?.pix_key;
    }

    if (responseData.listGroup?.expires_at) {
      const expiresAtDate = new Date(responseData.listGroup.expires_at);
      expiresAtDate.setHours(expiresAtDate.getHours() + 3); // Add 3 hours
      responseData.listGroup.expires_at = expiresAtDate;
    }

    if (responseData.comprovanteUrl) {
      responseData.comprovanteUrl = await s3Controller.retrieveFile(
        "listas/comprovantes",
        responseData.comprovanteUrl
      );
      console.log("Comprovante URL:", responseData.comprovanteUrl);
    }

    if (group_payment_total) {
      responseData.group_payment_total = group_payment_total;
    }

    res.status(200).json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erro ao buscar a lista. Por favor, tente novamente mais tarde.",
      detalhes: "Ocorreu um problema ao acessar a base de dados.",
    });
  }
};

export const getAllLists = async (req: any, res: Response): Promise<any> => {
  try {
    const clientId = req.user.id;
    const clientRole = req.user.role;
    const { page, limit, status, protocol, affiliate, type, responsible } =
      req.query;

    let whereCondition: any = {
      ...(status && { status }),
      ...(protocol && { protocol }),
      ...(type && { affiliateId: clientId }),
      ...(!type && clientRole == 2 && { affiliateId: null }),
    };

    if (clientRole === 1) {
      whereCondition = {
        ...whereCondition,
      };
    } else if (clientRole === 2) {
      // Role 2: Listas do próprio cliente e de afiliados
      whereCondition = {
        ...whereCondition,
        [Op.or]: [{ client_id: clientId }, { affiliateId: clientId }],
      };
    } else if (clientRole === 3) {
      // Role 3: Apenas listas do próprio cliente
      whereCondition.client_id = clientId;
    }

    if (affiliate) {
      whereCondition.client_id = affiliate;
    }

    console.log(whereCondition);

    if (page === "all") {
      const lists = await List.findAll({
        where: whereCondition,
        include: [
          {
            model: NamesList,
            as: "listData",
            attributes: ["nome", "cpf"],
          },
          {
            model: Client,
            as: "client",
            where: {
              ...(responsible && { responsible }),
            },
            attributes: [
              "username",
              "email",
              "phone",
              "price_consult",
              "affiliateId",
              "responsible",
            ],
          },
        ],
        order: [["created_at", "DESC"]],
      });
      return res.status(200).json(lists);
    }

    const currentPage = parseInt(page as string) || 1;
    const itemsPerPage = parseInt(limit as string) || 10;
    const offset = (currentPage - 1) * itemsPerPage;

    const totalItens = await List.count({ where: whereCondition });

    const lists = await List.findAll({
      where: whereCondition,
      include: [
        {
          model: NamesList,
          as: "listData",
          attributes: ["nome", "cpf"],
        },
        {
          model: Client,
          as: "client",
          where: {
            ...(responsible && { responsible }),
          },
          attributes: [
            "username",
            "email",
            "phone",
            "price_consult",
            "affiliateId",
            "responsible",
          ],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: itemsPerPage,
      offset,
    });

    const services: ReviewData[] = lists.map(transformListToReviewData);

    res.status(200).json({
      services,
      totalItens,
    });
  } catch (error) {
    console.error("Erro ao buscar listas:", error);
    res.status(500).json({
      message: "Erro ao buscar listas. Por favor, tente novamente mais tarde.",
      detalhes: "Ocorreu um problema ao acessar a base de dados.",
    });
  }
};

export const dashboardData = async (req: any, res: Response): Promise<void> => {
  try {
    const clientId = req.user.id;
    const clientRole = req.user.role;
    const {
      page,
      limit,
      startDate,
      endDate,
      clientId: client_data,
    } = req.query;

    // Parse query parameters
    const currentPage = parseInt(page as string) || 1;
    const itemsPerPage = parseInt(limit as string) || 10;
    const offset = (currentPage - 1) * itemsPerPage;

    // Prepare conditions for filtering lists
    const whereCondition = {
      ...(startDate && {
        created_at: { [Op.gte]: new Date(startDate as string) },
      }),
      ...(endDate && {
        created_at: {
          [Op.lte]: new Date(endDate as string),
          ...(startDate && { [Op.gte]: new Date(startDate as string) }),
        },
      }),
      ...((clientRole === 3 || clientRole === 2) && { client_id: clientId }),
      ...(client_data && { client_id: client_data }),
    };

    // Fetch lists data
    const totalItems = await List.count({ where: whereCondition });
    const lists = await List.findAll({
      where: whereCondition,
      include: [
        {
          model: NamesList,
          as: "listData",
          attributes: ["nome", "cpf"],
        },
        {
          model: Client,
          as: "client",
          attributes: ["username", "email", "phone", "price_consult"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: page === "all" ? undefined : itemsPerPage,
      offset: page === "all" ? undefined : offset,
    });

    // Prepare clients data for role 1 and role 2
    let clients: any = [];
    if (clientRole === 1) {
      // Fetch all clients with role 2
      console.log("aqui dentro");
      clients = await Client.findAll({
        where: { role: 2 },
        attributes: ["id", "username", "email", "phone", "price_consult"],
        include: [
          {
            model: UserService,
            as: "services",
            where: { service_id: 1 }, // Filter by service ID
            attributes: ["cost"], // Bring only the price column
          },
        ],
      });
    } else if (clientRole === 2) {
      // Fetch affiliates of this client
      clients = await Client.findAll({
        where: { affiliateId: clientId },
        attributes: ["id", "username", "email", "phone", "price_consult"],
        include: [
          {
            model: UserService,
            as: "services",
            where: { id: 1 }, // Filter by service ID
            attributes: ["cost"], // Bring only the price column
          },
        ],
      });
    }

    // Respond with the aggregated data
    res.status(200).json({
      lists: {
        lists,
        totalItems,
      },
      clients,
    });
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    res.status(500).json({
      message:
        "Erro ao buscar dados do dashboard. Por favor, tente novamente mais tarde.",
      detalhes: "Ocorreu um problema ao acessar a base de dados.",
    });
  }
};

// Admin-specific function (new behavior)
export const updateList = async (req: any, res: Response): Promise<void> => {
  try {
    const { id, list_name, listData }: ReviewData & { listData: listData[] } =
      req.body;
    const role = req.user.role;
    const idUser = req.user.id;
    if (!list_name || !listData || !Array.isArray(listData)) {
      res.status(400).json({
        message: "Dados obrigatórios ausentes.",
        detalhes: "Por favor, forneça 'list_name' e 'listData'.",
      });
      return;
    }

    let list: any;
    let created = false;

    if (id) {
      list = await List.findOne({ where: { id } });

      if (role !== 1 && list.client_id !== idUser) {
        res.status(403).json({
          message: "Acesso negado.",
          detalhes: "Você não tem permissão para atualizar essa lista.",
        });
        return;
      }

      if (list) {
        list.list_name = list_name;
        await list.save();
        await NamesList.destroy({ where: { list_id: list.id } });

        const namesListEntries = listData.map((item) => ({
          nome: item.nome,
          cpf: item.cpf,
          list_id: list.id,
        }));

        const pricePerName = await UserService.findOne({
          where: {
            service_id: 1,
            client_id: role === 1 ? list.client_id : idUser,
          },
          attributes: ["cost"],
        });
        if (!pricePerName) {
          res.status(403).json({
            message: "Acesso negado.",
            detalhes: "Você não tem permissão para atualizar essa lista.",
          });
          return;
        }

        list.price = pricePerName?.cost * namesListEntries.length;
        list.names_quantity = namesListEntries.length;
        await list.save();

        await NamesList.bulkCreate(namesListEntries);
      } else {
        res.status(404).json({
          message: "Lista Não encontrada.",
        });
        return;
      }
    }

    res.status(created ? 201 : 200).json({
      message: created
        ? "Lista criada com sucesso"
        : "Lista atualizada com sucesso",
      id: list.id,
      protocol: list.protocol,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message:
        "Erro ao processar a lista para admin. Por favor, tente novamente mais tarde.",
      detalhes: "Ocorreu um problema ao acessar a base de dados.",
    });
  }
};
