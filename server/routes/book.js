import { Router } from "express"
import {
  assignTechnician,
  confirmBooking,
  createBook,
  getBookings,
  rejectBooking,
} from "../controllers/BookController.js"
import {
  authenticateUser,
  authorizePermissions,
} from "../middlewares/AuthMiddleware.js"
import { validate } from "../middlewares/ValidationMiddleware.js"
import { createBookSchema, rejectSchema } from "../schemas/bookSchema.js"

const router = Router()

router.use(authenticateUser)

router.post(
  "/",
  authorizePermissions("CUSTOMER"),
  validate(createBookSchema),
  createBook
)

router.get("/", getBookings)
router.patch("/:id/assign", authorizePermissions("ADMIN"), assignTechnician)
router.patch(
  "/:id/reject",
  authorizePermissions("ADMIN"),
  validate(rejectSchema),
  rejectBooking
)
router.patch("/:id/confirm", authorizePermissions("ADMIN"), confirmBooking)

export default router