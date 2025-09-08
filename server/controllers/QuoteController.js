import { prisma } from "../server.js"
export async function createQuote(req, res) {
  const { id } = req.params
  const { amount } = req.body

  const booking = await prisma.booking.findUnique({
    where: { id: parseInt(id) },
  })

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" })
  }

  const quote = await prisma.quote.create({
    data: {
      bookingId: parseInt(id),
      total: amount,
      customerId: booking.customerId,
    },
  })

  res.status(200).json({ message: "Quote created successfully" })
}

export async function acceptQuote(req, res) {
  const { id } = req.params

  const quote = await prisma.quote.findUnique({
    where: { id: parseInt(id) },
  })

  if (!quote) {
    return res.status(404).json({ message: "Quote not found" })
  }

  const acceptQuote = await prisma.quote.update({
    where: { id: parseInt(id) },
    data: { status: "APPROVED" },
  })

  const billing = await prisma.billing.create({
    data: {
      quoteId: parseInt(id),
      total: quote.total,
    },
  })

  res.status(200).json({ message: "Quote accepted successfully" })
}

export async function deleteQuote(req, res) {
  const { id } = req.params

  const quote = await prisma.quote.findUnique({
    where: { id: parseInt(id) },
  })

  if (!quote) {
    return res.status(404).json({ message: "Quote not found" })
  }

  const deleteQuote = await prisma.quote.delete({
    where: { id: parseInt(id) },
  })

  res.status(200).json({ message: "Quote deleted successfully" })
}