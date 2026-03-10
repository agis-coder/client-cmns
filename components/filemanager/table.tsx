// components/import-file-columns.tsx
import { ColumnDef } from "@tanstack/react-table"
import { ImportFileItem, deleteImportFile } from "@/services/filemanager-data" // Sửa tên hàm
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useState } from "react"

// Component cho nút xóa với dialog xác nhận
const DeleteButton = ({ fileId, fileName, onDelete }: { fileId: string, fileName: string, onDelete: () => void }) => {
    const [isDeleting, setIsDeleting] = useState(false)
    const [open, setOpen] = useState(false)

    const handleDelete = async () => {
        try {
            setIsDeleting(true)
            await deleteImportFile(fileId) // Sửa thành deleteImportFile (số ít)
            onDelete()
            setOpen(false)
        } catch (error: any) {
            console.error("Lỗi khi xóa file:", error)
            // Có thể thêm toast thông báo lỗi ở đây
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                    <AlertDialogDescription>
                        Bạn có chắc chắn muốn xóa file <span className="font-semibold">{fileName}</span> không?
                        Hành động này không thể hoàn tác.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
                    >
                        {isDeleting ? "Đang xóa..." : "Xóa"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

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
                {row.original.status === "imported" ? "Đã import" : "Đã xóa tạm"}
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
    {
        id: "actions",
        header: "Thao tác",
        cell: ({ row, table }) => {
            // Lấy hàm refresh data từ table meta (nếu có)
            const meta = table.options.meta as any

            return (
                <DeleteButton
                    fileId={row.original.id}
                    fileName={row.original.file_name}
                    onDelete={() => {
                        // Gọi hàm refresh data nếu được truyền vào từ component cha
                        if (meta?.refreshData) {
                            meta.refreshData()
                        }
                    }}
                />
            )
        },
    },
]