import { Request, Response } from "express";
import ListGroup from "../models/list_group";
import List from "../models/list";
import Client from "../models/client";
import NamesList from "../models/name_list";
import { Op } from "sequelize";
import StatusHistory from "../models/status_history";
import UserService from "../models/user_services";
import { subHours } from "date-fns";
import logger from "../utils/logger";

export const updateListGroup = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;
  const { status } = req.body;
  console.log(status);

  try {
    const listGroup = await ListGroup.findByPk(id);
    if (!listGroup) return res.status(404).json({ message: "Group not found" });

    // Update the group status
    await listGroup.update({ status });

    logger.info("Group and status history updated successfully", {
      list_group_id: id,
      data: status,
    });

    // Update the status of associated lists
    const lists = await List.update(
      { status },
      { where: { list_group_id: id, payed: true } }
    );

    // Update the status history
    lists.forEach(async (list: any) => {
      await StatusHistory.create({
        list_id: list.id,
        list_group_id: id,
        status: status,
      });
    });

    res
      .status(200)
      .json({ message: "Group and status history updated successfully" });
  } catch (error) {
    console.error("Error updating group:", error);
    res.status(500).json({ error: "Error updating group" });
  }
};

export const getAllListGroups = async (req: Request, res: Response) => {
  const { status, listDetails } = req.query;

  try {
    const filter: any = status ? { where: { status } } : {};
    let listGroups;

    if (listDetails === "1") {
      listGroups = await ListGroup.findAll({
        ...filter,
        include: [
          {
            model: List,
            as: "lists",
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
          },
          {
            model: StatusHistory,
            as: "statusHistory", // Ensure this matches your StatusHistory association alias
            attributes: ["status", "updated_at"],
          },
        ],
      });
    } else {
      listGroups = await ListGroup.findAll({
        ...filter,
        include: [
          {
            model: StatusHistory,
            as: "statusHistory",
            attributes: ["status", "updated_at"],
          },
        ],
      });
    }

    res.status(200).json(listGroups);
  } catch (error) {
    console.error("Error fetching list groups:", error);
    res.status(500).json({ error: "Failed to fetch list groups" });
  }
};

// Create or update a ListGroup
export const createOrUpdateListGroup = async (req: Request, res: Response) => {
  const { name, expires_at, id } = req.body;

  try {
    const adjustedExpiresAt = subHours(new Date(expires_at), 3);
    let listGroup = await ListGroup.findByPk(parseInt(id ?? ""));

    if (listGroup) {
      listGroup.expires_at = adjustedExpiresAt;
      listGroup.status = "pagamento aprovado";
      listGroup.admin = false;
      listGroup.name = name;
      await listGroup.save();
      res.status(200).json(listGroup);
    } else {
      const newListGroup = await ListGroup.create({
        name,
        expires_at: adjustedExpiresAt,
        status: "pagamento aprovado",
        admin: false,
      });
      res.status(201).json(newListGroup);
    }
  } catch (error) {
    console.error("Error creating or updating ListGroup:", error);
    res
      .status(500)
      .json({ error: "Erro ao criar ou atualizar o grupo de listas" });
  }
};

// Delete a ListGroup by ID
export const deleteListGroup = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const listGroup = await ListGroup.findByPk(id);

    if (!listGroup) {
      return res.status(404).json({ error: "Grupo de listas não encontrado" });
    }

    await listGroup.destroy();
    res.status(200).json({ message: "Grupo de listas excluído com sucesso" });
  } catch (error) {
    console.error("Error deleting ListGroup:", error);
    res.status(500).json({ error: "Erro ao excluir o grupo de listas" });
  }
};

export const getListGroupById = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;

  try {
    const groupData: any = await ListGroup.findByPk(id, {
      include: [
        {
          model: List,
          as: "lists",
          where: {
            payed: true,
          },
          attributes: [
            "id",
            "status",
            "names_quantity",
            "price",
            "creation_date",
          ],
          include: [
            {
              model: NamesList,
              as: "listData",
              attributes: ["nome", "cpf"],
            },
            {
              model: Client,
              as: "client",
              attributes: ["id", "username", "email", "phone", "responsible"], // Incluímos `id` para verificar o preço do serviço
            },
          ],
        },
        {
          model: StatusHistory,
          as: "statusHistory",
          attributes: ["status", "updated_at"],
        },
      ],
    });

    if (!groupData) {
      return res
        .status(404)
        .json({ message: "Grupo de listas não encontrado" });
    }

    // Iterar sobre as listas e buscar o preço do serviço para cada cliente
    for (const list of groupData.lists) {
      if (list.client) {
        const userService = await UserService.findOne({
          where: {
            client_id: list.client.id,
            service_id: 1, // Assuming the service ID is always 1
          },
        });

        if (userService) {
          list.client.price_consult = userService.cost; // Adiciona o preço ao cliente
        } else {
          list.client.price_consult = null; // Define como null caso o serviço não seja encontrado
        }
      }
    }

    res.status(200).json(groupData);
  } catch (error) {
    console.error("Erro ao buscar grupo de listas:", error);
    res.status(500).json({ error: "Erro ao buscar grupo de listas" });
  }
};

export const getNearestListGroup = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const nearestGroup = await ListGroup.findOne({
      where: {
        expires_at: {
          [Op.gt]: new Date(), // Only future dates
        },
      },
      order: [["expires_at", "ASC"]], // Ascending order to get the soonest expiration date
      include: [
        {
          model: StatusHistory,
          as: "statusHistory",
          attributes: ["status", "updated_at"],
        },
      ],
      limit: 1,
    });

    if (!nearestGroup) {
      return res.status(404).json({ message: "No upcoming list group found" });
    }

    res.status(200).json(nearestGroup);
  } catch (error) {
    console.error("Error fetching nearest list group:", error);
    res.status(500).json({ error: "Failed to fetch nearest list group" });
  }
};
