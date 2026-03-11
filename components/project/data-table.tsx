// components/project/data-table.tsx
"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { IconSearch, IconX } from "@tabler/icons-react"
import { useDebounce } from "@/hooks/use-debounce"
import { DataTableProps, ProjectType } from "@/interfaces/project"
import { columns as defaultColumns } from "./table"
import { ProjectCategory } from "../data-customer/project-category"
import { Combobox } from "../data-customer/combobox"

export function DataTable({
  data,
  page,
  pageSize,
  total,
  onPageChange,
  onEdit,
  columns = defaultColumns
}: DataTableProps & { columns?: ColumnDef<ProjectType>[] }) {
  const [search, setSearch] = React.useState("")
  const [category, setCategory] = React.useState<string>("all")
  const debouncedSearch = useDebounce(search, 300)

  // Tạo options cho combobox từ ProjectCategory
  const categoryOptions = React.useMemo(() => [
    { value: "all", label: "Tất cả danh mục" },
    ...Object.values(ProjectCategory).map((cat) => ({
      value: cat,
      label: cat
    }))
  ], [])

  const filteredData = React.useMemo(() => {
    if (!data) return []
    let filtered = [...data]
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.project_name.toLowerCase().includes(q) ||
          (p.investor?.toLowerCase().includes(q) ?? false)
      )
    }
    if (category && category !== "all") {
      filtered = filtered.filter(p => p.project_category === category)
    }
    return filtered
  }, [data, debouncedSearch, category])

  const table = useReactTable({
    data: filteredData,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
    meta: {
      onEdit: onEdit
    }
  })

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm dự án hoặc chủ đầu tư..."
            className="pl-9 pr-9 w-full sm:w-full h-12 border border-gray-200 dark:border-gray-800 outline-none focus:outline-none focus:ring-0 focus:border-gray-400 dark:focus:border-gray-600"
          />
          {search && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => setSearch("")}
            >
              <IconX className="h-3 w-3" />
            </Button>
          )}
        </div>

        <Combobox
          value={category}
          onChange={(v) => setCategory(v)}
          title="Danh mục dữ liệu"
          options={categoryOptions}
        />
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
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-10 text-muted-foreground">
                  Không tìm thấy dự án
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
    </div>
  )
}