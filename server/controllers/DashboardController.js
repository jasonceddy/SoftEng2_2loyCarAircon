import { prisma } from "../server.js"
export async function getBookingsOverview(req, res) {
  try {
    const today = new Date()

    const startOfDay = new Date(today)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(today)
    endOfDay.setHours(23, 59, 59, 999)

    const [todayCount, weekCount, pending, confirmed, cancelled] =
      await Promise.all([
        prisma.booking.count({
          where: { createdAt: { gte: startOfDay, lte: endOfDay } },
        }),
        prisma.booking.count({
          where: {
            createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
        }),
        prisma.booking.count({ where: { status: "PENDING" } }),
        prisma.booking.count({ where: { status: "CONFIRMED" } }),
        prisma.booking.count({ where: { status: "CANCELLED" } }),
      ])

    res.json({
      today: todayCount,
      thisWeek: weekCount,
      pending,
      confirmed,
      cancelled,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /dashboard/jobs-overview
export async function getJobsOverview(req, res) {
  try {
    const [diagnostic, repair, testing, completion] = await Promise.all([
      prisma.job.count({ where: { stage: "DIAGNOSTIC" } }),
      prisma.job.count({ where: { stage: "REPAIR" } }),
      prisma.job.count({ where: { stage: "TESTING" } }),
      prisma.job.count({ where: { stage: "COMPLETION" } }),
    ])

    res.json({ diagnostic, repair, testing, completion })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /dashboard/revenue-summary
export async function getRevenueSummary(req, res) {
  try {
    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0))
    const endOfDay = new Date(today.setHours(23, 59, 59, 999))
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    const [todayRevenue, monthRevenue, unpaid, paid] = await Promise.all([
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { paidAt: { gte: startOfDay, lte: endOfDay } },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { paidAt: { gte: startOfMonth } },
      }),
      prisma.billing.aggregate({
        _sum: { total: true },
        where: { status: "UNPAID" },
      }),
      prisma.billing.aggregate({
        _sum: { total: true },
        where: { status: "PAID" },
      }),
    ])

    res.json({
      today: todayRevenue._sum.amount || 0,
      thisMonth: monthRevenue._sum.amount || 0,
      unpaid: unpaid._sum.total || 0,
      paid: paid._sum.total || 0,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /dashboard/trends
export async function getTrends(req, res) {
  try {
    // Last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const bookings = await prisma.booking.groupBy({
      by: ["createdAt"],
      where: { createdAt: { gte: sevenDaysAgo } },
      _count: { _all: true },
    })

    const revenue = await prisma.payment.groupBy({
      by: ["paidAt"],
      where: { paidAt: { gte: sevenDaysAgo } },
      _sum: { amount: true },
    })

    res.json({
      bookings: bookings.map((b) => ({
        date: b.createdAt.toISOString().split("T")[0],
        count: b._count._all,
      })),
      revenue: revenue.map((r) => ({
        date: r.paidAt.toISOString().split("T")[0],
        amount: r._sum.amount,
      })),
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /dashboard/low-stock
export async function getLowStock(req, res) {
  try {
    const lowStockParts = await prisma.part.findMany({
      where: {
        stock: {
          lte: prisma.part.fields.threshold,
        },
      },
      select: {
        id: true,
        name: true,
        stock: true,
        threshold: true,
      },
      orderBy: { stock: "asc" },
    })

    const filtered = lowStockParts.filter((p) => p.stock <= p.threshold)

    res.json(filtered)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}