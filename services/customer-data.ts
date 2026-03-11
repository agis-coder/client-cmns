import { CustomerApiResponse } from "@/interfaces/api";
import { CreateCustomerDto, Customer, CustomerUpdateData, ImportResult, ImportType, ProjectsBySourceResponse, SubdivisionsBySourceResponse } from "@/interfaces/customer";
import { SendBulkMailPayload } from "@/interfaces/mail";
import { api } from "@/lib/axios";

export async function fetchAllCustomers(page: number, searchTerm?: string, source?: string, projectId?: string, country?: 'vn' | 'nn', birthday?: 'today' | 'tomorrow', sortByPurchase?: 'most' | 'least', hasEmail?: 'yes' | 'no' | 'all'): Promise<CustomerApiResponse> {

    console.log('source:', source)
    const response = await api.get<CustomerApiResponse>('/customers', {
        params: {
            page,
            pageSize: 500,
            search: searchTerm || undefined,
            source: source || undefined,
            projectId: projectId || undefined,
            country: country || undefined,
            birthday: birthday || undefined,
            sortByPurchase: sortByPurchase || undefined,
            hasEmail: hasEmail || undefined,
        },
    })
    return response.data
}


export async function createCustomer(data: CreateCustomerDto): Promise<any> {
    try {
        const response = await api.post('/customers', data);
        return response.data;
    } catch (error) {
        console.error("Error creating customer:", error);
        throw error;
    }
}

export async function fetchCustomerById(id: string): Promise<Customer | null> {
    try {
        const response = await api.get<Customer>(`/customers/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching customer by ID:", error);
        return null;
    }
}

export async function updateCustomer(id: string, data: CustomerUpdateData): Promise<Customer | null> {
    try {
        const response = await api.patch<Customer>(`/customers/${id}`, data);
        return response.data;
    } catch (error) {
        console.error("Error updating customer:", error);
        throw error; // Ném lỗi để xử lý ở component
    }
}

export async function fetchProjectsBySource(source?: string): Promise<string[]> {
    try {
        const response = await api.get<string[]>("/customers/projects-by-source", { params: { source } })
        return response.data ?? []
    } catch (error) {
        console.error("Error fetching projects by source:", error)
        return []
    }
}

export async function fetchSubdivisionsBySource(investor?: string): Promise<string[]> {
    try {
        const response = await api.get<string[]>("/customers/projects-by-investor", { params: { investor } })
        console.log('response:', response.data)
        return response.data ?? []
    } catch (error) {
        console.error("Error fetching subdivisions:", error)
        return []
    }
}

export async function getListCustomerByProject(project_id: string): Promise<Customer[] | null> {
    try {
        const response = await api.get<Customer[]>(`/projects/${project_id}/customers`);
        if (response.status === 200) {
            return response.data;
        } else {
            return [];
        }
    } catch (error) {
        console.error("Error fetching customers:", error);
        return null;
    }
}

export async function getCustomerProjectUnits(customerId: string, projectId: string) {
    const res = await api.get(`/customers/${customerId}/projects/${projectId}/units`)
    return res.data
}

export async function importCustomersExcel(file: File, type: ImportType = "new-sale"): Promise<ImportResult> {
    try {
        const formData = new FormData()
        formData.append("file", file)
        const response = await api.post<ImportResult>(`/imports/excel/${type}`, formData, { headers: { "Content-Type": "multipart/form-data" } })
        return response.data
    } catch (error: any) {
        const message = error?.response?.data?.message || error?.message || "Import failed"
        const match = message.match(/Row\s+(\d+)/i)
        const row = match ? Number(match[1]) : 0
        return {
            total: 0, success: 0, failed: 1, errors: [{ row, message }],
        }
    }
}

export async function convertPhoneByTool(file: File): Promise<Blob | null> {
    try {
        const formData = new FormData();
        formData.append("file", file);
        const response = await api.post("/tools/convert-phone", formData, {
            headers: { "Content-Type": "multipart/form-data" },
            responseType: "blob",
        });
        return response.data;
    } catch (error: any) {
        console.error("Error converting Excel file:", error);
        return null;
    }
}

export async function convertPhoneMultiByTool(files: File[],): Promise<Blob | null> {
    try {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });
        const response = await api.post('/tools/excel/multi', formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                responseType: 'blob',
            },
        );
        return response.data;
    } catch (error) {
        console.error('Error converting Excel files:', error);
        return null;
    }
}

export async function downloadVideo(url: string): Promise<Blob | null> {
    try {
        const response = await api.post("/tools/download-video", { url }, { responseType: "blob" })
        return response.data
    } catch (error: any) {
        console.error("Error downloading video:", error)
        return null
    }
}

export async function sendBulkMail(payload: SendBulkMailPayload): Promise<{ success: boolean, total: number, messageId?: string }> {
    try {
        const response = await api.post("/mail/send", payload)
        console.log('esponse.data', response.data)
        return response.data
    } catch (error: any) {
        console.error("Error sending bulk mail:", error)
        return {
            success: false,
            total: 0,
        }
    }
}


const VN_KEYWORDS = [
    // 🇻🇳 Quốc gia
    'việt nam', 'viet nam', 'vietnam', 'vn',

    // 🏙️ Thành phố TW
    'hà nội', 'ha noi', 'hn',
    'hồ chí minh', 'ho chi minh', 'tp hcm', 'tphcm', 'hcm', 'sài gòn', 'sai gon',
    'đà nẵng', 'da nang', 'dn',
    'cần thơ', 'can tho',

    // 🌍 Miền Bắc
    'hải phòng', 'hai phong',
    'quảng ninh', 'quang ninh',
    'bắc ninh', 'bac ninh',
    'bắc giang', 'bac giang',
    'vĩnh phúc', 'vinh phuc',
    'phú thọ', 'phu tho',
    'thái nguyên', 'thai nguyen',
    'thái bình', 'thai binh',
    'nam định', 'nam dinh',
    'ninh bình', 'ninh binh',
    'hà nam', 'ha nam',
    'lào cai', 'lao cai',
    'yên bái', 'yen bai',
    'tuyên quang', 'tuyen quang',
    'hà giang', 'ha giang',
    'cao bằng', 'cao bang',
    'bắc kạn', 'bac kan',
    'sơn la', 'son la',
    'điện biên', 'dien bien',
    'lai châu', 'lai chau',
    'hòa bình', 'hoa binh',

    // 🌊 Bắc Trung Bộ
    'thanh hóa', 'thanh hoa',
    'nghệ an', 'nghe an',
    'hà tĩnh', 'ha tinh',
    'quảng bình', 'quang binh',
    'quảng trị', 'quang tri',
    'thừa thiên huế', 'hue',

    // 🌞 Nam Trung Bộ
    'đà lạt', 'da lat', // hay gặp
    'quảng nam', 'quang nam',
    'quảng ngãi', 'quang ngai',
    'bình định', 'binh dinh',
    'phú yên', 'phu yen',
    'khánh hòa', 'khanh hoa',
    'nha trang',
    'ninh thuận', 'ninh thuan',
    'bình thuận', 'binh thuan',

    // 🌴 Tây Nguyên
    'kon tum',
    'gia lai',
    'đắk lắk', 'dak lak',
    'đắk nông', 'dak nong',
    'lâm đồng', 'lam dong',

    // 🌾 Đông Nam Bộ
    'bình dương', 'binh duong',
    'đồng nai', 'dong nai',
    'bà rịa', 'ba ria',
    'vũng tàu', 'vung tau',
    'tây ninh', 'tay ninh',
    'bình phước', 'binh phuoc',

    // 🌊 Tây Nam Bộ (ĐBSCL)
    'an giang',
    'bạc liêu', 'bac lieu',
    'bến tre', 'ben tre',
    'cà mau', 'ca mau',
    'đồng tháp', 'dong thap',
    'hậu giang', 'hau giang',
    'kiên giang', 'kien giang',
    'long an',
    'sóc trăng', 'soc trang',
    'tiền giang', 'tien giang',
    'trà vinh', 'tra vinh',
    'vĩnh long', 'vinh long',
]

export const isVietnamAddress = (text?: string) => {
    if (!text) return false
    const lower = text.toLowerCase()
    return VN_KEYWORDS.some(k => lower.includes(k))
}