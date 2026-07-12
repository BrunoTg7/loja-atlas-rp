"use client";

import { useSteam } from "@/context/SteamContext";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import AdminWhitelistTable from "@/components/AdminWhitelistTable";
import AdminHistoryTable from "@/components/AdminHistoryTable";

interface WhitelistRequest {
  messageId: string;
  cityId: string;
  steamId: string;
  steamFormatted: string;
  steamName: string;
  characterName: string;
  age: string;
  birthDate: string;
  discord: string;
  rpExperience: string;
  characterStory: string;
  timestamp: string;
}

interface HistoryEntry extends WhitelistRequest {
  status: "approved" | "rejected";
  rejectReason?: string | null;
}

export default function AdminWhitelistPage() {
  const { user, loading: steamLoading } = useSteam();
  const router = useRouter();
  const [requests, setRequests] = useState<WhitelistRequest[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"pending" | "history">("pending");

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

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/discord-history");
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao carregar histórico.");
        return;
      }

      setHistory(data.history || []);
    } catch {
      setError("Erro de conexão ao carregar histórico.");
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

    if (tab === "pending") {
      fetchRequests();
    } else {
      fetchHistory();
    }
  }, [user, steamLoading, router, tab, fetchRequests, fetchHistory]);

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
          <div className="flex items-center justify-between">
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
            {process.env.NEXT_PUBLIC_DISCORD_CALL_LIBERAR_ID && (
              <a
                href={process.env.NEXT_PUBLIC_DISCORD_CALL_LIBERAR_ID}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#5865F2]/15 text-[#5865F2] hover:bg-[#5865F2]/25 transition-colors text-sm font-medium"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#5865F2">
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" />
                </svg>
                Entrar na Call
              </a>
            )}
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

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("pending")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === "pending"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            Pendentes
          </button>
          <button
            onClick={() => setTab("history")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === "history"
                ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            Histórico
          </button>
        </div>

        {/* Content */}
        <div className="bg-[#121622] border border-white/10 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center gap-3 text-gray-400">
                <span className="h-5 w-5 rounded-full border-2 border-gray-400/40 border-t-gray-400 animate-spin" />
                {tab === "pending" ? "Buscando mensagens do Discord..." : "Buscando histórico..."}
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
              <button onClick={tab === "pending" ? fetchRequests : fetchHistory} className="text-sm text-gray-400 hover:text-white underline transition-colors">
                Tentar novamente
              </button>
            </div>
          ) : tab === "pending" ? (
            <AdminWhitelistTable requests={requests} onAction={fetchRequests} />
          ) : (
            <AdminHistoryTable history={history} />
          )}
        </div>

        {/* Refresh button */}
        {!loading && !error && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={tab === "pending" ? fetchRequests : fetchHistory}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Atualizar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
