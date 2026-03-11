"use client"

import { Editor } from "@tiptap/react"
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    List,
    ListOrdered,
    Link as LinkIcon,
    Image as ImageIcon,
    Smile,
    Undo,
    Redo,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Quote,
    Minus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"
import EmojiPicker from "emoji-picker-react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Toggle } from "@/components/ui/toggle"
import { Separator } from "@/components/ui/separator"

export default function EmailToolbar({ editor }: { editor: Editor }) {
    const [showEmoji, setShowEmoji] = useState(false)
    const [showLinkDialog, setShowLinkDialog] = useState(false)
    const [showImageDialog, setShowImageDialog] = useState(false)
    const [linkUrl, setLinkUrl] = useState("")
    const [imageUrl, setImageUrl] = useState("")

    const emojiRef = useRef<HTMLDivElement>(null)

    // Đóng emoji picker khi click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (emojiRef.current && !emojiRef.current.contains(event.target as Node)) {
                setShowEmoji(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    if (!editor) return null

    // Xử lý chèn link
    const handleAddLink = () => {
        if (linkUrl) {
            editor.chain().focus().setLink({ href: linkUrl }).run()
            setLinkUrl("")
            setShowLinkDialog(false)
        }
    }

    // Xử lý xóa link
    const handleRemoveLink = () => {
        editor.chain().focus().unsetLink().run()
    }

    // Xử lý chèn image từ URL
    const handleAddImage = () => {
        if (imageUrl) {
            editor.chain().focus().setImage({ src: imageUrl }).run()
            setImageUrl("")
            setShowImageDialog(false)
        }
    }

    // Xử lý upload image từ file - ĐÃ FIX
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Kiểm tra file có phải là hình ảnh không
        if (!file.type.startsWith('image/')) {
            alert('Vui lòng chọn file hình ảnh')
            return
        }

        const reader = new FileReader()
        reader.onload = () => {
            editor.chain().focus().setImage({
                src: reader.result as string,
                alt: file.name
            }).run()
            setShowImageDialog(false)
            // Reset input file
            e.target.value = ''
        }
        reader.onerror = () => {
            alert('Có lỗi khi đọc file. Vui lòng thử lại')
        }
        reader.readAsDataURL(file)
    }

    return (
        <div className="border-b bg-white px-3 py-2">
            <div className="flex flex-wrap items-center gap-1">
                {/* Formatting Group */}
                <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
                    <Toggle
                        size="sm"
                        pressed={editor.isActive("bold")}
                        onPressedChange={() => editor.chain().focus().toggleBold().run()}
                        aria-label="In đậm"
                        title="In đậm (Ctrl+B)"
                    >
                        <Bold className="h-4 w-4" />
                    </Toggle>

                    <Toggle
                        size="sm"
                        pressed={editor.isActive("italic")}
                        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                        aria-label="In nghiêng"
                        title="In nghiêng (Ctrl+I)"
                    >
                        <Italic className="h-4 w-4" />
                    </Toggle>

                    <Toggle
                        size="sm"
                        pressed={editor.isActive("underline")}
                        onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
                        aria-label="Gạch chân"
                        title="Gạch chân (Ctrl+U)"
                    >
                        <UnderlineIcon className="h-4 w-4" />
                    </Toggle>

                    <Toggle
                        size="sm"
                        pressed={editor.isActive("strike")}
                        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
                        aria-label="Gạch ngang"
                        title="Gạch ngang"
                    >
                        <Strikethrough className="h-4 w-4" />
                    </Toggle>
                </div>

                <Separator orientation="vertical" className="h-6" />

                {/* List Group - ĐÃ FIX */}
                <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
                    <Toggle
                        size="sm"
                        pressed={editor.isActive("bulletList")}
                        onPressedChange={() => {
                            editor.chain().focus().toggleBulletList().run()
                        }}
                        aria-label="Danh sách không thứ tự"
                        title="Danh sách không thứ tự"
                    >
                        <List className="h-4 w-4" />
                    </Toggle>

                    <Toggle
                        size="sm"
                        pressed={editor.isActive("orderedList")}
                        onPressedChange={() => {
                            editor.chain().focus().toggleOrderedList().run()
                        }}
                        aria-label="Danh sách có thứ tự"
                        title="Danh sách có thứ tự"
                    >
                        <ListOrdered className="h-4 w-4" />
                    </Toggle>

                    <Toggle
                        size="sm"
                        pressed={editor.isActive("blockquote")}
                        onPressedChange={() => {
                            editor.chain().focus().toggleBlockquote().run()
                        }}
                        aria-label="Trích dẫn"
                        title="Trích dẫn"
                    >
                        <Quote className="h-4 w-4" />
                    </Toggle>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => editor.chain().focus().setHorizontalRule().run()}
                        title="Đường kẻ ngang"
                    >
                        <Minus className="h-4 w-4" />
                    </Button>
                </div>

                <Separator orientation="vertical" className="h-6" />

                {/* Alignment Group */}
                <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
                    <Toggle
                        size="sm"
                        pressed={editor.isActive({ textAlign: "left" })}
                        onPressedChange={() => editor.chain().focus().setTextAlign("left").run()}
                        aria-label="Căn trái"
                        title="Căn trái"
                    >
                        <AlignLeft className="h-4 w-4" />
                    </Toggle>

                    <Toggle
                        size="sm"
                        pressed={editor.isActive({ textAlign: "center" })}
                        onPressedChange={() => editor.chain().focus().setTextAlign("center").run()}
                        aria-label="Căn giữa"
                        title="Căn giữa"
                    >
                        <AlignCenter className="h-4 w-4" />
                    </Toggle>

                    <Toggle
                        size="sm"
                        pressed={editor.isActive({ textAlign: "right" })}
                        onPressedChange={() => editor.chain().focus().setTextAlign("right").run()}
                        aria-label="Căn phải"
                        title="Căn phải"
                    >
                        <AlignRight className="h-4 w-4" />
                    </Toggle>
                </div>

                <Separator orientation="vertical" className="h-6" />

                {/* Insert Group */}
                <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
                    {/* Link Button */}
                    <Popover open={showLinkDialog} onOpenChange={setShowLinkDialog}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`h-8 w-8 p-0 ${editor.isActive("link") ? "bg-gray-200" : ""}`}
                                title="Chèn link"
                            >
                                <LinkIcon className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80" align="start">
                            <div className="space-y-3">
                                <h4 className="font-medium text-sm">Chèn liên kết</h4>
                                <Input
                                    placeholder="https://..."
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleAddLink()
                                    }}
                                />
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={handleAddLink} className="flex-1">
                                        Thêm
                                    </Button>
                                    {editor.isActive("link") && (
                                        <Button size="sm" variant="outline" onClick={handleRemoveLink}>
                                            Xóa
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* Image Button - ĐÃ FIX */}
                    <Popover open={showImageDialog} onOpenChange={setShowImageDialog}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                title="Chèn hình ảnh"
                            >
                                <ImageIcon className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80" align="start">
                            <div className="space-y-4">
                                <h4 className="font-medium text-sm">Chèn hình ảnh</h4>

                                {/* Upload từ máy tính - ĐÃ FIX */}
                                <div className="space-y-2">
                                    <Label className="text-xs">Tải lên từ máy tính</Label>
                                    <Input
                                        type="file"
                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                        onChange={handleImageUpload}
                                        className="cursor-pointer text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                                    />
                                    <p className="text-xs text-gray-500">
                                        Hỗ trợ: JPG, PNG, GIF, WEBP
                                    </p>
                                </div>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-background px-2 text-muted-foreground">
                                            Hoặc URL
                                        </span>
                                    </div>
                                </div>

                                {/* URL Image */}
                                <div className="space-y-2">
                                    <Label className="text-xs">URL hình ảnh</Label>
                                    <Input
                                        placeholder="https://example.com/image.jpg"
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                    />
                                    <Button
                                        size="sm"
                                        onClick={handleAddImage}
                                        className="w-full"
                                        disabled={!imageUrl}
                                    >
                                        Chèn từ URL
                                    </Button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* Emoji Button */}
                    <div className="relative" ref={emojiRef}>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setShowEmoji(!showEmoji)}
                            title="Chèn emoji"
                        >
                            <Smile className="h-4 w-4" />
                        </Button>

                        {showEmoji && (
                            <div className="absolute top-8 left-0 z-50 shadow-lg">
                                <EmojiPicker
                                    onEmojiClick={(emojiData) => {
                                        editor.chain().focus().insertContent(emojiData.emoji).run()
                                        setShowEmoji(false)
                                    }}
                                    width={300}
                                    height={350}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <Separator orientation="vertical" className="h-6" />

                {/* History Group */}
                <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => editor.chain().focus().undo().run()}
                        title="Hoàn tác (Ctrl+Z)"
                    >
                        <Undo className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => editor.chain().focus().redo().run()}
                        title="Làm lại (Ctrl+Y)"
                    >
                        <Redo className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}