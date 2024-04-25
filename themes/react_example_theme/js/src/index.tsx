import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Outlet, Link, Routes, Route, createBrowserRouter, RouterProvider } from "react-router-dom";
import { Button, Layout, Menu, message } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import './App.css';
import Clients from './routes/Clients/List'
import EditClient from './routes/Clients/Edit';
import ShowClient from './routes/Clients/Show'
import ClientCreate from './routes/Clients/Create'
import Inventory from './routes/Inventory/List';
import Technicians from './routes/Technicians/List';
import ShowTechnician from './routes/Technicians/Show';
import EditTechnician from './routes/Technicians/Edit'
import { resources } from "./config/resources";
import { Provider } from 'react-redux'
import store from './store/store'
import routerBindings, {
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";
import { App as AntdApp } from "antd";
import { SideBar } from './components/SideBar';
import { Refine } from '@refinedev/core';
import { ThemedLayoutV2, ThemedSiderV2 } from '@refinedev/antd';
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { Header } from "./components/header";
import { ColorModeContextProvider } from './contexts/color-mode';
import InventoryCreate from './routes/Inventory/Create';
import EditInventory from './routes/Inventory/Edit';
const { Content, Footer, Sider } = Layout;

function App() {
  const [userLoggedIn, setUserLoggedIn] = useState(false)
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/current-user');

      if (response.ok) {
        const json = await response.json(); // This should have 'await' since response.json() returns a promise
        const user = json.map((user: any) => ({
          name: `${user.field_first_name[0].value} ${user.field_last_name[0].value}`,
          image: user.user_picture[0].url,
          uuid: user.uuid[0].value,
          role: user.roles[0].target_id
        }));

        if (user[0].role && user[0].role === "administrator") {
          setAdminLoggedIn(true);
        }
      } else {
        console.error('HTTP error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Fetch error:', message.error);
    }
  }

  const filteredResources = resources.filter(resource => {
    if (!adminLoggedIn && resource.name === "technicians") {
      return false
    }
    return true
  })

  
  useEffect(() => {
    fetchCurrentUser()
  }, [])
  console.log(resources, " i am resources")

  return (
    <Refine
      Title={({ collapsed }) => (
        <div>
          {collapsed ? <strong>Defender CRM</strong> : <strong>Defender CRM</strong>}

        </div>
      )}
      resources={filteredResources}
    >
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <AntdApp>
            <Router>
              <Layout>
                <Layout className="site-layout">
                  <Content  >
                    <Routes>
                      <Route
                        element={
                          <ThemedLayoutV2
                            Header={() => <Header sticky />}
                            Sider={(props) => <ThemedSiderV2 {...props} />}
                          >
                            <Outlet />
                          </ThemedLayoutV2>
                        }
                      >
                        {userLoggedIn ? (<Route
                          index
                          element={<NavigateToResource resource="clients" />}
                        />) : null}

                        <Route path="/clients" element={<Clients />} />
                        <Route path="/clients/edit/:clientId" element={<EditClient />} />
                        <Route path="/clients/create" element={<ClientCreate />} />
                        <Route path="/clients/show/:clientId" element={<ShowClient />} />
                        <Route path="/inventory" element={<Inventory />} />
                        <Route path="/inventory/create" element={<InventoryCreate />} />
                        <Route path="/inventory/edit/:inventoryId" element={<EditInventory />} />
                        {adminLoggedIn ? (
                          <>
                            <Route path="/technicians" element={<Technicians />} />
                            <Route path="/technicians/show/:technicianId" element={<ShowTechnician />} />
                            <Route path="/technicians/edit/:clientId" element={<EditTechnician />} />
                          </>
                        ) : null}

                      </Route>
                    </Routes>
                  </Content>
                  {/* <Footer style={{ textAlign: 'center' }}>Ant Design ©2018 Created by Ant UED</Footer> */}
                </Layout>
              </Layout>
            </Router>
          </AntdApp>
        </ColorModeContextProvider>

      </RefineKbarProvider>


    </Refine>

  )
}

// Get the container for your app
const container = document.getElementById('react-app');

// Check if the container exists to avoid null errors
if (container) {
  // Create a root
  const root = ReactDOM.createRoot(container);

  // Render the Main component
  root.render(
    <App />
  );
} else {
  console.error('Failed to find the root element');
}

