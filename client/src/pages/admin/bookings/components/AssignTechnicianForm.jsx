import { useForm } from "react-hook-form"
import { useState, useEffect } from "react"
import { LoaderCircle } from "lucide-react"
import { toast } from "react-toastify"
import axiosClient from "@/axiosClient"
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

export default function AssignTechnicianForm({
  setAssignTechnician,
  assignTechnician,
  fetchBookings,
}) {
  const {
    handleSubmit,
    setError,
    formState: { isSubmitting },
    reset,
    setValue,
  } = useForm()

  const [serverError, setServerError] = useState("")
  const [loadingData, setLoadingData] = useState(false)
  const [technicians, setTechnicians] = useState([])

  useEffect(() => {
    const fetchTechnician = async () => {
      setLoadingData(true)
      try {
        const resTechnician = await axiosClient.get("/users/technicians")
        setTechnicians(resTechnician.data.technicians)
        setLoadingData(false)
      } catch (error) {
        setLoadingData(false)
        toast.error(
          `Error fetching data: ${
            error.response?.data?.message || error.message
          }`
        )
      }
    }

    fetchTechnician()
  }, [assignTechnician.booking])

  const onSubmit = async (data) => {
    setServerError("")
    try {
      // combine date + time into one Date object
      await axiosClient.patch(
        `/bookings/${assignTechnician.booking.id}/assign`,
        data
      )
      await fetchBookings()
      toast.success("Technician assigned successfully!")
      reset()
      setAssignTechnician({ booking: null, open: false })
    } catch (error) {
      if (error.response?.status === 400) {
        const message = error.response.data.message
        if (typeof message === "object") {
          Object.entries(message).forEach(([field, msgs]) => {
            setError(field, { type: "server", message: msgs[0] })
          })
        } else {
          setServerError(message)
        }
      } else {
        toast.error("Something went wrong!")
      }
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoaderCircle className="animate-spin" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
      {/* Technician Select → only if allowed */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-900">
          Technician
        </label>
        <Select onValueChange={(val) => setValue("technicianId", val)}>
          <SelectTrigger className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600  w-full">
            <SelectValue placeholder="Select Technician..." />
          </SelectTrigger>
          <SelectContent>
            {technicians.map((tech) => (
              <SelectItem
                key={tech.id}
                value={tech.id.toString()}
                className="cursor-pointer"
              >
                {tech.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Submit */}
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="cursor-pointer w-full text-white bg-gray-600 hover:bg-gray-700 rounded-lg px-5 py-2.5 flex items-center justify-center"
        >
          {isSubmitting ? <LoaderCircle className="animate-spin" /> : "Assign"}
        </button>
        {serverError && (
          <p className="text-sm mt-1 text-red-600">{serverError}</p>
        )}
      </div>
    </form>
  )
}
