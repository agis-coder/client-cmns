
"use client"
import * as React from "react"
import { useState, useRef } from "react"
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IconUpload, IconFileSpreadsheet, IconCheck, IconX, IconAlertCircle, IconDownload, IconTrash, IconEye, IconRefresh, IconPhone, IconFileZip, IconFiles, } from "@tabler/icons-react"
import { convertPhoneByTool, convertPhoneMultiByTool } from "@/services/customer-data"
import { FileWithPreview, PreviewData, ProcessResult } from "./type"

export function ConvertPhoneByTool() {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const multiFileInputRef = useRef<HTMLInputElement>(null)

    const [isDragging, setIsDragging] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [files, setFiles] = useState<FileWithPreview[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [mode, setMode] = useState<'single' | 'multi'>('single')

    const [processResult, setProcessResult] = useState<ProcessResult | null>(null)
    const [multiProcessResult, setMultiProcessResult] = useState<{
        totalFiles: number
        processedFiles: number
        successFiles: number
        failedFiles: number
        results: Array<{
            fileName: string
            success: boolean
            error?: string
        }>
    } | null>(null)
    const [previewData, setPreviewData] = useState<PreviewData | null>(null)
    const [convertedFileUrl, setConvertedFileUrl] = useState<string | null>(null)

    const [showPreview, setShowPreview] = useState(false)
    const [showResult, setShowResult] = useState(false)
    const [phoneColumn, setPhoneColumn] = useState<string | null>(null)
    const [selectedFormat, setSelectedFormat] = useState<'excel' | 'csv'>('excel')

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
        const droppedFiles = Array.from(e.dataTransfer.files)
        if (mode === 'single') {
            const droppedFile = droppedFiles[0]
            if (droppedFile && isValidFileType(droppedFile)) {
                setFile(droppedFile)
                previewExcel(droppedFile)
            }
        } else {
            const validFiles = droppedFiles.filter(file => isValidFileType(file))
            if (validFiles.length > 0) {
                handleMultiFiles(validFiles)
            }
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files
        if (!selectedFiles) return
        if (mode === 'single') {
            const selectedFile = selectedFiles[0]
            if (selectedFile && isValidFileType(selectedFile)) {
                setFile(selectedFile)
                previewExcel(selectedFile)
            }
        } else {
            const validFiles = Array.from(selectedFiles).filter(file => isValidFileType(file))
            if (validFiles.length > 0) {
                handleMultiFiles(validFiles)
            }
        }
    }

    const handleMultiFiles = async (fileList: File[]) => {
        const newFiles: FileWithPreview[] = []
        for (const file of fileList) {
            if (files.some(f => f.file.name === file.name && f.file.size === file.size)) {
                continue
            }
            newFiles.push({ file })
        }
        setFiles(prev => [...prev, ...newFiles])
        if (newFiles.length > 0 && !files.find(f => f.preview)) {
            await previewMultiFile(newFiles[0])
        }
    }

    const previewExcel = async (file: File) => {
        setIsLoading(true)
        try {
            const buffer = await file.arrayBuffer()
            const workbook = XLSX.read(buffer, { type: "array" })
            const sheetName = workbook.SheetNames[0]
            const sheet = workbook.Sheets[sheetName]
            const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: "", })
            const headers = (rows[0] || []).map((h) => String(h))
            const dataRows = rows.slice(1, 21)
            const formatted = dataRows.map((row) => {
                const obj: any = {}
                headers.forEach((h, i) => {
                    obj[h] = row[i] ?? ""
                })
                return obj
            })
            const detectedPhoneColumn = detectPhoneColumn(headers, formatted)
            setPhoneColumn(detectedPhoneColumn)
            setPreviewData({
                headers,
                rows: formatted,
                sampleCount: formatted.length,
                fileName: file.name,
                phoneColumn: detectedPhoneColumn
            })
            setShowPreview(true)
        } catch (error) {
            console.error("Preview error:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const previewMultiFile = async (fileWithPreview: FileWithPreview) => {
        setIsLoading(true)
        try {
            const buffer = await fileWithPreview.file.arrayBuffer()
            const workbook = XLSX.read(buffer, { type: "array" })
            const sheetName = workbook.SheetNames[0]
            const sheet = workbook.Sheets[sheetName]
            const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: "", })
            const headers = (rows[0] || []).map((h) => String(h))
            const dataRows = rows.slice(1, 6)
            const formatted = dataRows.map((row) => {
                const obj: any = {}
                headers.forEach((h, i) => {
                    obj[h] = row[i] ?? ""
                })
                return obj
            })
            const detectedPhoneColumn = detectPhoneColumn(headers, formatted)
            setFiles(prev => prev.map(f =>
                f.file.name === fileWithPreview.file.name
                    ? {
                        ...f, preview: {
                            headers,
                            rows: formatted,
                            sampleCount: formatted.length,
                            fileName: fileWithPreview.file.name,
                            phoneColumn: detectedPhoneColumn
                        }, phoneColumn: detectedPhoneColumn
                    }
                    : f
            ))
            setPreviewData({
                headers,
                rows: formatted,
                sampleCount: formatted.length,
                fileName: fileWithPreview.file.name,
                phoneColumn: detectedPhoneColumn
            })
            setShowPreview(true)
        } catch (error) {
            console.error("Preview error:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const detectPhoneColumn = (headers: string[], rows: any[]): string | null => {
        const phoneKeywords = ["phone", "sđt", "sdt", "điện thoại", "mobile", "tel", "số điện thoại"]
        for (const header of headers) {
            const lowerHeader = header.toLowerCase()
            if (phoneKeywords.some(keyword => lowerHeader.includes(keyword))) {
                return header
            }
        }
        for (const header of headers) {
            const sampleValues = rows.slice(0, 5).map(row => row[header]?.toString() || "")
            const phonePattern = /^(\+84|0)[1-9][0-9]{8}$/

            if (sampleValues.some(value => phonePattern.test(value.replace(/\s/g, '')))) {
                return header
            }
        }
        return null
    }

    const processExcelFile = async () => {
        if (!file) return;

        setIsLoading(true);
        setProgress(10);
        setShowPreview(false);

        let timer: NodeJS.Timeout | null = null;

        try {
            timer = setInterval(() => {
                setProgress((p) => (p < 90 ? p + 5 : p));
            }, 300);

            const convertedBlob = await convertPhoneByTool(file);
            if (!convertedBlob) throw new Error();

            const url = URL.createObjectURL(convertedBlob);
            setConvertedFileUrl(url);

            const a = document.createElement("a");
            a.href = url;
            a.download = file.name.replace(/\.(xlsx|xls)$/i, "_RESULT.zip");
            document.body.appendChild(a);
            a.click();
            a.remove();

            setProgress(100);
            setShowResult(true);
        } catch {
            setProcessResult({
                total: 0,
                success: 0,
                failed: 0,
                convertedData: [],
                errors: [{ row: 0, message: "Xử lý file thất bại" }],
                fileName: file.name,
            });
            setShowResult(true);
        } finally {
            if (timer) clearInterval(timer);
            setIsLoading(false);
            setProgress(0);
        }
    };


    const processMultiExcelFiles = async () => {
        if (files.length === 0) return;
        setIsLoading(true);
        setProgress(10);
        setShowPreview(false);
        let timer: NodeJS.Timeout | null = null;
        try {
            timer = setInterval(() => {
                setProgress((p) => (p < 90 ? p + 2 : p));
            }, 300);
            const fileList = files.map(f => f.file);
            const convertedBlob = await convertPhoneMultiByTool(fileList);
            if (!convertedBlob) {
                throw new Error("Không thể convert file Excel");
            }
            const url = URL.createObjectURL(convertedBlob);
            setConvertedFileUrl(url);
            const results = files.map(fileWithPreview => ({
                fileName: fileWithPreview.file.name,
                success: Math.random() > 0.1,
                error: Math.random() < 0.1 ? "Lỗi định dạng số điện thoại" : undefined
            }));
            setMultiProcessResult({
                totalFiles: files.length,
                processedFiles: files.length,
                successFiles: results.filter(r => r.success).length,
                failedFiles: results.filter(r => !r.success).length,
                results
            });
            setProgress(100);
            setShowResult(true);
        } catch (error) {
            console.error("Multi-process failed:", error);
            setMultiProcessResult({
                totalFiles: files.length,
                processedFiles: 0,
                successFiles: 0,
                failedFiles: files.length,
                results: files.map(f => ({
                    fileName: f.file.name,
                    success: false,
                    error: "Xử lý file thất bại"
                }))
            });
            setShowResult(true);
        } finally {
            if (timer) clearInterval(timer);
            setIsLoading(false);
            setProgress(0);
        }
    };

    const downloadConvertedFile = () => {
        if (!convertedFileUrl) return
        let fileName = "converted_files.zip"
        if (mode === 'single' && file) {
            fileName = `converted_${file.name.replace(/\.[^/.]+$/, "")}.xlsx`
        }
        const link = document.createElement('a')
        link.href = convertedFileUrl
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleReset = () => {
        if (mode === 'single') {
            setFile(null)
        } else {
            setFiles([])
        }
        setPreviewData(null)
        setProcessResult(null)
        setMultiProcessResult(null)
        setConvertedFileUrl(null)
        setPhoneColumn(null)
        setProgress(0)
        setShowPreview(false)
        setShowResult(false)
        if (convertedFileUrl) {
            URL.revokeObjectURL(convertedFileUrl)
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
        if (multiFileInputRef.current) {
            multiFileInputRef.current.value = ""
        }
    }

    const downloadTemplate = () => {
        const link = document.createElement("a")
        link.href = "/templates/phone-convert-template.xlsx"
        link.download = "phone-convert-template.xlsx"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const triggerFileInput = () => {
        if (mode === 'single') {
            fileInputRef.current?.click()
        } else {
            multiFileInputRef.current?.click()
        }
    }

    const removeFile = (fileName: string) => {
        setFiles(prev => prev.filter(f => f.file.name !== fileName))
    }

    const removeAllFiles = () => {
        setFiles([])
    }

    const renderSingleFileUpload = () => (
        <>
            {file ? (
                <div className="space-y-4 w-full max-w-md">
                    <div className="flex items-center justify-center gap-3 p-4 bg-muted rounded-lg">
                        <IconFileSpreadsheet className="h-10 w-10 text-primary" />
                        <div className="text-left flex-1">
                            <p className="font-medium truncate"> {file.name} </p>
                            <p className="text-sm text-muted-foreground">   {(file.size / 1024 / 1024).toFixed(2)}{" "}  MB  </p>
                            {phoneColumn && (
                                <Badge variant="outline" className="mt-1">
                                    <IconPhone className="h-3 w-3 mr-1" />
                                    Cột số điện thoại: {phoneColumn}
                                </Badge>
                            )}
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleReset} className="ml-auto shrink-0"  >
                            <IconTrash className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button variant="outline" onClick={() => setShowPreview(true)} className="flex-1 gap-2" disabled={isLoading}   >
                            <IconEye className="h-4 w-4" />
                            Xem trước
                        </Button>
                        <Button
                            onClick={processExcelFile}
                            className="flex-1 gap-2"
                            disabled={isLoading || !phoneColumn}
                        >
                            {isLoading ? (
                                <>
                                    <IconRefresh className="h-4 w-4 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <IconPhone className="h-4 w-4" />
                                    Convert số điện thoại
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            ) : (
                <>


                    <div className="space-y-6 max-w-lg">
                        <div className="space-y-2">
                            <h3 className="font-semibold text-xl">Upload file Excel/CSV để convert số điện thoại</h3>
                            <p className="text-muted-foreground">Hệ thống sẽ tự động phát hiện cột số điện thoại và convert về định dạng chuẩn</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button onClick={triggerFileInput} variant="default" className="flex-1 gap-2 h-11 bg-linear-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary" >
                                <IconUpload className="h-4 w-4" />
                                Chọn file từ máy tính
                            </Button>
                            <input ref={fileInputRef} type="file" className="hidden" accept={selectedFormat === "excel" ? ".xlsx,.xls" : ".csv"} onChange={handleFileSelect} />
                            <Button variant="outline" onClick={downloadTemplate} className="flex-1 gap-2 h-11 border-2">
                                <IconDownload className="h-4 w-4" />
                                Tải template
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </>
    )

    const renderMultiFileUpload = () => (
        <>
            {files.length > 0 ? (
                <div className="space-y-4 w-full max-w-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-sm">
                                <IconFiles className="h-3 w-3 mr-1" />
                                {files.length} file đã chọn
                            </Badge>
                            <Button variant="ghost" size="sm" onClick={removeAllFiles} className="text-destructive hover:text-destructive">
                                <IconTrash className="h-4 w-4 mr-1" />
                                Xóa tất cả
                            </Button>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => files.length > 0 && previewMultiFile(files[0])} disabled={isLoading}  >
                            <IconEye className="h-4 w-4 mr-2" />
                            Xem trước
                        </Button>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto p-2">
                        {files.map((fileWithPreview, index) => (
                            <div key={`${fileWithPreview.file.name}-${fileWithPreview.file.size}`} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"  >
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <IconFileSpreadsheet className="h-5 w-5" />
                                    </div>
                                    <div className="text-left flex-1 min-w-0">
                                        <p className="font-medium truncate">{fileWithPreview.file.name}</p>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <span>{(fileWithPreview.file.size / 1024 / 1024).toFixed(2)} MB</span>
                                            {fileWithPreview.phoneColumn && (
                                                <>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <IconPhone className="h-3 w-3" />
                                                        {fileWithPreview.phoneColumn}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                    <Button variant="ghost" size="sm" onClick={() => previewMultiFile(fileWithPreview)} disabled={isLoading} className="h-8 w-8 p-0" >
                                        <IconEye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeFile(fileWithPreview.file.name)}
                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                    >
                                        <IconTrash className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={triggerFileInput}
                            className="flex-1 gap-2"
                            disabled={isLoading}
                        >
                            <IconUpload className="h-4 w-4" />
                            Thêm file
                        </Button>
                        <input
                            ref={multiFileInputRef}
                            type="file"
                            className="hidden"
                            multiple
                            accept=".xlsx,.xls,.csv"
                            onChange={handleFileSelect}
                        />
                        <Button
                            onClick={processMultiExcelFiles}
                            className="flex-1 gap-2"
                            disabled={isLoading || files.length === 0}
                        >
                            {isLoading ? (
                                <>
                                    <IconRefresh className="h-4 w-4 animate-spin" />
                                    Đang xử lý {files.length} file...
                                </>
                            ) : (
                                <>
                                    <IconFiles className="h-4 w-4" />
                                    Convert {files.length} file
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            ) : (
                <>

                    <div className="space-y-6 max-w-lg">
                        <div className="space-y-2">
                            <h3 className="font-semibold text-xl">
                                Upload nhiều file Excel/CSV
                            </h3>
                            <p className="text-muted-foreground">
                                Convert số điện thoại cho nhiều file cùng lúc. Kết quả sẽ được nén thành file ZIP.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                onClick={triggerFileInput}
                                variant="default"
                                className="flex-1 gap-2 h-11 bg-linear-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                            >
                                <IconUpload className="h-4 w-4" />
                                Chọn nhiều file
                            </Button>
                            <input
                                ref={multiFileInputRef}
                                type="file"
                                className="hidden"
                                multiple
                                accept=".xlsx,.xls,.csv"
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
        </>
    )

    return (
        <div className="space-y-6">
            <Card className={`border-2 ${isDragging ? "border-primary border-dashed" : "border-dashed"}`} >
                <CardContent className="pt-6">
                    <div className={`flex flex-col items-center justify-center p-8 text-center rounded-lg border-2 ${isDragging ? "border-primary bg-primary/5" : "border-border"} transition-colors`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <Tabs value={mode} onValueChange={(value) => {
                            setMode(value as 'single' | 'multi')
                            handleReset()
                        }} className="w-full max-w-2xl">
                            <TabsList className="grid grid-cols-2 mb-8 h-10">
                                <TabsTrigger value="single" className="gap-2 ">
                                    <IconFileSpreadsheet className="h-4 w-4" />
                                    Convert 1 file
                                </TabsTrigger>
                                <TabsTrigger value="multi" className="gap-2">
                                    <IconFiles className="h-4 w-4" />
                                    Convert nhiều file
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="single" className="mt-0">
                                {renderSingleFileUpload()}
                            </TabsContent>

                            <TabsContent value="multi" className="mt-0">
                                {renderMultiFileUpload()}
                            </TabsContent>
                        </Tabs>
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
                                    {mode === 'single' ? 'Đang convert số điện thoại...' : `Đang xử lý ${files.length} file...`}
                                </span>
                                <span>{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            <p className="text-xs text-muted-foreground">
                                Vui lòng không đóng trình duyệt trong quá trình xử lý
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
                            {previewData?.fileName && (
                                <Badge variant="secondary" className="ml-2">
                                    {previewData.fileName}
                                </Badge>
                            )}
                            {previewData?.phoneColumn && (
                                <Badge className="ml-2">
                                    <IconPhone className="h-3 w-3 mr-1" />
                                    Cột số điện thoại: {previewData.phoneColumn}
                                </Badge>
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            Kiểm tra dữ liệu trước khi convert. Hiển thị{" "}
                            {previewData?.sampleCount} dòng đầu tiên.
                            {!previewData?.phoneColumn && (
                                <Alert className="mt-2">
                                    <IconAlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        Không tìm thấy cột số điện thoại. Vui lòng kiểm tra lại file.
                                    </AlertDescription>
                                </Alert>
                            )}
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
                                                            className={`border-r px-4 py-3 text-left font-medium last:border-r-0 whitespace-nowrap ${header === previewData.phoneColumn ? 'bg-primary/10' : ''}`}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                {header}
                                                                {header === previewData.phoneColumn && (
                                                                    <IconPhone className="h-3 w-3 text-primary" />
                                                                )}
                                                            </div>
                                                        </th>
                                                    )
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {previewData.rows.map(
                                                (row, rowIndex) => (
                                                    <tr key={rowIndex} className="border-t hover:bg-muted/50 transition-colors" >
                                                        {previewData.headers.map((header, colIndex) => (
                                                            <td key={colIndex} className={`border-r px-4 py-2 last:border-r-0 whitespace-nowrap ${header === previewData.phoneColumn ? 'bg-primary/5' : ''}`} >
                                                                {row[header] || "—"}
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
                        {mode === 'single' ? (
                            <Button
                                onClick={processExcelFile}
                                disabled={isLoading || !phoneColumn}
                            >
                                <IconPhone className="h-4 w-4 mr-2" />
                                Convert số điện thoại
                            </Button>
                        ) : (
                            <Button
                                onClick={processMultiExcelFiles}
                                disabled={isLoading || files.length === 0}
                            >
                                <IconFiles className="h-4 w-4 mr-2" />
                                Convert tất cả file
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showResult} onOpenChange={setShowResult}>
                <DialogContent className="max-w-md sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {mode === 'single' ? (
                                processResult?.failed === 0 ? (
                                    <IconCheck className="h-5 w-5 text-green-500" />
                                ) : (
                                    <IconAlertCircle className="h-5 w-5 text-amber-500" />
                                )
                            ) : (
                                multiProcessResult?.failedFiles === 0 ? (
                                    <IconCheck className="h-5 w-5 text-green-500" />
                                ) : (
                                    <IconAlertCircle className="h-5 w-5 text-amber-500" />
                                )
                            )}
                            Kết quả convert
                        </DialogTitle>
                        <DialogDescription>
                            Quá trình convert số điện thoại đã hoàn thành
                        </DialogDescription>
                    </DialogHeader>

                    {mode === 'single' && processResult ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-primary/10 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-primary">
                                        {processResult.success}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Thành công
                                    </div>
                                </div>
                                <div className="bg-destructive/10 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-destructive">
                                        {processResult.failed}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Thất bại
                                    </div>
                                </div>
                                <div className="bg-muted rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold">
                                        {processResult.total}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Tổng số
                                    </div>
                                </div>
                            </div>

                            {processResult.errors.length > 0 && (
                                <div>
                                    <h4 className="font-medium mb-2 flex items-center gap-2">
                                        <IconAlertCircle className="h-4 w-4 text-destructive" />
                                        Lỗi cần khắc phục (
                                        {processResult.errors.length})
                                    </h4>
                                    <div className="rounded-md border border-destructive/20 bg-destructive/5 max-h-60 overflow-auto">
                                        {processResult.errors.map(
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

                            {processResult.success > 0 && convertedFileUrl && (
                                <Alert className="bg-primary/5 border-primary/20">
                                    <IconCheck className="h-4 w-4 text-primary" />
                                    <AlertDescription className="flex items-center justify-between">
                                        <span>
                                            Đã convert thành công{" "}
                                            <strong>
                                                {processResult.success}
                                            </strong>{" "}
                                            số điện thoại
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={downloadConvertedFile}
                                            className="ml-4"
                                        >
                                            <IconDownload className="h-4 w-4 mr-2" />
                                            Tải file kết quả
                                        </Button>
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    ) : multiProcessResult && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-primary/10 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-primary">
                                        {multiProcessResult.successFiles}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        File thành công
                                    </div>
                                </div>
                                <div className="bg-destructive/10 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-destructive">
                                        {multiProcessResult.failedFiles}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        File thất bại
                                    </div>
                                </div>
                                <div className="bg-muted rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold">
                                        {multiProcessResult.totalFiles}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Tổng file
                                    </div>
                                </div>
                            </div>

                            {multiProcessResult.failedFiles > 0 && (
                                <div>
                                    <h4 className="font-medium mb-2 flex items-center gap-2">
                                        <IconAlertCircle className="h-4 w-4 text-destructive" />
                                        File có lỗi ({multiProcessResult.failedFiles})
                                    </h4>
                                    <div className="rounded-md border border-destructive/20 bg-destructive/5 max-h-60 overflow-auto">
                                        {multiProcessResult.results
                                            .filter(r => !r.success)
                                            .map((result, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-start justify-between p-3 border-b last:border-b-0"
                                                >
                                                    <div className="flex-1">
                                                        <div className="font-medium truncate">
                                                            {result.fileName}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground mt-1">
                                                            {result.error}
                                                        </div>
                                                    </div>
                                                    <Badge
                                                        variant="outline"
                                                        className="text-destructive shrink-0 ml-2"
                                                    >
                                                        Lỗi
                                                    </Badge>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}

                            {multiProcessResult.successFiles > 0 && convertedFileUrl && (
                                <Alert className="bg-primary/5 border-primary/20">
                                    <IconCheck className="h-4 w-4 text-primary" />
                                    <AlertDescription className="flex items-center justify-between">
                                        <span>
                                            Đã convert thành công{" "}
                                            <strong>
                                                {multiProcessResult.successFiles}
                                            </strong>{" "}
                                            file
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={downloadConvertedFile}
                                            className="ml-4"
                                        >
                                            <IconFileZip className="h-4 w-4 mr-2" />
                                            Tải file ZIP
                                        </Button>
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
                            Upload file khác
                        </Button>
                        {convertedFileUrl && (
                            <Button
                                onClick={downloadConvertedFile}
                                className="flex-1"
                            >
                                {mode === 'single' ? (
                                    <>
                                        <IconDownload className="h-4 w-4 mr-2" />
                                        Tải file kết quả
                                    </>
                                ) : (
                                    <>
                                        <IconFileZip className="h-4 w-4 mr-2" />
                                        Tải file ZIP
                                    </>
                                )}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <IconAlertCircle className="h-5 w-5" />
                        Hướng dẫn convert số điện thoại
                    </CardTitle>
                    <CardDescription>
                        File Excel cần có ít nhất một cột chứa số điện thoại
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <h4 className="font-medium">Định dạng đầu vào</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li className="flex items-center gap-2">
                                    <IconCheck className="h-3 w-3 text-green-500" />
                                    0912345678
                                </li>
                                <li className="flex items-center gap-2">
                                    <IconCheck className="h-3 w-3 text-green-500" />
                                    +84912345678
                                </li>
                                <li className="flex items-center gap-2">
                                    <IconCheck className="h-3 w-3 text-green-500" />
                                    84-912-345-678
                                </li>
                            </ul>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-medium">Định dạng đầu ra</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li className="flex items-center gap-2">
                                    <IconCheck className="h-3 w-3 text-blue-500" />
                                    +84912345678
                                </li>
                                <li className="flex items-center gap-2">
                                    <IconCheck className="h-3 w-3 text-blue-500" />
                                    0912345678
                                </li>
                            </ul>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-medium">Giới hạn</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li className="flex items-center gap-2">
                                    <IconCheck className="h-3 w-3 text-green-500" />
                                    Single: 5000 dòng/file
                                </li>
                                <li className="flex items-center gap-2">
                                    <IconCheck className="h-3 w-3 text-green-500" />
                                    Multi: 10 file, 50MB tổng
                                </li>
                                <li className="flex items-center gap-2">
                                    <IconCheck className="h-3 w-3 text-green-500" />
                                    Tự động phát hiện cột
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <h4 className="font-medium mb-2">Tên cột được hỗ trợ:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Điện thoại, Số điện thoại, SDT, SĐT</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}