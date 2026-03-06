// table.tsx
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Phone, Mail, MessageCircle, Facebook, Monitor, Eye, CheckCircle, MoreVertical, Zap, ZapOff, ChevronRight, Users, Hash, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import React, { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export interface Device {
    id: number
    tenThietBi: string
    phones: {
        id: number
        sdt: string
        nhaMang: string
        soTien: number
    }[]
    emails: {
        id: number
        email: string
        password: string
        verified: boolean
    }[]
    zalos: {
        id: number
        tenZalo: string
        sdtDangKy: string
        trangThai: string
        chayAkaabiz: boolean
    }[]
    fbs: {
        id: number
        tenFacebook: string
        email: string
        trangThai: string
    }[]
}

// Phone Info Dialog Component
const PhoneInfoDialog = ({ phones }: { phones: Device['phones'] }) => {
    if (phones.length === 0) {
        return (
            <div className="py-8 text-center">
                <Phone className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Chưa có số điện thoại nào</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">


            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">STT</TableHead>
                            <TableHead>Số điện thoại</TableHead>
                            <TableHead>Nhà mạng</TableHead>
                            <TableHead className="text-right">Số tiền</TableHead>
                            <TableHead className="text-center">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {phones.map((phone, index) => (
                            <TableRow key={phone.id}>
                                <TableCell className="font-medium">{index + 1}</TableCell>
                                <TableCell>
                                    <div className="font-mono text-sm">{phone.sdt}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={
                                        phone.nhaMang?.toLowerCase().includes('viettel') ? "destructive" :
                                            phone.nhaMang?.toLowerCase().includes('mobi') ? "default" :
                                                phone.nhaMang?.toLowerCase().includes('vina') ? "secondary" : "outline"
                                    }>
                                        {phone.nhaMang || "Không xác định"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right font-medium text-green-600">
                                    {phone.soTien > 0 ? `${phone.soTien.toLocaleString()}đ` : "-"}
                                </TableCell>
                                <TableCell className="text-center">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => navigator.clipboard.writeText(phone.sdt)}
                                        className="h-8"
                                    >
                                        Sao chép
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

// Email Info Dialog Component
const EmailInfoDialog = ({ emails }: { emails: Device['emails'] }) => {
    const [showPasswords, setShowPasswords] = useState<boolean[]>([])

    React.useEffect(() => {
        setShowPasswords(new Array(emails.length).fill(false))
    }, [emails.length])

    const togglePassword = (index: number) => {
        setShowPasswords(prev => {
            const newState = [...prev]
            newState[index] = !newState[index]
            return newState
        })
    }

    if (emails.length === 0) {
        return (
            <div className="py-8 text-center">
                <Mail className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Chưa có email nào</p>
            </div>
        )
    }

    return (
        <div className="sm:max-w-6xl">


            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">STT</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Mật khẩu</TableHead>
                            <TableHead className="text-center">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {emails.map((email, index) => (
                            <TableRow key={email.id}>
                                <TableCell className="font-medium">{index + 1}</TableCell>
                                <TableCell>
                                    <div className="text-sm">{email.email}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type={showPasswords[index] ? "text" : "password"}
                                            value={email.password}
                                            readOnly
                                            className="flex-1 text-sm font-mono border rounded px-2 py-1"
                                        />
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => togglePassword(index)}
                                            className="h-8 w-8 p-0"
                                        >
                                            {showPasswords[index] ? "Ẩn" : "Hiện"}
                                        </Button>
                                    </div>
                                </TableCell>

                                <TableCell className="text-center">
                                    <div className="flex gap-2 justify-center">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => navigator.clipboard.writeText(email.email)}
                                            className="h-8"
                                        >
                                            Copy email
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => navigator.clipboard.writeText(email.password)}
                                            className="h-8"
                                        >
                                            Copy mật khẩu
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

// Zalo Info Dialog Component
const ZaloInfoDialog = ({ zalos }: { zalos: Device['zalos'] }) => {
    if (zalos.length === 0) {
        return (
            <div className="py-8 text-center">
                <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Chưa có tài khoản Zalo nào</p>
            </div>
        )
    }

    return (
        <div className="sm:max-w-6xl">


            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">STT</TableHead>
                            <TableHead>Tên Zalo</TableHead>
                            <TableHead>Số đăng ký</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>AK</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {zalos.map((zalo, index) => (
                            <TableRow key={zalo.id}>
                                <TableCell className="font-medium">{index + 1}</TableCell>
                                <TableCell>
                                    <div className="font-medium">{zalo.tenZalo}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-mono text-sm">{zalo.sdtDangKy}</div>
                                </TableCell>
                                <TableCell>
                                    {/* <Badge variant={zalo.trangThai === "active" ? "default" : "secondary"}>
                                        {zalo.trangThai === "active" ? "✅ Hoạt động" : "⭕ Không hoạt động"}
                                    </Badge> */}
                                </TableCell>
                                <TableCell>
                                    {zalo.chayAkaabiz ? (
                                        <div className="flex items-center gap-1 text-purple-600">
                                            <Zap className="h-4 w-4" />
                                            <span className="font-medium">Đang chạy</span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

// Facebook Info Dialog Component
const FacebookInfoDialog = ({ fbs }: { fbs: Device['fbs'] }) => {
    if (fbs.length === 0) {
        return (
            <div className="py-8 text-center">
                <Facebook className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Chưa có tài khoản Facebook nào</p>
            </div>
        )
    }

    return (
        <div className="sm:max-w-6xl">
            <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Facebook className="h-4 w-4" />
                    Danh sách Facebook ({fbs.length})
                </h4>
                <div className="text-sm text-gray-600">
                    Đang hoạt động: <span className="font-semibold text-green-600">
                        {fbs.filter(f => f.trangThai === "active").length}
                    </span>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">STT</TableHead>
                            <TableHead>Tên Facebook</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Trạng thái</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fbs.map((fb, index) => (
                            <TableRow key={fb.id}>
                                <TableCell className="font-medium">{index + 1}</TableCell>
                                <TableCell>
                                    <div className="font-medium">{fb.tenFacebook}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm">{fb.email}</div>
                                </TableCell>
                                <TableCell>
                                    {/* <Badge variant={fb.trangThai === "active" ? "default" : "secondary"}>
                                        {fb.trangThai === "active" ? "✅ Hoạt động" : "⭕ Không hoạt động"}
                                    </Badge> */}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

export const columns: ColumnDef<Device, any>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
                aria-label="Select all"
                className="border-gray-300 data-[state=checked]:bg-gray-900 data-[state=checked]:border-gray-900"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(v) => row.toggleSelected(!!v)}
                aria-label="Select row"
                className="border-gray-300 data-[state=checked]:bg-gray-900 data-[state=checked]:border-gray-900"
            />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 50,
    },
    {
        accessorKey: "tenThietBi",
        header: "Thiết bị",
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg border border-gray-100 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center shadow-sm">
                    <Monitor className="h-4.5 w-4.5 text-gray-700" />
                </div>
                <div>
                    <div className="font-semibold text-gray-900 text-sm tracking-tight">
                        {row.original.tenThietBi || "Thiết bị chưa đặt tên"}
                    </div>
                    <div className="text-xs text-gray-500 font-mono mt-0.5">#{row.original.id.toString().padStart(3, '0')}</div>
                </div>
            </div>
        ),
        size: 240,
    },
    {
        id: "phones",
        header: "Số điện thoại",
        cell: ({ row }) => {
            const phones = row.original.phones || []
            const count = phones.length
            const totalMoney = phones.reduce((sum, phone) => sum + (phone.soTien || 0), 0)
            const viettelCount = phones.filter(p => p.nhaMang?.toLowerCase().includes('viettel')).length
            const mobifoneCount = phones.filter(p => p.nhaMang?.toLowerCase().includes('mobi')).length
            const vinaphoneCount = phones.filter(p => p.nhaMang?.toLowerCase().includes('vina')).length

            return (
                <Dialog>
                    <DialogTrigger asChild>
                        <div className="cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full border border-blue-100 bg-blue-50 flex items-center justify-center">
                                    <Phone className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <div className="font-semibold text-gray-900 text-sm">
                                            {count} số
                                        </div>

                                    </div>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        {viettelCount > 0 && (
                                            <div className="h-2 w-2 rounded-full bg-red-500"></div>
                                        )}
                                        {mobifoneCount > 0 && (
                                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                        )}
                                        {vinaphoneCount > 0 && (
                                            <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                                        )}
                                        <span className="text-xs text-gray-500 truncate">
                                            {viettelCount || mobifoneCount || vinaphoneCount ? (
                                                `${viettelCount ? `Viettel: ${viettelCount}` : ''}${mobifoneCount ? ` Mobi: ${mobifoneCount}` : ''}${vinaphoneCount ? ` Vina: ${vinaphoneCount}` : ''}`
                                            ) : (
                                                "Không có nhà mạng"
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-6xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Phone className="h-5 w-5" />
                                Thông tin số điện thoại ({phones.length})
                            </DialogTitle>
                        </DialogHeader>
                        <PhoneInfoDialog phones={phones} />
                    </DialogContent>
                </Dialog>
            )
        },
        size: 250,
    },
    {
        id: "emails",
        header: "Email",
        cell: ({ row }) => {
            const emails = row.original.emails || []
            const verifiedCount = emails.filter(e => e.verified).length

            return (
                <Dialog>
                    <DialogTrigger asChild className="sm:max-w-6xl">
                        <div className="cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full border border-purple-100 bg-purple-50 flex items-center justify-center">
                                    <Mail className="h-4 w-4 text-purple-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <div className="font-semibold text-gray-900 text-sm">
                                            {emails.length} email
                                        </div>
                                        {verifiedCount > 0 && (
                                            <div className="text-xs font-medium text-green-700 bg-green-50 px-1.5 py-0.5 rounded">
                                                {verifiedCount} ✓
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className={`h-2 w-2 rounded-full ${verifiedCount > 0 ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                                        <span className="text-xs text-gray-500 truncate">
                                            {emails.length > 0 ? (
                                                emails[0].email
                                            ) : (
                                                "Không có email"
                                            )}
                                        </span>
                                        {emails.length > 1 && (
                                            <span className="text-xs text-gray-400">+{emails.length - 1}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-6xl overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Mail className="h-5 w-5" />
                                Thông tin Email ({emails.length})
                            </DialogTitle>
                        </DialogHeader>
                        <EmailInfoDialog emails={emails} />
                    </DialogContent>
                </Dialog>
            )
        },
        size: 280,
    },
    {
        id: "zalos",
        header: "Zalo",
        cell: ({ row }) => {
            const zalos = row.original.zalos || []
            const activeCount = zalos.filter(z => z.trangThai === "active").length
            const akabizCount = zalos.filter(z => z.chayAkaabiz === true).length

            return (
                <Dialog>
                    <DialogTrigger asChild>
                        <div className="cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="h-9 w-9 rounded-full border border-blue-100 bg-blue-50 flex items-center justify-center">
                                        <MessageCircle className="h-4 w-4 text-blue-600" />
                                    </div>
                                    {akabizCount > 0 && (
                                        <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-purple-600 flex items-center justify-center border border-white">
                                            <Zap className="h-2.5 w-2.5 text-white" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <div className="font-semibold text-gray-900 text-sm">
                                            {zalos.length} Zalo
                                        </div>
                                        {activeCount > 0 && (
                                            <div className="text-xs font-medium text-green-700 bg-green-50 px-1.5 py-0.5 rounded">
                                                {activeCount} ✓
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className={`h-2 w-2 rounded-full ${activeCount > 0 ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                        <span className="text-xs text-gray-500 truncate">
                                            {zalos.length > 0 ? (
                                                zalos[0].tenZalo
                                            ) : (
                                                "Không có Zalo"
                                            )}
                                        </span>
                                        {zalos.length > 1 && (
                                            <span className="text-xs text-gray-400">+{zalos.length - 1}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-6xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <MessageCircle className="h-5 w-5" />
                                Thông tin Zalo ({zalos.length})
                            </DialogTitle>
                        </DialogHeader>
                        <ZaloInfoDialog zalos={zalos} />
                    </DialogContent>
                </Dialog>
            )
        },
        size: 220,
    },
    {
        id: "fbs",
        header: "Facebook",
        cell: ({ row }) => {
            const fbs = row.original.fbs || []
            const activeCount = fbs.filter(f => f.trangThai === "active").length

            return (
                <Dialog>
                    <DialogTrigger asChild>
                        <div className="cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg border border-gray-100 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shadow-sm">
                                    <Facebook className="h-3.5 w-3.5 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <div className="font-semibold text-gray-900 text-sm">
                                            {fbs.length} Facebook
                                        </div>
                                        {activeCount > 0 && (
                                            <div className="text-xs font-medium text-green-700 bg-green-50 px-1.5 py-0.5 rounded">
                                                {activeCount} ✓
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className={`h-2 w-2 rounded-full ${activeCount > 0 ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                        <span className="text-xs text-gray-500 truncate">
                                            {fbs.length > 0 ? (
                                                fbs[0].tenFacebook
                                            ) : (
                                                "Không có Facebook"
                                            )}
                                        </span>
                                        {fbs.length > 1 && (
                                            <span className="text-xs text-gray-400">+{fbs.length - 1}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-6xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Facebook className="h-5 w-5" />
                                Thông tin Facebook
                            </DialogTitle>
                        </DialogHeader>
                        <FacebookInfoDialog fbs={fbs} />
                    </DialogContent>
                </Dialog>
            )
        },
        size: 220,
    },
    {
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => {
            const router = useRouter()
            const zalos = row.original.zalos || []
            const hasAkabiz = zalos.some(z => z.chayAkaabiz === true)

            return (
                <div className="flex items-center gap-2">


                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 border border-gray-200 hover:bg-gray-50"
                            >
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem className="text-sm">
                                <span className="mr-2">📱</span>
                                Thêm số điện thoại
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-sm">
                                <span className="mr-2">📧</span>
                                Thêm email
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-sm">
                                <span className="mr-2">💬</span>
                                Thêm Zalo
                            </DropdownMenuItem>
                            {hasAkabiz && (
                                <DropdownMenuItem className="text-sm text-purple-600 font-medium">
                                    <Zap className="h-3.5 w-3.5 mr-2" />
                                    Quản lý AK
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-sm text-red-600">
                                <span className="mr-2">🗑️</span>
                                Xóa thiết bị
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        },
        size: 140,
        enableSorting: false,
    },
]