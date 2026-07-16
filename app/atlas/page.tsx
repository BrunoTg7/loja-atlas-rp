"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSteam } from "@/context/SteamContext";
import PaginaAtlasCoins from "@/components/AtlasCoinCard";

export default function AtlasCoinsPage() {
  const { user, loading: steamLoading } = useSteam();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (steamLoading) return;

    if (!user) {
      router.push("/");
      return;
    }

    fetch("/api/admin/check")
      .then((res) => res.json())
      .then((data) => {
        if (data.isAdmin !== true) {
          router.push("/");
        } else {
          setIsAdmin(true);
        }
      })
      .catch(() => router.push("/"))
      .finally(() => setLoading(false));
  }, [user, steamLoading, router]);

  if (loading || steamLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 rounded-full border-2 border-[#d4af37]/30 border-t-[#d4af37] animate-spin mx-auto mb-4" />
          <p className="text-white/50 text-sm">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return <PaginaAtlasCoins />;
}
