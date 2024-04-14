import { CalendarOutlined, DashboardOutlined, ShoppingCartOutlined, ToolOutlined, UserOutlined } from "@ant-design/icons";
import { IResourceItem } from "@refinedev/core";
import React from 'react';

export const resources: IResourceItem[] = [
    // {
    //   name: "blog_posts",
    //   list: "/blog-posts",
    //   create: "/blog-posts/create",
    //   edit: "/blog-posts/edit/:id",
    //   show: "/blog-posts/show/:id",
    //   meta: {
    //     canDelete: true,
    //   },
    // },
    {
        name: "dashboard",
        list: "/dashboard",
        // create: "/dashboard/create",
        // edit: "/dashboard/edit/:id",
        // show: "/dashboard/show/:id",
        options: {label: "Dashboard"},
        icon: <DashboardOutlined />,
        meta: {
          canDelete: true,
        },
      },
    {
      name: "clients",
      list: "/clients",
      // create: "/clients/create",
      // edit: "/clients/edit/:id",
      // show: "/clients/show/:id",
      icon: <UserOutlined />,
      meta: {
        canDelete: true,
      },
    },
    {
        name: "technicians",
        list: "/technicians",
        // create: "/technicians/create",
        // edit: "/technicians/edit/:id",
        // show: "/technicians/show/:id",
        icon: <ToolOutlined />,
        meta: {
          canDelete: true,
        },
      },
      {
        name: "inventory",
        list: "/inventory",
        // create: "/inventory/create",
        // edit: "/inventory/edit/:id",
        // show: "/inventory/show/:id",
        icon: <ShoppingCartOutlined />,
        options: {label: "Inventory"},
        meta: {
          canDelete: true,
        },
      },
    {
      name: "appointments",
      list: "/appointments",
      // create: "/appointments/create",
      // edit: "/appointments/edit/:id",
      // show: "/appointments/show/:id",
      icon: <CalendarOutlined />, 
      meta: {
        canDelete: true,
      },
    },
    // {
    //   name: "categories",
    //   list: "/categories",
    //   create: "/categories/create",
    //   edit: "/categories/edit/:id",
    //   show: "/categories/show/:id",
    //   meta: {
    //     canDelete: true,
    //   },
    // },
  ]