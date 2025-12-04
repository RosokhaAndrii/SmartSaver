import express from "express";
import { authMiddleware } from "../helpers/authMiddleware.js";
import { getDashboard } from "../controllers/dashBoardController.js";

const router = express.Router();
router.use(authMiddleware);

router.get("/", getDashboard);

export default router;
