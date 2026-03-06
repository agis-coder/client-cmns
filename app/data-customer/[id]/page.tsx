"use client"

import { useEffect, useState } from "react"
import { useParams, notFound } from "next/navigation"
import CustomerDetail from "@/components/data-customer/customer-detail"
import { fetchCustomerById } from "@/services/customer-data"
import { Customer } from "@/interfaces/customer"

export default function CustomerDetailPage() {
    const params = useParams()
    const id = params?.id as string

    const [customer, setCustomer] = useState<Customer | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        if (!id) return

        const loadCustomer = async () => {
            try {
                console.log("📤 Fetch customer id:", id)

                const data = await fetchCustomerById(id)

                console.log("📥 Customer response:", data)

                setCustomer(data)
            } catch (err) {
                console.error("❌ Fetch customer failed:", err)
                setError(true)
            } finally {
                setLoading(false)
            }
        }

        loadCustomer()
    }, [id])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                Đang tải dữ liệu...
            </div>
        )
    }

    if (error || !customer) {
        notFound()
    }

    return (
        <div className="min-h-screen w-full bg-background">
            <CustomerDetail customer={customer} />
        </div>
    )
}
