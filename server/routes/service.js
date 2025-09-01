import { Router } from "express"
import {
  authenticateUser,
  authorizePermissions,
} from "../middlewares/AuthMiddleware.js"
import {
  createService,
  deleteService,
  getAllServices,
  updateService,
} from "../controllers/ServiceController.js"
import { validate } from "../middlewares/ValidationMiddleware.js"
import {
  createServiceSchema,
  updateServiceSchema,
} from "../schemas/serviceSchema.js"

const router = Router()

router.use(authenticateUser) //user must be logged in to access this route

router.get("/", authorizePermissions("ADMIN", "CUSTOMER"), getAllServices)
router.post(
  "/",
  authorizePermissions("ADMIN"),
  validate(createServiceSchema),
  createService
)
router.patch(
  "/:id",
  authorizePermissions("ADMIN"),
  validate(updateServiceSchema),
  updateService
)
router.delete("/:id", authorizePermissions("ADMIN"), deleteService)

export default router
