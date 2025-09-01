import { prisma } from "../server.js"
export async function createBook(req, res) {
  try {
    const { carId, serviceId, scheduledAt, technicianId } = req.body
    const userId = req.user.userId // from auth middleware

    // fetch service to check if customer can pick technician
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    })
    if (!service) {
      return res.status(404).json({ error: "Service not found" })
    }

    // if customer tried to assign tech but not allowed
    if (!service.allowCustomerTechChoice && technicianId) {
      return res
        .status(400)
        .json({ error: "Technician cannot be chosen for this service" })
    }

    // create booking
    const booking = await prisma.booking.create({
      data: {
        customerId: userId,
        carId,
        serviceId,
        scheduledAt: new Date(scheduledAt),
        technicianId: service.allowCustomerTechChoice ? technicianId : null,
      },
      include: {
        car: true,
        service: true,
        technician: true,
      },
    })

    res.json(booking)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Something went wrong" })
  }
}

export async function getBookings(req, res) {
  try {
    if (req.user.role === "ADMIN") {
      const bookings = await prisma.booking.findMany({
        include: {
          car: true,
          service: true,
          technician: true,
        },
      })
      res.json(bookings)
    }

    if (req.user.role === "CUSTOMER") {
      const bookings = await prisma.booking.findMany({
        include: {
          car: true,
          service: true,
          technician: true,
        },
        where: {
          customerId: req.user.userId,
        },
      })
      res.json(bookings)
    }

    if (req.user.role === "TECHNICIAN") {
      const bookings = await prisma.booking.findMany({
        include: {
          car: true,
          service: true,
          technician: true,
        },
        where: {
          technicianId: req.user.userId,
        },
      })
      res.json(bookings)
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Something went wrong" })
  }
}

export async function assignTechnician(req, res) {
  try {
    const { bookingId, technicianId } = req.body
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { technicianId: technicianId },
    })
    res.json(booking)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Something went wrong" })
  }
}

export async function confirmBooking(req, res) {
  try {
    const { bookingId } = req.body
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CONFIRMED" },
    })
    res.json(booking)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Something went wrong" })
  }
}

export async function cancelBooking(req, res) {
  try {
    const { bookingId } = req.body
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    })
    res.json(booking)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Something went wrong" })
  }
}

export async function rescheduleBooking(req, res) {
  try {
    const { bookingId, scheduledAt } = req.body
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { scheduledAt: new Date(scheduledAt) },
    })
    res.json(booking)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Something went wrong" })
  }
}
