import { Op, fn, col, WhereOptions } from "sequelize";
import Client from "../models/client";
import List from "../models/list";

export const getAllResponsibles = async (req: any, res: any) => {
  const clientRole = req.user.role;

  try {
    if (clientRole !== 1) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const whereCondition: WhereOptions = {
      responsible: {
        [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: "" }],
      },
    };

    const responsibles: any = await Client.findAll({
      attributes: [[fn("DISTINCT", col("responsible")), "responsible"]],
      where: whereCondition,
      raw: true,
    });

    const names = responsibles.map((r: any) => r.responsible);
    res.json(names);
  } catch (error) {
    console.error("Error fetching responsibles:", error);
    res.status(500).json({ message: "Failed to fetch responsibles." });
  }
};

export const extractReport = async (req: any, res: any) => {
  const { responsibles, startDate, endDate } = req.body;

  if (!Array.isArray(responsibles) || !startDate || !endDate) {
    return res.status(400).json({ message: "Parâmetros inválidos." });
  }

  try {
    const clients = await Client.findAll({
      where: {
        responsible: {
          [Op.in]: responsibles,
        },
      },
      attributes: ["username", "responsible"],
      include: [
        {
          model: List,
          as: "lists",
          where: {
            creation_date: {
              [Op.between]: [new Date(startDate), new Date(endDate)],
            },
          },
          required: false,
          attributes: ["list_name", "names_quantity", "price"],
        },
      ],
    });

    // Agrupar por responsável
    const reportMap: Record<
      string,
      {
        list_name: string;
        names_quantity: number;
        total_price: number;
        client: string;
      }[]
    > = {};

    clients.forEach((client: any) => {
      const responsible = client.responsible;

      if (!reportMap[responsible]) {
        reportMap[responsible] = [];
      }

      client.lists?.forEach((list: any) => {
        reportMap[responsible].push({
          list_name: list.list_name,
          names_quantity: list.names_quantity,
          total_price: list.price,
          client: client.username,
        });
      });
    });

    // Formatar resultado final como array
    const report = Object.entries(reportMap).map(([responsible, lists]) => ({
      responsible,
      lists,
    }));

    res.json(report);
  } catch (error) {
    console.error("Error extracting report:", error);
    res.status(500).json({ message: "Failed to extract report." });
  }
};
