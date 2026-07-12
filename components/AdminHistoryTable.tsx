"use client";

import { useState } from "react";

interface HistoryEntry {
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
  status: "approved" | "rejected";
  rejectReason?: string | null;
}

interface AdminHistoryTableProps {
  history: HistoryEntry[];
}

export default function AdminHistoryTable({ history }: AdminHistoryTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [storyModal, setStoryModal] = useState<HistoryEntry | null>(null);

  function formatStory(text: string) {
    return text
      .split(/\n/)
      .filter((line) => line.trim())
      .map((line) => line.trim())
      .join("\n");
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-gray-400 font-medium">Nenhum registro no histórico</p>
        <p className="text-gray-500 text-sm mt-1">Nenhuma whitelist foi aprovada ou reprovada ainda.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">ID</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Jogador</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Data</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Detalhes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {history.map((entry) => {
              const isExpanded = expandedRow === entry.messageId;

              return (
                <tr key={entry.messageId} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-4">
                    <span className="font-mono text-sm text-white">#{entry.cityId}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="text-sm text-white font-medium">{entry.steamName}</p>
                      <p className="text-xs text-gray-500 font-mono">{entry.steamId}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {entry.status === "approved" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Aprovado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/15 text-red-400">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                        </svg>
                        Reprovado
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-400">
                      {entry.timestamp ? new Date(entry.timestamp).toLocaleDateString("pt-BR") : "N/A"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setExpandedRow(isExpanded ? null : entry.messageId)}
                        className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {isExpanded ? "Ocultar" : "Ver"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Expanded Details */}
      {expandedRow && (() => {
        const entry = history.find((e) => e.messageId === expandedRow);
        if (!entry) return null;
        return (
          <div className="border-t border-white/10 bg-[#0f0f12] px-6 py-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 text-xs mb-1">Nome do Personagem</p>
                <p className="text-white">{entry.characterName}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Idade</p>
                <p className="text-white">{entry.age} anos</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Data de Nascimento</p>
                <p className="text-white">{entry.birthDate || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Discord</p>
                <p className="text-white">{entry.discord || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Steam Formatado</p>
                <p className="text-white font-mono text-xs">{entry.steamFormatted}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Data da Solicitação</p>
                <p className="text-white">{entry.timestamp ? new Date(entry.timestamp).toLocaleString("pt-BR") : "N/A"}</p>
              </div>
              {entry.status === "rejected" && entry.rejectReason && (
                <div className="sm:col-span-2">
                  <p className="text-gray-500 text-xs mb-1">Motivo da Reprovação</p>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <p className="text-sm text-white/80">{entry.rejectReason}</p>
                  </div>
                </div>
              )}
              <div className="sm:col-span-2">
                <p className="text-gray-500 text-xs mb-1">Já jogou RP?</p>
                <p className="text-white whitespace-pre-wrap">{entry.rpExperience}</p>
              </div>
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-gray-500 text-xs">História do Personagem</p>
                  <button
                    onClick={() => setStoryModal(entry)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Ver completa
                  </button>
                </div>
                <div className="bg-[#18181c] rounded-lg border border-white/5 p-4 max-h-60 overflow-y-auto">
                  <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{formatStory(entry.characterStory)}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">{entry.characterStory.length} caracteres</p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Story Full Modal */}
      {storyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-4xl bg-[#18181c] border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div>
                <h3 className="text-lg font-semibold text-white">História do Personagem</h3>
                <p className="text-sm text-gray-400">{storyModal.characterName} — {storyModal.steamName}</p>
              </div>
              <button
                onClick={() => setStoryModal(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                {formatStory(storyModal.characterStory)}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
              <p className="text-xs text-gray-500">{storyModal.characterStory.length} caracteres</p>
              <button
                onClick={() => setStoryModal(null)}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-white transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
