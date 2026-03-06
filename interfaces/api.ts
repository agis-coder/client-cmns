import { Customer } from "./customer";

export interface CustomerApiResponse {
    page: number
    pageSize: number
    total: number
    totalPages: number
    data: Customer[]
}