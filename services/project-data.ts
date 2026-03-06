// project-data.ts
import { InvestorData, ProjectCategory } from "@/interfaces/project-category";
import { api } from "@/lib/axios";

export interface Project {
    id: string;
    project_name: string;
    investor?: string;
}

export interface ProjectListResponse {
    data: Project[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export async function getProjects(
    page = 1,
    pageSize = 20,
    search?: string
): Promise<ProjectListResponse> {
    const params: Record<string, any> = { page, pageSize };
    if (search) params.search = search;

    const res = await api.get("/projects", { params });
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

export async function updateProject(id: string, payload: Partial<Project>): Promise<Project> {
    const res = await api.put(`/projects/${id}`, payload);
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