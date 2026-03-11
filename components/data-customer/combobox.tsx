"use client"
import * as React from "react"
import { Check, ChevronDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover"
import { ComboboxProps } from "@/interfaces/system"

export function Combobox({ value, onChange, options, title, placeholder = "Chọn...", searchPlaceholder = "Tìm kiếm...", disabled, height = "300px" }: ComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const selectedOption = options.find((o) => o.value === value)

    const displayValue = !value || value === "all" ? title || placeholder : selectedOption?.label

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    role="combobox"
                    disabled={disabled}
                    className={cn(
                        "w-full sm:w-64 h-12 px-4",
                        "justify-between",
                        "rounded-sm",
                        "border border-gray-200 dark:border-gray-800",
                        "bg-transparent",
                        "hover:bg-gray-50 dark:hover:bg-gray-900/50",
                        "text-sm font-normal",
                        !value && "text-gray-400 dark:text-gray-500",
                        "transition-colors duration-150",
                        "focus:outline-none focus:ring-0 focus:border-gray-400 dark:focus:border-gray-600"
                    )}
                >
                    <span className="truncate">
                        {displayValue || placeholder}
                    </span>
                    <ChevronDown className={cn(
                        "ml-2 h-4 w-4 shrink-0 text-gray-400",
                        open && "transform rotate-180"
                    )} />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-full sm:w-64 p-0"
                align="start"
                sideOffset={4}
            >
                <Command className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-black">
                    <div className="flex items-center border-b border-gray-100 dark:border-gray-800 px-3">
                        <Search className="h-4 w-4 text-gray-400 mr-2" />
                        <CommandInput
                            placeholder={searchPlaceholder}
                            className="h-12 border-0 focus:ring-0 px-0 text-sm bg-transparent"
                        />
                    </div>

                    <CommandEmpty className="py-8 text-center text-sm text-gray-400">
                        Không tìm thấy
                    </CommandEmpty>

                    <CommandGroup className="p-1 overflow-auto" style={{ maxHeight: height }}>




                        {options.map((o) => (
                            <CommandItem
                                key={o.value}
                                value={o.label}
                                onSelect={() => {
                                    onChange(o.value)
                                    setOpen(false)
                                }}
                                className={cn(
                                    "flex items-center px-3 py-2.5 rounded-lg",
                                    "text-sm",
                                    "cursor-pointer",
                                    "hover:bg-gray-50 dark:hover:bg-gray-900",
                                    "data-[selected]:bg-transparent",
                                    "aria-selected:bg-gray-50 dark:aria-selected:bg-gray-900"
                                )}
                            >
                                <div className={cn(
                                    "w-5 h-5 rounded-md mr-3",
                                    "flex items-center justify-center",
                                    "border border-gray-300 dark:border-gray-700",
                                    value === o.value ? "border-blue-500 bg-blue-500 dark:border-blue-400 dark:bg-blue-400" : "bg-transparent"
                                )}>
                                    {value === o.value && (
                                        <Check className="h-3.5 w-3.5 text-white" />
                                    )}
                                </div>
                                <span className={cn(
                                    "text-gray-900 dark:text-gray-100",
                                    value === o.value && "font-medium"
                                )}>
                                    {o.label}
                                </span>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    )
}