export interface ComboboxProps {
    value?: string
    onChange: (value: string) => void
    options: { value: string; label: string }[]
    placeholder?: string
    searchPlaceholder?: string
    disabled?: boolean
    height?: string
    title?: string
}