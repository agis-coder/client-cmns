// components/device-table.tsx (nếu muốn gộp chung)

"use client"

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { IconSearch, IconChevronLeft, IconChevronRight } from "@tabler/icons-react"
import { useDebounce } from "@/hooks/use-debounce"
import { Device } from "@/interfaces/device"
import { fetchDevices } from "@/services/phone-manager"
import { columns } from "./table" // Import columns từ file riêng
import { Combobox } from "../data-customer/combobox"

export function DeviceTable() {
  const [data, setData] = React.useState<Device[]>([])
  const [search, setSearch] = React.useState("")
  const debounced = useDebounce(search, 300)
  const [searchType, setSearchType] = React.useState<
    "all" | "sdt" | "tenZalo" | "tenThietBi"
  >("all")
  const [page, setPage] = React.useState(1)
  const pageSize = 20

  React.useEffect(() => {
    fetchDevices(debounced, searchType).then(setData)
    setPage(1)
  }, [debounced, searchType])

  const paginated = React.useMemo(
    () =>
      data.slice((page - 1) * pageSize, page * pageSize),
    [data, page]
  )

  const table = useReactTable({
    data: paginated,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => String(row.id),
  })

  const totalPages = Math.ceil(data.length / pageSize)
  const SEARCH_OPTIONS = [
    { label: "Tất cả", value: "all" },
    { label: "Số điện thoại", value: "sdt" },
    { label: "Tên Zalo", value: "tenZalo" },
    { label: "Tên thiết bị", value: "tenThietBi" },
  ]
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="flex gap-2">
            <Input
              placeholder="Nhập để tìm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />

            <Combobox
              value={searchType}
              onChange={(v) =>
                setSearchType(v as "all" | "sdt" | "tenZalo" | "tenThietBi")
              }
              options={SEARCH_OPTIONS.filter(o => o.value !== "all")}
              placeholder="Kiểu tìm"
            />
          </div>

        </div>
      </div>

      <div className="rounded-md border border-gray-200">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="border-b-gray-200 hover:bg-transparent">
                {hg.headers.map((h) => (
                  <TableHead key={h.id} className="h-10 font-medium text-gray-700 bg-gray-50">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="border-b-gray-100 hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-gray-500">
                  Không tìm thấy thiết bị nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Hiển thị {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, data.length)} của {data.length} thiết bị
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="border-gray-300 hover:bg-gray-50 h-8 px-3"
          >
            <IconChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-700 min-w-[80px] text-center">
            Trang {page} / {totalPages || 1}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className="border-gray-300 hover:bg-gray-50 h-8 px-3"
          >
            <IconChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}