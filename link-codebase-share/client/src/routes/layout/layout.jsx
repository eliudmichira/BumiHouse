import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import SimpleFooter from "../../components/footer/SimpleFooter";
import { Navigate, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PageLoader from "../../components/Preloader";

function Layout() {
  const location = useLocation();
  
  // Pages that should use simple footer (agents page)
  const useSimpleFooter = location.pathname.includes("/agents");
  
  return (
    <div className="layout min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white transition-colors duration-300">  
      <div className="navbar">
        <Navbar />
      </div>
      <div className="content">
        <Outlet />
      </div>
      {useSimpleFooter ? <SimpleFooter /> : <Footer />}
    </div>
  );
}

function RequireAuth() {
  const { currentUser, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return <PageLoader text="Loading..." />;
  }

  // Redirect to login if not authenticated
  return !currentUser ? (
    <Navigate to="/desktop/login" replace />
  ) : (
    <div className="layout min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white transition-colors duration-300">  
      <div className="navbar">
        <Navbar />
      </div>  
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}

export { Layout, RequireAuth };