export interface Customer {
    gender: string
    id: string
    // Thông tin dự án
    project_name: string
    product_type: string
    area_zone?: string // Phân khu
    apartment_code?: string // Mã căn
    floor_row?: string // Tầng/dãy
    apartment_number?: string // Căn số
    land_area?: string // Diện tích đất/Diện tích tim tường
    built_area?: string // Diện tích sàn xây dựng/Diện tích thông thủy
    door_direction?: string // Hướng cửa
    view?: string
    contract_price: number // Giá gốc trên hợp đồng
    transaction_date?: string // Giao dịch ngày
    source_from?: string // Nguồn từ đâu
    source_detail?: string // Chi tiết nguồn
    legal_status?: string // Pháp lý

    // Thông tin khách hàng
    customer_photo?: string // Ảnh khách hàng
    customer_name: string
    date_of_birth: string
    phone_number: string
    cccd: string
    email: string
    address: string // Địa chỉ liên hệ
    permanent_address: string // Địa chỉ thường trú
    living_area: string // Khu vực sinh sống
    current_property_type?: string // Loại sản phẩm đang ở
    nationality?: string // Quốc tịch
    marital_status?: string // Tình trạng hôn nhân
    hobbies?: string // Sở thích
    total_assets?: string // Tổng tài sản
    business_field?: string // Lĩnh vực kinh doanh
    zalo_status?: string // Tình trạng Zalo
    facebook?: string // Facebook

    // Thông tin người thân
    relative_relationship?: string // Mối quan hệ
    relative_name?: string // Họ và tên người thân
    relative_dob?: string // Ngày tháng năm sinh người thân
    relative_phone?: string // Số phone người thân
    relative_note?: string // Ghi chú người thân

    // Tương tác thứ cấp
    secondary_first_interaction?: string // Tương tác lần đầu (thứ cấp)
    secondary_last_interaction?: string // Tương tác gần nhất (thứ cấp)
    secondary_result?: string // Kết quả (thứ cấp)
    expected_sale_price?: string // Giá bán kỳ vọng (thứ cấp)
    expected_rent_price?: string // Giá cho thuê kỳ vọng (thứ cấp)
    secondary_note?: string // Ghi chú (thứ cấp)

    // Tương tác sơ cấp
    primary_first_interaction?: string // Tương tác lần đầu (sơ cấp)
    primary_last_interaction?: string // Tương tác gần nhất (sơ cấp)
    primary_project_offer?: string // Dự án đang chào (sơ cấp)
    primary_result?: string // Kết quả (sơ cấp)
    primary_note?: string // Ghi chú (sơ cấp)

    // Thông tin đại lý và sale
    agent_name?: string // Tên đại lý
    external_sale_name?: string // Tên sale ngoài
    external_sale_phone?: string // Số phone sale ngoài
    external_sale_email?: string // Email sale ngoài
    employee_code?: string // Mã số nhân viên
    sale_name?: string // Tên sale
    sale_phone?: string // Số phone sale
    sale_email?: string // Email sale
    lead_received_time?: string // Thời gian nhận được lead để chăm

    contract_type: 'DEPOSIT'
}

// interfaces/customer.ts
export interface Customer {
    id: string
    customer_name: string
    phone_number: string
    email: string
    isVip: boolean
    level: number
    address: string
    project_count?: number,
    relatives?: Array<{
        relative_name: string
        relationship: string
        note?: string
    }> | string
    projects?: Array<{
        project_name: string
        contract_price: string
        type: 'new_sale' | 'transfer'
        result: string
        first_interaction: string
        closest_interaction: string
        employee_name: string
        outside_sale_name: string
        address: string
        floor: string
        source?: string // Thêm source vào đây
    }> | string
}
export interface ExtendedCustomer extends Customer {
    relatives?: any[]
    projects?: any[]
    projectSources: string[]
}

export interface DataTableProps {
    data: Customer[]
}

export const CITY_ALIAS: Record<string, string> = {
    HCM: "TP Hồ Chí Minh",
    HN: "Hà Nội",
    DN: "Đà Nẵng",
}

export type ImportType = "new-sale" | "transfer"

export interface ImportError {
    row: number
    message: string
}

export interface ImportResult {
    total: number
    success: number
    failed: number
    errors: ImportError[]
}

export interface ProjectsBySourceResponse {
    projects: string[];
}

export interface SubdivisionsBySourceResponse {
    source: string
    subdivisions: string[]
}

export interface ExtendedCustomer extends Customer {
    // Thêm các field mở rộng nếu cần
    projects?: any[]
}

// interfaces/customer.ts
export interface CustomerUpdateData {
    customer_name?: string
    phone_number?: string
    date_of_birth?: string | null
    cccd?: string | null
    email?: string | null
    gender?: string | null
    address?: string | null
    permanent_address?: string | null
    living_area?: string | null
    the_product_type?: string | null
    nationality?: string | null
    marital_status?: string | null
    business_field?: string | null
    isVip?: boolean | null
}