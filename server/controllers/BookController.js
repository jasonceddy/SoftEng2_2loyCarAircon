import { prisma } from "../server.js"

// Helper function to check technician availability
async function checkTechnicianAvailability(
  technicianId,
  scheduledAt,
  excludeBookingId = null
) {
  const scheduledDate = new Date(scheduledAt)

  // Get start and end of the day for the scheduled date
  const startOfDay = new Date(scheduledDate)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(scheduledDate)
  endOfDay.setHours(23, 59, 59, 999)

  // Check if technician has any bookings on that day
  const existingBooking = await prisma.booking.findFirst({
    where: {
      technicianId: parseInt(technicianId),
      scheduledAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
      // Exclude current booking if updating
      ...(excludeBookingId && { id: { not: parseInt(excludeBookingId) } }),
    },
    include: {
      customer: { select: { name: true } },
      service: { select: { name: true } },
    },
  })

  return existingBooking
}

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
        .json({ message: "Technician cannot be chosen for this service" })
    }

    // if customer can choose technician and they provided one, check availability
    if (service.allowCustomerTechChoice && technicianId) {
      const existingBooking = await checkTechnicianAvailability(
        technicianId,
        scheduledAt
      )

      if (existingBooking) {
        return res.status(400).json({
          message: "Technician is not available on the selected date",
        })
      }
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
    const {
      search = "",
      page = 1,
      limit = 10,
      sort = "latest",
      status = "",
    } = req.query

    const pageNumber = parseInt(page)
    const pageSize = parseInt(limit)
    const skip = (pageNumber - 1) * pageSize

    // Base where clause based on user role
    let baseWhere = {}
    if (req.user.role === "CUSTOMER") {
      baseWhere.customerId = req.user.userId
    } else if (req.user.role === "TECHNICIAN") {
      baseWhere.technicianId = req.user.userId
    }
    // ADMIN sees all bookings

    // Search filters
    let searchWhere = {}
    if (search) {
      searchWhere = {
        OR: [
          { car: { plateNo: { contains: search } } },
          { car: { brand: { contains: search } } },
          { car: { model: { contains: search } } },
          { service: { name: { contains: search } } },
          { customer: { name: { contains: search } } },
          { customer: { email: { contains: search } } },
          { technician: { name: { contains: search } } },
        ],
      }
    }

    // Status filter
    let statusWhere = {}
    if (status) {
      statusWhere.status = status
    }

    // Combine all where conditions
    const where = {
      ...baseWhere,
      ...searchWhere,
      ...statusWhere,
    }

    // Base sort options (fallback)
    let orderBy
    switch (sort) {
      case "latest":
        orderBy = { createdAt: "desc" }
        break
      case "oldest":
        orderBy = { createdAt: "asc" }
        break
      case "scheduled_latest":
        orderBy = { scheduledAt: "desc" }
        break
      case "scheduled_oldest":
        orderBy = { scheduledAt: "asc" }
        break
      case "id_asc":
        orderBy = { id: "asc" }
        break
      case "id_desc":
        orderBy = { id: "desc" }
        break
      case "customer_name":
        orderBy = { customer: { name: "asc" } }
        break
      case "service_name":
        orderBy = { service: { name: "asc" } }
        break
      default:
        orderBy = { createdAt: "desc" }
    }

    const [bookings, count] = await prisma.$transaction([
      prisma.booking.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: {
          car: true,
          service: true,
          technician: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          jobs: {
            include: {
              notes: {
                include: {
                  author: {
                    select: { name: true },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.booking.count({ where }),
    ])

    // 🔥 Custom priority sorting in JS
    const sorted = bookings.sort((a, b) => {
      const aHasCompletion = a.jobs.some((j) => j.stage === "COMPLETION")
      const bHasCompletion = b.jobs.some((j) => j.stage === "COMPLETION")

      if (aHasCompletion && !bHasCompletion) return -1
      if (!aHasCompletion && bHasCompletion) return 1

      if (a.status === "PENDING" && b.status !== "PENDING") return -1
      if (b.status === "PENDING" && a.status !== "PENDING") return 1

      // fallback to your chosen sort (id_desc here)
      return b.id - a.id
    })

    res.status(200).json({
      data: sorted,
      count,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Something went wrong" })
  }
}

export async function assignTechnician(req, res) {
  try {
    const { id } = req.params // bookingId from URL
    const { technicianId } = req.body

    if (!technicianId) {
      return res.status(400).json({ error: "Technician is required" })
    }
    // Get the booking to check its scheduled date
    const existingBooking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
      select: { scheduledAt: true },
    })

    if (!existingBooking) {
      return res.status(404).json({ error: "Booking not found" })
    }

    // Check technician availability
    const conflictingBooking = await checkTechnicianAvailability(
      technicianId,
      existingBooking.scheduledAt,
      id // exclude current booking from check
    )

    if (conflictingBooking) {
      return res.status(400).json({
        message: `Technician already has a booking for ${conflictingBooking.service.name} with ${conflictingBooking.customer.name}`,
      })
    }

    const booking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: { technicianId: parseInt(technicianId) },
    })
    res.status(200).json({ message: "Technician assigned successfully" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Something went wrong" })
  }
}

export async function confirmBooking(req, res) {
  try {
    const { id } = req.params
    const booking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: { status: "CONFIRMED" },
    })

    const job = await prisma.job.create({
      data: {
        bookingId: parseInt(id),
      },
    })

    res.status(200).json({ message: "Booking confirmed successfully" })
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
    res.status(200).json({ message: "Booking cancelled successfully" })
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
    res.status(200).json({ message: "Booking rescheduled successfully" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Something went wrong" })
  }
}

export async function rejectBooking(req, res) {
  try {
    const { id } = req.params
    const { reason } = req.body
    const booking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: { status: "REJECTED", rejectReason: reason },
    })
    res.status(200).json({ message: "Booking rejected successfully" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Something went wrong" })
  }
}