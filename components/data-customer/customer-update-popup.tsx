// components/data-customer/customer-update-popup.tsx
"use client"

import * as React from "react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Customer, CustomerUpdateData } from "@/interfaces/customer"
import { toast } from "sonner"
import { IconLoader2 } from "@tabler/icons-react"
import { updateCustomer } from "@/services/customer-data"

interface CustomerUpdatePopupProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    customer: Customer | null
    onSuccess: () => void
}

export function CustomerUpdatePopup({
    open,
    onOpenChange,
    customer,
    onSuccess
}: CustomerUpdatePopupProps) {
    const [loading, setLoading] = React.useState(false)
    const [formData, setFormData] = React.useState<CustomerUpdateData>({})

    React.useEffect(() => {
        if (customer) {
            // Format date nếu có
            const formatDate = (dateStr?: string | null) => {
                if (!dateStr) return ""
                try {
                    return new Date(dateStr).toISOString().split('T')[0]
                } catch {
                    return ""
                }
            }

            setFormData({
                customer_name: customer.customer_name || "",
                phone_number: customer.phone_number || "",
                date_of_birth: formatDate(customer.date_of_birth),
                cccd: customer.cccd || "",
                email: customer.email || "",
                gender: customer.gender || "",
                address: customer.address || "",
                permanent_address: customer.permanent_address || "",
                living_area: customer.living_area || "",
                // the_product_type: customer.the_product_type || "",
                nationality: customer.nationality || "",
                marital_status: customer.marital_status || "",
                business_field: customer.business_field || "",
                isVip: customer.isVip || false,
            })
        }
    }, [customer])

    const handleChange = (field: keyof CustomerUpdateData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!customer) return

        setLoading(true)
        try {
            // Gọi service update thay vì fetch trực tiếp
            await updateCustomer(customer.id, formData)

            toast.success('Cập nhật khách hàng thành công')
            onSuccess()
            onOpenChange(false)
        } catch (error) {
            toast.error('Có lỗi xảy ra khi cập nhật')
            console.error('Update error:', error)
        } finally {
            setLoading(false)
        }
    }

    if (!customer) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Cập nhật thông tin khách hàng</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Họ và tên */}
                        <div className="space-y-2">
                            <Label htmlFor="customer_name">Họ và tên</Label>
                            <Input
                                id="customer_name"
                                value={formData.customer_name || ""}
                                onChange={(e) => handleChange("customer_name", e.target.value)}
                                placeholder="Nhập họ và tên"
                            />
                        </div>

                        {/* Số điện thoại */}
                        <div className="space-y-2">
                            <Label htmlFor="phone_number">Số điện thoại</Label>
                            <Input
                                id="phone_number"
                                value={formData.phone_number || ""}
                                onChange={(e) => handleChange("phone_number", e.target.value)}
                                placeholder="Nhập số điện thoại"
                            />
                        </div>

                        {/* Ngày sinh */}
                        <div className="space-y-2">
                            <Label htmlFor="date_of_birth">Ngày sinh</Label>
                            <Input
                                id="date_of_birth"
                                type="date"
                                value={formData.date_of_birth || ""}
                                onChange={(e) => handleChange("date_of_birth", e.target.value)}
                            />
                        </div>

                        {/* CCCD */}
                        <div className="space-y-2">
                            <Label htmlFor="cccd">CCCD/CMND</Label>
                            <Input
                                id="cccd"
                                value={formData.cccd || ""}
                                onChange={(e) => handleChange("cccd", e.target.value)}
                                placeholder="Nhập số CCCD/CMND"
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="text"
                                value={formData.email || ""}
                                onChange={(e) => handleChange("email", e.target.value)}
                                placeholder="Nhập email"
                            />
                        </div>

                        {/* Giới tính */}
                        <div className="space-y-2">
                            <Label htmlFor="gender">Giới tính</Label>
                            <Select
                                value={formData.gender || ""}
                                onValueChange={(v) => handleChange("gender", v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn giới tính" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Nam">Nam</SelectItem>
                                    <SelectItem value="Nữ">Nữ</SelectItem>
                                    <SelectItem value="Khác">Khác</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Địa chỉ liên hệ */}
                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="address">Địa chỉ liên hệ</Label>
                            <Input
                                id="address"
                                value={formData.address || ""}
                                onChange={(e) => handleChange("address", e.target.value)}
                                placeholder="Nhập địa chỉ liên hệ"
                            />
                        </div>

                        {/* Địa chỉ thường trú */}
                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="permanent_address">Địa chỉ thường trú</Label>
                            <Input
                                id="permanent_address"
                                value={formData.permanent_address || ""}
                                onChange={(e) => handleChange("permanent_address", e.target.value)}
                                placeholder="Nhập địa chỉ thường trú"
                            />
                        </div>

                        {/* Khu vực sinh sống */}
                        <div className="space-y-2">
                            <Label htmlFor="living_area">Khu vực sinh sống</Label>
                            <Input
                                id="living_area"
                                value={formData.living_area || ""}
                                onChange={(e) => handleChange("living_area", e.target.value)}
                                placeholder="Nhập khu vực sinh sống"
                            />
                        </div>

                        {/* Loại sản phẩm */}
                        <div className="space-y-2">
                            <Label htmlFor="the_product_type">Loại sản phẩm</Label>
                            <Input
                                id="the_product_type"
                                value={formData.the_product_type || ""}
                                onChange={(e) => handleChange("the_product_type", e.target.value)}
                                placeholder="Nhập loại sản phẩm"
                            />
                        </div>

                        {/* Quốc tịch */}
                        <div className="space-y-2">
                            <Label htmlFor="nationality">Quốc tịch</Label>
                            <Select
                                value={formData.nationality || ""}
                                onValueChange={(v) => handleChange("nationality", v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn quốc tịch" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Việt Nam">Việt Nam</SelectItem>
                                    <SelectItem value="Nước ngoài">Nước ngoài</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Tình trạng hôn nhân */}
                        <div className="space-y-2">
                            <Label htmlFor="marital_status">Tình trạng hôn nhân</Label>
                            <Select
                                value={formData.marital_status || ""}
                                onValueChange={(v) => handleChange("marital_status", v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn tình trạng" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Độc thân">Độc thân</SelectItem>
                                    <SelectItem value="Đã kết hôn">Đã kết hôn</SelectItem>
                                    <SelectItem value="Đã ly hôn">Đã ly hôn</SelectItem>
                                    <SelectItem value="Góa">Góa</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Lĩnh vực kinh doanh */}
                        <div className="space-y-2">
                            <Label htmlFor="business_field">Lĩnh vực kinh doanh</Label>
                            <Input
                                id="business_field"
                                value={formData.business_field || ""}
                                onChange={(e) => handleChange("business_field", e.target.value)}
                                placeholder="Nhập lĩnh vực kinh doanh"
                            />
                        </div>

                        {/* VIP Checkbox */}
                        <div className="space-y-2 flex items-end">
                            <div className="flex items-center space-x-2 pb-2">
                                <Checkbox
                                    id="isVip"
                                    checked={formData.isVip || false}
                                    onCheckedChange={(v) => handleChange("isVip", v)}
                                />
                                <Label htmlFor="isVip" className="cursor-pointer">
                                    Khách hàng VIP
                                </Label>
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Cập nhật
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}