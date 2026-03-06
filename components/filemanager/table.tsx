import { ColumnDef } from "@tanstack/react-table"
import { ImportFileItem } from "@/services/filemanager-data"
import { Badge } from "@/components/ui/badge"

export const columns: ColumnDef<ImportFileItem>[] = [
    {
        accessorKey: "file_name",
        header: "Tên file",
        cell: ({ row }) => (
            <span className="font-medium">{row.original.file_name}</span>
        ),
    },
    {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
            <Badge variant={row.original.status === "imported" ? "default" : "secondary"}>
                {row.original.status}
            </Badge>
        ),
    },
    {
        accessorKey: "customer_count",
        header: "KH",
        cell: ({ row }) => row.original.customer_count ?? 0,
    },
    {
        accessorKey: "new_sale_count",
        header: "New Sale",
        cell: ({ row }) => row.original.new_sale_count ?? 0,
    },
    {
        accessorKey: "transfer_count",
        header: "Transfer",
        cell: ({ row }) => row.original.transfer_count ?? 0,
    },
    {
        accessorKey: "imported_at",
        header: "Ngày import",
        cell: ({ row }) =>
            new Date(row.original.imported_at).toLocaleString("vi-VN"),
    },
]
