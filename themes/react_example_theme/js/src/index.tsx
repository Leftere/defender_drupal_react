import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Outlet, Link, Routes, Route, createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout, Menu } from 'antd';
import { DesktopOutlined, FileOutlined, PieChartOutlined } from '@ant-design/icons';
import './App.css';
import Clients from './routes/Clients/List'
import EditClient from './routes/Clients/Edit';
import ShowClient from './routes/Clients/Show'
import Inventory from './routes/Inventory';
import { Provider } from 'react-redux'
import store from './store/store'

import { SideBar } from './components/SideBar';
const { Header, Content, Footer, Sider } = Layout;

function App() {
  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider collapsible style={{ backgroundColor: "#fff" }}>

          <div className="demo-logo-vertical" style={{ textAlign: "center", padding: "1rem" }}>Defender </div>
          <Menu defaultSelectedKeys={['1']} mode="inline">
            {SideBar.map((item, index) => {
              return(
                <Menu.Item key={index} icon={item.icon}>
                <Link to={item.path}>{item.title}</Link>
              </Menu.Item>
              )
            })}
           

          </Menu>
        </Sider>
        <Layout className="site-layout">

          <Header className="site-layout-background" style={{ padding: 0, backgroundColor: "#fff", height: "45px" }} />
          <Content style={{ margin: '0 16px' }}>
            <Routes>
              <Route path="/clients" element={<Clients />} />
              <Route path="/edit/:clientId" element={<EditClient />} />
              <Route path="/clients/show/:clientId" element={<ShowClient />} />
              <Route path="/inventory" element={<Inventory />} />
            </Routes>
          </Content>
          <Footer style={{ textAlign: 'center' }}>Ant Design ©2018 Created by Ant UED</Footer>
        </Layout>
      </Layout>
    </Router>
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

