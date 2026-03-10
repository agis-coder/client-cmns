// components/project/edit-project-dialog.tsx
"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ProjectType } from "@/interfaces/project"
import { ProjectCategory } from "../data-customer/project-category"

interface EditProjectDialogProps {
    project: ProjectType | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave: (project: ProjectType) => void
}

export function EditProjectDialog({
    project,
    open,
    onOpenChange,
    onSave
}: EditProjectDialogProps) {
    const [formData, setFormData] = useState<Partial<ProjectType>>({})
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (project) {
            setFormData({
                project_name: project.project_name,
                investor: project.investor || "",
                project_category: project.project_category || "",
                source: project.source || "",
            })
        }
    }, [project])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!project) return

        setIsLoading(true)
        try {
            await onSave({ ...project, ...formData })
            onOpenChange(false)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    if (!project) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa dự án</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="project_name">Tên dự án</Label>
                        <Input
                            id="project_name"
                            value={formData.project_name || ""}
                            onChange={(e) => setFormData(prev => ({ ...prev, project_name: e.target.value }))}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="investor">Chủ đầu tư</Label>
                        <Input
                            id="investor"
                            value={formData.investor || ""}
                            onChange={(e) => setFormData(prev => ({ ...prev, investor: e.target.value }))}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Danh mục</Label>
                        <Select
                            value={formData.project_category}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn danh mục" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(ProjectCategory).map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="source">Nguồn</Label>
                        <Input
                            id="source"
                            value={formData.source || ""}
                            onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                            placeholder="Nhập nguồn dự án"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}