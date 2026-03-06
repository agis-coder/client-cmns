// src/services/filemanager-data.ts
import { api } from "@/lib/axios";

export type ImportStatus = "imported" | "temp_deleted";

export interface ImportFileItem {
    id: string;
    file_name: string;
    status: ImportStatus;
    imported_at: string;
    customer_count?: number;
    new_sale_count?: number;
    transfer_count?: number;
}

export interface ImportFileResponse {
    data: ImportFileItem[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        total_page: number;
    };
}

interface GetImportFilesParams {
    page?: number;
    limit?: number;
    status?: ImportStatus;
}

/**
 * Lấy danh sách file import
 */
export const getImportFiles = async (
    params: GetImportFilesParams = {},
): Promise<ImportFileResponse> => {
    const res = await api.get<ImportFileResponse>("/filemanager", {
        params,
    });

    return res.data;
};
