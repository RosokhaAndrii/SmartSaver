import express from "express";
import { authMiddleware } from "../helpers/authMiddleware.js";
import {
  listAutoRules,
  getAutoRule,
  createAutoRule,
  updateAutoRule,
  removeAutoRule,
} from "../controllers/autoruleController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", listAutoRules);
router.post("/", createAutoRule);
router.get("/:id", getAutoRule);
router.put("/:id", updateAutoRule);
router.delete("/:id", removeAutoRule);

export default router;
