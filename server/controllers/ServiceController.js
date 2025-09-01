import { prisma } from "../server.js"

//get all the services
export async function getAllServices(req, res) {
  try {
    const { search = "", page = 1, limit = 10, sort = "id_desc" } = req.query

    const pageNumber = parseInt(page) //if no page is provided, default to 1
    const pageSize = parseInt(limit) //limit will always be 25
    const skip = (pageNumber - 1) * pageSize //how much data would we skip per page

    //search filters
    let where = search
      ? {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
          ],
        }
      : {}

    //filters
    let orderBy
    switch (sort) {
      case "name_asc":
        orderBy = { name: "asc" }
        break
      case "name_desc":
        orderBy = { name: "desc" }
        break
      case "cost_asc":
        orderBy = { cost: "asc" }
        break
      case "cost_desc":
        orderBy = { cost: "desc" }
        break
      case "id_asc":
        orderBy = { id: "asc" }
        break
      case "id_desc":
        orderBy = { id: "desc" }
        break
      case "allowed":
        where = {
          ...where,
          allowCustomerTechChoice: true,
        }
        break
      case "not_allowed":
        where = {
          ...where,
          allowCustomerTechChoice: false,
        }
        break
      default:
        orderBy = { id: "desc" }
    }

    const [services, count] = await prisma.$transaction([
      prisma.service.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
      }),
      prisma.service.count({ where }),
    ])

    res.status(200).json({
      data: services,
      count,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

//create a new service
export async function createService(req, res) {
  const { name, cost, description, allowCustomerTechChoice } = req.body

  const service = await prisma.service.create({
    data: { name, cost, description, allowCustomerTechChoice },
  })
  res.status(201).json({ message: "Service created successfully" })
}

//update service
export async function updateService(req, res) {
  const { id } = req.params
  const { name, cost, description, allowCustomerTechChoice } = req.body

  const service = await prisma.service.update({
    where: { id: parseInt(id) },
    data: { name, cost, description, allowCustomerTechChoice },
  })
  if (!service) return res.status(404).json({ message: "Service not found" })

  res.status(200).json({ message: "Service updated successfully" })
}

export async function deleteService(req, res) {
  const { id } = req.params

  const service = await prisma.service.delete({ where: { id: parseInt(id) } })
  if (!service) return res.status(404).json({ message: "Service not found" })

  res.status(200).json({ message: "Service deleted successfully" })
}
