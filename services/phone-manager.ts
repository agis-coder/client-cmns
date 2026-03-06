// services/phone-manager.ts
import { api } from "@/lib/axios"

export const fetchDevices = async (
    search?: string,
    searchType: "all" | "sdt" | "tenZalo" | "tenThietBi" = "all"
) => {
    if (!search) {
        const res = await api.get("/devices")
        return res.data
    }

    const params: any = {}

    if (searchType === "all") {
        params.sdt = search
        params.tenZalo = search
        params.tenThietBi = search
    } else {
        params[searchType] = search
    }

    const res = await api.get("/devices", { params })
    return res.data
}
