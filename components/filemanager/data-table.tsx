"use client"

import * as React from "react"
import { flexRender, getCoreRowModel, useReactTable, } from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { IconSearch, IconChevronLeft, IconChevronRight, IconX, } from "@tabler/icons-react"
import { useDebounce } from "@/hooks/use-debounce"
import { ImportFileItem } from "@/services/filemanager-data"
import { columns } from "./table"

interface DataTableProps {
  data: ImportFileItem[]
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

export function DataTable({ data, page, pageSize, total, onPageChange, }: DataTableProps) {
  const [search, setSearch] = React.useState("")
  const debouncedSearch = useDebounce(search, 300)
  const filteredData = React.useMemo(() => {
    if (!debouncedSearch) return data
    const q = debouncedSearch.toLowerCase()
    return data.filter((f) =>
      f.file_name.toLowerCase().includes(q)
    )
  }, [data, debouncedSearch])

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  })

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-4">
      <div className="relative w-full max-w-sm">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo tên file..." className="pl-9 pr-9" />
        {search && (
          <Button size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2" onClick={() => setSearch("")}>
            <IconX className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Table */}
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
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-10 text-muted-foreground"
                >
                  Không có file import
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

      {/* Pagination */}
      <div className="flex justify-end items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <IconChevronLeft className="h-4 w-4" />
        </Button>
        <span>
          {page} / {totalPages || 1}
        </span>
        <Button
          size="sm"
          variant="outline"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <IconChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
