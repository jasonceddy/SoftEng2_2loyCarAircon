import { Router } from "express"
import { authenticateUser } from "../middlewares/AuthMiddleware.js"
import {
  acceptQuote,
  createQuote,
  deleteQuote,
} from "../controllers/QuoteController.js"

const router = Router()

router.use(authenticateUser)

router.post("/:id/generate", createQuote)
router.patch("/:id/accept", acceptQuote)
router.delete("/:id/cancel", deleteQuote)

export default router