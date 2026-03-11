// app/project-information/page.tsx
import { ProjectBrowser } from "@/components/project-information/table"
import { getProjectsByCategory } from "@/services/project-data"
import { ProjectCategory } from "@/interfaces/project-category"

export default async function Page() {
    const initialCategory = ProjectCategory.BĐS

    const initialData = await getProjectsByCategory(initialCategory)

    return (
        <ProjectBrowser
            initialCategory={initialCategory}
            initialData={initialData}
        />
    )
}
