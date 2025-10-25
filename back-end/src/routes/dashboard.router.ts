import express from "express";
import {
  dashboardData,
  totalizersData,
  monthlyChartDataYear,
  getHomeData,
} from "../controllers/dashboard.controler";
import { authenticateToken } from "../controllers/auth.controler";

const router = express.Router();

router.get("/", authenticateToken, dashboardData); // Get all lists
router.get("/totalizers", authenticateToken, totalizersData);
router.get("/monthly", authenticateToken, monthlyChartDataYear);
router.get("/home", authenticateToken, getHomeData);

export default router;
