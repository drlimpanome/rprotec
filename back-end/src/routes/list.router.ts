import express from "express";
import {
  createOrUpdateList,
  getListByProtocol,
  getAllLists,
  updateList,
} from "../controllers/list.controller";
import { authenticateToken } from "../controllers/auth.controler";

const router = express.Router();

// router.get("/dashboard", authenticateToken, dashboardData); // Get all lists
router.get("/", authenticateToken, getAllLists); // Get all lists
router.get("/:protocol", authenticateToken, getListByProtocol); // Get a specific list by protocol
router.post("/", authenticateToken, createOrUpdateList); // Create a new list
router.put("/", authenticateToken, updateList); // Create a new list

export default router;
