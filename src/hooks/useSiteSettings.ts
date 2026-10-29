import { useEffect, useState } from 'react';
import { fetchSiteSettings } from '@/services/catalog';
import type { SiteSettings } from '@/types';
import { DEMO_SETTINGS } from '@/data/demoData';

let cache: SiteSettings | null = null;

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(cache ?? DEMO_SETTINGS);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (cache) return;
    fetchSiteSettings().then(s => {
      cache = s;
      setSettings(s);
      setLoading(false);
    });
  }, []);

  return { settings, loading };
}
