"use client"
import * as React from "react"
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { IconSearch, IconX, IconChevronLeft, IconChevronRight, IconLoader2 } from "@tabler/icons-react"
import { useDebounce } from "@/hooks/use-debounce"
import { DataTableProps } from "@/interfaces/customer"
import { getSourceLabel } from "@/lib/utils"
import { columns } from "./table"
import { fetchAllCustomers, fetchProjectsBySource, fetchSubdivisionsBySource } from "@/services/customer-data"
import { Combobox } from "./combobox"
import { ProjectCategory } from "./project-category"
import { useRouter } from "next/navigation"

const getProjectSources = (projects: any): string[] => {
  if (!Array.isArray(projects)) return []
  return Array.from(new Set(projects.map((p) => p.source_details).filter(Boolean)))
}

export function DataTable({ data }: DataTableProps) {

  const router = useRouter()
  const [loading, setLoading] = React.useState(false)

  const [tableData, setTableData] = React.useState<any[]>((data as any).data ?? [])
  const [search, setSearch] = React.useState("")
  const debouncedSearch = useDebounce(search, 300)

  const [quickFilter, setQuickFilter] = React.useState<"all" | "birthday_today" | "birthday_tomorrow" | "purchase_most" | "purchase_least" | "country_vn" | "country_nn"
  >("all")

  const birthdayFilter = quickFilter === "birthday_today" ? "today" : quickFilter === "birthday_tomorrow" ? "tomorrow" : undefined
  const purchaseSort = quickFilter === "purchase_most" ? "most" : quickFilter === "purchase_least" ? "least" : undefined
  const countryFilter = quickFilter === "country_vn" ? "vn" : quickFilter === "country_nn" ? "nn" : undefined

  const [totalPages, setTotalPages] = React.useState(1)
  const pageSize = 100

  const [sourceFilter, setSourceFilter] = React.useState("all")
  const [investorFilter, setInvestorFilter] = React.useState("all")
  const [projectFilter, setProjectFilter] = React.useState("all")

  const [investorOptions, setInvestorOptions] = React.useState<string[]>([])
  const [projectOptions, setProjectOptions] = React.useState<string[]>([])

  const [currentPage, setCurrentPage] = React.useState(1)
  const [rowSelection, setRowSelection] = React.useState({})

  React.useEffect(() => {
    fetchProjectsBySource(sourceFilter === "all" ? undefined : sourceFilter)
      .then((data) => {
        setInvestorOptions(data)
      })
  }, [sourceFilter])


  React.useEffect(() => {
    const investor = investorFilter === "all" ? undefined : investorFilter
    fetchSubdivisionsBySource(investor).then((projects) => {
      setProjectOptions(projects ?? [])
      setProjectFilter("all")
    })
  }, [investorFilter])


  React.useEffect(() => {
    setLoading(true)
    fetchAllCustomers(currentPage, debouncedSearch || undefined, undefined, sourceFilter !== "all" ? sourceFilter : undefined, projectFilter !== "all" ? projectFilter : undefined, countryFilter, birthdayFilter, purchaseSort).then((res) => {
      setTableData(res.data ?? [])
      setTotalPages(res.totalPages ?? 1)
    }).finally(() => {
      setLoading(false)
    })

  }, [currentPage, debouncedSearch, sourceFilter, projectFilter, quickFilter])

  const paginatedData = React.useMemo(() =>
    tableData.map((c: any) => ({
      ...c,
      relatives: c.relatives ?? [],
      projects: c.projects ?? [],
      projectSources: getProjectSources(c.projects),
    })), [tableData]
  )

  const table = useReactTable({ data: paginatedData, columns, getCoreRowModel: getCoreRowModel(), enableRowSelection: true, onRowSelectionChange: setRowSelection, state: { rowSelection }, getRowId: (row: any) => String(row.id) })

  const selectedEmails = React.useMemo(() =>
    Array.from(new Set(table.getSelectedRowModel().rows.map((r) => r.original.email).filter((e) => e && e !== "Chưa có"))
    ), [table.getSelectedRowModel().rows]
  )

  return (
    <div className="space-y-4">

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
            { value: "birthday_today", label: "Sinh nhật hôm nay" },
            { value: "birthday_tomorrow", label: "Sinh nhật ngày mai" },
            { value: "purchase_most", label: "Khách hàng mua nhiều nhất" },
            { value: "purchase_least", label: "Khách hàng mua ít nhất" },
            { value: "country_vn", label: "Khách người Việt Nam" },
            { value: "country_nn", label: "Khách người Nước ngoài" },
          ]}
        />

        <Combobox
          value={sourceFilter}
          onChange={setSourceFilter}
          title="Danh mục"
          options={Object.values(ProjectCategory).map((c) => ({
            value: c,
            label: getSourceLabel(c),
          }))}
        />

        <Combobox
          value={investorFilter}
          onChange={setInvestorFilter}
          title="Chủ đầu tư"
          disabled={sourceFilter === "all"}
          options={investorOptions.map((i) => ({
            value: i,
            label: i,
          })) ?? []}
        />

        <Combobox
          value={projectFilter}
          onChange={setProjectFilter}
          title="Dự án"
          disabled={investorFilter === "all" || !Array.isArray(projectOptions) || projectOptions.length === 0}
          options={(Array.isArray(projectOptions) ? projectOptions : []).map((p) => ({
            value: p,
            label: p,
          }))}
        />

        {selectedEmails.length > 0 && (
          <Button
            onClick={() => {
              sessionStorage.setItem("mail_recipients", JSON.stringify(selectedEmails))
              router.push("/sendmail")
            }}
          >
            Gửi mail ({selectedEmails.length})
          </Button>
        )}

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
  )
}