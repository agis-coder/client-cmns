"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import {
    ProjectCategory,
    CATEGORY_TITLE,
    InvestorData,
} from "@/interfaces/project-category"
import { getProjectsByCategory } from "@/services/project-data"
import { User, Mail, Phone, X, ChevronLeft, ChevronRight } from "lucide-react"
import { getListCustomerByProject } from "@/services/customer-data"

interface ProjectBrowserProps {
    initialCategory: ProjectCategory
    initialData: InvestorData[]
}

interface CustomerData {
    customer_id: string
    customer_name: string
    phone: string
    address: string | null
    total_units: number
}

export function ProjectBrowser({
    initialCategory,
    initialData,
}: ProjectBrowserProps) {
    const [activeCategory, setActiveCategory] = useState<ProjectCategory>(initialCategory)
    const [data, setData] = useState<InvestorData[]>(initialData)
    const [loading, setLoading] = useState(false)

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalLoading, setModalLoading] = useState(false)
    const [customers, setCustomers] = useState<CustomerData[]>([])
    const [selectedProject, setSelectedProject] = useState<string>("")

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 100

    const handleChangeCategory = async (category: ProjectCategory) => {
        if (category === activeCategory) return
        setActiveCategory(category)
        setLoading(true)
        setData([])
        try {
            const res = await getProjectsByCategory(category)
            setData(res)
        } catch (err) {
            console.error("Fetch investors failed:", err)
        } finally {
            setLoading(false)
        }
    }

    const handleProjectClick = async (project_id: string) => {
        setSelectedProject(project_id)
        setIsModalOpen(true)
        setModalLoading(true)
        setCurrentPage(1)

        try {
            const result = await getListCustomerByProject(project_id)
            if (result) {
                // Map the data to match CustomerData interface
                const mappedCustomers: CustomerData[] = result.map((customer: any) => ({
                    customer_id: customer.customer_id,
                    customer_name: customer.customer_name,
                    phone: customer.phone || "",
                    address: customer.address || null,
                    total_units: customer.total_units
                }))
                setCustomers(mappedCustomers)
            }
        } catch (err) {
            console.error("Failed to fetch customers:", err)
            setCustomers([])
        } finally {
            setModalLoading(false)
        }
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setCustomers([])
        setSelectedProject("")
        setCurrentPage(1)
    }

    // Pagination calculations
    const totalPages = Math.ceil(customers.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentCustomers = customers.slice(startIndex, endIndex)

    const goToPage = (page: number) => {
        setCurrentPage(page)
    }

    return (
        <div className="flex h-[90vh] bg-background relative">
            {/* SIDEBAR */}
            <div className="w-64 border-r bg-white">
                <div className="p-6 border-b">
                    <h2 className="font-semibold text-lg">Danh Mục</h2>
                </div>
                <ScrollArea className="h-[calc(100vh-73px)]">
                    <div className="p-3">
                        {Object.entries(CATEGORY_TITLE).map(([key, title]) => {
                            const category = key as ProjectCategory
                            return (
                                <button
                                    key={category}
                                    onClick={() => handleChangeCategory(category)}
                                    disabled={loading}
                                    className={cn(
                                        "w-full text-left px-4 py-3 rounded-md mb-2 font-medium transition",
                                        activeCategory === category
                                            ? "bg-black text-white"
                                            : "hover:bg-gray-100",
                                    )}
                                >
                                    {title}
                                </button>
                            )
                        })}
                    </div>
                </ScrollArea>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 w-full bg-gray-50 overflow-hidden">
                <ScrollArea className="w-full h-full">
                    <div className="max-w-[150vh] h-[90vh] overflow-x-auto p-6 flex items-start gap-6 overflow-y-hidden">
                        {loading && (
                            <div className="text-gray-500">
                                Đang tải dữ liệu...
                            </div>
                        )}

                        {!loading &&
                            data.map((investor) => (
                                <div
                                    key={investor.investor}
                                    className="flex flex-col w-[360px] shrink-0"
                                >
                                    {/* INVESTOR HEADER */}
                                    <div className="mb-4 pb-3 flex justify-between items-center border-b-2 border-black">
                                        <h3 className="text-xl font-bold">
                                            {investor.investor}
                                        </h3>

                                        <div className="flex flex-col items-end gap-1">
                                            <Badge className="bg-black text-white">
                                                {investor.quantity} dự án
                                            </Badge>

                                            <div className="flex gap-1">
                                                <Badge variant="secondary">
                                                    {investor.totalCustomers}{" "}
                                                    <User className="w-3 h-3 ml-1" />
                                                </Badge>
                                                <Badge variant="outline">
                                                    {investor.totalEmails}{" "}
                                                    <Mail className="w-3 h-3 ml-1" />
                                                </Badge>
                                                <Badge variant="outline">
                                                    {investor.totalPhones}{" "}
                                                    <Phone className="w-3 h-3 ml-1" />
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* PROJECT LIST */}
                                    <ScrollArea className="h-full pr-2">
                                        <div className="space-y-2 overflow-y-auto h-[88vh]">
                                            {investor.list.map((project) => (
                                                <div
                                                    onClick={() => handleProjectClick(String(project.project_id))}
                                                    key={project.project_id}
                                                    className="px-4 py-3 bg-white border rounded-md hover:shadow-md transition cursor-pointer"
                                                >
                                                    <div className="font-medium mb-2">
                                                        {project.project_name}
                                                    </div>

                                                    <div className="flex gap-2 flex-wrap">
                                                        <Badge variant="secondary">
                                                            {project.quantity}{" "}
                                                            <User className="w-3 h-3 ml-1" />
                                                        </Badge>

                                                        <Badge variant="outline">
                                                            {project.email_quantity}{" "}
                                                            <Mail className="w-3 h-3 ml-1" />
                                                        </Badge>

                                                        <Badge variant="outline">
                                                            {project.phone_quantity}{" "}
                                                            <Phone className="w-3 h-3 ml-1" />
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </div>
                            ))}
                    </div>
                </ScrollArea>
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b">
                            <h3 className="text-xl font-semibold">Danh sách khách hàng</h3>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-gray-100 rounded-full transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-hidden p-6">
                            {modalLoading ? (
                                <div className="h-full flex items-center justify-center">
                                    <div className="text-gray-500">Đang tải dữ liệu...</div>
                                </div>
                            ) : (
                                <>
                                    {/* Table */}
                                    <ScrollArea className="h-[calc(90vh-200px)]">
                                        <table className="w-full border-collapse">
                                            <thead className="bg-gray-50 sticky top-0 z-10">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 border-b min-w-[200px]">Tên khách hàng</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 border-b w-32">Số điện thoại</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 border-b min-w-[300px]">Địa chỉ</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 border-b w-20">Số căn đã mua</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentCustomers.map((customer, index) => (
                                                    <tr key={customer.customer_id} className="hover:bg-gray-50 transition group">

                                                        <td className="px-4 py-3 text-sm font-medium border-b">
                                                            <div className="truncate max-w-[200px]" title={customer.customer_name}>
                                                                {customer.customer_name}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm border-b">
                                                            <span className="font-mono text-gray-600">
                                                                {customer.phone || "-"}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm border-b">
                                                            <div className="truncate max-w-[300px] text-gray-600" title={customer.address || ""}>
                                                                {customer.address || "-"}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm border-b">
                                                            <Badge variant="secondary" className="bg-gray-100">
                                                                {customer.total_units}
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        {customers.length === 0 && (
                                            <div className="text-center py-12 text-gray-400">
                                                Không có dữ liệu khách hàng
                                            </div>
                                        )}
                                    </ScrollArea>

                                    {/* Pagination */}
                                    {customers.length > 0 && (
                                        <div className="mt-4 flex items-center justify-between border-t pt-4 bg-white">
                                            <div className="text-sm text-gray-500">
                                                Hiển thị <span className="font-medium">{startIndex + 1}</span> -{' '}
                                                <span className="font-medium">{Math.min(endIndex, customers.length)}</span> /{' '}
                                                <span className="font-medium">{customers.length}</span> khách hàng
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => goToPage(currentPage - 1)}
                                                    disabled={currentPage === 1}
                                                    className="p-2 rounded-md border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                                >
                                                    <ChevronLeft className="w-4 h-4" />
                                                </button>

                                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                                    .filter(page => {
                                                        if (totalPages <= 7) return true
                                                        if (page === 1 || page === totalPages) return true
                                                        if (page >= currentPage - 1 && page <= currentPage + 1) return true
                                                        return false
                                                    })
                                                    .map((page, index, array) => {
                                                        if (index > 0 && page - array[index - 1] > 1) {
                                                            return (
                                                                <span key={`ellipsis-${page}`} className="px-3 py-2 text-gray-400">
                                                                    ...
                                                                </span>
                                                            )
                                                        }
                                                        return (
                                                            <button
                                                                key={page}
                                                                onClick={() => goToPage(page)}
                                                                className={cn(
                                                                    "min-w-[36px] h-9 rounded-md text-sm transition font-medium",
                                                                    currentPage === page
                                                                        ? "bg-black text-white"
                                                                        : "hover:bg-gray-100 text-gray-700"
                                                                )}
                                                            >
                                                                {page}
                                                            </button>
                                                        )
                                                    })}

                                                <button
                                                    onClick={() => goToPage(currentPage + 1)}
                                                    disabled={currentPage === totalPages}
                                                    className="p-2 rounded-md border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}