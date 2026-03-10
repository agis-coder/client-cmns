// components/project/table.tsx
import { ColumnDef } from "@tanstack/react-table"
import { ProjectType } from "@/interfaces/project"
import { Button } from "@/components/ui/button"
import { IconEdit } from "@tabler/icons-react"

export const columns: ColumnDef<ProjectType>[] = [
    {
        accessorKey: "project_name",
        header: "Tên dự án",
        cell: ({ row }) => <span className="font-medium">{row.original.project_name}</span>,
    },
    {
        accessorKey: "investor",
        header: "Chủ đầu tư",
        cell: ({ row }) => <span>{row.original.investor || "-"}</span>,
    },
    {
        accessorKey: "project_category",
        header: "Danh mục dữ liệu",
        cell: ({ row }) => <span>{row.original.project_category || "-"}</span>,
    },
    {
        accessorKey: "source",
        header: "Nguồn",
        cell: ({ row }) => <span>{row.original.source || "-"}</span>,
    },
    {
        id: "actions",
        header: "Thao tác",
        cell: ({ row, table }) => {
            const onEdit = (table.options.meta as any)?.onEdit
            console.log("onEdit from meta:", onEdit) // Debug log
            return (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        console.log("Edit clicked:", row.original)
                        if (onEdit) {
                            onEdit(row.original)
                        } else {
                            console.log("onEdit not found")
                        }
                    }}
                >
                    <IconEdit className="h-4 w-4 mr-1" />
                    Sửa
                </Button>
            )
        },
    },
]