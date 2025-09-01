import { Router } from "express"
import { createBook } from "../controllers/BookController.js"
import {
  authenticateUser,
  authorizePermissions,
} from "../middlewares/AuthMiddleware.js"
import { validate } from "../middlewares/ValidationMiddleware.js"
import { createBookSchema } from "../schemas/bookSchema.js"

const router = Router()

router.use(authenticateUser)

router.post(
  "/",
  authorizePermissions("CUSTOMER"),
  validate(createBookSchema),
  createBook
)

export default router
