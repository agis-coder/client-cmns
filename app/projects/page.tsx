"use client"

import { useEffect, useState } from "react"
import { getProjects, Project } from "@/services/project-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/project/data-table"
import { useRouter } from "next/navigation"

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [search, setSearch] = useState("")
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)
    const [total, setTotal] = useState(0)
    const router = useRouter()

    useEffect(() => {
        loadProjects()
    }, [page, pageSize, search])

    const loadProjects = async () => {
        try {
            setIsLoading(true)
            const data = await getProjects(page, pageSize, search)
            setProjects(data.data)
            setTotal(data.total)
        } catch (err) {
            console.error(err)
            setError("Không thể tải dữ liệu dự án")
        } finally {
            setIsLoading(false)
        }
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
        setPage(1)
    }

    if (isLoading) {
        return (
            <div className="px-20 w-full py-10 flex items-center justify-center min-h-100">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="mt-4 text-muted-foreground">Đang tải dữ liệu dự án...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="px-20 w-full py-10">
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                    <p className="text-destructive">{error}</p>
                    <Button onClick={loadProjects} className="mt-2"> Thử lại </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="px-4 md:px-6 lg:px-20 w-full py-6">
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight"> Quản lý dự án </h1>
                    <p className="text-muted-foreground mt-2"> Tổng số: {total} dự án </p>
                </div>
                <div className="flex gap-2 items-center">
                    <Button onClick={loadProjects}> Refresh </Button>
                    <Button
                        variant="default"
                        onClick={() => router.push("/projects/add")}
                    >
                        Thêm dự án mới
                    </Button>
                </div>
            </div>

            <DataTable
                data={projects.map(p => ({ ...p, investor: p.investor || "Danh sách" }))}
                columns={[
                    { key: "project_name", label: "Tên dự án" },
                    { key: "investor", label: "Chủ đầu tư" },
                ]}
                page={page}
                pageSize={pageSize}
                total={total}
                onPageChange={(p) => setPage(p)}
            />
        </div>
    )
}
