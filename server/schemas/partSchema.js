import z from "zod"

export const createPartSchema = z.object({
  name: z.string().min(1, "Please enter part name"),
  stock: z
    .string()
    .min(1, "Please enter service cost")
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      "Please enter a valid cost greater than 0"
    )
    .transform((val) => parseFloat(val)),
  threshold: z
    .string()
    .min(1, "Please enter service cost")
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      "Please enter a valid cost greater than 0"
    )
    .transform((val) => parseFloat(val)),
})

export const updatePartSchema = z.object({
  name: z.string().min(1, "Please enter part name"),
  threshold: z
    .string()
    .min(1, "Please enter service cost")
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      "Please enter a valid cost greater than 0"
    )
    .transform((val) => parseFloat(val)),
})

export const stockOutandInSchema = z.object({
  quantity: z
    .string()
    .min(1, "Please enter service cost")
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      "Please enter a valid cost greater than 0"
    )
    .transform((val) => parseFloat(val)),
})