import { ConvertPhoneByTool } from "@/components/excels/convert-phone"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Xử lý FILE",
    description: "Import dữ liệu khách hàng từ file Excel",
}

export default function ConvertPhoneExcel() {
    return (
        <div className="px-10 mx-auto py-6">
            <ConvertPhoneByTool />
        </div>
    )
}