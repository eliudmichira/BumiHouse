import React from 'react'
import ReactDOM from 'react-dom/client'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import App from './App.jsx'
import "./index.css"
import { AuthProvider } from './context/AuthContext.jsx'
import { SocketContextProvider } from './context/SocketContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import 'leaflet/dist/leaflet.css';
import { initializeCleanup } from './utils/clearCache';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute fresh
      cacheTime: 1000 * 60 * 5, // 5 minutes cache
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
    }
  }
}); 


const RootWrapper = ({ children }) => {
  if (import.meta.env && import.meta.env.DEV) {
    return children;
  }
  return <React.StrictMode>{children}</React.StrictMode>;
};

// Initialize cleanup
initializeCleanup();

ReactDOM.createRoot(document.getElementById('root')).render(
  <RootWrapper>
    {import.meta.env && import.meta.env.PROD ? (console.debug = () => {}, console.info = () => {}, null) : null}
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SocketContextProvider>
            <App />
          </SocketContextProvider>    
        </AuthProvider>   
      </QueryClientProvider>  
    </ThemeProvider>
  </RootWrapper>,
)
