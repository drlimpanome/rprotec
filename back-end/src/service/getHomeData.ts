import { Request, Response } from "express";
import ListGroup from "../models/list_group";
import List from "../models/list";
import Client from "../models/client";
import { Op } from "sequelize";

export const HomeSummary = async (req: any, res: Response): Promise<any> => {
  try {
    const userId: number = req.user?.id;
    const role: number = req.user?.role;

    const isAdmin = role === 1;

    // where base para filtrar listas conforme role
    const listsWhere: any = {};
    if (!isAdmin) {
      // clientes enxergam apenas listas próprias
      listsWhere.client_id = userId;
    }
    // Se sua coluna de data for "creation_date", troque para:
    // const dateColumn = "creation_date" as const;
    const dateColumn = "created_at" as const;

    // 1) Listas enviadas (count)
    const sentListsCount = await List.count({ where: listsWhere });

    // 2) Total de nomes enviados
    //    - admin: soma todos
    //    - não admin: soma apenas as próprias
    // Ideal: somar pela coluna agregada da List (ex.: names_quantity)
    // Caso essa coluna não exista/esteja defasada, você pode trocar para NamesList.count({ where: { list_id: ... }})
    const totalNamesSent =
      (await List.sum("names_quantity", { where: listsWhere })) || 0;

    // 3) Número de clientes cadastrados (somente admin)
    //    Se seus "clientes" são role=2, filtrar por isso
    const totalClients = isAdmin
      ? await Client.count({ where: { role: 2 } })
      : null;

    // 4) Últimas 5 listas enviadas (ou últimas recebidas se for admin)
    //    Admin: pega qualquer lista. Cliente: só as dele.
    const recentLists = await List.findAll({
      where: listsWhere,
      attributes: [
        "id",
        "protocol",
        "client_id",
        "names_quantity",
        "price",
        dateColumn, // "created_at" ou "creation_date"
      ],
      include: isAdmin
        ? [
            {
              model: Client,
              as: "client",
              attributes: ["id", "username", "email"],
            },
          ]
        : [],
      order: [[dateColumn, "DESC"]],
      limit: 5,
    });

    // 5) Próximo agrupamento de listas (list_group) ordenado por expires_at
    //    Se quiser apenas os futuros, usamos >= now. Se não houver futuro, devolvemos o mais recente passado como fallback.
    const now = new Date();

    let nextListGrouping = await ListGroup.findOne({
      where: { expires_at: { [Op.gte]: now } },
      order: [["expires_at", "ASC"]],
    });

    if (!nextListGrouping) {
      // fallback: último expirado (caso não exista nada futuro)
      nextListGrouping = await ListGroup.findOne({
        order: [["expires_at", "DESC"]],
      });
    }

    return res.status(200).json({
      role,
      data: {
        sentListsCount,
        totalNamesSent,
        totalClients, // null se não for admin
        recentLists,
        nextListGrouping,
      },
    });
  } catch (err) {
    console.error("Erro no homeSummary:", err);
    return res.status(500).json({
      message: "Erro ao carregar dados da home.",
      detalhes: "Ocorreu um problema ao acessar a base de dados.",
    });
  }
};
