const CURRENCY_FORMATTER = new Intl.NumberFormat("en-PH", {
  currency: "PHP",
  style: "currency",
  minimumFractionDigits: 0,
})

export function formatCurrency(number) {
  return CURRENCY_FORMATTER.format(number)
}
