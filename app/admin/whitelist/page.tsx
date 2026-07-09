"use client";

import { useSteam } from "@/context/SteamContext";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import AdminWhitelistTable from "@/components/AdminWhitelistTable";

interface WhitelistRequest {
  messageId: string;
  cityId: string;
  steamId: string;
  steamFormatted: string;
  steamName: string;
  characterName: string;
  age: string;
  rpExperience: string;
  characterStory: string;
  timestamp: string;
}

export default function AdminWhitelistPage() {
  const { user, loading: steamLoading } = useSteam();
  const router = useRouter();
  const [requests, setRequests] = useState<WhitelistRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/discord-messages");
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao carregar solicitações.");
        return;
      }

      setRequests(data.requests || []);
    } catch {
      setError("Erro de conexão ao carregar solicitações.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (steamLoading) return;

    if (!user) {
      router.replace("/");
      return;
    }

    fetchRequests();
  }, [user, steamLoading, router, fetchRequests]);

  if (steamLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <span className="h-5 w-5 rounded-full border-2 border-gray-400/40 border-t-gray-400 animate-spin" />
          Carregando...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-indigo-500/15 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Painel de Whitelist</h1>
              <p className="text-sm text-gray-400">Solicitações puxadas do canal do Discord.</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#121622] border border-white/10 rounded-xl p-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Pendentes</p>
            <p className="text-2xl font-bold text-amber-400">{loading ? "..." : requests.length}</p>
          </div>
          <div className="bg-[#121622] border border-white/10 rounded-xl p-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Conectado como</p>
            <p className="text-sm font-medium text-white truncate">{user.personaName}</p>
          </div>
          <div className="bg-[#121622] border border-white/10 rounded-xl p-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Steam ID</p>
            <p className="text-sm font-mono text-gray-300 truncate">{user.steamId}</p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-[#121622] border border-white/10 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center gap-3 text-gray-400">
                <span className="h-5 w-5 rounded-full border-2 border-gray-400/40 border-t-gray-400 animate-spin" />
                Buscando mensagens do Discord...
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/15">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-red-400 font-medium mb-2">{error}</p>
              <button onClick={fetchRequests} className="text-sm text-gray-400 hover:text-white underline transition-colors">
                Tentar novamente
              </button>
            </div>
          ) : (
            <AdminWhitelistTable requests={requests} onAction={fetchRequests} />
          )}
        </div>

        {/* Refresh button */}
        {!loading && !error && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={fetchRequests}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Atualizar lista
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
