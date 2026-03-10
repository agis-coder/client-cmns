import { ColumnDef } from "@tanstack/react-table";

export interface ProjectType {
    id: string;
    project_name: string;
    investor: string;
    project_category?: string;
    source?: string;
    created_at?: string;
    updated_at?: string;
}

export interface ProjectListResponse {
    data: ProjectType[];
    total: number;
    page: number;
    pageSize: number;
}

export interface DataTableProps {
    data: ProjectType[];
    columns: ColumnDef<ProjectType>[];
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onEdit?: (project: ProjectType) => void;
}