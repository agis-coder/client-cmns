// app/projects/page.tsx
"use client"

import { useEffect, useState } from "react"
import { getProjects, updateProject } from "@/services/project-data"
import { ProjectType } from "@/interfaces/project"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/project/data-table"
import { EditProjectDialog } from "@/components/project/edit-project-dialog"
import { useRouter } from "next/navigation"
import { columns } from "@/components/project/table"

export default function ProjectsPage() {
    const [projects, setProjects] = useState<ProjectType[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [search, setSearch] = useState("")
    const [category, setCategory] = useState("")
    const [investor, setInvestor] = useState("")
    const [page, setPage] = useState(1)
    const [pageSize] = useState(20)
    const [total, setTotal] = useState(0)

    const [editingProject, setEditingProject] = useState<ProjectType | null>(null)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

    const router = useRouter()

    useEffect(() => {
        loadProjects()
    }, [page, search, category, investor])

    const loadProjects = async () => {
        try {
            setIsLoading(true)
            const data = await getProjects(page, pageSize, search, category, investor)
            const formatted = data.data.map((p: any) => ({
                ...p,
                investor: p.investor ?? ""
            }))
            setProjects(formatted)
            setTotal(data.total)
            setError(null)
        } catch (err) {
            console.error(err)
            setError("Không thể tải dữ liệu dự án")
        } finally {
            setIsLoading(false)
        }
    }

    const handleEdit = (project: ProjectType) => {
        console.log("Editing project:", project)
        setEditingProject(project)
        setIsEditDialogOpen(true)
    }

    const handleSaveEdit = async (updatedProject: ProjectType) => {
        try {
            await updateProject(updatedProject.id, updatedProject)
            loadProjects()
            setIsEditDialogOpen(false)
        } catch (error) {
            console.error("Lỗi cập nhật:", error)
        }
    }

    if (isLoading && projects.length === 0) {
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
                    <Button onClick={loadProjects} className="mt-2">Thử lại</Button>
                </div>
            </div>
        )
    }

    return (
        <div className="px-4 md:px-6 lg:px-20 w-full py-6">
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý dự án</h1>
                    <p className="text-muted-foreground mt-2">Tổng số: {total} dự án</p>
                </div>
                <div className="flex gap-2 items-center">
                    <Button onClick={loadProjects} variant="outline">
                        Refresh
                    </Button>
                    <Button
                        variant="default"
                        onClick={() => router.push("/projects/add")}
                    >
                        Thêm dự án mới
                    </Button>
                </div>
            </div>

            <DataTable
                data={projects}
                columns={columns}
                page={page}
                pageSize={pageSize}
                total={total}
                onPageChange={setPage}
                onEdit={handleEdit}
            />

            <EditProjectDialog
                project={editingProject}
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                onSave={handleSaveEdit}
            />
        </div>
    )
}