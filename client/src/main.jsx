import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
      gcTime: 1000 * 60 * 5, // 5 minutes cache (formerly cacheTime)
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

// Ensure any initial HTML loader is removed before React mounts
try {
  const loader = document.querySelector('.app-loading');
  if (loader && loader.parentElement) {
    loader.parentElement.removeChild(loader);
  }
} catch (_) { }

ReactDOM.createRoot(document.getElementById('root')).render(
  <RootWrapper>
    {import.meta.env && import.meta.env.PROD ? (console.debug = () => { }, console.info = () => { }, null) : null}
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

// Hide loader once React has mounted
try { window.removeAppLoader && window.removeAppLoader(); } catch (_) { }
