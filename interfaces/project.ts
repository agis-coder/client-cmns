export interface ProjectType {
    id: string;
    project_name: string;
    investor: string;
}

export interface ColumnType {
    key: string;
    label: string;
}

export interface DataTableProps {
    data: ProjectType[];
    columns?: ColumnType[];  // cho phép truyền columns
    page?: number;
    pageSize?: number;
    total?: number;
    onPageChange?: (page: number) => void;
}