import { useState } from "react"
import { Home, FileText, Heart, User, Settings } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

const items = [
  { title: "홈", url: "/", icon: Home },
  { title: "프롬프트 라이브러리", url: "/", icon: FileText },
]

interface AppSidebarProps {
  currentUser?: string | null
  viewFilter: 'all' | 'my' | 'liked'
  onViewFilterChange: (filter: 'all' | 'my' | 'liked') => void
  onLoginClick: () => void
}

export function AppSidebar({ currentUser, viewFilter, onViewFilterChange, onLoginClick }: AppSidebarProps) {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const collapsed = state === "collapsed"

  const isActive = (path: string) => currentPath === path
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50"

  return (
    <Sidebar
      className={collapsed ? "w-14" : "w-60"}
      collapsible="icon"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {!collapsed && "🏢 HS본부 프롬프트"}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {currentUser && (
          <SidebarGroup>
            <SidebarGroupLabel>
              {!collapsed && "필터"}
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => onViewFilterChange(viewFilter === 'my' ? 'all' : 'my')}
                    className={viewFilter === 'my' ? 'bg-muted text-primary font-medium' : 'hover:bg-muted/50'}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    {!collapsed && <span>내 프롬프트</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => onViewFilterChange(viewFilter === 'liked' ? 'all' : 'liked')}
                    className={viewFilter === 'liked' ? 'bg-muted text-primary font-medium' : 'hover:bg-muted/50'}
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    {!collapsed && <span>좋아요한 프롬프트</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {!currentUser && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={onLoginClick}>
                    <User className="mr-2 h-4 w-4" />
                    {!collapsed && <span>로그인</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  )
}