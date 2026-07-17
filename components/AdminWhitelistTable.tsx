"use client";

import { useState, useCallback } from "react";
import BaseModal from "@/components/BaseModal";

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

interface AdminWhitelistTableProps {
  requests: WhitelistRequest[];
  onAction: () => void;
}

type ActionStatus = "idle" | "loading" | "success" | "error";

export default function AdminWhitelistTable({
  requests,
  onAction,
}: AdminWhitelistTableProps) {
  const [actions, setActions] = useState<
    Record<string, { status: ActionStatus; error?: string }>
  >({});
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectMotivo, setRejectMotivo] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [storyModal, setStoryModal] = useState<WhitelistRequest | null>(null);

  const handleAction = useCallback(
    async (messageId: string, action: "approve" | "reject", cityId: string, steamId: string, steamName: string, characterName: string, motivo?: string, discord?: string) => {
      setActions((prev) => ({ ...prev, [messageId]: { status: "loading" } }));

      try {
        const discordRes = await fetch("/api/admin/discord-action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messageId, action, cityId, steamId, steamName, characterName, motivo, discord }),
        });

        if (!discordRes.ok) {
          const discordData = await discordRes.json();
          setActions((prev) => ({
            ...prev,
            [messageId]: { status: "error", error: discordData.error || "Erro ao processar no Discord" },
          }));
          return;
        }

        setActions((prev) => ({ ...prev, [messageId]: { status: "success" } }));
        setTimeout(() => onAction(), 1500);
      } catch {
        setActions((prev) => ({
          ...prev,
          [messageId]: { status: "error", error: "Erro de conexão" },
        }));
      }
    },
    [onAction]
  );

  function formatStory(text: string) {
    return text
      .split(/\n/)
      .filter((line) => line.trim())
      .map((line) => line.trim())
      .join("\n");
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-gray-400 font-medium">Nenhuma solicitação pendente</p>
        <p className="text-gray-500 text-sm mt-1">Todas as whitelist já foram analisadas.</p>
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
              <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {requests.map((req) => {
              const actionState = actions[req.messageId];
              const isProcessing = actionState?.status === "loading";
              const isSuccess = actionState?.status === "success";
              const isExpanded = expandedRow === req.messageId;

              return (
                <tr key={req.messageId} className={`hover:bg-white/5 transition-colors ${isSuccess ? "bg-emerald-500/10" : ""}`}>
                  <td className="px-4 py-4">
                    <span className="font-mono text-sm text-white">#{req.cityId}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="text-sm text-white font-medium">{req.steamName}</p>
                      <p className="text-xs text-gray-500 font-mono">{req.steamId}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {isSuccess ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Processado
                      </span>
                    ) : actionState?.status === "error" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/15 text-red-400">
                        Erro
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/15 text-amber-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                        Pendente
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {actionState?.status === "error" && (
                        <span className="text-xs text-red-400 mr-2">{actionState.error}</span>
                      )}
                      {!isSuccess && (
                        <>
                          <button
                            onClick={() => setExpandedRow(isExpanded ? null : req.messageId)}
                            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleAction(req.messageId, "approve", req.cityId, req.steamId, req.steamName, req.characterName, undefined, req.discord)}
                            disabled={isProcessing}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors disabled:opacity-50"
                          >
                            {isProcessing ? (
                              <span className="h-3 w-3 rounded-full border-2 border-emerald-400/40 border-t-emerald-400 animate-spin" />
                            ) : (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                            Aprovar
                          </button>
                          <button
                            onClick={() => setRejectModal(req.messageId)}
                            disabled={isProcessing}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors disabled:opacity-50"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                            </svg>
                            Reprovar
                          </button>
                        </>
                      )}
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
        const req = requests.find((r) => r.messageId === expandedRow);
        if (!req) return null;
        return (
          <div className="border-t border-white/10 bg-[#0f0f12] px-6 py-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 text-xs mb-1">Nome do Personagem</p>
                <p className="text-white">{req.characterName}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Idade</p>
                <p className="text-white">{req.age} anos</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Data de Nascimento</p>
                <p className="text-white">{req.birthDate || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Discord</p>
                <p className="text-white">{req.discord || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Steam3 Hex</p>
                <p className="text-white font-mono text-xs">{req.steamFormatted}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Data da Solicitação</p>
                <p className="text-white">{req.timestamp ? new Date(req.timestamp).toLocaleString("pt-BR") : "N/A"}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-gray-500 text-xs mb-1">Já jogou RP?</p>
                <p className="text-white whitespace-pre-wrap">{req.rpExperience}</p>
              </div>
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-gray-500 text-xs">História do Personagem</p>
                  <button
                    onClick={() => setStoryModal(req)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Ver completa
                  </button>
                </div>
                <div className="bg-[#18181c] rounded-lg border border-white/5 p-4 max-h-60 overflow-y-auto">
                  <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{formatStory(req.characterStory)}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">{req.characterStory.length} caracteres</p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Story Full Modal */}
      <BaseModal
        open={!!storyModal}
        onClose={() => setStoryModal(null)}
        title="História do Personagem"
        maxWidth="4xl"
        icon={
          <svg className="w-5 h-5 text-[#d4af37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
        }
        footer={
          <BaseModal.SecondaryButton onClick={() => setStoryModal(null)}>Fechar</BaseModal.SecondaryButton>
        }
      >
        {storyModal && (
          <>
            <p className="text-sm text-white/40 mb-4">{storyModal.characterName} — {storyModal.steamName}</p>
            <div className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
              {formatStory(storyModal.characterStory)}
            </div>
            <p className="text-xs text-white/30 mt-4">{storyModal.characterStory.length} caracteres</p>
          </>
        )}
      </BaseModal>

      {/* Reject Modal */}
      {rejectModal !== null && (() => {
        const req = requests.find((r) => r.messageId === rejectModal);
        const actionState = actions[rejectModal];
        const isSuccess = actionState?.status === "success";
        const isError = actionState?.status === "error";
        const isLoading = actionState?.status === "loading";

        return (
          <BaseModal
            open={true}
            onClose={() => { setRejectModal(null); setRejectMotivo(""); }}
            title={isSuccess ? "Reprovado com sucesso" : isError ? "Erro ao reprovar" : "Reprovar Whitelist"}
            maxWidth="md"
            closeOnBackdrop={!isLoading}
            closeOnEscape={!isLoading}
            icon={
              isSuccess ? (
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : isError ? (
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              )
            }
            footer={
              (isSuccess || isError) ? (
                <BaseModal.SecondaryButton onClick={() => { setRejectModal(null); setRejectMotivo(""); }}>Fechar</BaseModal.SecondaryButton>
              ) : (
                <>
                  <BaseModal.SecondaryButton onClick={() => { setRejectModal(null); setRejectMotivo(""); }}>Cancelar</BaseModal.SecondaryButton>
                  <BaseModal.DangerButton onClick={() => {
                    if (req) {
                      handleAction(rejectModal, "reject", req.cityId, req.steamId, req.steamName, req.characterName, rejectMotivo.trim() || undefined, req.discord);
                    }
                  }}>
                    {isLoading && <span className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />}
                    Confirmar Reprovação
                  </BaseModal.DangerButton>
                </>
              )
            }
          >
            {isSuccess ? (
              <p className="text-sm text-white/50">
                Whitelist de <strong className="text-white/70">{req?.steamName}</strong> foi reprovada.
              </p>
            ) : isError ? (
              <p className="text-sm text-red-400">{actionState?.error || "Tente novamente."}</p>
            ) : (
              <>
                <p className="text-sm text-white/50 mb-3">Informe o motivo da reprovação (opcional).</p>
                <textarea
                  value={rejectMotivo}
                  onChange={(e) => setRejectMotivo(e.target.value)}
                  placeholder="Ex: História não condiz com o servidor, informações incompletas..."
                  rows={3}
                  disabled={isLoading}
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[rgba(201,162,39,0.4)] disabled:opacity-50 transition-colors"
                />
              </>
            )}
          </BaseModal>
        );
      })()}
    </>
  );
}
