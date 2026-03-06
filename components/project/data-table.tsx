"use client"

import * as React from "react"
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { IconSearch, IconX, IconChevronLeft, IconChevronRight } from "@tabler/icons-react"
import { useDebounce } from "@/hooks/use-debounce"
import { DataTableProps } from "@/interfaces/project"
import { columns } from "./table"

export function DataTable({ data }: DataTableProps) {
  const [search, setSearch] = React.useState("")
  const [currentPage, setCurrentPage] = React.useState(1)
  const pageSize = 20
  const debouncedSearch = useDebounce(search, 300)

  const filteredData = React.useMemo(() => {
    if (!data) return []
    const q = debouncedSearch.toLowerCase()
    if (!q) return data
    return data.filter(
      (p) =>
        p.project_name.toLowerCase().includes(q) ||
        (p.investor?.toLowerCase().includes(q) ?? false)
    )
  }, [data, debouncedSearch])

  const totalPages = Math.ceil(filteredData.length / pageSize)
  const paginatedData = React.useMemo(
    () => filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredData, currentPage]
  )

  const table = useReactTable({
    data: paginatedData,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  })

  React.useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch])

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-2 mb-2">
        <div className="relative flex-1">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm dự án hoặc chủ đầu tư..."
            className="pl-9 pr-9"
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
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</TableHead>
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
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={currentPage <= 1}
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
        >
          <IconChevronLeft className="h-4 w-4" />
        </Button>
        <span>
          {currentPage} / {totalPages || 1}
        </span>
        <Button
          size="sm"
          variant="outline"
          disabled={currentPage >= totalPages}
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
        >
          <IconChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
