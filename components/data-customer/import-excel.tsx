"use client"

import * as React from "react"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog"
import { IconUpload, IconFileSpreadsheet, IconCheck, IconX, IconAlertCircle, IconDownload, IconTrash, IconEye, IconRefresh } from "@tabler/icons-react"
import { importCustomersExcel } from "@/services/customer-data"
import { ImportResult } from "@/interfaces/customer"

type ImportType = "new-sale" | "transfer"
interface PreviewData {
    headers: string[]
    rows: any[]
    sampleCount: number
}

export function ExcelImport() {
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [importType, setImportType] = useState<ImportType | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [progress, setProgress] = useState(0)

    const [importResult, setImportResult] = useState<ImportResult | null>(null)
    const [previewData, setPreviewData] = useState<PreviewData | null>(null)

    const [showPreview, setShowPreview] = useState(false)
    const [showResult, setShowResult] = useState(false)

    const isValidFileType = (file: File): boolean => {
        const validExtensions = [".xlsx", ".xls", ".csv"]
        return validExtensions.some((ext) =>
            file.name.toLowerCase().endsWith(ext)
        )
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const droppedFile = e.dataTransfer.files[0]
        if (droppedFile && isValidFileType(droppedFile)) {
            setFile(droppedFile)
            previewExcel(droppedFile)
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile && isValidFileType(selectedFile)) {
            setFile(selectedFile)
            previewExcel(selectedFile)
        }
    }

    const previewExcel = async (file: File) => {
        setIsLoading(true)
        try {
            const buffer = await file.arrayBuffer()
            const workbook = XLSX.read(buffer, { type: "array" })

            const sheetName = workbook.SheetNames[0]
            const sheet = workbook.Sheets[sheetName]

            const rows = XLSX.utils.sheet_to_json<any[]>(sheet, {
                header: 1,
                defval: "",
            })

            const headers = (rows[0] || []).map((h) => String(h))
            const dataRows = rows.slice(1, 21)

            const formatted = dataRows.map((row) => {
                const obj: any = {}
                headers.forEach((h, i) => {
                    obj[h] = row[i] ?? ""
                })
                return obj
            })

            setPreviewData({
                headers,
                rows: formatted,
                sampleCount: formatted.length,
            })

            setShowPreview(true)
        } catch (error) {
            console.error("Preview error:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleImport = async () => {
        if (!file || !importType) return
        setIsLoading(true)
        setProgress(10)
        setShowPreview(false)
        let timer: NodeJS.Timeout | null = null
        try {
            timer = setInterval(() => {
                setProgress((p) => (p < 90 ? p + 10 : p))
            }, 300)
            const result = await importCustomersExcel(file, importType)
            setProgress(100)
            setImportResult(result)
            setShowResult(true)
        } catch (error) {
            console.error("Import failed:", error)
            setImportResult({
                total: 0,
                success: 0,
                failed: 0,
                errors: [
                    {
                        row: 0,
                        message: "Import failed",
                    },
                ],
            })
            setShowResult(true)
        } finally {
            if (timer) clearInterval(timer)
            setIsLoading(false)
            setProgress(0)
        }
    }

    const handleReset = () => {
        setFile(null)
        setPreviewData(null)
        setImportResult(null)
        setProgress(0)
        setShowPreview(false)
        setShowResult(false)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const downloadTemplate = () => {
        const link = document.createElement("a")
        link.href = "/templates/customer-import-template.xlsx"
        link.download = "customer-import-template.xlsx"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const triggerFileInput = () => {
        fileInputRef.current?.click()
    }

    const [selectedFormat, setSelectedFormat] = useState<'excel' | 'csv'>('excel');


    return (
        <div className="space-y-6">
            <Card className={`border-2 ${isDragging ? "border-primary border-dashed" : "border-dashed"}`}  >
                <CardContent className="pt-6">
                    <div
                        className={`flex flex-col items-center justify-center p-8 text-center rounded-lg border-2 ${isDragging ? "border-primary bg-primary/5" : "border-border"} transition-colors`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        {file ? (
                            <div className="space-y-4 w-full max-w-md">
                                <div className="flex items-center justify-center gap-3 p-4 bg-muted rounded-lg">
                                    <IconFileSpreadsheet className="h-10 w-10 text-primary" />
                                    <div className="text-left flex-1">
                                        <p className="font-medium truncate">  {file.name} </p>
                                        <p className="text-sm text-muted-foreground"> {(file.size / 1024 / 1024).toFixed(2)}{" "}MB</p>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={handleReset} className="ml-auto shrink-0">
                                        <IconTrash className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowPreview(true)}
                                        className="flex-1 gap-2"
                                        disabled={isLoading}
                                    >
                                        <IconEye className="h-4 w-4" />
                                        Xem trước
                                    </Button>
                                    <Button
                                        onClick={handleImport}
                                        className="flex-1 gap-2"
                                        disabled={isLoading || !importType}
                                    >
                                        {isLoading ? (
                                            <>
                                                <IconRefresh className="h-4 w-4 animate-spin" />
                                                Đang xử lý...
                                            </>
                                        ) : (
                                            <>
                                                <IconUpload className="h-4 w-4" />
                                                Import dữ liệu
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="rounded-full bg-linear-to-br from-primary/10 to-primary/5 p-6 mb-6 ring-4 ring-primary/5">
                                    <IconUpload className="h-14 w-14 text-primary" />
                                </div>
                                <div className="space-y-6 max-w-lg">
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-xl">
                                            Kéo thả file Excel/CSV vào đây
                                        </h3>
                                        <p className="text-muted-foreground">
                                            Hoặc nhấn nút bên dưới để chọn file từ máy tính
                                        </p>
                                    </div>
                                    <div className="w-full space-y-3">
                                        <div className="text-sm font-medium text-muted-foreground">
                                            Chọn loại import:
                                        </div>
                                        <div className=" grid grid-cols-2 gap-3">
                                            <div
                                                className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${importType === "new-sale" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                                                onClick={() => setImportType("new-sale")}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`flex h-10 w-10 items-center justify-center rounded-full ${importType === "new-sale" ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground"}`}
                                                    >
                                                        🏠
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-semibold">MUA BÁN</div>

                                                    </div>
                                                    {importType === "new-sale" && (
                                                        <IconCheck className="h-5 w-5 text-primary" />
                                                    )}
                                                </div>
                                            </div>
                                            <div
                                                className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${importType === "transfer"
                                                    ? "border-amber-500 bg-amber-50"
                                                    : "border-border hover:border-amber-500/50"
                                                    }`}
                                                onClick={() => setImportType("transfer")}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`flex h-10 w-10 items-center justify-center rounded-full ${importType === "transfer"
                                                            ? "bg-amber-100 text-amber-600"
                                                            : "bg-muted/50 text-muted-foreground"
                                                            }`}
                                                    >
                                                        🔁
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-semibold">CHUYỂN NHƯỢNG</div>

                                                    </div>
                                                    {importType === "transfer" && (
                                                        <IconCheck className="h-5 w-5 text-amber-600" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="text-sm font-medium text-muted-foreground"> Chọn định dạng file:</div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div
                                                className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedFormat === "excel"
                                                    ? "border-primary bg-primary/5"
                                                    : "border-border hover:border-primary/50"
                                                    }`}
                                                onClick={() => setSelectedFormat("excel")}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`flex h-10 w-10 items-center justify-center rounded-full ${selectedFormat === "excel"
                                                            ? "bg-primary/10 text-primary"
                                                            : "bg-muted/50 text-muted-foreground"
                                                            }`}
                                                    >
                                                        <IconFileSpreadsheet className="h-5 w-5" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-semibold">Excel File</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            .xlsx, .xls
                                                        </div>
                                                    </div>
                                                    {selectedFormat === "excel" && (
                                                        <IconCheck className="h-5 w-5 text-primary" />
                                                    )}
                                                </div>
                                            </div>
                                            <div
                                                className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedFormat === "csv"
                                                    ? "border-blue-500 bg-blue-50"
                                                    : "border-border hover:border-blue-500/50"
                                                    }`}
                                                onClick={() => setSelectedFormat("csv")}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`flex h-10 w-10 items-center justify-center rounded-full ${selectedFormat === "csv"
                                                            ? "bg-blue-100 text-blue-600"
                                                            : "bg-muted/50 text-muted-foreground"
                                                            }`}
                                                    >
                                                        <IconFileSpreadsheet className="h-5 w-5" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-semibold">CSV File</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            .csv
                                                        </div>
                                                    </div>
                                                    {selectedFormat === "csv" && (
                                                        <IconCheck className="h-5 w-5 text-blue-600" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <Button
                                            onClick={triggerFileInput}
                                            variant="default"
                                            disabled={!importType}
                                            className="flex-1 gap-2 h-11 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                                        >
                                            <IconUpload className="h-4 w-4" />
                                            Chọn file từ máy tính
                                        </Button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            className="hidden"
                                            accept={
                                                selectedFormat === "excel"
                                                    ? ".xlsx,.xls"
                                                    : ".csv"
                                            }
                                            onChange={handleFileSelect}
                                        />
                                        <Button
                                            variant="outline"
                                            onClick={downloadTemplate}
                                            className="flex-1 gap-2 h-11 border-2"
                                        >
                                            <IconDownload className="h-4 w-4" />
                                            Tải template
                                        </Button>
                                    </div>
                                </div>
                            </>

                        )}
                    </div>
                </CardContent>
            </Card>

            {isLoading && progress > 0 && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="flex items-center gap-2">
                                    <IconRefresh className="h-3 w-3 animate-spin" />
                                    Đang import dữ liệu...
                                </span>
                                <span>{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            <p className="text-xs text-muted-foreground">
                                Vui lòng không đóng trình duyệt trong quá trình
                                import
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Dialog open={showPreview} onOpenChange={setShowPreview}>
                <DialogContent className="max-w-6xl sm:max-w-1/2 max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <IconEye className="h-5 w-5" />
                            Xem trước dữ liệu
                            {importType && (
                                <Badge className="ml-2">
                                    {importType === "new-sale"
                                        ? "BÁN"
                                        : "CHUYỂN NHƯỢNG"}
                                </Badge>
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            Kiểm tra dữ liệu trước khi import. Hiển thị{" "}
                            {previewData?.sampleCount} dòng đầu tiên.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-auto">
                        {previewData && (
                            <div className="rounded-md border">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted">
                                            <tr>
                                                {previewData.headers.map(
                                                    (header, index) => (
                                                        <th
                                                            key={index}
                                                            className="border-r px-4 py-3 text-left font-medium last:border-r-0 whitespace-nowrap"
                                                        >
                                                            {header}
                                                        </th>
                                                    )
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {previewData.rows.map(
                                                (row, rowIndex) => (
                                                    <tr
                                                        key={rowIndex}
                                                        className="border-t hover:bg-muted/50 transition-colors"
                                                    >
                                                        {previewData.headers.map(
                                                            (
                                                                header,
                                                                colIndex
                                                            ) => (
                                                                <td
                                                                    key={
                                                                        colIndex
                                                                    }
                                                                    className="border-r px-4 py-2 last:border-r-0 whitespace-nowrap"
                                                                >
                                                                    {row[
                                                                        header
                                                                    ] || "—"}
                                                                </td>
                                                            )
                                                        )}
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setShowPreview(false)}
                        >
                            Đóng
                        </Button>
                        <Button
                            onClick={handleImport}
                            disabled={isLoading || !importType}
                        >
                            <IconUpload className="h-4 w-4 mr-2" />
                            Import dữ liệu
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showResult} onOpenChange={setShowResult}>
                <DialogContent className="max-w-md sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {importResult?.failed === 0 ? (
                                <IconCheck className="h-5 w-5 text-green-500" />
                            ) : (
                                <IconAlertCircle className="h-5 w-5 text-amber-500" />
                            )}
                            Kết quả import
                        </DialogTitle>
                        <DialogDescription>
                            Quá trình import đã hoàn thành
                        </DialogDescription>
                    </DialogHeader>

                    {importResult && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-primary/10 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-primary">
                                        {importResult.success}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Thành công
                                    </div>
                                </div>
                                <div className="bg-destructive/10 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-destructive">
                                        {importResult.failed}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Thất bại
                                    </div>
                                </div>
                                <div className="bg-muted rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold">
                                        {importResult.total}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Tổng số
                                    </div>
                                </div>
                            </div>

                            {importResult && importResult.errors && importResult.errors.length > 0 && (
                                <div>
                                    <h4 className="font-medium mb-2 flex items-center gap-2">
                                        <IconAlertCircle className="h-4 w-4 text-destructive" />
                                        Lỗi cần khắc phục (
                                        {importResult.errors.length})
                                    </h4>
                                    <div className="rounded-md border border-destructive/20 bg-destructive/5 max-h-60 overflow-auto">
                                        {importResult.errors.map(
                                            (error, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-start justify-between p-3 border-b last:border-b-0"
                                                >
                                                    <div className="flex-1">
                                                        <div className="font-medium">
                                                            Dòng {error.row}:
                                                        </div>
                                                        <div className="text-sm text-muted-foreground mt-1">
                                                            {error.message}
                                                        </div>
                                                    </div>
                                                    <Badge
                                                        variant="outline"
                                                        className="text-destructive shrink-0 ml-2"
                                                    >
                                                        Lỗi
                                                    </Badge>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                            {importResult && !importResult.errors && (
                                <Alert className="bg-primary/5 border-primary/20">
                                    <IconCheck className="h-4 w-4 text-primary" />
                                    <AlertDescription>
                                        Đã import thành công{" "}
                                        <strong>
                                            {importResult.success}
                                        </strong>{" "}
                                        khách hàng vào hệ thống
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    )}

                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button
                            variant="outline"
                            onClick={handleReset}
                            className="flex-1"
                        >
                            Import file khác
                        </Button>
                        <Button
                            onClick={() => {
                                setShowResult(false)
                                router.push("/data-customer")
                            }}
                            className="flex-1"
                        >
                            Xem danh sách khách hàng
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <IconAlertCircle className="h-5 w-5" />
                        Hướng dẫn import
                    </CardTitle>
                    <CardDescription>
                        Đảm bảo file Excel của bạn có cấu trúc đúng theo template
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <h4 className="font-medium">Cột bắt buộc</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li className="flex items-center gap-2">
                                    <IconCheck className="h-3 w-3 text-green-500" />
                                    Họ và tên
                                </li>
                                <li className="flex items-center gap-2">
                                    <IconCheck className="h-3 w-3 text-green-500" />
                                    Số điện thoại
                                </li>
                                <li className="flex items-center gap-2">
                                    <IconCheck className="h-3 w-3 text-green-500" />
                                    Email
                                </li>
                            </ul>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-medium">Cột tùy chọn</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li className="flex items-center gap-2">
                                    <IconCheck className="h-3 w-3 text-blue-500" />
                                    Địa chỉ
                                </li>
                                <li className="flex items-center gap-2">
                                    <IconCheck className="h-3 w-3 text-blue-500" />
                                    Người thân
                                </li>
                                <li className="flex items-center gap-2">
                                    <IconCheck className="h-3 w-3 text-blue-500" />
                                    Dự án
                                </li>
                            </ul>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-medium">Lưu ý</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li className="flex items-center gap-2">
                                    <IconX className="h-3 w-3 text-destructive" />
                                    Không hỗ trợ file có mật khẩu
                                </li>
                                <li className="flex items-center gap-2">
                                    <IconX className="h-3 w-3 text-destructive" />
                                    Tối đa 5000 dòng/file
                                </li>
                                <li className="flex items-center gap-2">
                                    <IconCheck className="h-3 w-3 text-green-500" />
                                    UTF-8 encoding
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <h4 className="font-medium mb-2">Định dạng dữ liệu:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>
                                • Số điện thoại: 10-11 số, bắt đầu bằng 0 hoặc
                                +84
                            </li>
                            <li>• Email: định dạng email hợp lệ</li>
                            <li>• Người thân: số nguyên (0 nếu không có)</li>
                            <li>
                                • Dự án: phân cách bằng dấu phẩy (Bất động sản,
                                Chứng khoán,...)
                            </li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
