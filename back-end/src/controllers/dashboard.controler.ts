import { Response } from "express";
import List from "../models/list";
import Client from "../models/client";
import NamesList from "../models/name_list";
import UserService from "../models/user_services";
import { Op, col, fn, literal } from "sequelize";
import { HomeSummary } from "../service/getHomeData";

export const dashboardData = async (req: any, res: Response): Promise<any> => {
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

export const totalizersData = async (req: any, res: Response): Promise<any> => {
  try {
    const { startDate, endDate, clientId } = req.query;

    const whereCondition = {
      ...(startDate && {
        creation_date: { [Op.gte]: new Date(startDate as string) },
      }),
      ...(endDate && {
        creation_date: {
          [Op.lte]: new Date(endDate as string),
          ...(startDate && { [Op.gte]: new Date(startDate as string) }),
        },
      }),
      ...(clientId && { client_id: clientId }),
    };

    // Buscar todas as listas de uma só vez, agora incluindo "price"
    const lists: any = await List.findAll({
      where: whereCondition,
      attributes: ["id", "client_id", "names_quantity", "price"], // Pegando price diretamente
    });

    // Calcular totalNames diretamente da lista
    const totalNames = lists.reduce(
      (sum: any, list: any) => sum + (list.names_quantity || 0),
      0
    );

    // Contar clientes únicos
    const uniqueClients = new Set(lists.map((list: any) => list.client_id))
      .size;

    // Contar o total de clientes cadastrados
    const totalClients = await Client.count();

    // Agora, totalRevenue é apenas a soma da coluna "price"
    const totalRevenue = lists.reduce(
      (sum: any, list: any) => sum + (list.price || 0),
      0
    );

    // Calcular previsão de faturamento para o próximo mês
    const now = new Date();
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextMonthEnd = new Date(
      nextMonthStart.getFullYear(),
      nextMonthStart.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    // Buscar listas do próximo mês
    const nextMonthLists = await List.findAll({
      where: {
        ...whereCondition,
        created_at: { [Op.between]: [nextMonthStart, nextMonthEnd] }, // Considerando listas criadas no próximo mês
      },
      attributes: ["id", "client_id", "names_quantity", "price"], // Pegando price diretamente
    });

    // Calcular receita do próximo mês somando a coluna "price"
    const nextMontRevenue = nextMonthLists.reduce(
      (sum, list) => sum + (list.price || 0),
      0
    );

    // Calcular aumento previsto para o próximo mês
    const nextMontIncrease = Math.max(nextMontRevenue - totalRevenue, 0);

    res.status(200).json({
      totalNames,
      uniqueClients,
      totalRevenue,
      totalClients,
      nextMontRevenue,
      nextMontIncrease,
    });
  } catch (error) {
    console.error("Erro ao calcular totalizadores:", error);
    res.status(500).json({
      message:
        "Erro ao calcular totalizadores. Por favor, tente novamente mais tarde.",
      detalhes: "Ocorreu um problema ao acessar a base de dados.",
    });
  }
};

const monthNames = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

export const monthlyChartDataYear = async (
  req: any,
  res: Response
): Promise<any> => {
  try {
    const { year } = req.query;
    const currentYear = year
      ? parseInt(year as string)
      : new Date().getFullYear();

    const result: Record<string, any> = {};

    // Buscar todos os dados da tabela List de uma vez para evitar múltiplas queries
    const allLists = await List.findAll({
      where: {
        creation_date: {
          [Op.between]: [
            new Date(currentYear, 0, 1),
            new Date(currentYear, 11, 31, 23, 59, 59),
          ],
        },
      },
      attributes: [
        [fn("MONTH", col("creation_date")), "month"],
        [fn("SUM", col("price")), "totalRevenue"],
        [fn("COUNT", col("id")), "totalLists"],
        [fn("COUNT", literal("DISTINCT client_id")), "sendingClients"],
      ],
      group: ["month"],
      raw: true,
    });

    // Buscar clientes de uma vez para evitar múltiplas queries
    const allClients = await Client.findAll({
      where: { role: 2 },
      attributes: ["id", [fn("MONTH", col("created_at")), "month"]],
      raw: true,
    });

    // Organizar os dados para fácil acesso
    const revenueByMonth: Record<number, number> = {};
    const sendingClientsByMonth: Record<number, number> = {};

    allLists.forEach((list: any) => {
      const month = parseInt(list.month);
      revenueByMonth[month] = parseFloat(list.totalRevenue) || 0;
      sendingClientsByMonth[month] = parseInt(list.sendingClients) || 0;
    });

    const newPartnersByMonth: Record<number, number> = {};
    const totalPartners = new Set(allClients.map((c) => c.id));

    allClients.forEach((client: any) => {
      const month = parseInt(client.month);
      newPartnersByMonth[month] = (newPartnersByMonth[month] || 0) + 1;
    });

    // Calcular métricas mensais
    for (let m = 1; m <= 12; m++) {
      const currentMonthRevenue = revenueByMonth[m] || 0;
      const prevMonthRevenue = revenueByMonth[m - 1] || 0;

      let revenueIncreasePercentage = 0;
      if (prevMonthRevenue > 0) {
        revenueIncreasePercentage =
          ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100;
        if (revenueIncreasePercentage < 0) revenueIncreasePercentage = 0;
      } else {
        revenueIncreasePercentage = currentMonthRevenue > 0 ? 100 : 0;
      }

      result[m] = {
        newPartnersCount: newPartnersByMonth[m] || 0,
        notSendingCount: totalPartners.size - (sendingClientsByMonth[m] || 0),
        revenueIncreasePercentage,
      };
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Erro ao calcular dados mensais do gráfico:", error);
    res.status(500).json({
      message: "Erro ao calcular dados mensais do gráfico.",
      detalhes: "Ocorreu um problema ao acessar a base de dados.",
    });
  }
};

export const getHomeData = async (req: any, res: Response): Promise<any> => {
  try {
    return await HomeSummary(req, res);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao calcular dados mensais do gráfico.",
      detalhes: "Ocorreu um problema ao acessar a base de dados.",
    });
  }
};
