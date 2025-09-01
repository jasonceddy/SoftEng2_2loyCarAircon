import express from "express"
import { PrismaClient } from "@prisma/client"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import cors from "cors"
import errorHandlerMiddleware from "./middlewares/ErrorHandlerMiddleware.js"
import AuthRouter from "./routes/auth.js"
import ServiceRouter from "./routes/service.js"
import CarRouter from "./routes/car.js"
import BookRouter from "./routes/book.js"
import UserRouter from "./routes/user.js"

dotenv.config()

export const prisma = new PrismaClient()

const app = express()

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
)
app.use(express.json())
app.use(cookieParser())

app.use("/api/auth", AuthRouter)
app.use("/api/services", ServiceRouter)
app.use("/api/cars", CarRouter)
app.use("/api/bookings", BookRouter)
app.use("/api/users", UserRouter)

app.use((req, res) => {
  res.status(404).json({ message: "Not Found" })
})

app.use(errorHandlerMiddleware)

app.listen(5000, () => {
  console.log("server running...")
})
