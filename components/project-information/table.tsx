"use client"

import React, { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import {
    ProjectCategory,
    CATEGORY_TITLE,
    InvestorData,
} from "@/interfaces/project-category"
import { getProjectsByCategory } from "@/services/project-data"
import { User, Mail, Phone, X, ChevronLeft, ChevronRight, Search, Loader2 } from "lucide-react"
import { getListCustomerByProject } from "@/services/customer-data"
import { Input } from "@/components/ui/input"
import { Button } from "../ui/button"
import { useRouter } from "next/navigation"

interface ProjectBrowserProps {
    initialCategory: ProjectCategory
    initialData: InvestorData[]
}

interface CustomerData {
    customer_id: string
    customer_name: string
    phone: string
    email: string
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

    const router = useRouter()
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalLoading, setModalLoading] = useState(false)
    const [customers, setCustomers] = useState<CustomerData[]>([])
    const [selectedProject, setSelectedProject] = useState<string>("")

    // Search state
    const [searchTerm, setSearchTerm] = useState("")

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
        setSearchTerm("") // Reset search when opening new project

        try {
            const result = await getListCustomerByProject(project_id)
            if (result) {
                // Map the data to match CustomerData interface
                const mappedCustomers: CustomerData[] = result.map((customer: any) => ({
                    customer_id: customer.customer_id,
                    customer_name: customer.customer_name,
                    email: customer.email,
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
        setSearchTerm("")
    }

    // Filter customers based on search term
    const filteredCustomers = useMemo(() => {
        if (!searchTerm.trim()) return customers

        const searchLower = searchTerm.toLowerCase().trim()
        return customers.filter(customer => {
            // Kiểm tra tên khách hàng (ưu tiên)
            const nameMatch = customer.customer_name.toLowerCase().includes(searchLower)

            // Kiểm tra địa chỉ nếu có
            const addressMatch = customer.address &&
                customer.address.toLowerCase().includes(searchLower)

            return nameMatch || addressMatch
        })
    }, [customers, searchTerm])

    // Pagination calculations
    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentCustomers = filteredCustomers.slice(startIndex, endIndex)

    const goToPage = (page: number) => {
        setCurrentPage(page)
    }

    const [selectedEmails, setSelectedEmails] = useState<string[]>([])

    const toggleSelectEmail = (email: string) => {
        setSelectedEmails((prev) =>
            prev.includes(email)
                ? prev.filter((e) => e !== email)
                : [...prev, email]
        )
    }

    const toggleSelectAll = () => {
        const emails = currentCustomers
            .filter((c) => c.email)
            .map((c) => c.email)

        const allSelected = emails.every((email) => selectedEmails.includes(email))

        if (allSelected) {
            setSelectedEmails((prev) => prev.filter((email) => !emails.includes(email)))
        } else {
            setSelectedEmails((prev) => [...new Set([...prev, ...emails])])
        }
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

                        {/* Search và Actions */}
                        <div className="px-6 py-4 border-b space-y-3">
                            {/* Search Bar */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    type="text"
                                    placeholder="Tìm kiếm theo tên khách hàng hoặc địa chỉ..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value)
                                        setCurrentPage(1)
                                    }}
                                    className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/20"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between">
                                {selectedEmails.length > 0 && (
                                    <Button
                                        onClick={() => {
                                            sessionStorage.setItem("mail_recipients", JSON.stringify(selectedEmails))
                                            router.push("/sendmail")
                                        }}
                                        className="bg-black text-white hover:bg-gray-800 px-4 py-2 rounded-md text-sm font-medium transition"
                                    >
                                        Gửi mail ({selectedEmails.length})
                                    </Button>
                                )}

                                {searchTerm && (
                                    <div className="text-sm text-gray-500 ml-auto">
                                        Tìm thấy <span className="font-medium text-black">{filteredCustomers.length}</span> kết quả cho "{searchTerm}"
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-hidden p-6 pt-0">
                            {modalLoading ? (
                                <div className="h-full flex items-center justify-center">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Đang tải dữ liệu...</span>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Table */}
                                    <ScrollArea className="h-[calc(90vh-320px)] border rounded-lg">
                                        <table className="w-full border-collapse table-fixed">
                                            <thead className="bg-gray-50 sticky top-0 z-10">
                                                <tr>
                                                    <th className="px-4 py-3 border-b text-center w-12">
                                                        <input
                                                            type="checkbox"
                                                            onChange={toggleSelectAll}
                                                            checked={
                                                                currentCustomers
                                                                    .filter((c) => c.email)
                                                                    .every((c) => selectedEmails.includes(c.email)) &&
                                                                currentCustomers.filter((c) => c.email).length > 0
                                                            }
                                                            className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                                                        />
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 border-b w-1/4">Tên khách hàng</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 border-b w-36">Số điện thoại</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 border-b w-56">Email</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 border-b w-2/5">Địa chỉ</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 border-b w-24">Số căn đã mua</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentCustomers.map((customer) => (
                                                    <tr key={customer.customer_id} className="hover:bg-gray-50 transition group">
                                                        <td className="px-4 py-3 border-b text-center w-12">
                                                            {customer.email ? (
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedEmails.includes(customer.email)}
                                                                    onChange={() => toggleSelectEmail(customer.email)}
                                                                    className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                                                                />
                                                            ) : (
                                                                <span className="text-gray-300 text-xs">-</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm font-medium border-b">
                                                            <div className="break-words pr-2" title={customer.customer_name}>
                                                                {customer.customer_name}
                                                                {searchTerm && customer.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) && (
                                                                    <span className="ml-2 text-xs text-blue-600 font-normal whitespace-nowrap bg-blue-50 px-1.5 py-0.5 rounded">tên</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm border-b">
                                                            <div className="font-mono text-gray-600 break-words" title={customer.phone}>
                                                                {customer.phone || "-"}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm border-b">
                                                            <div className="font-mono text-gray-600 break-words pr-2" title={customer.email}>
                                                                {customer.email || "-"}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm border-b">
                                                            <div className="break-words pr-2 text-gray-600" title={customer.address || ""}>
                                                                {customer.address || "-"}
                                                                {searchTerm && customer.address?.toLowerCase().includes(searchTerm.toLowerCase()) && (
                                                                    <span className="ml-2 text-xs text-blue-600 font-normal whitespace-nowrap bg-blue-50 px-1.5 py-0.5 rounded">địa chỉ</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm border-b">
                                                            <Badge variant="secondary" className="bg-gray-100 w-16 text-center block mx-auto">
                                                                {customer.total_units}
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        {filteredCustomers.length === 0 && (
                                            <div className="text-center py-16 text-gray-400">
                                                <div className="text-5xl mb-3">😕</div>
                                                <div className="text-sm">
                                                    {searchTerm ? "Không tìm thấy khách hàng phù hợp" : "Không có dữ liệu khách hàng"}
                                                </div>
                                            </div>
                                        )}
                                    </ScrollArea>

                                    {/* Pagination */}
                                    {filteredCustomers.length > 0 && (
                                        <div className="mt-4 flex items-center justify-between border-t pt-4 bg-white">
                                            <div className="text-sm text-gray-500">
                                                Hiển thị <span className="font-medium text-black">{startIndex + 1}</span> -{' '}
                                                <span className="font-medium text-black">{Math.min(endIndex, filteredCustomers.length)}</span> /{' '}
                                                <span className="font-medium text-black">{filteredCustomers.length}</span> khách hàng
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
                                                                        ? "bg-black text-white hover:bg-gray-800"
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