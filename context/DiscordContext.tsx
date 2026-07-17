"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

interface DiscordUser {
  id: string;
  username: string;
  globalName: string | null;
  avatar: string;
}

interface DiscordContextType {
  user: DiscordUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => void;
}

const DiscordContext = createContext<DiscordContextType>({
  user: null,
  loading: true,
  refresh: async () => {},
  logout: () => {},
});

export function DiscordProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/discord/session", { credentials: "same-origin" });
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

  const logout = useCallback(() => {
    setUser(null);
    document.cookie = "s5d5nja52cacubca923e0=; max-age=0; path=/";
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <DiscordContext.Provider value={{ user, loading, refresh, logout }}>
      {children}
    </DiscordContext.Provider>
  );
}

export function useDiscord() {
  return useContext(DiscordContext);
}
