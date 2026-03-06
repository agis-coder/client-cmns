"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog"
import EmailEditor from "./EmailEditor"
import { sendBulkMail } from "@/services/customer-data"
import { toast } from "sonner"

const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export default function EmailSender() {
    const router = useRouter()

    const [to, setTo] = useState<string[]>([])
    const [subject, setSubject] = useState("")
    const [html, setHtml] = useState("")
    const [text, setText] = useState("")
    const [loading, setLoading] = useState(false)

    // popup add email
    const [open, setOpen] = useState(false)
    const [newEmail, setNewEmail] = useState("")

    useEffect(() => {
        const stored = sessionStorage.getItem("mail_recipients")
        if (stored) {
            setTo(JSON.parse(stored))
        }
    }, [])

    const handleAddEmail = () => {
        const email = newEmail.trim().toLowerCase()

        if (!email) return toast.error("Chưa nhập email")
        if (!isValidEmail(email)) return toast.error("Email không hợp lệ")
        if (to.includes(email)) return toast.error("Email đã tồn tại")

        setTo((prev) => [...prev, email])
        setNewEmail("")
        setOpen(false)
        toast.success("Đã thêm email")
    }

    const handleSend = async () => {
        if (!to.length) return toast.error("Không có email người nhận")
        if (!subject) return toast.error("Chưa nhập tiêu đề")

        setLoading(true)

        const result = await sendBulkMail({
            to,
            subject,
            htmlContent: html,
            textContent: text,
            type: "marketing",
            fromName: "Hệ thống CRM",
        })

        setLoading(false)
        sessionStorage.removeItem("mail_recipients")

        if (result.success) {
            toast.success("Gửi mail thành công")
            setTimeout(() => router.refresh(), 800)
        } else {
            toast.error("Gửi mail không thành công")
            if (result.messageId) toast.error(result.messageId)
        }
    }

    return (
        <Card className="rounded-none">
            <CardHeader>
                <CardTitle>Gửi Email Đồng Loạt</CardTitle>
                <div className="text-sm text-muted-foreground flex items-center gap-3">
                    Đang gửi tới <b>{to.length}</b> email

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                                + Thêm email
                            </Button>
                        </DialogTrigger>

                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Thêm email người nhận</DialogTitle>
                            </DialogHeader>

                            <Input
                                placeholder="example@gmail.com"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleAddEmail()
                                }}
                            />

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setOpen(false)}>
                                    Hủy
                                </Button>
                                <Button onClick={handleAddEmail}>
                                    Thêm
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <Input
                    placeholder="Tiêu đề email"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                />

                <EmailEditor
                    onChange={(html, text) => {
                        setHtml(html)
                        setText(text)
                    }}
                />

                <Button onClick={handleSend} disabled={loading}>
                    {loading ? "Đang gửi..." : `Gửi mail (${to.length})`}
                </Button>
            </CardContent>
        </Card>
    )
}
