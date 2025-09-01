import z from "zod"

export const carSchema = z.object({
  plateNo: z.string().min(1, "Please enter a plate number"),
  brand: z.string().min(1, "Please enter a brand name"),
  model: z.string().min(1, "Please enter a model name"),
  year: z.string().min(4, "Please enter a valid year"),
  notes: z.string().min(1, "Please enter some notes"),
})
