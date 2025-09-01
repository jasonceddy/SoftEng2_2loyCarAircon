import { prisma } from "../server.js"
export async function getTechnicians(req, res) {
  const technicians = await prisma.user.findMany({
    where: { role: "TECHNICIAN" },
  })
  res.status(200).json({ technicians })
}
