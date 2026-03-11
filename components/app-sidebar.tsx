"use client"
import * as React from "react"
import { IconBuildingAirport, IconBuildingBank, IconCamera, IconChartBar, IconDashboard, IconDatabase, IconFile3d, IconFileAi, IconFileDescription, IconInnerShadowTop, IconListDetails, IconMailbox, IconPhoneCheck, } from "@tabler/icons-react"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, } from "@/components/ui/sidebar"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Thống kê dữ liệu dự án",
      url: "/project-information",
      icon: IconDashboard,
    },
    {
      title: "Dữ liệu khách hàng",
      url: "/data-customer",
      icon: IconListDetails,
    },
    {
      title: "Danh sách dự án",
      url: "/projects",
      icon: IconBuildingBank,
    },
    {
      title: "Danh sách FIle đã import",
      url: "/filemanager",
      icon: IconFile3d,
    },
    {
      title: "Import Excel",
      url: "/data-customer/import-customer",
      icon: IconBuildingAirport,
    },
    {
      title: "Chuyển đổi SDT file Excel",
      url: "/excels",
      icon: IconChartBar,
    },

    {
      title: "Gửi Mail nhiều khách hàng",
      url: "/sendmail",
      icon: IconMailbox,
    },

  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#">
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">Agis Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
