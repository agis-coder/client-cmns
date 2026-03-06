"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getImportFiles, ImportFileItem } from "@/services/filemanager-data"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/filemanager/data-table"

export default function FileManager() {
    const [files, setFiles] = useState<ImportFileItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [page, setPage] = useState(1)
    const [limit] = useState(20)
    const [total, setTotal] = useState(0)

    const router = useRouter()

    const loadFiles = async () => {
        try {
            setLoading(true)
            const res = await getImportFiles({ page, limit })
            setFiles(res.data)
            setTotal(res.pagination.total)
        } catch (e) {
            console.error(e)
            setError("Không thể tải danh sách file import")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadFiles()
    }, [page])

    if (loading) {
        return (
            <div className="py-10 flex justify-center">
                <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary border-t-transparent" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-6">
                <p className="text-destructive">{error}</p>
                <Button className="mt-2" onClick={loadFiles}>Thử lại</Button>
            </div>
        )
    }

    return (
        <div className="px-4 md:px-6 lg:px-20 py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">File Manager</h1>
                    <p className="text-muted-foreground">
                        Tổng cộng {total} file import
                    </p>
                </div>

            </div>

            <DataTable
                data={files}

                page={page}
                pageSize={limit}
                total={total}
                onPageChange={setPage}
            />
        </div>
    )
}
