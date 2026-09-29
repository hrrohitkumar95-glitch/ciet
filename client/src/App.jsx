import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import FloatingWhatsAppButton from "./components/FloatingWhatsAppButton";
import PageLoader from "./components/PageLoader";
import ErrorBoundary from "./components/ErrorBoundary";
import { loadIconMap } from "./utils/helpers";
import { useSite } from "./context/SiteContext";

const Home = lazy(() => import("./pages/Home"));
const Contact = lazy(() => import("./pages/Contact"));
const Legal = lazy(() => import("./pages/Legal"));
const NotFound = lazy(() => import("./pages/NotFound"));

const AdminLayout = lazy(() => import("./admin/AdminLayout"));
const Login = lazy(() => import("./admin/Login"));
const Dashboard = lazy(() => import("./admin/Dashboard"));
const ServicesAdmin = lazy(() => import("./admin/ServicesAdmin"));
const BlogsAdmin = lazy(() => import("./admin/BlogsAdmin"));
const BlogEditor = lazy(() => import("./admin/BlogEditor"));
const GalleryAdmin = lazy(() => import("./admin/GalleryAdmin"));
const MediaAdmin = lazy(() => import("./admin/MediaAdmin"));
const TestimonialsAdmin = lazy(() => import("./admin/TestimonialsAdmin"));
const MessagesAdmin = lazy(() => import("./admin/MessagesAdmin"));
const SettingsAdmin = lazy(() => import("./admin/SettingsAdmin"));

function PageFade({ children }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35 }}
    >
      {children}
    </motion.main>
  );
}

export default function App() {
  const location = useLocation();
  const { site } = useSite();
  const isAdmin = location.pathname.startsWith("/admin");

  useEffect(() => {
    loadIconMap();
  }, []);

  useEffect(() => {
    const seo = site.seo || {};
    const favicon = seo.favicon;
    if (favicon) {
      const link = document.querySelector('link[rel="icon"]');
      if (link) link.href = favicon;
    }
  }, [site.seo]);

  if (isAdmin) {
    return (
      <Suspense fallback={<PageLoader label="Loading admin…" />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="services" element={<ServicesAdmin />} />
              <Route path="blogs" element={<BlogsAdmin />} />
              <Route path="blogs/new" element={<BlogEditor />} />
              <Route path="blogs/:id" element={<BlogEditor />} />
              <Route path="gallery" element={<GalleryAdmin />} />
              <Route path="media" element={<MediaAdmin />} />
              <Route path="testimonials" element={<TestimonialsAdmin />} />
              <Route path="messages" element={<MessagesAdmin />} />
              <Route path="settings" element={<SettingsAdmin />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    );
  }

  return (
    <>
      <ScrollToTop />
      <Header />
      {/* Every public page is lazy-loaded, so they all need a Suspense boundary.
          Without this, client-side navigation to an unloaded route white-screens. */}
      <ErrorBoundary onRetry={() => window.location.reload()}>
        <Suspense fallback={<PageLoader label="Loading page…" />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageFade><Home /></PageFade>} />
              <Route path="/contact" element={<PageFade><Contact /></PageFade>} />
              <Route path="/privacy-policy" element={<PageFade><Legal type="privacy" /></PageFade>} />
              <Route path="/terms" element={<PageFade><Legal type="terms" /></PageFade>} />
              <Route path="*" element={<PageFade><NotFound /></PageFade>} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </ErrorBoundary>
      <Footer />
      <FloatingWhatsAppButton />
    </>
  );
}
