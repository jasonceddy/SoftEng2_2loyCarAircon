import axiosClient from "@/axiosClient"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLoaderData } from "react-router-dom"
import { toast } from "react-toastify"
import { useEffect, useState } from "react"
import JobPagination from "./components/JobPagination"
import Stepper from "./components/Stepper"

export async function loader() {
  const res = await axiosClient.get("/bookings")
  return res.data
}

export default function Job() {
  const initialData = useLoaderData()
  const [data, setData] = useState(initialData) //mapping the data
  const [search, setSearch] = useState("") //search filter
  const [filter, setFilter] = useState("latest") //filters
  const [loading, setLoading] = useState(false) //loading state
  const [currentPage, setCurrentPage] = useState(1) //pagination
  const fetchBookings = async (searchTerm = "", sortBy = "", page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (sortBy) params.append("sort", sortBy)
      params.append("page", page.toString())
      const res = await axiosClient.get(`/bookings?${params.toString()}`)
      setData(res.data)
    } catch (error) {
      console.log(error)
      toast.error(`Error fetching jobs`, error)
    } finally {
      setLoading(false)
    }
  }

  console.log(data.data)

  const refreshJobs = () => {
    fetchBookings(search, filter, currentPage)
  }
  //Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchBookings(search, filter, currentPage)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [search, filter, currentPage])

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [search, filter])

  const bookFilters = [
    { value: "latest", label: "Latest" },
    { value: "oldest", label: "Oldest" },
  ]
  return (
    <>
      <main className="flex-1 p-4 border-t bg-gray-100/50">
        <h1>Your Bookings</h1>
        <div className="flex items-center gap-5 mb-6">
          <div className="flex flex-col">
            <label htmlFor="search">Search:</label>
            <input
              type="text"
              placeholder="Enter search..."
              className="border-1 border-black rounded-md bg-white py-1 px-2 "
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="filter">Filter:</label>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="py-1 px-2 border-1 border-black rounded-md">
                <SelectValue placeholder="Select a filter..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Filters</SelectLabel>
                  {bookFilters.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {data &&
            data.data.map((booking) => (
              <Stepper key={booking.id} booking={booking} />
            ))}
        </div>
        <div className="flex items-center justify-between mt-5 w-full">
          <p className="italic">
            Showing {data.data?.length || 0} of {data.count || 0} results
          </p>

          {data.totalPages > 1 && (
            <div>
              <JobPagination
                data={data}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
              />
            </div>
          )}
        </div>
      </main>
    </>
  )
}