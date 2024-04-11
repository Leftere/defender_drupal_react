// Sidebar.tsx
import React from 'react';
import { CalendarOutlined, DashboardOutlined, ShoppingCartOutlined, ToolOutlined, UserOutlined } from "@ant-design/icons";
interface SidebarProps {
  // Define any props here. For example:
  isVisible: boolean;
}

export const SideBar = [
    {
        title:"Dashboard",
        path: "/",
        icon: <DashboardOutlined /> 
        },
    {
        title:"Clients",
        path: "/clients",
        icon: <UserOutlined />
    },
    {
        title:"Inventory",
        path: "/inventory",
        icon: <ShoppingCartOutlined />
    },

]

