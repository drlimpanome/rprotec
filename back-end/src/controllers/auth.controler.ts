import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Client from "../models/client";
import { Op } from "sequelize";
import UserService from "../models/user_services";
const JWT_SECRET = process.env.JWT_SECRET || "Secret";

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Dados obrigatórios ausentes.",
        detalhes: "Por favor, forneça 'email' e 'password'.",
      });
    }

    // Find client by email
    const client = await Client.findOne({ where: { email } });
    if (!client) {
      return res.status(404).json({
        message: `Credenciais inválidas.`,
        detalhes: "Email ou senha incorretos.",
      });
    }

    // Compare the provided password with the stored hashed password

    const isPasswordValid = await bcrypt.compare(password, client.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Credenciais inválidas.",
        detalhes: "Email ou senha incorretos.",
      });
    }

    // Generate a JWT token
    const token = jwt.sign(
      {
        id: client.id,
        email: client.email,
        role: client.role,
        affiliate_id: client.affiliateId,
      },
      JWT_SECRET,
      {
        expiresIn: "8h", // Token expiration time
      }
    );

    res.json({
      message: "Login bem-sucedido.",
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erro ao fazer login. Por favor, tente novamente mais tarde.",
      detalhes: "Ocorreu um problema ao acessar a base de dados.",
    });
  }
};

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  const token = req.headers.authorization?.split(" ")[1]; // Espera que o token seja enviado como 'Bearer <token>'

  if (!token) {
    return res.status(401).json({ message: "Token não fornecido." });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token inválido ou expirado." });
    }

    (req as any).user = user; // Armazena o usuário decodificado no objeto `req`
    next();
  });
};

export const signUp = async (req: Request, res: Response): Promise<any> => {
  let affiliateClient: any;
  try {
    const { username, document, email, password, affiliate, phone } = req.body;

    // Basic validation
    if (!username || !document || !email || !password || !phone) {
      return res.status(400).json({
        message: "Dados obrigatórios ausentes.",
        detalhes:
          "Por favor, forneça 'username', 'document', 'email', 'password' e 'affiliate'.",
      });
    }

    // Check if affiliate exists
    affiliateClient = await Client.findOne({
      where: { email: affiliate },
    });

    if (!affiliate) {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create the user
      const newClient = await Client.create({
        username,
        document,
        email,
        password: hashedPassword,
        phone,
        role: 2,
        active: true,
        uses_pix: false,
      });

      // Generate a JWT token
      const token = jwt.sign(
        { id: newClient.id, email: newClient.email, role: newClient.role },
        JWT_SECRET,
        {
          expiresIn: "8h",
        }
      );

      return res.status(201).json({
        message: "Usuário criado com sucesso.",
        token,
      });
    }

    if (!affiliateClient || affiliateClient.role === 1) {
      return res.status(400).json({
        message: "O link de indicação esta invalido.",
        detalhes: "O email fornecido como affiliate não existe.",
      });
    }

    // Check if email or document already exists
    const existingClient = await Client.findOne({
      where: { [Op.or]: [{ email }, { document }] },
    });

    if (existingClient) {
      return res.status(400).json({
        message: `Email ou documento já cadastrado. Para mais informações, entre em contato com seu Patrocinador: Email: ${affiliateClient?.email}, telefone: ${affiliateClient?.phone}.`,
        detalhes: "Por favor, utilize um email ou documento diferente.",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const newClient = await Client.create({
      username,
      document,
      email,
      password: hashedPassword,
      affiliateId: affiliateClient.id,
      phone,
      role: 2,
      active: true,
      uses_pix: false,
    });

    await UserService.create({
      client_id: newClient.id,
      service_id: 1,
      cost: 300,
    });

    // Generate a JWT token
    const token = jwt.sign(
      { id: newClient.id, email: newClient.email, role: newClient.role },
      JWT_SECRET,
      {
        expiresIn: "8h",
      }
    );

    res.status(201).json({
      message: "Usuário criado com sucesso.",
      token,
    });
  } catch (error) {
    res.status(404).json({
      message: `Erro ao criar usuário. Por favor, tente novamente mais tarde. Para mais informações, entre em contato com seu Patrocinador: Email: ${affiliateClient?.email}, telefone: ${affiliateClient?.phone}.`,
      detalhes: "Ocorreu um problema ao acessar a base de dados.",
      error,
    });
  }
};
