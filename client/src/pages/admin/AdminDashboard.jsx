import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { Calendar, Briefcase, DollarSign, AlertTriangle } from "lucide-react"
import axiosClient from "@/axiosClient"

export default function AdminDashboard() {
  // --- State ---
  const [bookingsOverview, setBookingsOverview] = useState({})
  const [jobsOverview, setJobsOverview] = useState([])
  const [revenueSummary, setRevenueSummary] = useState({})
  const [bookingsTrend, setBookingsTrend] = useState([])
  const [revenueTrend, setRevenueTrend] = useState([])
  const [lowStock, setLowStock] = useState([])

  const COLORS = ["#fbbf24", "#3b82f6", "#10b981", "#6b7280"]

  // --- Fetch Dashboard Data ---
  useEffect(() => {
    async function fetchData() {
      try {
        const [bookingsRes, jobsRes, revenueRes, trendsRes, lowStockRes] =
          await Promise.all([
            axiosClient.get("/dashboard/bookings-overview"),
            axiosClient.get("/dashboard/jobs-overview"),
            axiosClient.get("/dashboard/revenue-summary"),
            axiosClient.get("/dashboard/trends"),
            axiosClient.get("/dashboard/low-stock"),
          ])

        setBookingsOverview(bookingsRes.data)
        setJobsOverview(jobsRes.data)
        setRevenueSummary(revenueRes.data)
        setBookingsTrend(trendsRes.data.bookings)
        setRevenueTrend(trendsRes.data.revenue)
        setLowStock(lowStockRes.data)
      } catch (err) {
        console.error("Dashboard fetch error:", err)
      }
    }

    fetchData()
  }, [])

  return (
    <main className="flex-1 p-4 border-t bg-gray-100/50">
      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="shadow-md rounded-2xl">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-gray-500">Bookings Today</p>
                <h2 className="text-2xl font-bold">
                  {bookingsOverview.today || 0}
                </h2>
              </div>
              <Calendar className="text-blue-500" size={28} />
            </CardContent>
          </Card>

          <Card className="shadow-md rounded-2xl">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-gray-500">Active Jobs</p>
                <h2 className="text-2xl font-bold">
                  {(jobsOverview.diagnostic || 0) +
                    (jobsOverview.repair || 0) +
                    (jobsOverview.testing || 0)}
                </h2>
              </div>
              <Briefcase className="text-green-500" size={28} />
            </CardContent>
          </Card>

          <Card className="shadow-md rounded-2xl">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-gray-500">Unpaid Bills</p>
                <h2 className="text-2xl font-bold">
                  {revenueSummary.unpaid || 0}
                </h2>
              </div>
              <DollarSign className="text-red-500" size={28} />
            </CardContent>
          </Card>

          <Card className="shadow-md rounded-2xl">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-gray-500">Low Stock Parts</p>
                <h2 className="text-2xl font-bold">{lowStock.length}</h2>
              </div>
              <AlertTriangle className="text-yellow-500" size={28} />
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bookings Trend */}
          <Card className="shadow-md rounded-2xl">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Bookings (Last 7 Days)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={bookingsTrend}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Job Stage Distribution */}
          <Card className="shadow-md rounded-2xl">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Job Stages</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      {
                        name: "Diagnostic",
                        value: jobsOverview.diagnostic || 0,
                      },
                      { name: "Repair", value: jobsOverview.repair || 0 },
                      { name: "Testing", value: jobsOverview.testing || 0 },
                      {
                        name: "Completion",
                        value: jobsOverview.completion || 0,
                      },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Trend */}
        <Card className="shadow-md rounded-2xl">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Revenue (Monthly)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueTrend}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#10b981"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
