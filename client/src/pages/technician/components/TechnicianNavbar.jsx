import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Link, useNavigate } from "react-router-dom"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Settings } from "lucide-react"
import axiosClient from "@/axiosClient"
import { toast } from "react-toastify"
import { useTechnician } from "../TechnicianPortal"

export default function TechnicianNavbar() {
  const navigate = useNavigate()
  const signOut = async () => {
    try {
      await axiosClient.get("/auth/logout")
      toast.success("Logout successful!")
      navigate("/login")
    } catch (error) {
      console.log(error)
    }
  }
  const { name } = useTechnician()
  return (
    <header>
      <nav className="py-4 px-5 flex items-center justify-between bg-blue-400 text-white">
        <div className="flex items-center">
          <Link to={"/tech"} className="text-xl font-bold">
            Car Aircon Service
          </Link>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 px-2 py-1 hover:bg-blue-500  cursor-pointer rounded-md">
              <Avatar>
                <AvatarFallback className="bg-gray-200 flex items-center justify-center">
                  {name.slice(0, 1)}
                </AvatarFallback>
              </Avatar>
              <span className="capitalize max-[768px]:hidden">
                {name.split(" ").slice(0, 1)}
              </span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              className="flex items-center gap-1 cursor-pointer"
              asChild
            >
              <Link
                to="/tech/settings"
                className="flex items-center gap-1 cursor-pointer"
              >
                <Settings /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center gap-1 cursor-pointer"
              asChild
            >
              <button
                onClick={() => signOut()}
                className="flex items-center gap-1 cursor-pointer w-full"
              >
                <LogOut />
                Logout
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </header>
  )
}