// components/data-customer/columns.tsx
import { ExtendedCustomer } from "@/interfaces/customer"
import { IconBuilding, IconEdit, IconEye, IconHome, IconMail, IconPhone, IconUser, } from "@tabler/icons-react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "../ui/badge"
import { useRouter } from "next/navigation"
import { Button } from "../ui/button"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Navigation2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip"

const isBirthdayToday = (dob?: string | Date | null) => {
    if (!dob) return false
    const d = new Date(dob)
    const today = new Date()
    return (
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth()
    )
}

const getDisplayValue = (value: any): string => {
    if (!value || (Array.isArray(value) && value.length === 0)) return "—"
    if (Array.isArray(value)) return `${value.length}`
    if (value === "Chưa có") return "0"
    return String(value)
}



// Hàm tạo columns với tham số onEdit
export const createColumns = (onEdit?: (customer: ExtendedCustomer) => void): ColumnDef<ExtendedCustomer, any>[] => [
    {
        id: "select",
        header: ({ table }) => (
            <div className="flex items-center justify-center">
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(v) =>
                        table.toggleAllPageRowsSelected(!!v)
                    }
                    aria-label="Select all"
                    className="border-gray-300 dark:border-gray-700 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                />
            </div>
        ),
        cell: ({ row }) => (
            <div className="flex items-center justify-center">
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(v) => row.toggleSelected(!!v)}
                    aria-label="Select row"
                    className="border-gray-300 dark:border-gray-700 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
    },

    {
        accessorKey: "customer_name",
        header: () => (
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Họ và tên
            </div>
        ),
        cell: ({ row }) => {
            const c = row.original
            const birthdayToday = isBirthdayToday(c.date_of_birth)
            const isVip = c.isVip

            return (
                <div className="flex items-center gap-3 py-2">
                    {/* AVATAR */}
                    <div
                        className={cn(
                            "h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0",
                            isVip
                                ? "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800"
                                : "bg-gray-50 dark:bg-gray-800"
                        )}
                    >
                        {c.customer_name ? (
                            <span
                                className={cn(
                                    "text-sm font-medium",
                                    isVip ? "text-amber-600 dark:text-amber-400" : "text-gray-600 dark:text-gray-300"
                                )}
                            >
                                {c.customer_name[0].toUpperCase()}
                            </span>
                        ) : (
                            <IconUser className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        )}
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[180px]">
                                {getDisplayValue(c.customer_name)}
                            </span>

                            {isVip && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span className="text-amber-500 text-xs cursor-help">👑</span>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="text-xs">
                                            Khách hàng VIP
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}

                            {typeof c.level === "number" && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 font-medium">
                                    Lv {c.level}
                                </span>
                            )}

                            {birthdayToday && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span className="cursor-help text-xs">🎂</span>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="text-xs">
                                            Sinh nhật hôm nay
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>

                        {/* EMAIL */}
                        {c.email && (
                            <div className="flex items-center gap-1 mt-0.5">
                                <IconMail className="h-3 w-3 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {c.email.length > 40 ? `${c.email.slice(0, 40)}…` : c.email}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )
        },
        size: 300,
    },
    {
        accessorKey: "phone_number",
        header: () => (
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Số điện thoại
            </div>
        ),
        cell: ({ row }) => {
            const phone = row.getValue("phone_number")
            const phoneStr = getDisplayValue(phone)

            // Chỉ thay | bằng -, giữ nguyên dấu - có sẵn
            const displayPhone = phoneStr.replace(/\|/g, '-')

            return (
                <div className="flex items-start gap-2 py-2 max-w-[180px]">
                    <span className="text-sm text-gray-700 dark:text-gray-300 break-words whitespace-pre-wrap">
                        {displayPhone}
                    </span>
                </div>
            )
        },
        size: 160,
    },
    {
        accessorKey: "nationality",
        header: () => (
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Quốc tịch
            </div>
        ),
        cell: ({ row }) => {
            const value = row.getValue<string>("nationality");
            const display = value === "vn" ? "Việt Nam" : value === "nn" ? "Nước ngoài" : getDisplayValue(value);

            return (
                <div className="flex items-center gap-2 text-sm py-2">
                    <Navigation2 className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                        {display}
                    </span>
                </div>
            );
        },
        size: 120,
    },

    {
        accessorKey: "address",
        header: () => (
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Địa chỉ
            </div>
        ),
        cell: ({ row }) => (
            <div className="flex items-start gap-2 py-2">
                <IconHome className="h-4 w-4 mt-0.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                    {getDisplayValue(row.getValue("address"))}
                </span>
            </div>
        ),
        size: 350,
    },

    {
        id: "projects",
        header: () => (
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Đã mua
            </div>
        ),
        cell: ({ row }) => {
            const count = row.original.project_count || 0
            return (
                <div className="py-2">
                    <span className={cn(
                        "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs",
                        count === 0
                            ? "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                            : "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400"
                    )}>
                        <IconBuilding className="h-3 w-3" />
                        {count} căn
                    </span>
                </div>
            )
        },
        size: 100,
    },

    {
        id: "actions",
        header: () => (
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
                Thao tác
            </div>
        ),
        cell: ({ row }) => {
            const router = useRouter()

            return (
                <div className="flex items-center justify-center gap-1 py-2">
                    <TooltipProvider>
                        {/* View button */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => router.push(`/data-customer/${row.original.id}`)}
                                    className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
                                >
                                    <IconEye className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                                Xem chi tiết
                            </TooltipContent>
                        </Tooltip>

                        {/* Edit button */}
                        {onEdit && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => onEdit(row.original)}
                                        className="p-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors duration-150"
                                    >
                                        <IconEdit className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                    Chỉnh sửa
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </TooltipProvider>
                </div>
            )
        },
        size: 100,
    },
]