
import axiosClient from "@/axiosClient"
import { useLoaderData } from "react-router-dom"

export async function loader() {
  const res = await axiosClient.get("/bookings")
  return res.data
}

export default function CustomerDashboard() {
  const data = useLoaderData()

  console.log(data)
  return (
    <>
      <main className="flex-1 p-4 border-t bg-gray-100/50">
        <h1>Your Bookings</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {data &&
            data.data.map((booking) => (
              <Stepper key={booking.id} booking={booking} />
            ))}
        </div>
      </main>
    </>
  )
}
