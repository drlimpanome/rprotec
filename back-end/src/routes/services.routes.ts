import express from "express";
import {
  getAllServices,
  createService,
  updateService,
  addServiceForm,
  updateFormStatus,
  getAllServicesPageGeral,
} from "../controllers/services.controler";
import { authenticateToken } from "../controllers/auth.controler";

const router = express.Router();

router.get("/", authenticateToken, getAllServices);
router.get("/page/geral", authenticateToken, getAllServicesPageGeral);
router.post("/", authenticateToken, createService);
router.get("/form/:id", authenticateToken, addServiceForm);
router.get("/form", authenticateToken, addServiceForm);
router.put("/form/:id", authenticateToken, addServiceForm);
router.put("/active/:id", authenticateToken, updateFormStatus);
router.put("/:id", authenticateToken, updateService);

export default router;
