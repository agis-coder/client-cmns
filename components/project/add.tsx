// app/projects/add/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createProject } from "@/services/project-data"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"

export default function AddProjectPages() {
    const router = useRouter()
    const [projectName, setProjectName] = useState("")
    const [investor, setInvestor] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!projectName.trim()) return toast.error("Chưa nhập tên dự án")
        setLoading(true)
        try {
            await createProject({ project_name: projectName.trim(), investor: investor.trim() })
            toast.success("Thêm dự án thành công")
            router.push("/projects") // quay về danh sách dự án
        } catch (err) {
            console.error(err)
            toast.error("Thêm dự án thất bại")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="px-6 md:px-20 py-10">
            <Card className="max-w-xl mx-auto">
                <CardHeader>
                    <CardTitle>Thêm dự án mới</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium mb-1">Tên dự án</label>
                            <Input
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                placeholder="Nhập tên dự án"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Chủ đầu tư</label>
                            <Input
                                value={investor}
                                onChange={(e) => setInvestor(e.target.value)}
                                placeholder="Nhập tên chủ đầu tư"
                            />
                        </div>
                    </form>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? "Đang thêm..." : "Thêm dự án"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
