"use client"
import * as React from "react"
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { IconSearch, IconX, IconChevronLeft, IconChevronRight, IconLoader2 } from "@tabler/icons-react"
import { useDebounce } from "@/hooks/use-debounce"
import { DataTableProps, ExtendedCustomer } from "@/interfaces/customer"
import { getSourceLabel } from "@/lib/utils"
import { createColumns } from "./table"
import { fetchAllCustomers, fetchProjectsBySource, fetchSubdivisionsBySource } from "@/services/customer-data"
import { Combobox } from "./combobox"
import { ProjectCategory } from "./project-category"
import { useRouter } from "next/navigation"
import { CustomerUpdatePopup } from "./customer-update-popup"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import CreateCustomerPopup from "./add-customer"

const getProjectSources = (projects: any): string[] => {
  if (!Array.isArray(projects)) return []
  return Array.from(new Set(projects.map((p) => p.source_details).filter(Boolean)))
}

type Project = {
  id: string
  project_name: string
}

export function DataTable({ data }: DataTableProps) {

  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [selectedCustomer, setSelectedCustomer] = React.useState<ExtendedCustomer | null>(null)
  const [showUpdatePopup, setShowUpdatePopup] = React.useState(false)

  const [tableData, setTableData] = React.useState<any[]>((data as any).data ?? [])
  const [search, setSearch] = React.useState("")
  const debouncedSearch = useDebounce(search, 3000)
  const [openPopup, setOpenPopup] = React.useState(false)

  const [quickFilter, setQuickFilter] = React.useState<"all" | "birthday_today" | "birthday_tomorrow" | "purchase_most" | "purchase_least" | "country_vn" | "country_nn" | "have_email" | "not_email"
  >("all")

  const birthdayFilter = quickFilter === "birthday_today" ? "today" : quickFilter === "birthday_tomorrow" ? "tomorrow" : undefined
  const purchaseSort = quickFilter === "purchase_most" ? "most" : quickFilter === "purchase_least" ? "least" : undefined
  const countryFilter = quickFilter === "country_vn" ? "vn" : quickFilter === "country_nn" ? "nn" : undefined
  const emailFilter = quickFilter === "have_email" ? "yes" : quickFilter === "not_email" ? "no" : undefined

  const [totalPages, setTotalPages] = React.useState(1)

  // Lấy giá trị BĐS đầu tiên từ ProjectCategory
  const firstProjectCategory = Object.values(ProjectCategory)[0] || "all"
  const [sourceFilter, setSourceFilter] = React.useState<ProjectCategory | "all">(firstProjectCategory)
  const [investorFilter, setInvestorFilter] = React.useState("all")
  const [projectFilter, setProjectFilter] = React.useState<string | "all">("all")

  const [investorOptions, setInvestorOptions] = React.useState<string[]>([])
  const [projectOptions, setProjectOptions] = React.useState<Project[]>([])

  const [currentPage, setCurrentPage] = React.useState(1)
  const [rowSelection, setRowSelection] = React.useState({})

  React.useEffect(() => {
    if (sourceFilter === "all") {
      setInvestorOptions([])
      setInvestorFilter("all")
      return
    }

    fetchProjectsBySource(sourceFilter)
      .then((data) => {
        setInvestorOptions(data)
        setInvestorFilter("all")
      })
  }, [sourceFilter])

  React.useEffect(() => {
    if (investorFilter === "all") {
      setProjectOptions([])
      setProjectFilter("all")
      return
    }

    setProjectFilter("all")

    fetchSubdivisionsBySource(investorFilter).then((projects) => {
      const normalized: Project[] = (projects ?? []).map((p: any) => ({
        id: String(p.id),
        project_name: String(p.project_name),
      }))

      setProjectOptions(normalized)
    })
  }, [investorFilter])

  const fetchData = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchAllCustomers(
        currentPage,
        debouncedSearch || undefined,
        sourceFilter !== "all" ? sourceFilter : undefined,
        projectFilter !== "all" ? projectFilter : undefined,
        countryFilter,
        birthdayFilter,
        purchaseSort,
        emailFilter
      )
      setTableData(res.data ?? [])
      setTotalPages(res.totalPages ?? 1)
    } catch (error) {
      console.error("Error fetching customers:", error)
    } finally {
      setLoading(false)
    }
  }, [currentPage, debouncedSearch, sourceFilter, projectFilter, countryFilter, birthdayFilter, purchaseSort, emailFilter])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const paginatedData = React.useMemo(() =>
    tableData.map((c: any) => ({
      ...c,
      relatives: c.relatives ?? [],
      projects: c.projects ?? [],
      projectSources: getProjectSources(c.projects),
    })), [tableData]
  )

  const handleEdit = (customer: ExtendedCustomer) => {
    setSelectedCustomer(customer)
    setShowUpdatePopup(true)
  }

  const handleUpdateSuccess = () => {
    fetchData()
  }

  const handleCustomerCreated = (newCustomer: any) => {
    const enhancedCustomer = {
      ...newCustomer,
      relatives: newCustomer.relatives ?? [],
      projects: newCustomer.projects ?? [],
      projectSources: getProjectSources(newCustomer.projects),
    }
    setTableData(prev => [enhancedCustomer, ...prev])
  }

  const columns = React.useMemo(
    () => createColumns(handleEdit),
    [handleEdit]
  )

  const table = useReactTable({
    data: paginatedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
    getRowId: (row: any) => String(row.id)
  })

  const selectedEmails = React.useMemo(() =>
    Array.from(new Set(table.getSelectedRowModel().rows.map((r) => r.original.email).filter((e) => e && e !== "Chưa có"))
    ), [table.getSelectedRowModel().rows]
  )

  const exportToExcel = () => {
    const exportData = paginatedData.map((c) => ({
      "Họ và tên": c.customer_name || "",
      "Email": c.email || "",
      "Số điện thoại": (c.phone_number || "").replace(/\|/g, "-"),
      "Quốc tịch": c.nationality === "vn" ? "Việt Nam" : c.nationality === "nn" ? "Nước ngoài" : "",
      "Địa chỉ": c.address || "",
      "Số căn đã mua": c.project_count || 0,
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers")
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    })
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })
    saveAs(blob, `customers_${Date.now()}.xlsx`)
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Danh sách khách hàng</h2>
          <Button
            onClick={() => setOpenPopup(true)}
            className="bg-gray-900 text-white hover:bg-gray-800"
          >
            + Thêm khách hàng
          </Button>
        </div>

        <CreateCustomerPopup
          open={openPopup}
          onOpenChange={setOpenPopup}
          onSuccess={handleCustomerCreated}
        />

        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên, SĐT, email..."
              className="pl-9 pr-9 w-full sm:w-full h-12 border border-gray-200 dark:border-gray-800 outline-none focus:outline-none focus:ring-0 focus:border-gray-400 dark:focus:border-gray-600"
            />
            {search && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2"
                onClick={() => setSearch("")}
              >
                <IconX className="h-4 w-4" />
              </Button>
            )}
          </div>

          <Combobox
            value={quickFilter}
            onChange={(v) => setQuickFilter(v as any)}
            title="Bộ lọc tổng hợp"
            options={[
              { value: "all", label: "Tất cả khách hàng" },
              { value: "birthday_today", label: "Sinh nhật hôm nay" },
              { value: "birthday_tomorrow", label: "Sinh nhật ngày mai" },
              { value: "purchase_most", label: "Khách hàng mua nhiều nhất" },
              { value: "purchase_least", label: "Khách hàng mua ít nhất" },
              { value: "country_vn", label: "Khách người Việt Nam" },
              { value: "country_nn", label: "Khách người Nước ngoài" },
              { value: "have_email", label: "Khách hàng có Email" },
              { value: "not_email", label: "Khách hàng không có Email" },
            ]}
          />

          <Combobox
            value={sourceFilter}
            onChange={(v) => setSourceFilter(v as "all" | ProjectCategory)}
            title="Danh mục"
            options={[
              { value: "all", label: "Tất cả danh mục" },
              ...Object.values(ProjectCategory).map((c) => ({
                value: c,
                label: getSourceLabel(c),
              }))
            ]}
          />

          <Combobox
            value={investorFilter}
            onChange={setInvestorFilter}
            title="Chủ đầu tư"
            disabled={sourceFilter === "all"}
            options={[
              { value: "all", label: "Tất cả chủ đầu tư" },
              ...(investorOptions.map((i) => ({
                value: i,
                label: i,
              })) ?? [])
            ]}
          />

          <Combobox
            value={projectFilter}
            onChange={(v: string) => setProjectFilter(v)}
            title="Dự án"
            disabled={investorFilter === "all" || projectOptions.length === 0}
            options={[
              { value: "all", label: "Tất cả dự án" },
              ...(projectOptions.map((p) => ({
                value: String(p.id),
                label: p.project_name,
              })))
            ]}
          />

          {selectedEmails.length > 0 && (
            <Button
              variant={'ghost'}
              className="pl-9 pr-9 h-12 border border-gray-200 dark:border-gray-800 outline-none focus:outline-none focus:ring-0 focus:border-gray-400 dark:focus:border-gray-600"
              onClick={() => {
                sessionStorage.setItem("mail_recipients", JSON.stringify(selectedEmails))
                router.push("/sendmail")
              }}
            >
              Gửi mail ({selectedEmails.length})
            </Button>
          )}
          <Button
            variant={'ghost'}
            className="pl-9 pr-9 h-12 border border-gray-200 dark:border-gray-800 outline-none focus:outline-none focus:ring-0 focus:border-gray-400 dark:focus:border-gray-600"
            onClick={exportToExcel}
          >
            Xuất Excel
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((h) => (
                    <TableHead key={h.id}>
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-10">
                    <div className="flex justify-center items-center gap-2">
                      <IconLoader2 className="animate-spin h-4 w-4" />
                      Đang tải dữ liệu...
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-10 text-muted-foreground">
                    Không tìm thấy khách hàng
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            <IconChevronLeft />
          </Button>

          <span>
            {currentPage} / {totalPages || 1}
          </span>

          <Button
            size="sm"
            variant="outline"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            <IconChevronRight />
          </Button>
        </div>
      </div>

      <CustomerUpdatePopup
        open={showUpdatePopup}
        onOpenChange={setShowUpdatePopup}
        customer={selectedCustomer}
        onSuccess={handleUpdateSuccess}
      />
    </>
  )
}