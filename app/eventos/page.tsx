"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface FormField {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "number" | "email" | "phone";
  options?: string[];
  required?: boolean;
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
}

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

function getEventStatus(startDate: string, endDate: string): { label: string; color: string } {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) return { label: "Em breve", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" };
  if (now > end) return { label: "Encerrado", color: "text-white/40 bg-white/5 border-white/10" };
  return { label: "Em andamento", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" };
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventoSelecionado, setEventoSelecionado] = useState<Evento | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => setEventos(data.events || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openInscricao = (evento: Evento) => {
    setEventoSelecionado(evento);
    setFormData({});
    setEnviado(false);
    setErro("");
  };

  const handleInscricao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventoSelecionado) return;

    setEnviando(true);
    setErro("");

    try {
      const res = await fetch(`/api/events/${eventoSelecionado.id}/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participant_name: formData["nome"] || "Anônimo",
          participant_data: formData,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || "Erro ao enviar inscrição");
        return;
      }

      setEnviado(true);
    } catch {
      setErro("Erro de conexão");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F121B] via-[#0B1725] to-[#05080F]">
      {/* Hero */}
      <section className="relative pt-32 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/Imagens/fundo1.webp')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F121B]/80 via-[#0B1725]/90 to-[#05080F]" />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div {...fadeUp}>
            <h1 className="font-cinzel text-4xl md:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#C9A227] to-[#8B6914] mb-4">
              Eventos
            </h1>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent mx-auto mb-6" />
            <p className="font-rajdhani text-lg text-white/60 max-w-xl mx-auto">
              Participe dos eventos exclusivos do Atlas RP e ganhe recompensas únicas.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Lista de Eventos */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="text-center py-20">
              <div className="h-8 w-8 rounded-full border-2 border-[#d4af37]/30 border-t-[#d4af37] animate-spin mx-auto mb-4" />
              <p className="font-rajdhani text-white/40 text-sm">Carregando eventos...</p>
            </div>
          ) : eventos.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                <svg className="w-10 h-10 text-white/10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <p className="font-rajdhani text-white/40 text-sm">Nenhum evento disponível no momento</p>
              <p className="font-rajdhani text-white/20 text-xs mt-1">Volte em breve para conferir as novidades!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventos.map((evento, i) => {
                const status = getEventStatus(evento.start_date, evento.end_date);
                return (
                  <motion.div
                    key={evento.id}
                    {...fadeUp}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className="bg-gradient-to-br from-[#131318] to-[#0B0B0B] border border-[#d4af37]/15 rounded-2xl overflow-hidden hover:border-[#d4af37]/30 transition-all group"
                  >
                    {evento.image_url && (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={evento.image_url}
                          alt={evento.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${status.color}`}>
                          {status.label}
                        </span>
                        <span className="font-rajdhani text-white/30 text-xs">
                          {formatDate(evento.start_date)}
                        </span>
                      </div>
                      <h3 className="font-cinzel text-xl font-bold text-white mb-2">{evento.name}</h3>
                      {evento.description && (
                        <p className="font-rajdhani text-white/50 text-sm leading-relaxed mb-4 line-clamp-3">
                          {evento.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs font-rajdhani text-white/30 mb-4">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                        <span>{formatDate(evento.start_date)} — {formatDate(evento.end_date)}</span>
                      </div>
                      <button
                        onClick={() => openInscricao(evento)}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-[#0a0a0a] font-rajdhani font-bold text-sm uppercase tracking-wider hover:from-[#e8c84a] hover:to-[#d4af37] transition-all"
                      >
                        Participar
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Modal de Inscrição */}
      {eventoSelecionado && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setEventoSelecionado(null)} />
          <div className="relative bg-[#0c0c10] border border-[#d4af37]/20 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#0c0c10] border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h3 className="font-cinzel text-lg font-bold text-white">{eventoSelecionado.name}</h3>
                <p className="font-rajdhani text-white/40 text-xs">Inscrição no evento</p>
              </div>
              <button
                onClick={() => setEventoSelecionado(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {enviado ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="font-rajdhani text-white font-semibold text-lg">Inscrição realizada!</p>
                  <p className="font-rajdhani text-white/40 text-sm mt-1">Sua participação foi registrada com sucesso.</p>
                  <button
                    onClick={() => setEventoSelecionado(null)}
                    className="mt-6 px-6 py-2.5 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/20 text-[#d4af37] font-rajdhani font-semibold text-sm hover:bg-[#d4af37]/20 transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              ) : (
                <form onSubmit={handleInscricao} className="space-y-4">
                  <div>
                    <label className="block font-rajdhani text-white/60 text-sm mb-1">Nome *</label>
                    <input
                      type="text"
                      required
                      value={formData["nome"] || ""}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-rajdhani text-sm focus:outline-none focus:border-[#d4af37]/50 transition-colors"
                      placeholder="Seu nome"
                    />
                  </div>

                  {eventoSelecionado.form_fields?.map((field) => (
                    <div key={field.id}>
                      <label className="block font-rajdhani text-white/60 text-sm mb-1">
                        {field.label} {field.required && "*"}
                      </label>
                      {field.type === "textarea" ? (
                        <textarea
                          required={field.required}
                          rows={3}
                          value={formData[field.id] || ""}
                          onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-rajdhani text-sm focus:outline-none focus:border-[#d4af37]/50 transition-colors resize-none"
                          placeholder={`Digite ${field.label.toLowerCase()}`}
                        />
                      ) : field.type === "select" ? (
                        <select
                          required={field.required}
                          value={formData[field.id] || ""}
                          onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-rajdhani text-sm focus:outline-none focus:border-[#d4af37]/50 transition-colors"
                        >
                          <option value="">Selecione...</option>
                          {field.options?.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type === "number" ? "number" : field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text"}
                          required={field.required}
                          value={formData[field.id] || ""}
                          onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-rajdhani text-sm focus:outline-none focus:border-[#d4af37]/50 transition-colors"
                          placeholder={field.type === "email" ? "email@exemplo.com" : field.type === "phone" ? "(00) 00000-0000" : `Digite ${field.label.toLowerCase()}`}
                        />
                      )}
                    </div>
                  ))}

                  {erro && (
                    <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                      <p className="font-rajdhani text-red-400 text-sm">{erro}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={enviando}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-[#0a0a0a] font-rajdhani font-bold text-sm uppercase tracking-wider hover:from-[#e8c84a] hover:to-[#d4af37] transition-all disabled:opacity-50"
                  >
                    {enviando ? "Enviando..." : "Confirmar Inscrição"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
