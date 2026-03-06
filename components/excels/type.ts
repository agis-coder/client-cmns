
export interface PreviewData {
    headers: string[]
    rows: any[]
    sampleCount: number
    fileName: string
    phoneColumn: string | null
}

export interface FileWithPreview {
    file: File
    preview?: PreviewData
    phoneColumn?: string | null
}

export interface ProcessResult {
    total: number
    success: number
    failed: number
    convertedData: any[]
    errors: Array<{
        row: number
        message: string
    }>
    fileName?: string
}