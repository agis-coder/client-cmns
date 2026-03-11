"use client"

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
    IconCash,
    IconChartBar,
    IconHeart,
    IconWorld,
    IconMessage,
    IconBrandFacebook,
    IconUserCheck,
    IconEdit,
    IconPrinter,
    IconShare,
    IconContract,
    IconEye,
    IconChevronDown,
    IconChevronUp,
    IconBuildingCommunity,
    IconInfoCircle,
    IconLoader2,
    IconTag,
    IconSourceCode,
    IconCurrencyDong,
    IconLayersSubtract,
    IconSearch
} from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getCustomerProjectUnits } from '@/services/customer-data'
import { CopyPlus } from 'lucide-react'
import { CustomerUpdatePopup } from '@/components/data-customer/customer-update-popup' // Import popup
import { Customer } from '@/interfaces/customer'
import { updateProjectDetail } from '@/services/project-data'
import { Combobox } from './combobox'

interface CustomerDetailProps {
    customer: any
}

interface UnitData {
    project_detail_id: string
    project_id: string
    project_name: string
    unit_code: string
    subdivision: string
    product_type: string
    floor: string
    source: string
    source_details: string | null
    contract_price: string
}

const CONTRACT_TYPES: Record<string, string> = {
    'VBTT': 'Văn bản thỏa thuận',
    'DEPOSIT': 'Hợp đồng đặt cọc',
    'CAPITAL': 'Hợp đồng góp vốn',
    'HĐMB': 'Hợp đồng mua bán',
    'PINK_BOOK': 'Sổ hồng',
    'HANDWRITTEN': 'Giấy viết tay',
    '': 'Không xác định'
}

const PRODUCT_TYPES = [
    "Studio",
    "1PN",
    "1PN+",
    "2PN",
    "2PN+",
    "3PN",
    "3PN+",
    "4PN",
    "Duplex",
    "Penthouse",
    "Sky Villa",
    "Shophouse",
    "Shop Villa",
    "Boutique",
    "Land",
    "Văn Phòng",
    "House",
    "Townhouse",
    "BTSL",
    "BTĐL",
    "Villa",
    "Condotel",
    "Officetel"
]

export default function CustomerDetail({ customer }: CustomerDetailProps) {
    const router = useRouter()
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
    const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())
    const [projectUnits, setProjectUnits] = useState<Record<string, UnitData[]>>({})
    const [loadingUnits, setLoadingUnits] = useState<Record<string, boolean>>({})
    const [searchTerms, setSearchTerms] = useState<Record<string, string>>({})

    const [editingUnit, setEditingUnit] = useState<any>(null)
    const [formData, setFormData] = useState<any>({})
    // State cho popup update
    const [showUpdatePopup, setShowUpdatePopup] = useState(false)
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

    console.log('customer:', customer)

    const getDisplayValue = (value: any): string => {
        if (value === undefined || value === null || value === '') {
            return '—'
        }
        return String(value)
    }

    const getContractTypeName = (typeCode: string): string => {
        return CONTRACT_TYPES[typeCode] || getDisplayValue(typeCode)
    }

    const handleViewDetails = (projectId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        setSelectedProjectId(projectId)
        console.log('Selected project ID:', projectId)
    }

    const toggleProject = async (projectName: string, projectId: string) => {
        const isExpanded = expandedProjects.has(projectName)

        if (!isExpanded && !projectUnits[projectId]) {
            setLoadingUnits(prev => ({ ...prev, [projectId]: true }))
            try {
                const units = await getCustomerProjectUnits(customer.id, projectId)
                setProjectUnits(prev => ({ ...prev, [projectId]: units }))
            } catch (error) {
                console.error('Failed to fetch project units:', error)
            } finally {
                setLoadingUnits(prev => ({ ...prev, [projectId]: false }))
            }
        }

        setExpandedProjects(prev => {
            const newSet = new Set(prev)
            if (newSet.has(projectName)) {
                newSet.delete(projectName)
            } else {
                newSet.add(projectName)
            }
            return newSet
        })
    }

    const handleSearchChange = (projectId: string, value: string) => {
        setSearchTerms(prev => ({ ...prev, [projectId]: value }))
    }

    // const getFilteredUnits = (projectId: string, units: UnitData[]) => {
    //     const searchTerm = searchTerms[projectId]?.toLowerCase() || ''
    //     if (!searchTerm) return units

    //     return units.filter(unit =>
    //         unit.unit_code.toLowerCase().includes(searchTerm) ||
    //         unit.subdivision.toLowerCase().includes(searchTerm) ||
    //         unit.source.toLowerCase().includes(searchTerm) ||
    //         (unit.source_details && unit.source_details.toLowerCase().includes(searchTerm))
    //     )
    // }

    const getSourceBadgeColor = (source: string) => {
        const colors = {
            'IMPORT': 'bg-blue-100 text-blue-700 border-blue-200',
            'MANUAL': 'bg-green-100 text-green-700 border-green-200',
            'API': 'bg-purple-100 text-purple-700 border-purple-200',
        }
        return colors[source as keyof typeof colors] || 'bg-gray-100 text-gray-700 border-gray-200'
    }

    // Handler cho nút chỉnh sửa
    const handleEdit = () => {
        setSelectedCustomer(customer as Customer)
        setShowUpdatePopup(true)
    }

    const handleEditUnit = (unit: any) => {
        setEditingUnit(unit)
        setFormData({
            unit_code: unit.unit_code || "",
            product_type: unit.product_type || "",
            subdivision: unit.subdivision || "",
            floor: unit.floor || "",
            land_area: unit.land_area || "",
            usable_area: unit.usable_area || "",
            door_direction: unit.door_direction || "",
            view: unit.view || "",
            contract_price: unit.contract_price || "",
            day_trading: unit.day_trading || "",
            source: unit.source || "",
            source_details: unit.source_details || "",
            is_active: unit.is_active ?? true
        })
    }

    const handleSave = async () => {
        try {

            await updateProjectDetail(editingUnit.project_detail_id, formData)

            window.location.reload()

        } catch (error) {
            console.error(error)
        }
    }

    // Handler khi update thành công
    const handleUpdateSuccess = () => {
        window.location.reload()
    }

    const [productTypeFilter, setProductTypeFilter] = useState<Record<string, string>>({})

    // Handler cho product type filter
    const handleProductTypeFilterChange = (projectId: string, value: string) => {
        setProductTypeFilter(prev => ({ ...prev, [projectId]: value }))
    }

    // Cập nhật hàm getFilteredUnits để bao gồm filter loại sản phẩm
    const getFilteredUnits = (projectId: string, units: UnitData[]) => {
        const searchTerm = searchTerms[projectId]?.toLowerCase() || ''
        const productType = productTypeFilter[projectId]

        return units.filter(unit => {
            // Filter by search term
            const matchesSearch = !searchTerm ||
                unit.unit_code.toLowerCase().includes(searchTerm) ||
                unit.subdivision.toLowerCase().includes(searchTerm) ||
                unit.source.toLowerCase().includes(searchTerm) ||
                (unit.source_details && unit.source_details.toLowerCase().includes(searchTerm))

            // Filter by product type
            const matchesProductType = !productType || productType === 'all' || unit.product_type === productType

            return matchesSearch && matchesProductType
        })
    }

    // Cập nhật filteredUnits khi render

    const tabs = [
        {
            value: 'personal',
            label: 'Thông tin cá nhân',
            icon: IconUserCheck,
            content: (
                <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900">Thông tin cá nhân</h3>
                        <p className="text-sm text-gray-500 mt-1">Thông tin chi tiết về khách hàng</p>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Cột trái */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-1 h-7 bg-black rounded-full"></div>
                                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Thông tin cơ bản</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                    <InfoItem
                                        label="Họ và tên"
                                        value={customer.customer_name}
                                        icon={<IconUserCheck className="h-4 w-4 text-gray-400" />}
                                        getDisplayValue={getDisplayValue}
                                    />
                                    <InfoItem
                                        label="Ngày sinh"
                                        value={customer.date_of_birth ? formatDate(customer.date_of_birth) : undefined}
                                        icon={<IconCalendar className="h-4 w-4 text-gray-400" />}
                                        getDisplayValue={getDisplayValue}
                                    />
                                    <InfoItem
                                        label="Số điện thoại"
                                        value={customer.phone_number}
                                        icon={<IconPhone className="h-4 w-4 text-gray-400" />}
                                        getDisplayValue={getDisplayValue}
                                    />
                                    <InfoItem
                                        label="CCCD"
                                        value={customer.cccd}
                                        icon={<IconId className="h-4 w-4 text-gray-400" />}
                                        getDisplayValue={getDisplayValue}
                                    />
                                    <InfoItem
                                        label="Email"
                                        value={customer.email}
                                        icon={<IconMail className="h-4 w-4 text-gray-400" />}
                                        getDisplayValue={getDisplayValue}
                                    />
                                    <InfoItem
                                        label="Giới tính"
                                        value={customer.gender}
                                        icon={<IconUserCheck className="h-4 w-4 text-gray-400" />}
                                        getDisplayValue={getDisplayValue}
                                    />
                                    <InfoItem
                                        label="Quốc tịch"
                                        value={customer.nationality}
                                        icon={<IconWorld className="h-4 w-4 text-gray-400" />}
                                        getDisplayValue={getDisplayValue}
                                    />
                                    <InfoItem
                                        label="Tình trạng hôn nhân"
                                        value={customer.marital_status}
                                        icon={<IconHeart className="h-4 w-4 text-gray-400" />}
                                        getDisplayValue={getDisplayValue}
                                    />
                                </div>
                            </div>

                            {/* Cột phải */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-1 h-7 bg-black rounded-full"></div>
                                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Liên hệ & Cư trú</h4>
                                </div>
                                <div className="space-y-4">
                                    <InfoItem
                                        label="Địa chỉ liên hệ"
                                        value={customer.address}
                                        icon={<IconMapPin className="h-4 w-4 text-gray-400" />}
                                        fullWidth
                                        getDisplayValue={getDisplayValue}
                                    />
                                    <InfoItem
                                        label="Địa chỉ thường trú"
                                        value={customer.permanent_address}
                                        icon={<IconHome className="h-4 w-4 text-gray-400" />}
                                        fullWidth
                                        getDisplayValue={getDisplayValue}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <InfoItem
                                            label="Khu vực sinh sống"
                                            value={customer.living_area}
                                            icon={<IconMapPin className="h-4 w-4 text-gray-400" />}
                                            getDisplayValue={getDisplayValue}
                                        />
                                        <InfoItem
                                            label="Loại sản phẩm quan tâm"
                                            value={customer.the_product_type}
                                            icon={<IconBuilding className="h-4 w-4 text-gray-400" />}
                                            getDisplayValue={getDisplayValue}
                                        />
                                    </div>

                                    <Separator className="my-6" />

                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-1 h-7 bg-black rounded-full"></div>
                                        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Sở thích & Kinh doanh</h4>
                                    </div>
                                    <div className="space-y-4">
                                        <InfoItem
                                            label="Sở thích"
                                            value={customer.interest}
                                            icon={<IconHeart className="h-4 w-4 text-gray-400" />}
                                            fullWidth
                                            getDisplayValue={getDisplayValue}
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <InfoItem
                                                label="Tổng tài sản"
                                                value={customer.total_assets}
                                                icon={<IconCash className="h-4 w-4 text-gray-400" />}
                                                getDisplayValue={getDisplayValue}
                                            />
                                            <InfoItem
                                                label="Tình trạng Zalo"
                                                value={customer.zalo_status}
                                                icon={<IconMessage className="h-4 w-4 text-gray-400" />}
                                                getDisplayValue={getDisplayValue}
                                            />
                                        </div>
                                        <InfoItem
                                            label="Lĩnh vực kinh doanh"
                                            value={customer.business_field}
                                            icon={<IconChartBar className="h-4 w-4 text-gray-400" />}
                                            fullWidth
                                            getDisplayValue={getDisplayValue}
                                        />
                                        <InfoItem
                                            label="Facebook"
                                            value={customer.facebook}
                                            icon={<IconBrandFacebook className="h-4 w-4 text-gray-400" />}
                                            fullWidth
                                            getDisplayValue={getDisplayValue}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            value: 'project',
            label: 'Dự án đã mua',
            icon: IconBuilding,
            content: (
                <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900">Dự án đã mua</h3>
                        <p className="text-sm text-gray-500 mt-1">Click vào dự án để xem chi tiết các căn hộ</p>
                    </div>
                    <div className="p-6">
                        {customer.projects?.new_sales?.length > 0 ? (
                            <div className="space-y-4">
                                {customer.projects.new_sales.map((project: any, index: number) => {
                                    const projectName = project.project_name || 'Chưa có tên'
                                    const projectId = project.project_id
                                    const isExpanded = expandedProjects.has(projectName)
                                    const units = projectUnits[projectId] || []
                                    const isLoading = loadingUnits[projectId]
                                    const filteredUnits = useMemo(() =>
                                        getFilteredUnits(projectId, units),
                                        [projectId, units, searchTerms, productTypeFilter]
                                    )
                                    return (
                                        <div
                                            key={project.id || index}
                                            className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:border-gray-300 transition-colors"
                                        >
                                            {/* Project Header */}
                                            <div
                                                onClick={() => toggleProject(projectName, projectId)}
                                                className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50/80 transition-colors"
                                            >
                                                <div className="flex items-center gap-4 min-w-0 flex-1">
                                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center text-white font-semibold text-lg shrink-0">
                                                        {index + 1}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h4 className="font-semibold text-gray-900 truncate text-base">{projectName}</h4>
                                                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                                            <Badge variant="outline" className="rounded-full px-3 py-0.5 text-xs border-gray-300">
                                                                <IconBuilding className="h-3 w-3 mr-1" />
                                                                {project.total_units || 0} căn
                                                            </Badge>
                                                            {units.length > 0 && (
                                                                <>
                                                                    <span className="text-xs text-gray-300">•</span>
                                                                    <span className="text-xs text-gray-500">
                                                                        Đã tải {units.length} căn
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0 ml-4">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={(e) => handleViewDetails(projectId, e)}
                                                        className="rounded-full hover:bg-gray-200 h-9 w-9"
                                                    >
                                                        <IconEye className="h-4 w-4 text-gray-500" />
                                                    </Button>
                                                    <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                                                        <IconChevronDown className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expanded Content - Table with Search */}
                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="border-t border-gray-100"
                                                    >
                                                        {isLoading ? (
                                                            <div className="flex flex-col items-center justify-center py-12 bg-gray-50/50">
                                                                <IconLoader2 className="h-8 w-8 animate-spin text-gray-400 mb-3" />
                                                                <p className="text-sm text-gray-500">Đang tải danh sách căn hộ...</p>
                                                            </div>
                                                        ) : units.length > 0 ? (
                                                            <div className="p-4 bg-gray-50/50">
                                                                {/* Filter Bar */}
                                                                <div className="flex gap-3 mb-4">
                                                                    {/* Search Bar */}
                                                                    <div className="relative flex-1">
                                                                        <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                                        <Input
                                                                            placeholder="Tìm kiếm theo mã căn, phân khu, nguồn..."
                                                                            value={searchTerms[projectId] || ''}
                                                                            onChange={(e) => handleSearchChange(projectId, e.target.value)}
                                                                            className="pl-9 pr-4 py-2 w-full border-gray-200 rounded-lg focus:ring-2 focus:ring-black/20 focus:border-black"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                        />
                                                                    </div>

                                                                    {/* Product Type Filter Combobox */}
                                                                    <Combobox
                                                                        value={productTypeFilter[projectId] || 'all'}
                                                                        onChange={(value) => handleProductTypeFilterChange(projectId, value)}
                                                                        title="Loại sản phẩm"
                                                                        options={[
                                                                            { value: 'all', label: 'Tất cả loại sản phẩm' },
                                                                            ...PRODUCT_TYPES.map(type => ({
                                                                                value: type,
                                                                                label: type
                                                                            }))
                                                                        ]}
                                                                    />
                                                                </div>

                                                                {/* Search result info */}
                                                                {searchTerms[projectId] && (
                                                                    <div className="mt-2 text-sm text-gray-500">
                                                                        Tìm thấy {filteredUnits.length} kết quả cho "{searchTerms[projectId]}"
                                                                    </div>
                                                                )}


                                                                {/* Units Table */}
                                                                <div className="overflow-x-auto rounded-lg border border-gray-200">
                                                                    <Table>
                                                                        <TableHeader className="bg-gray-100">
                                                                            <TableRow>
                                                                                <TableHead className="text-xs font-medium text-gray-600 whitespace-nowrap px-4 py-3">Mã căn</TableHead>
                                                                                <TableHead className="text-xs font-medium text-gray-600 whitespace-nowrap px-4 py-3">Phân khu</TableHead>
                                                                                <TableHead className="text-xs font-medium text-gray-600 whitespace-nowrap px-4 py-3">Loại sản phẩm</TableHead>
                                                                                <TableHead className="text-xs font-medium text-gray-600 whitespace-nowrap px-4 py-3">Tầng</TableHead>
                                                                                <TableHead className="text-xs font-medium text-gray-600 whitespace-nowrap px-4 py-3">Nguồn</TableHead>
                                                                                <TableHead className="text-xs font-medium text-gray-600 whitespace-nowrap px-4 py-3">Chi tiết nguồn</TableHead>
                                                                                <TableHead className="text-xs font-medium text-gray-600 whitespace-nowrap px-4 py-3 text-right">Giá hợp đồng</TableHead>
                                                                                <TableHead className="text-xs font-medium text-gray-600 whitespace-nowrap px-4 py-3 text-center">
                                                                                    Hành động
                                                                                </TableHead>
                                                                            </TableRow>
                                                                        </TableHeader>
                                                                        <TableBody>
                                                                            {filteredUnits.length > 0 ? (
                                                                                filteredUnits.map((unit) => (
                                                                                    <TableRow key={unit.project_detail_id} className="hover:bg-gray-50">
                                                                                        <TableCell className="px-4 py-3">
                                                                                            <div className="flex items-center gap-2">
                                                                                                <IconTag className="h-4 w-4 text-gray-400" />
                                                                                                <span className="font-medium text-gray-900">{unit.unit_code}</span>
                                                                                            </div>
                                                                                        </TableCell>
                                                                                        <TableCell className="px-4 py-3 text-gray-600">
                                                                                            {unit.subdivision || '—'}
                                                                                        </TableCell>
                                                                                        <TableCell className="px-4 py-3 text-gray-700">
                                                                                            {unit.product_type === 'UNKNOWN'
                                                                                                ? 'Chưa xác định'
                                                                                                : unit.product_type || '—'}                                                                                        </TableCell>
                                                                                        <TableCell className="px-4 py-3">
                                                                                            {unit.floor ? (
                                                                                                <Badge variant="outline" className="rounded-full px-3 py-0.5 text-xs border-gray-300">
                                                                                                    Tầng {unit.floor}
                                                                                                </Badge>
                                                                                            ) : '—'}
                                                                                        </TableCell>
                                                                                        <TableCell className="px-4 py-3">
                                                                                            <Badge className={`${getSourceBadgeColor(unit.source)} rounded-full px-3 py-1 text-xs font-medium border-0`}>
                                                                                                {unit.source}
                                                                                            </Badge>
                                                                                        </TableCell>
                                                                                        <TableCell className="px-4 py-3 text-gray-600 max-w-[200px] truncate" title={unit.source_details || ''}>
                                                                                            {unit.source_details || '—'}
                                                                                        </TableCell>
                                                                                        <TableCell className="px-4 py-3 text-right">
                                                                                            {unit.contract_price !== '0' ? (
                                                                                                <div className="flex items-center justify-end gap-1">
                                                                                                    <IconCurrencyDong className="h-4 w-4 text-gray-400" />
                                                                                                    <span className="font-medium text-gray-900">
                                                                                                        {formatCurrency(Number(unit.contract_price))}
                                                                                                    </span>
                                                                                                </div>
                                                                                            ) : '—'}
                                                                                        </TableCell>
                                                                                        <TableCell className="text-center">
                                                                                            <button
                                                                                                onClick={() => handleEditUnit(unit)}
                                                                                                className="p-2 border rounded hover:bg-gray-100"
                                                                                            >
                                                                                                <IconEdit className="w-4 h-4" />
                                                                                            </button>
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                ))
                                                                            ) : (
                                                                                <TableRow>
                                                                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                                                                        <IconInfoCircle className="h-6 w-6 mx-auto mb-2 text-gray-300" />
                                                                                        Không tìm thấy căn hộ nào khớp với từ khóa "{searchTerms[projectId]}"
                                                                                    </TableCell>
                                                                                </TableRow>
                                                                            )}
                                                                        </TableBody>
                                                                    </Table>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col items-center justify-center py-12 bg-gray-50/50">
                                                                <IconInfoCircle className="h-8 w-8 text-gray-300 mb-3" />
                                                                <p className="text-sm text-gray-500">Không có thông tin căn hộ</p>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                                <IconBuilding className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p className="text-sm">Khách hàng chưa tham gia dự án nào</p>
                            </div>
                        )}
                    </div>
                </div>
            )
        },
        {
            value: 'contract',
            label: 'Hợp đồng',
            icon: IconContract,
            content: (
                <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900">Thông tin hợp đồng</h3>
                        <p className="text-sm text-gray-500 mt-1">Chi tiết về loại hợp đồng và pháp lý</p>
                    </div>
                    <div className="p-6">
                        <div className="space-y-8">
                            {/* Contract Types Grid */}
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-1 h-7 bg-black rounded-full"></div>
                                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Danh sách loại hợp đồng</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {Object.entries(CONTRACT_TYPES).map(([code, name]) => {
                                        const isActive = customer.projects?.new_sales?.some((p: any) => p.legal === code)
                                        return (
                                            <div
                                                key={code}
                                                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isActive
                                                    ? 'bg-gray-50 border-gray-300 shadow-sm'
                                                    : 'bg-white border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        <IconContract className="h-4 w-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span className="font-medium text-gray-900 text-sm block truncate">{name}</span>
                                                        {code && (
                                                            <span className="text-xs text-gray-400">Mã: {code}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                {isActive && (
                                                    <Badge className="bg-gray-900 text-white rounded-full px-3 py-1 text-xs border-0 shrink-0 ml-2">
                                                        Đang sử dụng
                                                    </Badge>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Project Contracts Table */}
                            {customer.projects?.new_sales?.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-1 h-7 bg-black rounded-full"></div>
                                        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Hợp đồng theo dự án</h4>
                                    </div>
                                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader className="bg-gray-50">
                                                    <TableRow>
                                                        <TableHead className="text-xs font-medium text-gray-500 whitespace-nowrap px-4 py-3">STT</TableHead>
                                                        <TableHead className="text-xs font-medium text-gray-500 whitespace-nowrap px-4 py-3">Tên dự án</TableHead>
                                                        <TableHead className="text-xs font-medium text-gray-500 whitespace-nowrap px-4 py-3">Loại hợp đồng</TableHead>
                                                        <TableHead className="text-xs font-medium text-gray-500 whitespace-nowrap px-4 py-3">Mã hợp đồng</TableHead>
                                                        <TableHead className="text-xs font-medium text-gray-500 whitespace-nowrap px-4 py-3">Số căn</TableHead>
                                                        <TableHead className="text-center text-xs font-medium text-gray-500 whitespace-nowrap px-4 py-3">Hành động</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {customer.projects.new_sales.map((project: any, index: number) => (
                                                        <TableRow key={project.id || index} className="hover:bg-gray-50">
                                                            <TableCell className="text-sm px-4 py-3 font-medium">{index + 1}</TableCell>
                                                            <TableCell className="font-medium text-sm px-4 py-3 min-w-[200px]">
                                                                {project.project_name || 'Chưa có'}
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3">
                                                                <Badge variant="outline" className="rounded-full px-3 py-1 text-xs border-gray-300 whitespace-nowrap">
                                                                    {getContractTypeName(project.legal)}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-sm text-gray-600 px-4 py-3">
                                                                {project.legal || '—'}
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3">
                                                                <Badge className="bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-xs border-0">
                                                                    <IconLayersSubtract className="h-3 w-3 mr-1" />
                                                                    {project.total_units || 0}
                                                                </Badge>
                                                            </TableCell>

                                                            <TableCell className="text-center">
                                                                <button
                                                                    onClick={() => handleEditUnit(project)}
                                                                    className="p-2 border rounded hover:bg-gray-100"
                                                                >
                                                                    Asfasf
                                                                    <IconEdit className="w-4 h-4" />
                                                                </button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )
        }
    ]

    return (
        <>

            <div className="min-h-screen bg-[#F8FAFC]">
                {editingUnit && (
                    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-lg">

                            {/* Header */}
                            <div className="px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-base font-medium text-gray-700">
                                            Cập nhật thông tin
                                        </h2>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            Mã căn: <span className="text-gray-600">{editingUnit.unit_code}</span>
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setEditingUnit(null)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-5 overflow-y-auto max-h-[calc(90vh-120px)]">
                                <div className="grid grid-cols-2 gap-4">

                                    {/* Cột 1 */}
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">Mã căn</label>
                                            <input
                                                type="text"
                                                value={formData.unit_code}
                                                onChange={(e) => setFormData({ ...formData, unit_code: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-gray-400 focus:outline-none"
                                                placeholder="Nhập mã căn"
                                            />
                                        </div>

                                        {/* Loại sản phẩm - ĐÃ SỬA THÀNH SELECT */}
                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">Loại sản phẩm</label>
                                            <select
                                                value={formData.product_type}
                                                onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-gray-400 focus:outline-none bg-white"
                                            >
                                                <option value="">Chọn loại sản phẩm</option>
                                                {PRODUCT_TYPES.map((type) => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">Phân khu</label>
                                            <input
                                                type="text"
                                                value={formData.subdivision}
                                                onChange={(e) => setFormData({ ...formData, subdivision: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-gray-400 focus:outline-none"
                                                placeholder="Nhập phân khu"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">Tầng</label>
                                            <input
                                                type="number"
                                                value={formData.floor}
                                                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-gray-400 focus:outline-none"
                                                placeholder="Nhập tầng"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">Diện tích đất (m²)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={formData.land_area}
                                                onChange={(e) => setFormData({ ...formData, land_area: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-gray-400 focus:outline-none"
                                                placeholder="Nhập diện tích đất"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">Diện tích sử dụng (m²)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={formData.usable_area}
                                                onChange={(e) => setFormData({ ...formData, usable_area: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-gray-400 focus:outline-none"
                                                placeholder="Nhập diện tích sử dụng"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">Hướng cửa</label>
                                            <select
                                                value={formData.door_direction}
                                                onChange={(e) => setFormData({ ...formData, door_direction: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-gray-400 focus:outline-none bg-white"
                                            >
                                                <option value="">Chọn hướng</option>
                                                <option value="Đông">Đông</option>
                                                <option value="Tây">Tây</option>
                                                <option value="Nam">Nam</option>
                                                <option value="Bắc">Bắc</option>
                                                <option value="Đông Bắc">Đông Bắc</option>
                                                <option value="Đông Nam">Đông Nam</option>
                                                <option value="Tây Bắc">Tây Bắc</option>
                                                <option value="Tây Nam">Tây Nam</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Cột 2 */}
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">View</label>
                                            <select
                                                value={formData.view}
                                                onChange={(e) => setFormData({ ...formData, view: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-gray-400 focus:outline-none bg-white"
                                            >
                                                <option value="">Chọn view</option>
                                                <option value="Biển">Biển</option>
                                                <option value="Thành phố">Thành phố</option>
                                                <option value="Hồ bơi">Hồ bơi</option>
                                                <option value="Công viên">Công viên</option>
                                                <option value="Nội khu">Nội khu</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">Giá hợp đồng (VNĐ)</label>
                                            <input
                                                type="number"
                                                value={formData.contract_price}
                                                onChange={(e) => setFormData({ ...formData, contract_price: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-gray-400 focus:outline-none"
                                                placeholder="Nhập giá hợp đồng"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">Ngày giao dịch</label>
                                            <input
                                                type="date"
                                                value={formData.day_trading}
                                                onChange={(e) => setFormData({ ...formData, day_trading: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-gray-400 focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">Nguồn</label>
                                            <select
                                                value={formData.source}
                                                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-gray-400 focus:outline-none bg-white"
                                            >
                                                <option value="">Chọn nguồn</option>
                                                <option value="BĐS">BDS</option>
                                                <option value="GUI_TIET_KIEM">Gửi tiết kiệm</option>
                                                <option value="XE_HOI">Xe hơi</option>
                                                <option value="CHUNG_KHOAN">Chứng khoán</option>
                                                <option value="VANG">Vàng</option>
                                                <option value="TRUONG_QUOC_TE">Trường quốc tế</option>
                                                <option value="BAC_SI">Bác sĩ</option>
                                                <option value="QUAN_CHUC">Quan chức</option>
                                                <option value="DINH_CU">Định cư</option>
                                                <option value="TMĐT">TMĐT</option>
                                                <option value="CEO">CEO</option>
                                                <option value="BAO_HIEM">Bảo hiểm</option>
                                                <option value="GOLF">Golf</option>
                                                <option value="KS_5_SAO">KS 5 sao</option>
                                                <option value="HIEP_HOI">Hiệp hội</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">Chi tiết nguồn</label>
                                            <input
                                                type="text"
                                                value={formData.source_details}
                                                onChange={(e) => setFormData({ ...formData, source_details: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-gray-400 focus:outline-none"
                                                placeholder="Nhập chi tiết nguồn"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">Trạng thái</label>
                                            <select
                                                value={formData.is_active}
                                                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === "true" })}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-gray-400 focus:outline-none bg-white"
                                            >
                                                <option value="true">Hoạt động</option>
                                                <option value="false">Không hoạt động</option>
                                            </select>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-2">
                                <button
                                    onClick={() => setEditingUnit(null)}
                                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 text-sm bg-gray-800 text-white hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    Cập nhật
                                </button>
                            </div>

                        </div>
                    </div>
                )}
                {/* Header */}
                <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/80   z-50">
                    <div className="w-full px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => router.push('/data-customer')}
                                    className="rounded-full hover:bg-gray-100 w-10 h-10"
                                >
                                    <IconArrowLeft className="h-5 w-5" />
                                </Button>
                                <div>
                                    <h1 className="text-xl font-semibold text-gray-900">
                                        {customer.customer_name || 'Khách hàng'}
                                    </h1>
                                    <p className="text-sm text-gray-500">
                                        ID: {customer.id?.slice(0, 8)}...
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 w-10 h-10">
                                    <IconShare className="h-5 w-5 text-gray-600" />
                                </Button>
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 w-10 h-10">
                                    <IconPrinter className="h-5 w-5 text-gray-600" />
                                </Button>
                                <Button
                                    onClick={handleEdit}
                                    className="rounded-full bg-black hover:bg-gray-800 text-white px-5 h-10"
                                >
                                    <IconEdit className="h-4 w-4 mr-2" />
                                    Chỉnh sửa
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="w-full px-6 lg:px-8 py-8">
                    {/* Profile Card */}
                    <div className="bg-white rounded-2xl border border-gray-200/80 p-6 mb-8 w-full shadow-sm">
                        <div className="flex items-start gap-6">
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center text-white text-3xl font-semibold shadow-lg shrink-0">
                                {customer.customer_name?.charAt(0).toUpperCase() || 'K'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <h2 className="text-2xl font-semibold text-gray-900 truncate">
                                            {customer.customer_name || 'Chưa có tên'}
                                        </h2>
                                        <div className="flex items-center gap-4 mt-2 flex-wrap">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <IconPhone className="h-4 w-4" />
                                                <span>{getDisplayValue(customer.phone_number)}</span>
                                            </div>
                                            <span className="text-gray-300 hidden sm:inline">•</span>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <IconMail className="h-4 w-4" />
                                                <span>{getDisplayValue(customer.email)}</span>
                                            </div>
                                            {customer.cccd && (
                                                <>
                                                    <span className="text-gray-300 hidden sm:inline">•</span>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <IconId className="h-4 w-4" />
                                                        <span>{getDisplayValue(customer.cccd)}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="px-4 py-1.5 rounded-full text-sm border-gray-300 bg-gray-50">
                                        {customer.projects?.new_sales?.length || 0} dự án
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <Tabs defaultValue="personal" className="space-y-6">
                        <TabsList className="bg-transparent border-b border-gray-200/80 rounded-none h-12 p-0 w-full justify-start gap-8">
                            {tabs.map((tab) => (
                                <TabsTrigger
                                    key={tab.value}
                                    value={tab.value}
                                    className="rounded-none px-0 pb-3 data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:shadow-none bg-transparent h-auto text-sm font-medium text-gray-600 data-[state=active]:text-black"
                                >
                                    <tab.icon className="h-4 w-4 mr-2" />
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {tabs.map((tab) => (
                            <TabsContent key={tab.value} value={tab.value}>
                                {tab.content}
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>

                {/* Debug Panel */}
                {selectedProjectId && (
                    <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm shadow-lg z-50">
                        Project ID: {selectedProjectId.slice(0, 8)}...
                    </div>
                )}
            </div>

            {/* Customer Update Popup */}
            <CustomerUpdatePopup
                open={showUpdatePopup}
                onOpenChange={setShowUpdatePopup}
                customer={selectedCustomer}
                onSuccess={handleUpdateSuccess}
            />
        </>
    )
}

// Helper component for info items
interface InfoItemProps {
    label: string
    value?: string | number
    icon?: React.ReactNode
    fullWidth?: boolean
    getDisplayValue: (value: any) => string
}

function InfoItem({ label, value, icon, fullWidth = false, getDisplayValue }: InfoItemProps) {
    const displayValue = getDisplayValue(value)

    return (
        <div className={`space-y-1.5 ${fullWidth ? 'col-span-full' : ''}`}>
            <div className="flex items-center gap-1.5 text-gray-500">
                {icon}
                <span className="text-xs font-medium uppercase tracking-wider">
                    {label}
                </span>
            </div>
            <div className="text-sm text-gray-900 font-medium break-words pl-6">
                {displayValue}
            </div>
        </div>
    )
}

