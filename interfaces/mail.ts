export interface MailAttachment {
    filename: string
    content: string
    contentType?: string
}

export type EmailSendType = "normal" | "marketing" | "system"

export interface SendBulkMailPayload {
    to: string[]               // danh sách email chính
    cc?: string[]              // cc (optional)
    bcc?: string[]             // bcc (optional)
    subject: string
    htmlContent: string        // HTML từ editor (Quill / TipTap)
    textContent?: string       // plain text (fallback)
    attachments?: MailAttachment[]
    type?: EmailSendType       // phân loại email
    replyTo?: string
    fromName?: string
    fromEmail?: string
}