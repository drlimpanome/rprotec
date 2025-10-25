import { Response } from "express";
import ServiceFormFieldAnswer from "../models/form_fields_anserws";
import ServiceFormSubmission from "../models/submission_group";
import FormField from "../models/form_fields";
import Client from "../models/client";
import ServiceForm from "../models/service_form";
import { S3Controller } from "./s3.controler";
import { Op } from "sequelize";
import StatusHistory from "../models/status_history";

const s3Controller = new S3Controller();
const generateProtocol = async (): Promise<string> => {
  const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
  const listCount = await ServiceFormSubmission.count();
  return `${datePrefix}-${listCount + 1}`;
};

export const saveAnswers = async (req: any, res: Response): Promise<any> => {
  try {
    const { form_id, service_id, price } = req.body;
    const files = req.files as Express.Multer.File[];
    const clientId = req.user.id;
    const affiliate_id = req.user.affiliate_id;

    console.log("📩 Dados recebidos:", req.body);
    console.log("📂 Arquivos recebidos:", files);

    // ✅ Converter as respostas textuais para um objeto
    let textAnswers: Record<string, string> = {};
    try {
      textAnswers = JSON.parse(req.body.text_answers || "{}");
    } catch (error) {
      console.error("❌ Erro ao converter text_answers para JSON:", error);
      return res
        .status(400)
        .json({ message: "Formato inválido para answers." });
    }

    // ✅ Criar submissão no banco de dados
    const protocol = await generateProtocol();
    const formSubmission = await ServiceFormSubmission.create({
      user_id: clientId,
      service_form_id: form_id,
      price,
      status: "aguardando pagamento",
      protocol,
      affiliate_id,
      group_payment_id: null,
    });

    // ✅ Criar estrutura final de respostas
    const answers: Record<string, any> = { ...textAnswers };

    // ✅ Upload de arquivos para o S3 e associá-los aos answers
    for (const file of files) {
      const key = file.fieldname.match(/\d+/)?.[0]; // Extrai o ID do campo (ex: "files[13]" -> "13")
      console.log(key);
      if (key) {
        const folder = `servicos/form-uploads/${formSubmission.id}`;
        const fileName = await s3Controller.saveFile(
          folder,
          file.originalname,
          file.buffer
        );
        console.log(fileName);
        answers[key] = fileName; // Salva apenas o nome do arquivo
      }
    }

    console.log("✅ Estrutura final dos answers:", answers);

    // ✅ Preparar os dados para o bulkCreate
    const answersArray = Object.entries(answers).map(
      ([formFieldId, value]) => ({
        service_id: service_id,
        form_field_id: parseInt(formFieldId),
        user_id: clientId,
        service_form_submission_id: formSubmission.id,
        answer: value, // Agora, se for arquivo, será apenas o nome salvo no banco
      })
    );

    console.log(answersArray);

    // ✅ Inserindo as respostas associadas no banco
    await ServiceFormFieldAnswer.bulkCreate(answersArray);

    // ✅ Criar histórico do status
    await StatusHistory.create({
      submission_id: formSubmission.id,
      status: "aguardando pagamento",
    });

    res.status(200).json({
      message: "Respostas salvas com sucesso.",
      id: formSubmission.id,
    });
  } catch (error) {
    console.error("❌ Erro ao salvar respostas:", error);
    res.status(500).json({ message: "Erro ao salvar respostas." });
  }
};

export const getAnswers = async (req: any, res: Response): Promise<any> => {
  const {
    serviceId,
    userId,
    page = 1,
    limit = 10,
    clientFilter,
    statusFilter,
    affiliateFilter,
    type,
  } = req.query;

  const clientId = req.user.id;
  const clientRole = req.user.role;

  let whereClause: any = {
    ...(type && { affiliate_id: clientId }),
    ...(!type && clientRole == 2 && { affiliate_id: null }),
    ...(clientRole === 1 && {
      [Op.or]: [
        { affiliate_id: null }, // Listas sem affiliate_id
        { affiliate_id: { [Op.ne]: null }, confirmed_affiliate_list: true }, // Listas com affiliate_id, mas somente se confirmed_affiliate_list for true
      ],
    }),
    ...(clientRole === 2 && {
      [Op.or]: [
        { user_id: clientId }, // Listas sem affiliate_id
        { affiliate_id: clientId }, // Listas com affiliate_id, mas somente se confirmed_affiliate_list for true
      ],
    }),
  };

  try {
    // Convertendo valores numéricos
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const offset = (pageNumber - 1) * limitNumber;

    if (serviceId) whereClause.service_id = serviceId;
    if (userId) whereClause.user_id = userId;
    if (clientFilter) whereClause.protocol = clientId;
    if (statusFilter) whereClause.status = statusFilter;

    // Filtro por afiliado
    let userWhereClause: any = {};
    if (clientRole === 1 && affiliateFilter) {
      userWhereClause.affiliateId = parseInt(affiliateFilter, 10);
    } else if (clientRole === 2 && affiliateFilter) {
      whereClause.user_id = parseInt(affiliateFilter, 10); // Caso clientRole seja 2, filtra direto por user_id
    } else if (clientRole === 3) {
      whereClause.user_id = clientId;
    }

    console.log("limit and page", pageNumber, limitNumber);
    console.log("whereClause:", whereClause);
    console.log("userWhereClause:", userWhereClause);

    // Definição do include
    const includeClause: any[] = [
      {
        model: ServiceFormFieldAnswer,
        as: "answers",
        include: [{ model: FormField, as: "formField" }],
        required: false, // Permite registros sem respostas
      },
      {
        model: Client,
        as: "user",
        attributes: ["id", "affiliateId", "username"],
        required: false, // Permite registros sem cliente associado
        where: Object.keys(userWhereClause).length
          ? userWhereClause
          : undefined, // Aplica where condicionalmente
      },
      {
        model: ServiceForm,
        as: "serviceForm",
        attributes: ["name"],
        required: false, // Permite registros sem formulário associado
      },
    ];

    // Consulta no banco de dados
    const { count, rows } = await ServiceFormSubmission.findAndCountAll({
      where: whereClause,
      include: includeClause,
      limit: limitNumber,
      offset,
      distinct: true, // Adiciona distinct para evitar duplicação no count
    });

    // Responde com os dados
    res.status(200).json({
      totalItens: count,
      currentPage: pageNumber,
      services: rows,
    });
  } catch (error) {
    console.error("Error fetching answers:", error);
    res.status(500).json({ message: "Error fetching answers." });
  }
};

export const getAnswerById = async (req: any, res: Response): Promise<any> => {
  const id = req.params.id;
  const clientId = req.user.id;
  const clientRole = req.user.role;

  try {
    const answers: any = await ServiceFormSubmission.findByPk(id, {
      include: [
        {
          model: ServiceFormFieldAnswer,
          as: "answers",
          include: [{ model: FormField, as: "formField" }],
        },
        {
          model: Client,
          as: "user",
          include: [
            {
              model: Client,
              as: "affiliate",
              attributes: ["id", "uses_pix", "pix_key"],
            },
          ],
        },
        {
          model: ServiceForm,
          as: "serviceForm",
          attributes: ["name"],
        },
      ],
    });

    if (!answers) {
      return res.status(404).json({ message: "Submissão não encontrada." });
    }

    let pix = null;
    if (clientRole === 3) {
      pix = answers?.user?.affiliate?.uses_pix
        ? answers?.user?.affiliate?.pix_key
        : null;
    }

    if (clientRole === 2) {
      const clientpix = await Client.findByPk(2, {
        attributes: ["pix_key"],
      });
      pix = clientpix?.pix_key;
    }

    const cleanedAnswers = answers.toJSON(); // Converte para JSON

    let group_payment_total = null;
    if (cleanedAnswers.group_payment_id) {
      const groupPayment = await ServiceFormSubmission.findAll({
        where: { group_payment_id: cleanedAnswers.group_payment_id },
        attributes: ["price"],
      });

      group_payment_total = groupPayment.reduce(
        (total, item) => total + item.price,
        0
      );
    }

    // 🔥 **Recuperar arquivos do S3 para os campos do tipo "file"**
    for (const answer of cleanedAnswers.answers) {
      if (answer.formField.type === "file" && answer.answer) {
        try {
          console.log(
            `📂 Buscando arquivo: servicos/form-uploads/${cleanedAnswers.id}/${answer.answer}`
          );

          const fileData = await s3Controller.retrieveFile(
            `servicos/form-uploads/${cleanedAnswers.id}`,
            answer.answer
          );

          // Se for PDF, retorna Buffer normal
          if (fileData.buffer && fileData.contentType === "application/pdf") {
            answer.answer = {
              fileName: answer.answer,
              fileData: fileData.buffer.toString("base64"), // Base64 ainda pode ser útil aqui
              contentType: fileData.contentType,
            };
          }
          // Se for imagem, retorna Base64 pronto para <img>
          else if (fileData.base64) {
            answer.answer = {
              fileName: answer.answer,
              fileData: fileData.base64, // Base64 completo com MIME type
              contentType: fileData.contentType,
            };
          } else {
            throw new Error("Tipo de arquivo não suportado.");
          }
        } catch (error) {
          console.error(
            `❌ Erro ao buscar arquivo ${answer.answer} do S3:`,
            error
          );
          answer.answer = null; // Se falhar, retorna null
        }
      }
    }

    // 🔥 **Recuperar o comprovante caso exista**
    if (cleanedAnswers.comprovanteUrl) {
      try {
        console.log(
          `📂 Buscando comprovante: servicos/comprovantes/${answers.comprovanteUrl}`
        );
        const comprovanteBuffer = await s3Controller.retrieveFile(
          "servicos/comprovantes",
          answers.comprovanteUrl
        );

        cleanedAnswers.comprovanteUrl = comprovanteBuffer;
      } catch (error) {
        console.error(
          `❌ Erro ao buscar comprovante ${answers.comprovanteUrl} do S3:`,
          error
        );
        cleanedAnswers.comprovanteUrl = null;
      }
    }

    res.status(200).json({
      ...cleanedAnswers,
      pix_key: pix,
      group_payment_total,
    });
  } catch (error) {
    console.error("❌ Erro ao buscar respostas:", error);
    res.status(500).json({ message: "Erro ao buscar respostas." });
  }
};

export const invalidAnswers = async (req: any, res: Response): Promise<any> => {
  const { invalids_answers } = req.body;
  const { id } = req.params;

  try {
    // Validação básica do payload
    if (
      !invalids_answers ||
      typeof invalids_answers !== "object" ||
      Object.keys(invalids_answers).length === 0
    ) {
      return res
        .status(400)
        .json({ message: "invalids_answers must be a non-empty object." });
    }

    const formSubmission = await ServiceFormSubmission.findByPk(id);
    if (!formSubmission) {
      return res.status(404).json({ message: "Form submission not found." });
    }
    formSubmission.status = "Formulario Reprovado";
    await formSubmission.save();

    console.log(Object.entries(invalids_answers));

    // Criando um array de Promises para atualizar os registros existentes
    const updatePromises = Object.entries(invalids_answers).map(
      ([id, reason]) => {
        console.log(id, reason);
        return ServiceFormFieldAnswer.update(
          { invalid_reason: reason }, // Apenas atualiza o campo necessário
          { where: { id } } // Só atualiza se o registro existir
        );
      }
    );

    // Executando todas as atualizações em paralelo
    await Promise.all(updatePromises);

    res.status(200).json({ message: "Respostas invalidadas com sucesso." });
  } catch (error) {
    console.error("Error saving invalid answers:", error);
    res.status(500).json({ message: "Error saving invalid answers." });
  }
};

export const updateAnswers = async (req: any, res: Response): Promise<any> => {
  const { updated_answers } = req.body; // Dados corrigidos pelo usuário
  const { id } = req.params; // ID do formulário

  try {
    // Validação do payload
    if (
      !updated_answers ||
      typeof updated_answers !== "object" ||
      Object.keys(updated_answers).length === 0
    ) {
      return res
        .status(400)
        .json({ message: "updated_answers must be a non-empty object." });
    }

    // Busca a submissão do formulário no banco
    const formSubmission = await ServiceFormSubmission.findByPk(id);
    if (!formSubmission) {
      return res.status(404).json({ message: "Form submission not found." });
    }

    // Atualiza o status para "Aguardando aprovação"
    formSubmission.status = "Aguardando aprovação";
    await formSubmission.save();

    console.log("Atualizando respostas:", Object.entries(updated_answers));

    // Criando um array de Promises para atualizar os registros existentes
    const updatePromises = Object.entries(updated_answers).map(
      async ([fieldId, newValue]) => {
        console.log(`Campo ID ${fieldId} atualizado para:`, newValue);
        return ServiceFormFieldAnswer.update(
          { answer: newValue, invalid_reason: null }, // Remove o erro e salva a nova resposta
          { where: { id: fieldId } }
        );
      }
    );

    // Executa todas as atualizações em paralelo
    await Promise.all(updatePromises);

    res.status(200).json({
      message:
        "Respostas corrigidas com sucesso. Formulário aguardando aprovação.",
    });
  } catch (error) {
    console.error("Erro ao salvar respostas corrigidas:", error);
    res.status(500).json({ message: "Erro ao salvar respostas corrigidas." });
  }
};

export const ApproveForm = async (req: any, res: Response): Promise<any> => {
  const { id } = req.params; // ID do formulário

  try {
    // Busca a submissão do formulário no banco
    const formSubmission = await ServiceFormSubmission.findByPk(id);
    if (!formSubmission) {
      return res.status(404).json({ message: "Form submission not found." });
    }

    // Atualiza o status para "Aprovado"
    formSubmission.status = "Aprovado";
    await formSubmission.save();

    await StatusHistory.create({
      submission_id: formSubmission.id,
      status: "Formulario Aprovado",
    });

    res.status(200).json({ message: "Formulário aprovado com sucesso." });
  } catch (error) {
    console.error("Erro ao aprovar formulário:", error);
    res.status(500).json({ message: "Erro ao aprovar formulário." });
  }
};

export const confirmAffiliateService = async (
  req: any,
  res: Response
): Promise<any> => {
  const { data } = req.body; // Array de IDs dos registros a serem atualizados

  try {
    // Validação básica do payload
    if (!Array.isArray(data) || data.length === 0) {
      return res
        .status(400)
        .json({ message: "Data must be a non-empty array." });
    }

    // Atualiza os registros no banco de dados
    const [updatedCount] = await ServiceFormSubmission.update(
      {
        confirmed_affiliate_list: 1, // Atualiza a coluna confirmed_affiliate_list
        status: "Aguardando Aprovação", // Atualiza o status
      },
      {
        where: { id: data }, // Filtra pelos IDs fornecidos
      }
    );

    // Verifica se algum registro foi atualizado
    if (updatedCount === 0) {
      return res
        .status(404)
        .json({ message: "Nenhum registro encontrado para atualização." });
    }

    // Responde com sucesso
    res.status(200).json({
      message: `${updatedCount} registro(s) atualizado(s) com sucesso.`,
    });
  } catch (error) {
    console.error("Erro ao confirmar serviços de afiliados:", error);
    res
      .status(500)
      .json({ message: "Erro ao confirmar serviços de afiliados." });
  }
};

export const serviceUpdateStatus = async (
  req: any,
  res: Response
): Promise<any> => {
  const { status } = req.body; // Array de IDs dos registros a serem atualizados
  const { id } = req.params;

  try {
    // Busca a submissão do formulário no banco
    const formSubmission = await ServiceFormSubmission.findByPk(id);
    if (!formSubmission) {
      return res.status(404).json({ message: "Form submission not found." });
    }

    await StatusHistory.create({
      submission_id: formSubmission.id,
      status,
    });

    // Atualiza o status para "Aguardando aprovação"
    formSubmission.status = status;
    await formSubmission.save();

    res.status(200).json({ message: "Status atualizado com sucesso." });
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    res.status(500).json({ message: "Erro ao atualizar status." });
  }
};
