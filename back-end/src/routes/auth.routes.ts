// routes/auth.routes.ts
import express from "express";
import { login, signUp } from "../controllers/auth.controler"; // Ajuste o caminho se necessário

const router = express.Router();

// Define a rota de login
router.post("/login", login);
router.post("/create", signUp);

export default router;
