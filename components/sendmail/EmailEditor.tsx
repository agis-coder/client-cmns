"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import Highlight from "@tiptap/extension-highlight"
import Color from "@tiptap/extension-color"
import { TextStyle } from "@tiptap/extension-text-style"
import FontFamily from "@tiptap/extension-font-family"
import Subscript from "@tiptap/extension-subscript"
import Superscript from "@tiptap/extension-superscript"
import Placeholder from "@tiptap/extension-placeholder"
import HorizontalRule from "@tiptap/extension-horizontal-rule"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import { Table } from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"

import EmailToolbar from "./EmailToolbar"

export default function EmailEditor({
    onChange,
}: {
    onChange: (html: string, text: string) => void
}) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Underline,
            Subscript,
            Superscript,
            TextStyle,
            Color,
            FontFamily,
            Highlight.configure({ multicolor: true }),
            Image,
            Link.configure({ openOnClick: false }),
            TextAlign.configure({ types: ["heading", "paragraph"] }),
            Placeholder.configure({
                placeholder: "Soạn nội dung email...",
            }),
            HorizontalRule,
            TaskList,
            TaskItem.configure({ nested: true }),
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
        ],
        content: "<p>Soạn nội dung email...</p>",
        onUpdate({ editor }) {
            onChange(editor.getHTML(), editor.getText())
        },
    })

    if (!editor) return null

    return (
        <div className="border rounded-md">
            <EmailToolbar editor={editor} />
            <EditorContent editor={editor} className="p-4 min-h-[320px]" />
        </div>
    )
}
