import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Council from './pages/Council';
import Festival from './pages/Festival';
import Marketplace from './pages/Marketplace';
import Skills from './pages/Skills';
import Donate from './pages/Donate';
import Contact from './pages/Contact';
import Report from './pages/Report';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import Events from './pages/Events';
import EventsDetail from './pages/EventsDetail';

import Directory from './pages/Directory';
import Suggestions from './pages/Suggestions';

// Admin Imports
import Login from './pages/Admin/Login';
import Dashboard from './pages/Admin/Dashboard';
import Submissions from './pages/Admin/Submissions';
import AdminNews from './pages/Admin/AdminNews';
import AdminEvents from './pages/Admin/AdminEvents';
import AdminMarket from './pages/Admin/AdminMarket';
import AdminProjects from './pages/Admin/AdminProjects';
import AdminDirectory from './pages/Admin/AdminDirectory';
import AdminSuggestions from './pages/Admin/AdminSuggestions';
import AdminAlerts from './pages/Admin/AdminAlerts';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';


import { ToastProvider } from './context/ToastContext';

function App() {
  // Build-time mode detection for hosting separation
  const mode = import.meta.env.VITE_APP_MODE; // 'ADMIN' or 'PUBLIC'
  const isAdminBuild = mode === 'ADMIN';
  const isPublicBuild = mode === 'PUBLIC';

  return (
    <Router>
      <ToastProvider>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen font-body">
          <Routes>
            {/* Public Routes - Rendered if not an Admin-only build */}
            {!isAdminBuild && (
              <Route element={
                <>
                  <Navbar />
                  <Outlet />
                  <Footer />
                </>
              }>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/council" element={<Council />} />
                <Route path="/festival" element={<Festival />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/directory" element={<Directory />} />
                <Route path="/suggestions" element={<Suggestions />} />
                <Route path="/donate" element={<Donate />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/skills" element={<Skills />} />
                <Route path="/report" element={<Report />} />
                <Route path="/news" element={<News />} />
                <Route path="/news/:id" element={<NewsDetail />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/:id" element={<EventsDetail />} />
              </Route>
            )}

            {/* Admin Routes - Rendered if not a Public-only build */}
            {!isPublicBuild && (
              <Route>
                <Route path="/admin/login" element={<Login />} />
                <Route path="/admin" element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Dashboard />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="submissions" element={<Submissions />} />
                  <Route path="news" element={<AdminNews />} />
                  <Route path="events" element={<AdminEvents />} />
                  <Route path="market" element={<AdminMarket />} />
                  <Route path="projects" element={<AdminProjects />} />
                  <Route path="directory" element={<AdminDirectory />} />
                  <Route path="suggestions" element={<AdminSuggestions />} />
                  <Route path="alerts" element={<AdminAlerts />} />
                </Route>
              </Route>
            )}

            {/* Fallback for Mode mismatch */}
            {(isAdminBuild || isPublicBuild) && (
              <Route path="*" element={
                <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
                  <h1 className="text-4xl font-black text-afife-accent mb-4">404</h1>
                  <p className="text-gray-500">The page you are looking for is not available in this portal view.</p>
                  <Link to={isAdminBuild ? "/admin" : "/"} className="mt-6 text-afife-primary font-bold hover:underline">
                    Back to {isAdminBuild ? "Dashboard" : "Home"}
                  </Link>
                </div>
              } />
            )}
          </Routes>
        </div>
      </ToastProvider>
    </Router>
  );
}

export default App;
