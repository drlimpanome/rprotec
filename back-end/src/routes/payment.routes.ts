// src/routes/pixRoutes.ts

import express from "express";
import {
  checkPaymentStatus,
  createPaymentPix,
  handleWebhook,
  payByPix,
  aproveComprovante,
  generatePaymentLinkOrQrcode,
} from "../controllers/payment.controller";
import { authenticateToken } from "../controllers/auth.controler";
import multer from "multer";

const router = express.Router();
const upload = multer();

// Sub-router para rotas que precisam do middleware de upload
const comprovanteRouter = express.Router();

// Aplica o middleware de upload apenas ao sub-router
comprovanteRouter.use(upload.single("comprovante"));

// Rota para enviar o comprovante
comprovanteRouter.post("/", payByPix);

// Rotas principais
router.post("/pix", authenticateToken, createPaymentPix); // Criação de uma cobrança via Pix
router.get("/pix/status/:idLista", authenticateToken, checkPaymentStatus);
router.post("/webhook", handleWebhook);
router.get("/generate-payment", authenticateToken, generatePaymentLinkOrQrcode);
router.post("/aprovar/:id", authenticateToken, aproveComprovante);

// Usa o sub-router para a rota /comprovante
router.use("/comprovante", authenticateToken, comprovanteRouter);

export default router;
