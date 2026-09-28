import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api/client";

const SiteContext = createContext(null);

export function SiteProvider({ children }) {
  const [site, setSite] = useState({
    general: {}, homepage: {}, about: {}, seo: {},
    services: [], testimonials: [], gallery: [], blogs: [], galleryCategories: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refresh = useCallback(async () => {
    setError(false);
    try {
      const { data } = await api.get("/public/site");
      setSite((prev) => ({ ...prev, ...data }));
      return true;
    } catch {
      // Site data is optional: pages must still render from defaults.
      setError(true);
      return false;
    } finally {
      // Always settle, so a failed request can never leave a permanent spinner.
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return <SiteContext.Provider value={{ site, loading, error, refresh }}>{children}</SiteContext.Provider>;
}

export function useSite() {
  return useContext(SiteContext);
}
