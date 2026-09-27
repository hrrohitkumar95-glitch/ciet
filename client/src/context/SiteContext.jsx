import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api/client";

const SiteContext = createContext(null);

export function SiteProvider({ children }) {
  const [site, setSite] = useState({
    general: {}, homepage: {}, about: {}, seo: {},
    services: [], testimonials: [], gallery: [], blogs: [], galleryCategories: [],
  });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get("/public/site");
      setSite({ ...site, ...data });
      setLoading(false);
    } catch {
      // keep loading true; keep defaults so UI knows data isn't ready
    }
  }, []);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <SiteContext.Provider value={{ site, loading, refresh }}>{children}</SiteContext.Provider>;
}

export function useSite() {
  return useContext(SiteContext);
}
