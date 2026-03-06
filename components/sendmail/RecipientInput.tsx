"use client"

import { useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import * as XLSX from "xlsx"
import { parseEmails } from "@/lib/utils"

interface Props {
    value: string
    onChange: (emails: string[]) => void
}

export function ToInput({ value, onChange }: Props) {
    const fileRef = useRef<HTMLInputElement>(null)

    const handleTextChange = (v: string) => {
        onChange(parseEmails(v))
    }

    const handleImportExcel = async (file: File) => {
        const buffer = await file.arrayBuffer()
        const workbook = XLSX.read(buffer)
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const rows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 })

        const raw = rows.flat().join(" ")
        onChange(parseEmails(raw))
    }

    return (
        <div className="space-y-1">
            <label className="text-sm font-medium">To</label>

            <div className="flex gap-2">
                <Input
                    placeholder="Nhập danh sách email (dán nguyên cục cũng được)"
                    value={value}
                    onChange={(e) => handleTextChange(e.target.value)}
                />

                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => fileRef.current?.click()}
                >
                    <Upload size={16} />
                </Button>

                <input
                    ref={fileRef}
                    type="file"
                    accept=".xlsx,.xls"
                    hidden
                    onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImportExcel(file)
                    }}
                />
            </div>
        </div>
    )
}
