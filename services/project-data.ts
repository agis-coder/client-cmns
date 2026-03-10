// project-data.ts
import { InvestorData, ProjectCategory } from "@/interfaces/project-category";
import { api } from "@/lib/axios";
import { ColumnDef } from "@tanstack/react-table";

// interfaces/project.ts
export interface Project {
    id: string;
    project_name: string;
    investor?: string | null;
    category?: string;
    source?: string; // Thêm trường nguồn
    created_at?: string;
    updated_at?: string;
}

export interface ProjectListResponse {
    data: Project[];
    total: number;
    page: number;
    pageSize: number;
}

export interface DataTableProps {
    data: Project[];
    columns: ColumnDef<Project>[];
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onEdit: (project: Project) => void;
}

export async function getProjects(
    page = 1,
    pageSize = 20,
    search?: string,
    category?: string,
    investor?: string
): Promise<ProjectListResponse> {
    const params: Record<string, any> = { page, pageSize };
    if (search) params.search = search;
    if (category) params.category = category;
    if (investor) params.investor = investor;

    const res = await api.get("/projects", { params });

    const transformedData = {
        ...res.data,
        data: res.data.data.map((p: any) => ({
            ...p,
            investor: p.investor ?? ""
        }))
    };

    return transformedData;
}

export async function updateProject(id: string, data: Partial<Project>): Promise<Project> {
    const res = await api.patch(`/projects/${id}`, data);
    return res.data;
}

export async function updateProjectDetail(id: string, data: any) {
    const res = await api.patch(`/projects/projectDetail/${id}`, data);
    return res.data;
}


export async function getProjectById(id: string): Promise<Project> {
    const res = await api.get(`/projects/${id}`);
    return res.data;
}

export async function createProject(payload: Partial<Project>): Promise<Project> {
    const res = await api.post("/projects", payload);
    return res.data;
}

export async function deleteProject(id: string): Promise<{ message: string }> {
    const res = await api.delete(`/projects/${id}`);
    return res.data;
}



export async function getProjectsByCategory(
    category: ProjectCategory
): Promise<InvestorData[]> {
    const res = await api.get<InvestorData[]>('/projects/investors', {
        params: { category },
    });

    return res.data;
}