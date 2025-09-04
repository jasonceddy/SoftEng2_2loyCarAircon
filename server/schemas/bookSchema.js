import z from "zod"

export const createBookSchema = z.object({
  carId: z.number().int().positive(),
  serviceId: z.number().int().positive(),
  scheduledAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  technicianId: z.number().int().positive().optional(),
})

export const rejectSchema = z.object({ reason: z.string().min(1, "Required") })