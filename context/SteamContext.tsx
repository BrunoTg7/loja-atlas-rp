"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

interface SteamUser {
  steamId: string;
  steamIdFormatted: string;
  avatar: string;
  personaName: string;
  profileUrl: string;
}

interface SteamContextType {
  user: SteamUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const SteamContext = createContext<SteamContextType>({
  user: null,
  loading: true,
  refresh: async () => {},
});

export function SteamProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SteamUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <SteamContext.Provider value={{ user, loading, refresh }}>
      {children}
    </SteamContext.Provider>
  );
}

export function useSteam() {
  return useContext(SteamContext);
}
