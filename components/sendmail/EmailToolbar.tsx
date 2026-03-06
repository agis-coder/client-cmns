"use client"

import { Editor } from "@tiptap/react"
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    Highlighter,
    Type,
    Eraser,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Image as ImageIcon,
    Link as LinkIcon,
    Undo,
    Redo,
    List,
    ListOrdered,
    Quote,
    Minus,
    Table as TableIcon,
    Subscript,
    Superscript,
    Smile,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import EmojiPicker from "emoji-picker-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

const btn = (active: boolean) =>
    active ? "default" : "outline"

export default function EmailToolbar({ editor }: { editor: Editor }) {
    const [textColor, setTextColor] = useState("#000000")
    const [bgColor, setBgColor] = useState("#fff3a0")
    const [link, setLink] = useState("")
    const [imageUrl, setImageUrl] = useState("")
    const [showEmoji, setShowEmoji] = useState(false)

    if (!editor) return null

    return (
        <div className="relative flex flex-wrap items-center gap-1 border-b bg-muted/60 p-2">
            {/* TEXT */}
            <Button size="icon" variant={btn(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={16} /></Button>
            <Button size="icon" variant={btn(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={16} /></Button>
            <Button size="icon" variant={btn(editor.isActive("underline"))} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon size={16} /></Button>
            <Button size="icon" variant={btn(editor.isActive("strike"))} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough size={16} /></Button>
            <Button size="icon" variant={btn(editor.isActive("subscript"))} onClick={() => editor.chain().focus().toggleSubscript().run()}><Subscript size={16} /></Button>
            <Button size="icon" variant={btn(editor.isActive("superscript"))} onClick={() => editor.chain().focus().toggleSuperscript().run()}><Superscript size={16} /></Button>

            <div className="mx-1 h-6 w-px bg-border" />

            {/* TEXT COLOR */}
            <Button size="icon" variant={btn(!!editor.getAttributes("textStyle")?.color)} onClick={() => editor.chain().focus().setColor(textColor).run()}>
                <Type size={16} />
            </Button>
            <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="h-8 w-8 rounded border" />
            <Button size="icon" variant="outline" onClick={() => editor.chain().focus().unsetColor().run()}>
                <Eraser size={16} />
            </Button>

            <div className="mx-1 h-6 w-px bg-border" />

            {/* HIGHLIGHT */}
            <Button size="icon" variant={btn(editor.isActive("highlight"))} onClick={() => editor.chain().focus().setHighlight({ color: bgColor }).run()}>
                <Highlighter size={16} />
            </Button>
            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-8 w-8 rounded border" />
            <Button size="icon" variant="outline" onClick={() => editor.chain().focus().unsetHighlight().run()}>
                <Eraser size={16} />
            </Button>

            <div className="mx-1 h-6 w-px bg-border" />

            {/* ALIGN */}
            <Button size="icon" variant={btn(editor.isActive({ textAlign: "left" }))} onClick={() => editor.chain().focus().setTextAlign("left").run()}><AlignLeft size={16} /></Button>
            <Button size="icon" variant={btn(editor.isActive({ textAlign: "center" }))} onClick={() => editor.chain().focus().setTextAlign("center").run()}><AlignCenter size={16} /></Button>
            <Button size="icon" variant={btn(editor.isActive({ textAlign: "right" }))} onClick={() => editor.chain().focus().setTextAlign("right").run()}><AlignRight size={16} /></Button>
            <Button size="icon" variant={btn(editor.isActive({ textAlign: "justify" }))} onClick={() => editor.chain().focus().setTextAlign("justify").run()}><AlignJustify size={16} /></Button>

            <div className="mx-1 h-6 w-px bg-border" />

            {/* LIST */}
            <Button size="icon" variant={btn(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={16} /></Button>
            <Button size="icon" variant={btn(editor.isActive("orderedList"))} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={16} /></Button>
            <Button size="icon" variant={btn(editor.isActive("blockquote"))} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote size={16} /></Button>

            <div className="mx-1 h-6 w-px bg-border" />

            {/* HR */}
            <Button size="icon" variant="outline" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus size={16} /></Button>

            <div className="mx-1 h-6 w-px bg-border" />

            {/* LINK */}
            <Input className="h-8 w-36" placeholder="Link" value={link} onChange={(e) => setLink(e.target.value)} />
            <Button size="icon" variant={btn(editor.isActive("link"))} onClick={() => editor.chain().focus().setLink({ href: link }).run()}>
                <LinkIcon size={16} />
            </Button>

            <div className="mx-1 h-6 w-px bg-border" />

            {/* IMAGE */}
            <Dialog>
                <DialogTrigger asChild>
                    <Button size="icon" variant="outline"><ImageIcon size={16} /></Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Chèn hình ảnh</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Input placeholder="URL hình" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                        <Button className="w-full" onClick={() => editor.chain().focus().setImage({ src: imageUrl }).run()}>
                            Chèn từ URL
                        </Button>
                        <Input type="file" accept="image/*" onChange={(e) => {
                            const f = e.target.files?.[0]
                            if (!f) return
                            const r = new FileReader()
                            r.onload = () => editor.chain().focus().setImage({ src: r.result as string }).run()
                            r.readAsDataURL(f)
                        }} />
                    </div>
                </DialogContent>
            </Dialog>

            <Button size="icon" variant="outline" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()}>
                <TableIcon size={16} />
            </Button>

            <div className="mx-1 h-6 w-px bg-border" />

            {/* EMOJI */}
            <Button size="icon" variant={btn(showEmoji)} onClick={() => setShowEmoji(!showEmoji)}><Smile size={16} /></Button>
            {showEmoji && (
                <div className="absolute top-12 left-2 z-50">
                    <EmojiPicker onEmojiClick={(e) => editor.chain().focus().insertContent(e.emoji).run()} />
                </div>
            )}

            <div className="mx-1 h-6 w-px bg-border" />

            {/* HISTORY */}
            <Button size="icon" variant="outline" onClick={() => editor.chain().focus().undo().run()}><Undo size={16} /></Button>
            <Button size="icon" variant="outline" onClick={() => editor.chain().focus().redo().run()}><Redo size={16} /></Button>
        </div>
    )
}
