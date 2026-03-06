"use client"

import dynamic from "next/dynamic"

const EmailSender = dynamic(
    () => import("@/components/sendmail/emailsend"),
    { ssr: false }
)

export default function EmailSendPage() {
    return (
        <div>
            <EmailSender />
        </div>
    )
}
