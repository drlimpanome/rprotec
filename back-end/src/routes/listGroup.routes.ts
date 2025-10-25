import express from "express";
import {
  createOrUpdateListGroup,
  getAllListGroups,
  getListGroupById,
  updateListGroup,
  getNearestListGroup, // Import the new function
} from "../controllers/listGroup.controller";

const router = express.Router();

router.get("/nearest", getNearestListGroup); // New route for nearest list group
router.get("/:id", getListGroupById);
router.get("/", getAllListGroups);
router.post("/", createOrUpdateListGroup);
router.put("/:id", updateListGroup);

export default router;
