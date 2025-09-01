import { Router } from "express"
import { authenticateUser } from "../middlewares/AuthMiddleware.js"
import { getTechnicians } from "../controllers/UserController.js"

const router = Router()

router.use(authenticateUser)

router.get("/technicians", getTechnicians)

export default router
