"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { CreateCustomerDto } from "@/interfaces/customer"
import { createCustomer } from "@/services/customer-data"

interface CreateCustomerPopupProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: (customer: any) => void;
}

export default function CreateCustomerPopup({ open, onOpenChange, onSuccess }: CreateCustomerPopupProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState<CreateCustomerDto>({
        customer_name: "",
        phone_number: "",
        img_customer: "",
        date_of_birth: "",
        cccd: "",
        email: "",
        gender: "",
        address: "",
        permanent_address: "",
        living_area: "",
        the_product_type: "",
        nationality: "",
        marital_status: "",
        interest: "",
        total_assets: undefined,
        business_field: "",
        zalo_status: "",
        facebook: "",
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: name === 'total_assets' ? (value ? Number(value) : undefined) : value
        }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async () => {
        if (!formData.customer_name) return toast.error("Vui lòng nhập tên khách hàng")
        if (!formData.phone_number) return toast.error("Vui lòng nhập số điện thoại")

        setLoading(true)
        try {
            const result = await createCustomer(formData)
            toast.success("Thêm khách hàng thành công")
            onSuccess?.(result)
            onOpenChange(false)
            // Reset form
            setFormData({
                customer_name: "",
                phone_number: "",
                img_customer: "",
                date_of_birth: "",
                cccd: "",
                email: "",
                gender: "",
                address: "",
                permanent_address: "",
                living_area: "",
                the_product_type: "",
                nationality: "",
                marital_status: "",
                interest: "",
                total_assets: undefined,
                business_field: "",
                zalo_status: "",
                facebook: "",
            })
        } catch (error: any) {
            if (error.response?.status === 400) {
                toast.error("Số điện thoại đã tồn tại")
            } else {
                toast.error("Có lỗi xảy ra, vui lòng thử lại")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-gray-900">
                        Thêm khách hàng mới
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-3 gap-4 py-4">
                    {/* Hàng 1 */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                            Tên khách hàng <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            name="customer_name"
                            value={formData.customer_name}
                            onChange={handleChange}
                            placeholder="Nhập tên khách hàng"
                            className="border-gray-200 focus:border-gray-400"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                            Số điện thoại <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleChange}
                            placeholder="Nhập số điện thoại"
                            className="border-gray-200 focus:border-gray-400"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Email</Label>
                        <Input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="example@gmail.com"
                            className="border-gray-200 focus:border-gray-400"
                        />
                    </div>

                    {/* Hàng 2 */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">CCCD/CMND</Label>
                        <Input
                            name="cccd"
                            value={formData.cccd}
                            onChange={handleChange}
                            placeholder="Nhập số CCCD/CMND"
                            className="border-gray-200 focus:border-gray-400"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Ngày sinh</Label>
                        <Input
                            name="date_of_birth"
                            type="date"
                            value={formData.date_of_birth}
                            onChange={handleChange}
                            className="border-gray-200 focus:border-gray-400"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Giới tính</Label>
                        <Select
                            value={formData.gender}
                            onValueChange={(value) => handleSelectChange('gender', value)}
                        >
                            <SelectTrigger className="border-gray-200">
                                <SelectValue placeholder="Chọn giới tính" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Nam">Nam</SelectItem>
                                <SelectItem value="Nữ">Nữ</SelectItem>
                                <SelectItem value="Khác">Khác</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Hàng 3 */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Quốc tịch</Label>
                        <Input
                            name="nationality"
                            value={formData.nationality}
                            onChange={handleChange}
                            placeholder="Nhập quốc tịch"
                            className="border-gray-200 focus:border-gray-400"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Tình trạng hôn nhân</Label>
                        <Select
                            value={formData.marital_status}
                            onValueChange={(value) => handleSelectChange('marital_status', value)}
                        >
                            <SelectTrigger className="border-gray-200">
                                <SelectValue placeholder="Chọn tình trạng" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Độc thân">Độc thân</SelectItem>
                                <SelectItem value="Đã kết hôn">Đã kết hôn</SelectItem>
                                <SelectItem value="Ly hôn">Ly hôn</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Địa chỉ</Label>
                        <Input
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Nhập địa chỉ"
                            className="border-gray-200 focus:border-gray-400"
                        />
                    </div>

                    {/* Hàng 4 */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Địa chỉ thường trú</Label>
                        <Input
                            name="permanent_address"
                            value={formData.permanent_address}
                            onChange={handleChange}
                            placeholder="Nhập địa chỉ thường trú"
                            className="border-gray-200 focus:border-gray-400"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Khu vực sinh sống</Label>
                        <Input
                            name="living_area"
                            value={formData.living_area}
                            onChange={handleChange}
                            placeholder="Nhập khu vực"
                            className="border-gray-200 focus:border-gray-400"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Loại sản phẩm</Label>
                        <Input
                            name="the_product_type"
                            value={formData.the_product_type}
                            onChange={handleChange}
                            placeholder="Nhập loại sản phẩm"
                            className="border-gray-200 focus:border-gray-400"
                        />
                    </div>

                    {/* Hàng 5 */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Lĩnh vực kinh doanh</Label>
                        <Input
                            name="business_field"
                            value={formData.business_field}
                            onChange={handleChange}
                            placeholder="Nhập lĩnh vực kinh doanh"
                            className="border-gray-200 focus:border-gray-400"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Tổng tài sản (VNĐ)</Label>
                        <Input
                            name="total_assets"
                            type="number"
                            value={formData.total_assets || ''}
                            onChange={handleChange}
                            placeholder="Nhập tổng tài sản"
                            className="border-gray-200 focus:border-gray-400"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Sở thích</Label>
                        <Input
                            name="interest"
                            value={formData.interest}
                            onChange={handleChange}
                            placeholder="Nhập sở thích"
                            className="border-gray-200 focus:border-gray-400"
                        />
                    </div>

                    {/* Hàng 6 */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Zalo</Label>
                        <Input
                            name="zalo_status"
                            value={formData.zalo_status}
                            onChange={handleChange}
                            placeholder="Số Zalo"
                            className="border-gray-200 focus:border-gray-400"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Facebook</Label>
                        <Input
                            name="facebook"
                            value={formData.facebook}
                            onChange={handleChange}
                            placeholder="Link Facebook"
                            className="border-gray-200 focus:border-gray-400"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Ảnh đại diện</Label>
                        <Input
                            name="img_customer"
                            value={formData.img_customer}
                            onChange={handleChange}
                            placeholder="URL ảnh"
                            className="border-gray-200 focus:border-gray-400"
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2 mt-4">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="border-gray-200 text-gray-700 hover:bg-gray-50"
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-gray-900 text-white hover:bg-gray-800"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Đang xử lý...
                            </span>
                        ) : (
                            'Thêm khách hàng'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}