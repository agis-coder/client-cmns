export interface Device {
    id: number
    tenThietBi: string
    phones: {
        id: number
        sdt: string
        nhaMang: string
        soTien: number
    }[]
    emails: {
        id: number
        email: string
        password: string
        verified: boolean
    }[]
    zalos: {
        id: number
        tenZalo: string
        sdtDangKy: string
        trangThai: string
        chayAkaabiz: boolean
    }[]
    fbs: {
        id: number
        tenFacebook: string
        email: string
        trangThai: string
    }[]
}
