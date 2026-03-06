import { ProjectCategory } from "@/components/data-customer/project-category"
import { CITY_ALIAS } from "@/interfaces/customer"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// lib/utils.ts
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(value)
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export function parseEmails(input: string): string[] {
  if (!input) return []

  return Array.from(
    new Set(
      (input.match(/[^\s@]+@[^\s@]+\.[^\s@]+/g) || [])
        .map(e => e.toLowerCase())
    )
  )
}


export const normalizeSearch = (value: string) => {
  const trimmed = value.trim()
  const upper = trimmed.toUpperCase()
  if (CITY_ALIAS[upper]) return CITY_ALIAS[upper]
  return trimmed
}

export const getSourceLabel = (source: string): string => {
  const sourceLabels: Record<ProjectCategory, string> = {
    [ProjectCategory.BDS]: "Bất động sản",
    [ProjectCategory.GUI_TIET_KIEM]: "Gửi tiết kiệm",
    [ProjectCategory.XE_HOI]: "Xe hơi",
    [ProjectCategory.CHUNG_KHOAN]: "Chứng khoán",
    [ProjectCategory.VANG]: "Vàng",
    [ProjectCategory.TRUONG_QUOC_TE]: "Trường quốc tế",
    [ProjectCategory.BAC_SI]: "Bác sĩ",
    [ProjectCategory.QUAN_CHUC]: "Quan chức",
    [ProjectCategory.DINH_CU]: "Định cư",
    [ProjectCategory.TMĐT]: "Thương mại điện tử",
    [ProjectCategory.CEO]: "CEO",
    [ProjectCategory.BAO_HIEM]: "Bảo hiểm",
    [ProjectCategory.GOLF]: "Golf",
    [ProjectCategory.KS_5_SAO]: "Khách sạn 5 sao",
    [ProjectCategory.HIEP_HOI]: "Hiệp hội",
  }
  return sourceLabels[source as ProjectCategory] || source
}
