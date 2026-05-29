import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import SimpleFooter from "../../components/footer/SimpleFooter";
import { Navigate, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PageLoader from "../../components/Preloader";

function Layout() {
  const location = useLocation();
  const hideNavbar = ["/login", "/register", "/properties"].some(path => location.pathname.startsWith(path));
  
  // Pages that should not have footers
  const hideFooter = [
    "/login",
    "/register", 
    "/properties",
    "/property",
    "/account",
    "/dashboard",
    "/messages",
    "/properties/add",
    "/admin",
    "/privacy",
    "/terms",
    "/cookies"
  ].some(path => location.pathname.startsWith(path));

  // Pages that should use simple footer
  const useSimpleFooter = location.pathname.startsWith("/agents");
  
  return (
    <div className="layout min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white transition-colors duration-300">  
      {!hideNavbar && (
        <div className="navbar">
          <Navbar />
        </div>
      )}
      <div className={hideNavbar ? "content no-padding-top" : hideFooter ? "content no-padding-top" : "content pb-0"}>
        <Outlet />
      </div>
      {!hideFooter && (useSimpleFooter ? <SimpleFooter /> : <Footer />)}
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
    <Navigate to="/login" replace />
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