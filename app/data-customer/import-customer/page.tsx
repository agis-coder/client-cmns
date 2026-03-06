import { ExcelImport } from "@/components/data-customer/import-excel"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Import Khách Hàng",
    description: "Import dữ liệu khách hàng từ file Excel",
}

export default function ImportCustomerPage() {
    return (
        <div className="px-10 mx-auto py-6">
            <ExcelImport />
        </div>
    )
}