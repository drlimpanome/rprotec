import express from "express";
import { authenticateToken } from "../controllers/auth.controler";
import {
  saveAnswers,
  getAnswers,
  getAnswerById,
  invalidAnswers,
  updateAnswers,
  ApproveForm,
  confirmAffiliateService,
  serviceUpdateStatus,
} from "../controllers/formAnswers.controler";

import multer from "multer";

const upload = multer();

// Sub-router para rotas que precisam do middleware de upload
const answersRouter = express.Router();

// Aplica o middleware de upload apenas ao sub-router
answersRouter.use(upload.any());

// Rota para enviar o comprovante
answersRouter.post("/", saveAnswers);

const router = express.Router();
router.post("/", authenticateToken, answersRouter);
router.get("/", authenticateToken, getAnswers);
router.get("/:id", authenticateToken, getAnswerById);
router.put("/:id", authenticateToken, invalidAnswers);
router.put("/edit/:id", authenticateToken, updateAnswers);
router.put("/approve/:id", authenticateToken, ApproveForm);
router.post("/confirm", authenticateToken, confirmAffiliateService);
router.put("/status/:id", authenticateToken, serviceUpdateStatus);

export default router;
