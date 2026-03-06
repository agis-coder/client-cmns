import { DeviceTable } from "@/components/phone-manager/data-table";

export default function PhonePage() {
    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">
                Quản lý thiết bị & số điện thoại
            </h1>

            <DeviceTable />
        </div>
    )
}
