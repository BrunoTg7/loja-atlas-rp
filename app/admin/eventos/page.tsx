"use client";

import { useSteam } from "@/context/SteamContext";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface FormField {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "number" | "email" | "phone";
  options?: string[];
  required?: boolean;
  multiple?: boolean;
}

interface Evento {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  form_fields: FormField[];
  start_date: string;
  end_date: string;
  is_enabled: boolean;
  created_at: string;
}

interface Participant {
  id: string;
  event_id: string;
  participant_name: string;
  participant_data: Record<string, string>;
  created_at: string;
}

const emptyForm = {
  name: "",
  description: "",
  image_url: "",
  start_date: "",
  end_date: "",
  is_enabled: true,
};

function getFieldNameMap(formFields: FormField[]): Record<string, string> {
  const map: Record<string, string> = { nome: "Nome" };
  formFields.forEach((f) => { map[f.id] = f.label; });
  return map;
}

function formatParticipantText(p: Participant, formFields: FormField[]): string {
  const map = getFieldNameMap(formFields);
  const lines = [`Nome: ${p.participant_name}`];
  if (p.participant_data) {
    Object.entries(p.participant_data).forEach(([key, val]) => {
      lines.push(`${map[key] || key}: ${val}`);
    });
  }
  return lines.join("\n");
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white/40 font-rajdhani text-[10px] hover:bg-white/10 hover:text-white/60 transition-colors"
    >
      {copied ? "Copiado!" : label}
    </button>
  );
}

function CopyControls({
  formFields = [],
  allParticipants,
  fieldNameMap,
  selectedColumns,
  onToggleColumn,
  onCopyParticipant,
}: {
  formFields?: FormField[];
  allParticipants: Participant[];
  fieldNameMap: Record<string, string>;
  selectedColumns: string[];
  onToggleColumn: (colId: string) => void;
  onCopyParticipant: (p: Participant) => void;
}) {
  const [showCols, setShowCols] = useState(false);
  const [copied, setCopied] = useState(false);

  const allColumns = ["nome", ...formFields.map((f) => f.id)];

  const copyAll = async () => {
    const cols = selectedColumns.length > 0 ? selectedColumns : allColumns;
    const header = cols.map((c) => fieldNameMap[c] || c).join("\t");
    const rows = allParticipants.map((p) =>
      cols.map((c) => (c === "nome" ? p.participant_name : String(p.participant_data?.[c] ?? ""))).join("\t")
    );
    await navigator.clipboard.writeText(`${header}\n${rows.join("\n")}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowCols(!showCols)}
          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 font-rajdhani text-xs hover:bg-white/10 transition-colors"
        >
          Colunas ({selectedColumns.length > 0 ? selectedColumns.length : "todas"})
        </button>
        {showCols && (
          <div className="absolute left-0 top-full mt-1 bg-[#131318] border border-white/10 rounded-xl shadow-xl z-50 min-w-[220px] py-1">
            {allColumns.map((colId) => (
              <label
                key={colId}
                className="flex items-center gap-2 px-4 py-2 font-rajdhani text-white/60 text-xs hover:bg-white/5 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedColumns.includes(colId)}
                  onChange={() => onToggleColumn(colId)}
                  className="rounded border-white/20"
                />
                {fieldNameMap[colId] || colId}
              </label>
            ))}
          </div>
        )}
      </div>
      <button
        onClick={copyAll}
        className="px-3 py-1.5 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/20 text-[#d4af37] font-rajdhani text-xs font-semibold hover:bg-[#d4af37]/20 transition-colors"
      >
        {copied ? "Copiado!" : "Copiar todos"}
      </button>
    </>
  );
}

export default function AdminEventosPage() {
  const { user, loading: steamLoading } = useSteam();
  const router = useRouter();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [saving, setSaving] = useState(false);

  const [showParticipants, setShowParticipants] = useState(false);
  const [participantsEvent, setParticipantsEvent] = useState<Evento | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  useEffect(() => {
    if (!steamLoading && !user) {
      router.push("/");
    }
  }, [user, steamLoading, router]);

  useEffect(() => {
    if (!steamLoading && user) {
      fetch("/api/admin/check")
        .then((res) => res.json())
        .then((data) => {
          if (data.isAdmin !== true) router.push("/");
        })
        .catch(() => router.push("/"));
    }
  }, [user, steamLoading, router]);

  const fetchEventos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/events?all=true");
      const data = await res.json();
      setEventos(data.events || []);
    } catch {
      setError("Erro ao carregar eventos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchEventos();
  }, [user, fetchEventos]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormFields([]);
    setShowForm(true);
  };

  const fromISOString = (isoDate: string): string => {
    const d = new Date(isoDate);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const openEdit = (evento: Evento) => {
    setEditingId(evento.id);
    setForm({
      name: evento.name,
      description: evento.description || "",
      image_url: evento.image_url || "",
      start_date: fromISOString(evento.start_date),
      end_date: fromISOString(evento.end_date),
      is_enabled: evento.is_enabled,
    });
    setFormFields(evento.form_fields || []);
    setShowForm(true);
  };

  const toISOString = (localDatetime: string): string => {
    const [datePart, timePart] = localDatetime.split("T");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hours, minutes] = (timePart || "00:00").split(":").map(Number);
    const local = new Date(year, month - 1, day, hours, minutes);
    return local.toISOString();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        ...form,
        start_date: toISOString(form.start_date),
        end_date: toISOString(form.end_date),
        form_fields: formFields,
      };

      const url = editingId ? `/api/events/${editingId}` : "/api/events";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao salvar evento");
        return;
      }

      setShowForm(false);
      fetchEventos();
    } catch {
      setError("Erro de conexão");
    } finally {
      setSaving(false);
    }
  };

  const toggleEnabled = async (evento: Evento) => {
    try {
      const res = await fetch(`/api/events/${evento.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: evento.name,
          description: evento.description,
          image_url: evento.image_url,
          form_fields: evento.form_fields,
          start_date: evento.start_date,
          end_date: evento.end_date,
          is_enabled: !evento.is_enabled,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao alterar status");
        return;
      }
      fetchEventos();
    } catch {
      setError("Erro ao alterar status");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (!res.ok) {
        setError("Erro ao excluir evento");
        return;
      }
      setConfirmDelete(null);
      fetchEventos();
    } catch {
      setError("Erro de conexão");
    }
  };

  const openParticipants = async (evento: Evento) => {
    setParticipantsEvent(evento);
    setShowParticipants(true);
    setLoadingParticipants(true);
    setSelectedColumns([]);

    try {
      const res = await fetch(`/api/events/${evento.id}/participants`);
      const data = await res.json();
      setParticipants(data.participants || []);
    } catch {
      setParticipants([]);
    } finally {
      setLoadingParticipants(false);
    }
  };

  const addFormField = () => {
    setFormFields([
      ...formFields,
      { id: `field_${Date.now()}`, label: "", type: "text", required: false },
    ]);
  };

  const updateFormField = (index: number, updates: Partial<FormField>) => {
    const updated = [...formFields];
    updated[index] = { ...updated[index], ...updates };
    setFormFields(updated);
  };

  const removeFormField = (index: number) => {
    setFormFields(formFields.filter((_, i) => i !== index));
  };

  if (steamLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#05080F] via-[#0B1725] to-[#05080F]">
        <div className="h-8 w-8 rounded-full border-2 border-[#d4af37]/30 border-t-[#d4af37] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#05080F] via-[#0B1725] to-[#05080F] pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-cinzel text-3xl font-bold text-[#d4af37]">Gerenciar Eventos</h1>
            <p className="font-rajdhani text-white/40 text-sm mt-1">Crie, edite e gerencie os eventos do servidor</p>
          </div>
          <button
            onClick={openCreate}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-[#0a0a0a] font-rajdhani font-bold text-sm uppercase tracking-wider hover:from-[#e8c84a] hover:to-[#d4af37] transition-all"
          >
            + Novo Evento
          </button>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="font-rajdhani text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Lista de Eventos */}
        {showForm ? (
          <div className="bg-gradient-to-br from-[#131318] to-[#0B0B0B] border border-[#d4af37]/15 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-cinzel text-xl font-bold text-white">
                {editingId ? "Editar Evento" : "Novo Evento"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="font-rajdhani text-white/40 hover:text-white text-sm transition-colors"
              >
                Cancelar
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-rajdhani text-white/60 text-sm mb-1">Nome do Evento *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-rajdhani text-sm focus:outline-none focus:border-[#d4af37]/50 transition-colors"
                    placeholder="Nome do evento"
                  />
                </div>
                <div>
                  <label className="block font-rajdhani text-white/60 text-sm mb-1">URL da Imagem</label>
                  <input
                    type="url"
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-rajdhani text-sm focus:outline-none focus:border-[#d4af37]/50 transition-colors"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label className="block font-rajdhani text-white/60 text-sm mb-1">Descrição</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-rajdhani text-sm focus:outline-none focus:border-[#d4af37]/50 transition-colors resize-none"
                  placeholder="Descreva o evento..."
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-rajdhani text-white/60 text-sm mb-1">Data de Início *</label>
                  <input
                    type="datetime-local"
                    required
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-rajdhani text-sm focus:outline-none focus:border-[#d4af37]/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-rajdhani text-white/60 text-sm mb-1">Data de Fim *</label>
                  <input
                    type="datetime-local"
                    required
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-rajdhani text-sm focus:outline-none focus:border-[#d4af37]/50 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="font-rajdhani text-white/60 text-sm">Habilitado</label>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, is_enabled: !form.is_enabled })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.is_enabled ? "bg-[#d4af37]" : "bg-white/20"}`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${form.is_enabled ? "left-[22px]" : "left-0.5"}`}
                  />
                </button>
              </div>

              {/* Form Fields */}
              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-rajdhani text-white font-semibold text-sm">Campos do Formulário de Inscrição</h3>
                  <button
                    type="button"
                    onClick={addFormField}
                    className="px-3 py-1.5 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/20 text-[#d4af37] font-rajdhani text-xs font-semibold hover:bg-[#d4af37]/20 transition-colors"
                  >
                    + Adicionar Campo
                  </button>
                </div>

                {formFields.length === 0 ? (
                  <p className="font-rajdhani text-white/30 text-xs">Nenhum campo adicional. O campo &ldquo;Nome&rdquo; é obrigatório.</p>
                ) : (
                  <div className="space-y-3">
                    {formFields.map((field, i) => (
                      <div key={field.id} className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 grid sm:grid-cols-3 gap-2">
                            <input
                              type="text"
                              required
                              value={field.label}
                              onChange={(e) => updateFormField(i, { label: e.target.value })}
                              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-rajdhani text-xs focus:outline-none focus:border-[#d4af37]/50"
                              placeholder="Nome do campo"
                            />
                            <select
                              value={field.type}
                              onChange={(e) => {
                                const newType = e.target.value as FormField["type"];
                                const updates: Partial<FormField> = { type: newType };
                                if (newType !== "select") {
                                  updates.options = undefined;
                                  updates.multiple = undefined;
                                } else {
                                  updates.options = field.options?.length ? field.options : [""];
                                }
                                updateFormField(i, updates);
                              }}
                              className="px-3 py-2 bg-[#131318] border border-white/10 rounded-lg text-white font-rajdhani text-xs focus:outline-none focus:border-[#d4af37]/50"
                            >
                              <option value="text">Texto</option>
                              <option value="textarea">Área de texto</option>
                              <option value="number">Número</option>
                              <option value="email">E-mail</option>
                              <option value="phone">Telefone</option>
                              <option value="select">Seleção</option>
                            </select>
                            <div className="flex items-center gap-2">
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={field.required || false}
                                  onChange={(e) => updateFormField(i, { required: e.target.checked })}
                                  className="rounded border-white/20"
                                />
                                <span className="font-rajdhani text-white/40 text-xs">Obrigatório</span>
                              </label>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFormField(i)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors shrink-0"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>

                        {field.type === "select" && (
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center gap-3">
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={field.multiple || false}
                                  onChange={(e) => updateFormField(i, { multiple: e.target.checked })}
                                  className="rounded border-white/20"
                                />
                                <span className="font-rajdhani text-white/40 text-xs">Selecionar vários</span>
                              </label>
                            </div>
                            <div className="space-y-1.5">
                              <p className="font-rajdhani text-white/30 text-[10px]">Opções:</p>
                              {(field.options || [""]).map((opt, oi) => (
                                <div key={oi} className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) => {
                                      const newOptions = [...(field.options || [""])];
                                      newOptions[oi] = e.target.value;
                                      updateFormField(i, { options: newOptions });
                                    }}
                                    className="flex-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white font-rajdhani text-[11px] focus:outline-none focus:border-[#d4af37]/50"
                                    placeholder={`Opção ${oi + 1}`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newOptions = (field.options || []).filter((_, j) => j !== oi);
                                      if (newOptions.length === 0) newOptions.push("");
                                      updateFormField(i, { options: newOptions });
                                    }}
                                    className="w-6 h-6 flex items-center justify-center rounded text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-colors shrink-0"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                  {oi === (field.options || [""]).length - 1 && (
                                    <button
                                      type="button"
                                      onClick={() => updateFormField(i, { options: [...(field.options || []), ""] })}
                                      className="w-6 h-6 flex items-center justify-center rounded text-white/20 hover:text-[#d4af37] hover:bg-[#d4af37]/10 transition-colors shrink-0"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                      </svg>
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 font-rajdhani font-semibold text-sm hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-[#0a0a0a] font-rajdhani font-bold text-sm uppercase tracking-wider hover:from-[#e8c84a] hover:to-[#d4af37] transition-all disabled:opacity-50"
                >
                  {saving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        ) : loading ? (
          <div className="text-center py-20">
            <div className="h-8 w-8 rounded-full border-2 border-[#d4af37]/30 border-t-[#d4af37] animate-spin mx-auto mb-4" />
            <p className="font-rajdhani text-white/40 text-sm">Carregando eventos...</p>
          </div>
        ) : eventos.length === 0 ? (
          <div className="text-center py-20 bg-gradient-to-br from-[#131318] to-[#0B0B0B] border border-[#d4af37]/15 rounded-2xl">
            <p className="font-rajdhani text-white/40 text-sm">Nenhum evento criado</p>
            <button onClick={openCreate} className="mt-4 font-rajdhani text-[#d4af37] text-sm hover:underline">
              Criar primeiro evento
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {eventos.map((evento) => (
              <div
                key={evento.id}
                className="bg-gradient-to-br from-[#131318] to-[#0B0B0B] border border-[#d4af37]/15 rounded-2xl p-5 hover:border-[#d4af37]/25 transition-colors"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {evento.image_url && (
                    <img src={evento.image_url} alt={evento.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-cinzel text-lg font-bold text-white truncate">{evento.name}</h3>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          evento.is_enabled
                            ? "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20"
                            : "text-white/40 bg-white/5 border border-white/10"
                        }`}
                      >
                        {evento.is_enabled ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                    <p className="font-rajdhani text-white/40 text-xs">
                      {new Date(evento.start_date).toLocaleDateString("pt-BR")} — {new Date(evento.end_date).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleEnabled(evento)}
                      className={`px-3 py-1.5 rounded-lg font-rajdhani text-xs font-semibold transition-colors ${
                        evento.is_enabled
                          ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
                          : "bg-white/5 text-white/40 hover:bg-white/10 border border-white/10"
                      }`}
                    >
                      {evento.is_enabled ? "Desativar" : "Ativar"}
                    </button>
                    <button
                      onClick={() => openParticipants(evento)}
                      className="px-3 py-1.5 rounded-lg bg-[#d4af37]/10 text-[#d4af37] font-rajdhani text-xs font-semibold hover:bg-[#d4af37]/20 border border-[#d4af37]/20 transition-colors"
                    >
                      Participantes
                    </button>
                    <button
                      onClick={() => openEdit(evento)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 font-rajdhani text-xs font-semibold hover:bg-white/10 border border-white/10 transition-colors"
                    >
                      Editar
                    </button>
                    {confirmDelete === evento.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(evento.id)}
                          className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 font-rajdhani text-xs font-semibold hover:bg-red-500/30 border border-red-500/20 transition-colors"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 text-white/40 font-rajdhani text-xs hover:bg-white/10 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(evento.id)}
                        className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 font-rajdhani text-xs font-semibold hover:bg-red-500/20 border border-red-500/20 transition-colors"
                      >
                        Excluir
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Participantes */}
        {showParticipants && participantsEvent && (() => {
          const fieldNameMap = getFieldNameMap(participantsEvent.form_fields || []);

          const copyParticipant = async (p: Participant) => {
            const cols = selectedColumns.length > 0
              ? selectedColumns
              : ["nome", ...(participantsEvent.form_fields || []).map((f) => f.id)];
            const lines = cols.map((c) => {
              const label = fieldNameMap[c] || c;
              const val = c === "nome" ? p.participant_name : String(p.participant_data?.[c] ?? "");
              return `${label}: ${val}`;
            });
            await navigator.clipboard.writeText(lines.join("\n"));
          };

          return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowParticipants(false)} />
              <div className="relative bg-[#0c0c10] border border-[#d4af37]/20 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
                <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between shrink-0">
                  <div>
                    <h3 className="font-cinzel text-lg font-bold text-white">Participantes</h3>
                    <p className="font-rajdhani text-white/40 text-xs">{participantsEvent.name} • {participants.length} inscrito(s)</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CopyControls
                      formFields={participantsEvent.form_fields || []}
                      allParticipants={participants}
                      fieldNameMap={fieldNameMap}
                      selectedColumns={selectedColumns}
                      onToggleColumn={(colId) => {
                        setSelectedColumns((prev) =>
                          prev.includes(colId) ? prev.filter((c) => c !== colId) : [...prev, colId]
                        );
                      }}
                      onCopyParticipant={copyParticipant}
                    />
                    <button
                      onClick={() => setShowParticipants(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  {loadingParticipants ? (
                    <div className="text-center py-8">
                      <div className="h-6 w-6 rounded-full border-2 border-[#d4af37]/30 border-t-[#d4af37] animate-spin mx-auto mb-3" />
                      <p className="font-rajdhani text-white/40 text-xs">Carregando...</p>
                    </div>
                  ) : participants.length === 0 ? (
                    <p className="font-rajdhani text-white/40 text-sm text-center py-8">Nenhum participante inscrito</p>
                  ) : (
                    <div className="space-y-3">
                      {participants.map((p, idx) => (
                        <div key={p.id} className="p-4 rounded-xl bg-white/5 border border-white/5">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-rajdhani text-white/30 text-xs">#{idx + 1}</span>
                              <span className="font-rajdhani text-white text-sm font-semibold">{p.participant_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-rajdhani text-white/30 text-xs">
                                {new Date(p.created_at).toLocaleDateString("pt-BR")}
                              </span>
                              <button
                                onClick={() => copyParticipant(p)}
                                className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white/40 font-rajdhani text-[10px] hover:bg-white/10 hover:text-white/60 transition-colors"
                              >
                                Copiar
                              </button>
                            </div>
                          </div>
                          {p.participant_data && Object.keys(p.participant_data).length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-2">
                              {Object.entries(p.participant_data).map(([key, val]) => {
                                const label = fieldNameMap[key] || key;
                                return (
                                  <div key={key} className="flex items-center gap-2">
                                    <span className="font-rajdhani text-white/40 text-xs shrink-0">{label}:</span>
                                    <span className="font-rajdhani text-white/60 text-xs truncate">{String(val)}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
