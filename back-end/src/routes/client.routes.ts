import express from "express";
import {
  createClient,
  getClients,
  updateClient,
  getClientProfile,
  toggleClientStatus,
  affiliateConfig,
  getAffiliates,
} from "../controllers/client.controller";
import { authenticateToken } from "../controllers/auth.controler";
import {
  getAllResponsibles,
  extractReport,
} from "../controllers/resposibles.controller";

const router = express.Router();

router.get("/", authenticateToken, getClients);
router.get("/affiliates", authenticateToken, getAffiliates);
router.post("/affiliate-config", authenticateToken, affiliateConfig);
router.post("/", authenticateToken, createClient);
router.put("/:id", authenticateToken, updateClient);
router.put("/:id/toggle-status", authenticateToken, toggleClientStatus);
router.get("/responsible", authenticateToken, getAllResponsibles);
router.post("/responsible/report", authenticateToken, extractReport);

// Rota para pegar o perfil do cliente autenticado
router.get("/profile", authenticateToken, getClientProfile);
export default router;
