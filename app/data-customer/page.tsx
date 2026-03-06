"use client"

import { DataTable } from "@/components/data-customer/data-table"
import { useEffect, useState } from "react"
import { fetchAllCustomers } from "@/services/customer-data"
import { Customer } from "@/interfaces/customer"

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCustomers = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const res = await fetchAllCustomers(1) // page = 1
      setCustomers(res)

    } catch (err) {
      setError("Không thể tải dữ liệu khách hàng")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  if (isLoading) {
    return (
      <div className="px-20 w-full py-10 flex items-center justify-center min-h-100">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-muted-foreground">
            Đang tải dữ liệu khách hàng...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-20 w-full py-10">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-destructive">{error}</p>
          <button
            onClick={loadCustomers}
            className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 md:px-6 lg:px-20 w-full py-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Quản lý khách hàng
            </h1>
            <p className="text-muted-foreground mt-2">
              Tổng số: {customers.total ?? 0} khách hàng
            </p>
          </div>

          <button
            onClick={loadCustomers}
            className="px-4 py-2 text-sm border rounded-md hover:bg-accent"
          >
            Refresh
          </button>
        </div>
      </div>

      <DataTable data={customers} />
    </div>
  )
}