import { Request, Response } from "express";
import Service from "../models/service";
import FormField from "../models/form_fields";
import ServiceForm from "../models/service_form";
import UserService from "../models/user_services";
import ServiceFormFieldAnswer from "../models/form_fields_anserws";
import { Op, where } from "sequelize";

export const getAllServicesPageGeral = async (
  req: any,
  res: Response
): Promise<any> => {
  const clientId = req.user.id;
  const clientRole = req.user.role;
  const { admin } = req.query;
  try {
    if (clientRole !== 1) {
      const services = await UserService.findAll({
        where: { client_id: clientId },
        include: [
          {
            model: Service,
            as: "service",
            where: { id: { [Op.ne]: 1 } },
            include: [
              {
                model: ServiceForm,
                as: "servicesForm",
                where: { active: true },
                include: [{ model: FormField, as: "formFields" }],
              },
            ],
          },
        ],
      });
      return res.status(200).json(services);
    }

    const services = await Service.findAll({
      ...(admin && { where: { id: { [Op.ne]: 1 } } }),
      include: [
        {
          model: ServiceForm,
          as: "servicesForm",
          include: [{ model: FormField, as: "formFields" }],
        },
      ],
    });
    res.status(200).json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({
      message: "Failed to fetch services. Please try again later.",
    });
  }
};

export const getAllServices = async (req: any, res: Response): Promise<any> => {
  const clientId = req.user.id;
  const clientRole = req.user.role;
  const { admin } = req.query;
  try {
    if (clientRole !== 1) {
      const services = await UserService.findAll({
        where: { client_id: clientId },
      });
      const servicesIds = services.map((service: any) => service.service_id);
      const usableServices = await Service.findAll({
        where: { id: { [Op.in]: servicesIds } },
        include: [
          {
            model: ServiceForm,
            as: "servicesForm",
            include: [{ model: FormField, as: "formFields" }],
          },
        ],
      });
      return res.status(200).json(usableServices);
    }

    const services = await Service.findAll({
      ...(admin && { where: { id: { [Op.ne]: 1 } } }),
      include: [
        {
          model: ServiceForm,
          as: "servicesForm",
          include: [{ model: FormField, as: "formFields" }],
        },
      ],
    });
    res.status(200).json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({
      message: "Failed to fetch services. Please try again later.",
    });
  }
};

export const createService = async (req: Request, res: Response) => {
  const { name } = req.body;
  try {
    const newService = await Service.create({ name });
    res.status(201).json(newService);
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({ message: "Error creating service." });
  }
};

export const updateService = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const service = await Service.findByPk(id);
    if (!service) {
      return res.status(404).json({ message: "Service not found." });
    }
    service.name = name;
    await service.save();
    res.json(service);
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({ message: "Error updating service." });
  }
};
export const addServiceForm = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params; // ID do serviço
  const { formFields, name } = req.body; // Campos e nome do formulário

  try {
    // Busca o serviço e inclui os forms associados
    const service = await Service.findByPk(id, {
      include: [{ model: ServiceForm, as: "servicesForm" }],
    });

    if (!service) {
      return res.status(404).json({ message: "Serviço não foi encontrado." });
    }

    // Verifica se há servicesForm existentes e desativa todos
    if (service.servicesForm && service.servicesForm.length > 0) {
      await Promise.all(
        service.servicesForm.map((form: any) => form.update({ active: false }))
      );
    }

    const existingForm = await ServiceForm.findOne({
      where: { name, service_id: id },
    });

    if (existingForm) {
      return res
        .status(400)
        .json({ message: "Formulário com o mesmo nome ja existe." });
    }

    console.log(formFields, name, id);

    const serviceForm = await ServiceForm.create({
      service_id: id,
      name,
      active: true,
    });

    // Cria os FormFields relacionados
    if (formFields && Array.isArray(formFields)) {
      const formFieldsData = formFields.map((field: any) => ({
        serviceForm_id: serviceForm.id,
        label: field.label,
        type: field.type,
        required: field.required || false,
        service_id: id,
      }));

      await FormField.bulkCreate(formFieldsData);
    }

    res.status(201).json({
      message: "Formulário criado com sucesso.",
    });
  } catch (error) {
    console.error("Error creating service form:", error);
    res.status(500).json({ message: "Erro ao criar o formulário." });
  }
};

export const updateFormStatus = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const serviceForm = await ServiceForm.findByPk(id);
    if (!serviceForm) {
      return res
        .status(404)
        .json({ message: "Formulário não foi encontrado." });
    }
    console.log(serviceForm.service_id);
    await ServiceForm.update(
      { active: false },
      { where: { service_id: serviceForm.service_id } }
    );
    // Atualiza o formulário específico para active: true
    await serviceForm.update({ active: true });
    res.status(200).json({
      message: "Formulário Ativado com sucesso.",
      status: 200,
    });
  } catch (e) {
    res.status(500).json({ message: "Erro ao mudar o status do formulário." });
  }
};

export const getAllForms = async (req: any, res: Response) => {
  const clientId = req.user.id;
  const clientRole = req.user.role;
  try {
    /*const answers = await ServiceFormFieldAnswer.findAll({
      where: { user_id: clientId },
    });
    res.json(forms);*/
  } catch (error) {
    console.error("Error fetching forms:", error);
    res.status(500).json({ message: "Failed to fetch forms." });
  }
};
