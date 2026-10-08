import express from "express";
import { signup, login, logout } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { apiRateLimit, authRateLimit } from "../middleware/rateLimit.middleware.js";

const router = express.Router();

router.use(apiRateLimit);

router.post("/signup", authRateLimit, signup);
router.post("/login", authRateLimit, login);
router.post("/logout", logout);

router.get("/check", protectRoute, (req, res) => res.status(200).json(req.user));

export default router;
