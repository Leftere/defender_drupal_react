import React from 'react'
import ReactDOM from 'react-dom/client'
import { GitHubBanner, Refine } from "@refinedev/core";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { ColorModeContextProvider } from "./contexts/color-mode";
import { App as AntdApp } from "antd";

import {
  ErrorComponent,
  ThemedLayoutV2,
  ThemedSiderV2,
  useNotificationProvider,
} from "@refinedev/antd";
// import "@refinedev/antd/dist/reset.css";
// import "./styles/fc.css";
import routerBindings, {
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";
import dataProvider from "@refinedev/simple-rest";
import { resources } from "./config/resources";
import { Header } from "./components/header";
import { 
  ClientsList,
  ClientShow,
  ClientsEdit,
  ClientCreate
} from "./pages/clients";
/* Import Components */
// import DrupalProjectStats from './components/DrupalProjectStats';
// import NodeListOnly from "./components/NodeListOnly";
// import NodeReadWrite from "./components/NodeReadWrite";

// Define Main as a functional component
function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <AntdApp>
            <Refine
              Title={({ collapsed }) => (
                <div>
                  {collapsed ?
                    // <img src={logo} alt="Logo" />
                    <strong>Defender CRM</strong>
                    : <strong>Defender CRM</strong>}

                </div>
              )}
              // dataProvider={dataProvider("https://api.fake-rest.refine.dev")}
              dataProvider={dataProvider("https://defender-crm-dfcc459abdc0.herokuapp.com")}
              // dataProvider={dataProvider("https://defender-crm-dfcc459abdc0.herokuapp.com")}
              notificationProvider={useNotificationProvider}
              routerProvider={routerBindings}
              resources={resources}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                useNewQueryKeys: true,
                projectId: "zUo54W-jLbwib-H5rOju",
              }}
            >
              <Routes>
                <Route
                  element={
                    // <h1>Hello </h1>
                    <ThemedLayoutV2
                      Header={() => <Header sticky />}
                      Sider={(props) => <ThemedSiderV2 {...props}  />}
                    >
                      <Outlet />
                    </ThemedLayoutV2>
                  }
                >
                  <Route
                    index
                    element={<NavigateToResource resource="clients" />}
                  />

                  <Route path="/clients">
                    <Route index element={<ClientsList />} />
                    <Route path="create" element={<ClientCreate />} />
                    <Route path="edit/:id" element={<ClientsEdit />} />
                    <Route path="show/:id" element={<ClientShow />} />
                  </Route>
                </Route>
              </Routes>

            </Refine>

          </AntdApp>

        </ColorModeContextProvider>

      </RefineKbarProvider>

    </BrowserRouter>

  )
}

// Get the container for your app
const container = document.getElementById('react-app');

// Check if the container exists to avoid null errors
if (container) {
  // Create a root
  const root = ReactDOM.createRoot(container);

  // Render the Main component
  root.render(<App />);
} else {
  console.error('Failed to find the root element');
}

