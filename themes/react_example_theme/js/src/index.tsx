import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Outlet, Link, Routes, Route, createBrowserRouter, RouterProvider } from "react-router-dom";
import { Button, Layout, Menu } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import './App.css';
import Clients from './routes/Clients/List'
import EditClient from './routes/Clients/Edit';
import ShowClient from './routes/Clients/Show'
import ClientCreate from './routes/Clients/Create'
import Inventory from './routes/Inventory';
import { resources } from "./config/resources";
import { Provider } from 'react-redux'
import store from './store/store'
import { App as AntdApp } from "antd";
import { SideBar } from './components/SideBar';
import { Refine } from '@refinedev/core';
import { ThemedLayoutV2, ThemedSiderV2 } from '@refinedev/antd';
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { Header } from "./components/header";
import { ColorModeContextProvider } from './contexts/color-mode';
const { Content, Footer, Sider } = Layout;

function App() {


  return (
    <Refine
    Title={({ collapsed }) => (
      <div>
          {collapsed ? <strong>Defender CRM</strong>:  <strong>Defender CRM</strong> }
        
      </div>
  )}
      resources={resources}
    >
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <AntdApp>
            <Router>
              <Layout>
                <Layout className="site-layout">
                  <Content>
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
                        <Route path="/clients" element={<Clients />} />
                        <Route path="/clients/edit/:clientId" element={<EditClient />} />
                        <Route path="/clients/create" element={<ClientCreate />} />
                        <Route path="/clients/show/:clientId" element={<ShowClient />} />
                        <Route path="/inventory" element={<Inventory />} />
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

