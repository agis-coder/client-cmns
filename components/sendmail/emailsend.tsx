"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, ChevronDown, Search, X, Inbox } from "lucide-react"
import EmailEditor from "./EmailEditor"
import { sendBulkMail } from "@/services/customer-data"
import { toast } from "sonner"

const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export default function EmailSender() {
    const router = useRouter()

    const [to, setTo] = useState<string[]>([])
    const [cc, setCc] = useState<string[]>([])
    const [bcc, setBcc] = useState<string[]>([])
    const [subject, setSubject] = useState("")
    const [html, setHtml] = useState("")
    const [text, setText] = useState("")
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState('to')
    const [recipientType, setRecipientType] = useState('to')

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

        if (recipientType === 'to') {
            if (to.includes(email)) return toast.error("Email đã tồn tại trong To")
            setTo((prev) => [...prev, email])
        } else if (recipientType === 'cc') {
            if (cc.includes(email)) return toast.error("Email đã tồn tại trong CC")
            setCc((prev) => [...prev, email])
        } else if (recipientType === 'bcc') {
            if (bcc.includes(email)) return toast.error("Email đã tồn tại trong BCC")
            setBcc((prev) => [...prev, email])
        }

        setNewEmail("")
        setOpen(false)
        toast.success("Đã thêm email")
    }

    const handleRemoveEmail = (email: string, type: string) => {
        if (type === 'to') {
            setTo((prev) => prev.filter((e) => e !== email))
        } else if (type === 'cc') {
            setCc((prev) => prev.filter((e) => e !== email))
        } else if (type === 'bcc') {
            setBcc((prev) => prev.filter((e) => e !== email))
        }
        toast.success("Đã xoá email")
    }

    const handleMoveEmail = (email: string, fromType: string, toType: string) => {
        if (fromType === toType) return

        if (toType === 'to') {
            if (to.includes(email)) return toast.error("Email đã tồn tại trong To")
            setTo((prev) => [...prev, email])
        } else if (toType === 'cc') {
            if (cc.includes(email)) return toast.error("Email đã tồn tại trong CC")
            setCc((prev) => [...prev, email])
        } else if (toType === 'bcc') {
            if (bcc.includes(email)) return toast.error("Email đã tồn tại trong BCC")
            setBcc((prev) => [...prev, email])
        }

        if (fromType === 'to') {
            setTo((prev) => prev.filter((e) => e !== email))
        } else if (fromType === 'cc') {
            setCc((prev) => prev.filter((e) => e !== email))
        } else if (fromType === 'bcc') {
            setBcc((prev) => prev.filter((e) => e !== email))
        }

        toast.success(`Đã chuyển email sang ${toType.toUpperCase()}`)
    }

    const [searchTerm, setSearchTerm] = React.useState('')

    // Filter emails based on search term
    const filteredEmails = React.useMemo(() => {
        const currentList = activeTab === 'to' ? to : activeTab === 'cc' ? cc : bcc

        if (!searchTerm.trim()) return currentList

        return currentList.filter(email =>
            email.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [activeTab, to, cc, bcc, searchTerm])

    // Reset search when changing tabs
    React.useEffect(() => {
        setSearchTerm('')
    }, [activeTab])

    // Thêm prop onCancel nếu cần
    interface Props {
        onCancel?: () => void
    }

    const handleSend = async () => {
        if (!to.length && !cc.length && !bcc.length) return toast.error("Không có email người nhận")
        if (!subject) return toast.error("Chưa nhập tiêu đề")

        setLoading(true)

        const result = await sendBulkMail({ to, cc, bcc, subject, htmlContent: html, textContent: text, type: "marketing", fromName: "Hệ thống CRM", })
        setLoading(false)
        sessionStorage.removeItem("mail_recipients")

        if (result.success) {
            toast.success("Gửi mail thành công")
            setTo([])
            setCc([])
            setBcc([])
            setSubject("")
            setHtml("")
            setText("")
            setTimeout(() => router.refresh(), 800)
        } else {
            toast.error("Gửi mail không thành công")
            if (result.messageId) toast.error(result.messageId)
        }
    }

    const renderEmailRow = (email: string, type: string) => (
        <tr key={email} className="border-t border-gray-100 hover:bg-gray-50">
            <td className="p-3 text-gray-700">{email}</td>
            <td className="p-3 text-right w-[120px]">
                <div className="flex items-center justify-end gap-1">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 px-2 text-gray-500 hover:text-gray-900"
                            >
                                <span className="mr-1">Chuyển</span>
                                <ChevronDown className="h-3 w-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                            {type !== 'to' && (
                                <DropdownMenuItem onClick={() => handleMoveEmail(email, type, 'to')}>
                                    Chuyển sang To
                                </DropdownMenuItem>
                            )}
                            {type !== 'cc' && (
                                <DropdownMenuItem onClick={() => handleMoveEmail(email, type, 'cc')}>
                                    Chuyển sang CC
                                </DropdownMenuItem>
                            )}
                            {type !== 'bcc' && (
                                <DropdownMenuItem onClick={() => handleMoveEmail(email, type, 'bcc')}>
                                    Chuyển sang BCC
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveEmail(email, type)}
                        className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                    >
                        Xóa
                    </Button>
                </div>
            </td>
        </tr>
    )

    return (
        <Card className="rounded-lg border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="text-xl font-semibold text-gray-900">
                    Soạn email mới
                </CardTitle>
                <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                    <span className="flex items-center gap-1">
                        TO: <span className="font-medium text-gray-900">{to.length}</span>
                    </span>

                    <span className="flex items-center gap-1">
                        CC: <span className="font-medium text-gray-900">{cc.length}</span>
                    </span>

                    <span className="flex items-center gap-1">
                        BCC: <span className="font-medium text-gray-900">{bcc.length}</span>
                    </span>

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="ml-auto text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            >
                                + Thêm email
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-gray-900">Thêm email người nhận</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Loại người nhận</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                                        value={recipientType}
                                        onChange={(e) => setRecipientType(e.target.value)}
                                    >
                                        <option value="to">To</option>
                                        <option value="cc">CC</option>
                                        <option value="bcc">BCC</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Địa chỉ email</label>
                                    <Input
                                        placeholder="example@gmail.com"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") handleAddEmail()
                                        }}
                                        className="border-gray-200 focus:border-gray-400 focus:ring-gray-400"
                                    />
                                </div>
                            </div>

                            <DialogFooter className="sm:justify-end gap-2">
                                <Button
                                    variant="ghost"
                                    onClick={() => setOpen(false)}
                                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                >
                                    Hủy
                                </Button>
                                <Button
                                    onClick={handleAddEmail}
                                    className="bg-gray-900 text-white hover:bg-gray-800"
                                >
                                    Thêm
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 bg-gray-50">
                        <button
                            className={`px-4 py-2 text-sm font-medium transition-colors flex-1 sm:flex-none ${activeTab === 'to'
                                ? 'text-gray-900 border-b-2 border-gray-900 bg-white'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                            onClick={() => setActiveTab('to')}
                        >
                            To ({to.length})
                        </button>
                        <button
                            className={`px-4 py-2 text-sm font-medium transition-colors flex-1 sm:flex-none ${activeTab === 'cc'
                                ? 'text-gray-900 border-b-2 border-gray-900 bg-white'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                            onClick={() => setActiveTab('cc')}
                        >
                            CC ({cc.length})
                        </button>
                        <button
                            className={`px-4 py-2 text-sm font-medium transition-colors flex-1 sm:flex-none ${activeTab === 'bcc'
                                ? 'text-gray-900 border-b-2 border-gray-900 bg-white'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                            onClick={() => setActiveTab('bcc')}
                        >
                            BCC ({bcc.length})
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="p-3 border-b border-gray-200 bg-white">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                type="text"
                                placeholder={`Tìm kiếm trong danh sách ${activeTab.toUpperCase()}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-8 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-black/20 text-sm"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="max-h-[300px] overflow-y-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                                <tr>
                                    <th className="text-left p-3 text-gray-600 font-medium">Email</th>
                                    <th className="text-right p-3 text-gray-600 font-medium w-[120px]">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeTab === 'to' && (
                                    <>
                                        {to.length === 0 ? (
                                            <tr>
                                                <td colSpan={2} className="text-center p-8 text-gray-500">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Inbox className="w-8 h-8 text-gray-300" />
                                                        <span>Chưa có email trong danh sách To</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            <>
                                                {filteredEmails.length === 0 && searchTerm ? (
                                                    <tr>
                                                        <td colSpan={2} className="text-center p-8 text-gray-500">
                                                            <div className="flex flex-col items-center gap-2">
                                                                <Search className="w-8 h-8 text-gray-300" />
                                                                <span>Không tìm thấy email "{searchTerm}"</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredEmails.map((email) => renderEmailRow(email, 'to'))
                                                )}
                                            </>
                                        )}
                                    </>
                                )}

                                {activeTab === 'cc' && (
                                    <>
                                        {cc.length === 0 ? (
                                            <tr>
                                                <td colSpan={2} className="text-center p-8 text-gray-500">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Inbox className="w-8 h-8 text-gray-300" />
                                                        <span>Chưa có email trong danh sách CC</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            <>
                                                {filteredEmails.length === 0 && searchTerm ? (
                                                    <tr>
                                                        <td colSpan={2} className="text-center p-8 text-gray-500">
                                                            <div className="flex flex-col items-center gap-2">
                                                                <Search className="w-8 h-8 text-gray-300" />
                                                                <span>Không tìm thấy email "{searchTerm}"</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredEmails.map((email) => renderEmailRow(email, 'cc'))
                                                )}
                                            </>
                                        )}
                                    </>
                                )}

                                {activeTab === 'bcc' && (
                                    <>
                                        {bcc.length === 0 ? (
                                            <tr>
                                                <td colSpan={2} className="text-center p-8 text-gray-500">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Inbox className="w-8 h-8 text-gray-300" />
                                                        <span>Chưa có email trong danh sách BCC</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            <>
                                                {filteredEmails.length === 0 && searchTerm ? (
                                                    <tr>
                                                        <td colSpan={2} className="text-center p-8 text-gray-500">
                                                            <div className="flex flex-col items-center gap-2">
                                                                <Search className="w-8 h-8 text-gray-300" />
                                                                <span>Không tìm thấy email "{searchTerm}"</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredEmails.map((email) => renderEmailRow(email, 'bcc'))
                                                )}
                                            </>
                                        )}
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    {(activeTab === 'to' && to.length > 0) ||
                        (activeTab === 'cc' && cc.length > 0) ||
                        (activeTab === 'bcc' && bcc.length > 0) ? (
                        <div className="border-t border-gray-200 bg-gray-50 p-3 text-xs text-gray-500">
                            <div className="flex justify-between items-center">
                                <span>
                                    Tổng: {activeTab === 'to' ? to.length : activeTab === 'cc' ? cc.length : bcc.length} email
                                </span>
                                {searchTerm && (
                                    <span className="text-gray-600">
                                        Tìm thấy {filteredEmails.length} kết quả
                                    </span>
                                )}
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Email Subject */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Tiêu đề email</label>
                    <Input
                        placeholder="Nhập tiêu đề email..."
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="border-gray-200 focus:border-gray-400 focus:ring-gray-400"
                    />
                </div>

                {/* Email Editor */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Nội dung email</label>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <EmailEditor
                            onChange={(html, text) => {
                                setHtml(html)
                                setText(text)
                            }}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                        {to.length + cc.length + bcc.length} người nhận
                    </div>
                    <div className="flex items-center gap-3">
                        {/* <Button
                            variant="outline"
                            onClick={onCancel}
                            className="border-gray-200 hover:bg-gray-50"
                        >
                            Hủy
                        </Button> */}
                        <Button
                            onClick={handleSend}
                            disabled={loading || (!to.length && !cc.length && !bcc.length) || !subject || !html}
                            className="bg-gray-900 text-white hover:bg-gray-800 px-6 min-w-[120px]"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Đang gửi...
                                </span>
                            ) : (
                                'Gửi email'
                            )}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}