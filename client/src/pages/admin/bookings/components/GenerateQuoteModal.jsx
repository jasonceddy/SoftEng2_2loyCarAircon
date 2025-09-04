import { Car, Pickaxe, User, XCircle } from "lucide-react"

export default function GenerateQuoteModal({
  quoteModal,
  setQuoteModal,
  fetchBookings,
}) {
  return (
    <div className="fixed inset-0 h-full w-full flex flex-items bg-black/20 justify-center  z-50">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0 flex-1">
        <div className="w-full bg-white rounded-lg shadow border border-black md:mt-0 sm:max-w-md xl:p-0">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl flex items-center gap-1">
                Details
              </h1>
              <XCircle
                className="cursor-pointer"
                onClick={() => setQuoteModal({ booking: null, open: false })}
              />

              <div className="flex flex-col">
                <h2 className="text-lg font-bold flex items-center gap-1">
                  <User />
                  Customer:
                </h2>
                <p>Name: {quoteModal.booking.customer.name}</p>
                <p>Email: {quoteModal.booking.customer.email}</p>
                <p>Phone: {quoteModal.booking.customer.phone}</p>
              </div>
              <div className="flex flex-col">
                <h2 className="text-lg font-bold flex items-center gap-1">
                  <Car />
                  Car:
                </h2>
                <p>Plate No: {quoteModal.booking.car.plateNo}</p>
                <p>Brand: {quoteModal.booking.car.brand}</p>
                <p>Model: {quoteModal.booking.car.model}</p>
                <p>Year: {quoteModal.booking.car.year}</p>
                <p>Notes: {quoteModal.booking.car.notes}</p>
              </div>
              <div className="flex flex-col">
                <h2 className="text-lg font-bold flex items-center gap-1">
                  <Pickaxe />
                  Service:
                </h2>
                <p>Service: {quoteModal.booking.service.name}</p>
                <p>Cost: {quoteModal.booking.car.brand}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}