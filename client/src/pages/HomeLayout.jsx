import { Outlet } from "react-router-dom"
import Navbar from "../components/Navbar"

export default function HomeLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Outlet />
    </div>
  )
}
