// components/customer/customer-detail.tsx
"use client"

import { Customer } from '@/interfaces/customer'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
    IconArrowLeft,
    IconCalendar,
    IconMapPin,
    IconPhone,
    IconMail,
    IconId,
    IconHome,
    IconBuilding,
    IconUsers,
    IconCash,
    IconChartBar,
    IconHeart,
    IconWorld,
    IconMessage,
    IconBrandFacebook,
    IconUserCheck,
    IconFileDescription,
    IconChevronRight,
    IconEdit,
    IconPrinter,
    IconShare,
    IconDownload,
    IconContract,
} from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface CustomerDetailProps {
    customer: any // Sử dụng any vì cấu trúc phức tạp
}

// Định nghĩa các loại hợp đồng dựa trên dữ liệu bạn cung cấp
const CONTRACT_TYPES: Record<string, string> = {
    'VBTT': 'Văn bản thỏa thuận (VBTT)',
    'DEPOSIT': 'Hợp đồng đặt cọc',
    'CAPITAL': 'Hợp đồng góp vốn',
    'HĐMB': 'Hợp đồng mua bán (HĐMB)',
    'PINK_BOOK': 'Sổ hồng',
    'HANDWRITTEN': 'Giấy viết tay',
    '': 'Không xác định'
}

export default function CustomerDetail({ customer }: CustomerDetailProps) {
    const router = useRouter()

    const getDisplayValue = (value: any): string => {
        if (value === undefined || value === null || value === '') {
            return 'Chưa có'
        }
        return String(value)
    }

    // Hàm lấy loại hợp đồng từ dữ liệu
    const getContractType = () => {
        // Từ dữ liệu mẫu, trường legal trong projects.new_sales[0] có thể chứa loại hợp đồng
        const project = customer.projects?.new_sales?.[0]
        if (project?.legal) {
            // Nếu có trường legal, trả về giá trị đó
            return project.legal
        }
        return ''
    }

    // Hàm lấy tên loại hợp đồng dựa trên mã
    const getContractTypeName = (typeCode: string): string => {
        return CONTRACT_TYPES[typeCode] || getDisplayValue(typeCode)
    }

    return (
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-20 py-6">
            {/* Header */}
            <div className="mb-6">
                <Button
                    variant="ghost"
                    onClick={() => router.push('/data-customer')}
                    className="mb-4 hover:bg-accent"
                >
                    <IconArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại danh sách
                </Button>

                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                        {/* Avatar hoặc chữ cái đầu */}
                        <div className="size-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border shadow-sm">
                            {customer.customer_name ? (
                                <span className="text-2xl font-bold text-primary">
                                    {customer.customer_name.charAt(0).toUpperCase()}
                                </span>
                            ) : (
                                <IconUserCheck className="h-8 w-8 text-muted-foreground" />
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
                                {customer.customer_name || 'Chưa có tên'}
                            </h1>
                            <div className="mt-2 flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-1 text-sm text-muted-foreground bg-accent/50 px-2 py-1 rounded-md">
                                    <IconPhone className="h-3.5 w-3.5" />
                                    <span>{getDisplayValue(customer.phone_number)}</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground bg-accent/50 px-2 py-1 rounded-md">
                                    <IconMail className="h-3.5 w-3.5" />
                                    <span>{getDisplayValue(customer.email)}</span>
                                </div>
                                {customer.cccd && (
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground bg-accent/50 px-2 py-1 rounded-md">
                                        <IconId className="h-3.5 w-3.5" />
                                        <span>{getDisplayValue(customer.cccd)}</span>
                                    </div>
                                )}
                                <Badge variant="secondary" className="text-xs">
                                    ID: {customer.id?.slice(0, 8)}...
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" size="sm" className="h-9">
                            <IconShare className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">Chia sẻ</span>
                        </Button>
                        <Button variant="outline" size="sm" className="h-9">
                            <IconPrinter className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">In</span>
                        </Button>
                        <Button size="sm" className="h-9">
                            <IconEdit className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">Chỉnh sửa</span>
                        </Button>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="personal" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 lg:grid-cols-4 h-11 px-1">
                    <TabsTrigger value="personal" className="h-9 text-sm">
                        <IconUserCheck className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Thông tin cá nhân</span>
                        <span className="sm:hidden">Cá nhân</span>
                    </TabsTrigger>
                    <TabsTrigger value="project" className="h-9 text-sm">
                        <IconBuilding className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Dự án & Hợp đồng</span>
                        <span className="sm:hidden">Dự án</span>
                    </TabsTrigger>
                    <TabsTrigger value="contract" className="h-9 text-sm">
                        <IconContract className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Loại hợp đồng</span>
                        <span className="sm:hidden">Hợp đồng</span>
                    </TabsTrigger>
                </TabsList>

                {/* Tab 1: Thông tin cá nhân */}
                <TabsContent value="personal">
                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <IconUserCheck className="h-5 w-5" />
                                Thông tin cá nhân
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-base">Thông tin cơ bản</h3>
                                    <InfoItem
                                        label="Họ và tên"
                                        value={customer.customer_name}
                                        getDisplayValue={getDisplayValue}
                                    />
                                    <InfoItem
                                        label="Ngày sinh"
                                        value={customer.date_of_birth ? formatDate(customer.date_of_birth) : undefined}
                                        icon={<IconCalendar className="h-4 w-4" />}
                                        getDisplayValue={getDisplayValue}
                                    />
                                    <InfoItem
                                        label="Số điện thoại"
                                        value={customer.phone_number}
                                        icon={<IconPhone className="h-4 w-4" />}
                                        getDisplayValue={getDisplayValue}
                                    />
                                    <InfoItem
                                        label="CCCD"
                                        value={customer.cccd}
                                        icon={<IconId className="h-4 w-4" />}
                                        getDisplayValue={getDisplayValue}
                                    />
                                    <InfoItem
                                        label="Email"
                                        value={customer.email}
                                        icon={<IconMail className="h-4 w-4" />}
                                        getDisplayValue={getDisplayValue}
                                    />
                                    <InfoItem
                                        label="Giới tính"
                                        value={customer.gender}
                                        getDisplayValue={getDisplayValue}
                                    />
                                    <InfoItem
                                        label="Quốc tịch"
                                        value={customer.nationality}
                                        icon={<IconWorld className="h-4 w-4" />}
                                        getDisplayValue={getDisplayValue}
                                    />
                                    <InfoItem
                                        label="Tình trạng hôn nhân"
                                        value={customer.marital_status}
                                        getDisplayValue={getDisplayValue}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-semibold text-base">Thông tin liên hệ & cư trú</h3>
                                    <InfoItem
                                        label="Địa chỉ liên hệ"
                                        value={customer.address}
                                        icon={<IconMapPin className="h-4 w-4" />}
                                        fullWidth
                                        getDisplayValue={getDisplayValue}
                                    />
                                    <InfoItem
                                        label="Địa chỉ thường trú"
                                        value={customer.permanent_address}
                                        icon={<IconHome className="h-4 w-4" />}
                                        fullWidth
                                        getDisplayValue={getDisplayValue}
                                    />
                                    <InfoItem
                                        label="Khu vực sinh sống"
                                        value={customer.living_area}
                                        icon={<IconMapPin className="h-4 w-4" />}
                                        getDisplayValue={getDisplayValue}
                                    />
                                    <InfoItem
                                        label="Loại sản phẩm quan tâm"
                                        value={customer.the_product_type}
                                        icon={<IconBuilding className="h-4 w-4" />}
                                        getDisplayValue={getDisplayValue}
                                    />

                                    <Separator className="my-4" />

                                    <h3 className="font-semibold text-base">Sở thích & Kinh doanh</h3>
                                    <InfoItem
                                        label="Sở thích"
                                        value={customer.interest}
                                        icon={<IconHeart className="h-4 w-4" />}
                                        fullWidth
                                        getDisplayValue={getDisplayValue}
                                    />
                                    <InfoItem
                                        label="Tổng tài sản"
                                        value={customer.total_assets}
                                        icon={<IconCash className="h-4 w-4" />}
                                        getDisplayValue={getDisplayValue}
                                    />
                                    <InfoItem
                                        label="Lĩnh vực kinh doanh"
                                        value={customer.business_field}
                                        icon={<IconChartBar className="h-4 w-4" />}
                                        fullWidth
                                        getDisplayValue={getDisplayValue}
                                    />
                                    <InfoItem
                                        label="Tình trạng Zalo"
                                        value={customer.zalo_status}
                                        icon={<IconMessage className="h-4 w-4" />}
                                        getDisplayValue={getDisplayValue}
                                    />
                                    <InfoItem
                                        label="Facebook"
                                        value={customer.facebook}
                                        icon={<IconBrandFacebook className="h-4 w-4" />}
                                        fullWidth
                                        getDisplayValue={getDisplayValue}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab 2: Dự án & Hợp đồng */}
                <TabsContent value="project">
                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <IconBuilding className="h-5 w-5" />
                                Thông tin dự án
                            </CardTitle>
                            <CardDescription>
                                Thông tin chi tiết về dự án mà khách hàng đang quan tâm
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {customer.projects?.new_sales?.length > 0 ? (
                                <div className="space-y-6">
                                    {customer.projects.new_sales.map((project: any, index: number) => (
                                        <div key={project.id || index} className="space-y-4 p-4 rounded-lg border bg-card">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold text-base">
                                                    Dự án #{index + 1}
                                                </h3>
                                                <Badge variant="outline">
                                                    {project.project_name || 'Chưa có tên'}
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <InfoItem
                                                    label="Tên dự án"
                                                    value={project.project_name}
                                                    icon={<IconBuilding className="h-4 w-4" />}
                                                    getDisplayValue={getDisplayValue}
                                                />
                                                <InfoItem
                                                    label="Loại sản phẩm"
                                                    value={project.product_type}
                                                    getDisplayValue={getDisplayValue}
                                                />
                                                <InfoItem
                                                    label="Mã căn"
                                                    value={project.unit_code}
                                                    getDisplayValue={getDisplayValue}
                                                />
                                                <InfoItem
                                                    label="Tầng"
                                                    value={project.floor}
                                                    getDisplayValue={getDisplayValue}
                                                />
                                                <InfoItem
                                                    label="Diện tích đất"
                                                    value={project.land_area}
                                                    getDisplayValue={getDisplayValue}
                                                />
                                                <InfoItem
                                                    label="Diện tích sử dụng"
                                                    value={project.usable_area}
                                                    getDisplayValue={getDisplayValue}
                                                />
                                                <InfoItem
                                                    label="Hướng cửa"
                                                    value={project.door_direction}
                                                    getDisplayValue={getDisplayValue}
                                                />
                                                <InfoItem
                                                    label="View"
                                                    value={project.view}
                                                    getDisplayValue={getDisplayValue}
                                                />
                                                <InfoItem
                                                    label="Giá hợp đồng"
                                                    value={project.contract_price ? formatCurrency(project.contract_price) : undefined}
                                                    icon={<IconCash className="h-4 w-4" />}
                                                    isCurrency
                                                    getDisplayValue={getDisplayValue}
                                                />
                                                <InfoItem
                                                    label="Ngày giao dịch"
                                                    value={project.day_trading ? formatDate(project.day_trading) : undefined}
                                                    icon={<IconCalendar className="h-4 w-4" />}
                                                    getDisplayValue={getDisplayValue}
                                                />
                                                <InfoItem
                                                    label="Nguồn"
                                                    value={project.source}
                                                    getDisplayValue={getDisplayValue}
                                                />
                                                <InfoItem
                                                    label="Chi tiết nguồn"
                                                    value={project.source_details}
                                                    fullWidth
                                                    getDisplayValue={getDisplayValue}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <IconBuilding className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                                    <p>Không có thông tin dự án</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab 3: Loại hợp đồng (Tab mới) */}
                <TabsContent value="contract">
                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <IconContract className="h-5 w-5" />
                                Thông tin hợp đồng
                            </CardTitle>
                            <CardDescription>
                                Chi tiết về loại hợp đồng và pháp lý
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">


                                {/* Thông tin chi tiết hợp đồng */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-base">Thông tin hợp đồng</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <InfoItem
                                                label="Loại hợp đồng"
                                                value={getContractTypeName(getContractType())}
                                                icon={<IconContract className="h-4 w-4" />}
                                                getDisplayValue={getDisplayValue}
                                            />
                                            <InfoItem
                                                label="Mã hợp đồng"
                                                value={getContractType()}
                                                getDisplayValue={getDisplayValue}
                                            />
                                            <InfoItem
                                                label="Trạng thái pháp lý"
                                                value={customer.projects?.new_sales?.[0]?.legal}
                                                getDisplayValue={getDisplayValue}
                                            />
                                        </CardContent>
                                    </Card>


                                </div>

                                {/* Mô tả các loại hợp đồng */}
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base">Các loại hợp đồng</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {Object.entries(CONTRACT_TYPES).map(([code, name]) => (
                                                <div
                                                    key={code}
                                                    className={`flex items-center justify-between p-3 rounded-lg border ${getContractType() === code ? 'bg-primary/5 border-primary/20' : 'bg-card'}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`size-8 rounded-full flex items-center justify-center ${getContractType() === code ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                                            <IconContract className="h-4 w-4" />
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">{name}</span>
                                                            {code && (
                                                                <span className="text-xs text-muted-foreground ml-2">({code})</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {getContractType() === code && (
                                                        <Badge variant="default" className="text-xs">
                                                            Đang áp dụng
                                                        </Badge>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

// Helper component for info items
interface InfoItemProps {
    label: string
    value?: string | number
    icon?: React.ReactNode
    fullWidth?: boolean
    isCurrency?: boolean
    colSpan?: number
    getDisplayValue: (value: any) => string
}

function InfoItem({ label, value, icon, fullWidth = false, isCurrency = false, colSpan, getDisplayValue }: InfoItemProps) {
    const displayValue = getDisplayValue(value)

    return (
        <div
            className={`space-y-1 ${colSpan ? `col-span-${colSpan}` : ''}`}
            style={colSpan ? { gridColumn: `span ${colSpan} / span ${colSpan}` } : {}}
        >
            <div className="flex items-center gap-1.5">
                {icon}
                <span className="text-sm font-medium text-muted-foreground">
                    {label}
                </span>
            </div>
            <div className={`text-sm ${isCurrency ? 'font-semibold' : ''} ${fullWidth ? '' : 'max-w-md'}`}>
                {displayValue}
            </div>
        </div>
    )
}