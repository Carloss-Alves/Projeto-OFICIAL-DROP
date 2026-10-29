import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface FavoritesContextValue {
  ids: Set<string>;
  toggle: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);
const STORAGE_KEY = 'asfalto:favorites';

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return new Set(raw ? (JSON.parse(raw) as string[]) : []);
    } catch {
      return new Set();
    }
  });
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUserId(session?.user?.id ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Usuário logado -> sincroniza com a tabela `favorites`. Visitante -> localStorage.
  useEffect(() => {
    if (!isSupabaseConfigured || !userId) return;
    supabase.from('favorites').select('product_id').eq('user_id', userId).then(({ data }) => {
      if (data) setIds(new Set(data.map(r => r.product_id)));
    });
  }, [userId]);

  useEffect(() => {
    if (!userId) localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  }, [ids, userId]);

  async function toggle(productId: string) {
    const has = ids.has(productId);
    const next = new Set(ids);
    has ? next.delete(productId) : next.add(productId);
    setIds(next);

    if (isSupabaseConfigured && userId) {
      if (has) {
        await supabase.from('favorites').delete().eq('user_id', userId).eq('product_id', productId);
      } else {
        await supabase.from('favorites').insert({ user_id: userId, product_id: productId });
      }
    }
  }

  return (
    <FavoritesContext.Provider value={{ ids, toggle, isFavorite: id => ids.has(id) }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites deve ser usado dentro de <FavoritesProvider>');
  return ctx;
}
