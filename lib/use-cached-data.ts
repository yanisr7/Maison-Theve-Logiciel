"use client";

import { useEffect, useRef, useState } from "react";

// Cache mémoire (durée de la session navigateur). Survit à la navigation SPA :
// revenir sur une page déjà vue l'affiche instantanément, puis revalide en fond
// (pattern stale-while-revalidate). Les mutations se corrigent à la revalidation.
const memoryCache = new Map<string, unknown>();

export function invalidateCache(prefix?: string) {
  if (!prefix) {
    memoryCache.clear();
    return;
  }
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) memoryCache.delete(key);
  }
}

/**
 * Charge des données avec cache mémoire + revalidation en arrière-plan.
 * - `key` null → ne charge rien (data null, loading false).
 * - cache plein → `data` immédiat (pas de squelette), revalidation silencieuse.
 * - cache vide → `loading` true (afficher un squelette).
 */
export function useCachedData<T>(
  key: string | null,
  fetcher: () => Promise<T>
): { data: T | null; loading: boolean; refreshing: boolean } {
  const initial =
    key && memoryCache.has(key) ? (memoryCache.get(key) as T) : null;
  const [data, setData] = useState<T | null>(initial);
  const [loading, setLoading] = useState<boolean>(initial === null && key !== null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    if (!key) {
      setData(null);
      setLoading(false);
      return;
    }
    let active = true;
    const cached = memoryCache.has(key);
    if (cached) {
      setData(memoryCache.get(key) as T);
      setLoading(false);
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    fetcherRef.current()
      .then((res) => {
        if (!active) return;
        memoryCache.set(key, res);
        setData(res);
      })
      .catch(() => {
        /* garde la donnée en cache en cas d'échec */
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
        setRefreshing(false);
      });
    return () => {
      active = false;
    };
  }, [key]);

  return { data, loading, refreshing };
}
