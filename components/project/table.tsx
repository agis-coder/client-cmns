import { ColumnDef } from "@tanstack/react-table"
import { Project } from "@/services/project-data"

export const columns: ColumnDef<Project>[] = [
    {
        accessorKey: "project_name",
        header: "Tên dự án",
        cell: ({ row }) => <span className="font-medium">{row.original.project_name}</span>,
    },
    {
        accessorKey: "investor",
        header: "Chủ đầu tư",
        cell: ({ row }) => <span>{row.original.investor ?? "Danh sách"}</span>,
    },
]
