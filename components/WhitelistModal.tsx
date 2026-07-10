"use client";

import { useSteam } from "@/context/SteamContext";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface WhitelistModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormState {
  cityId: string;
  characterName: string;
  age: string;
  rpExperience: string;
  characterStory: string;
}

const initialForm: FormState = {
  cityId: "",
  characterName: "",
  age: "",
  rpExperience: "",
  characterStory: "",
};

type Step = "login" | "form";
type Status = "idle" | "loading" | "success" | "error";

const STORAGE_KEY = "atlas_whitelist_draft";
const STORAGE_TTL = 24 * 60 * 60 * 1000;
const ENC_KEY = "atlas-rp-wl-2024";

function encrypt(data: string): string {
  let result = "";
  for (let i = 0; i < data.length; i++) {
    result += String.fromCharCode(
      data.charCodeAt(i) ^ ENC_KEY.charCodeAt(i % ENC_KEY.length)
    );
  }
  return btoa(result);
}

function decrypt(data: string): string {
  try {
    const decoded = atob(data);
    let result = "";
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(
        decoded.charCodeAt(i) ^ ENC_KEY.charCodeAt(i % ENC_KEY.length)
      );
    }
    return result;
  } catch {
    return "";
  }
}

function saveDraft(form: FormState, step: Step) {
  try {
    const payload = JSON.stringify({ form, step, ts: Date.now() });
    localStorage.setItem(STORAGE_KEY, encrypt(payload));
  } catch {}
}

function loadDraft(): { form: FormState; step: Step } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const decoded = decrypt(raw);
    if (!decoded) return null;
    const { form, step, ts } = JSON.parse(decoded);
    if (Date.now() - ts > STORAGE_TTL) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return { form, step: step || "form" };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function clearDraft() {
  localStorage.removeItem(STORAGE_KEY);
}

function validate(form: FormState): Record<string, string> {
  const e: Record<string, string> = {};
  if (!form.cityId.trim()) e.cityId = "Informe o ID da cidade.";
  if (!form.characterName.trim())
    e.characterName = "Informe o nome do personagem.";
  if (!form.age.trim()) {
    e.age = "Informe sua idade.";
  } else if (Number(form.age) < 16) {
    e.age = "Idade mínima de 16 anos.";
  }
  if (!form.rpExperience.trim())
    e.rpExperience = "Conte um pouco da sua experiência.";
  if (!form.characterStory.trim()) {
    e.characterStory = "Escreva uma história para seu personagem.";
  } else if (form.characterStory.trim().length < 300) {
    e.characterStory = "A história precisa ter pelo menos 300 caracteres.";
  }
  return e;
}

export default function WhitelistModal({
  open,
  onClose,
}: WhitelistModalProps) {
  const { user, loading: steamLoading } = useSteam();
  const [step, setStep] = useState<Step>("login");
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const firstFieldRef = useRef<HTMLInputElement | null>(null);
  const storyRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (open) {
      if (steamLoading) return;

      if (!user) {
        setStep("login");
        setForm(initialForm);
      } else {
        const draft = loadDraft();
        if (draft && draft.form.cityId && draft.step === "form") {
          setForm(draft.form);
        } else {
          setForm(draft?.form || initialForm);
        }
        setStep("form");
      }
      setErrors({});
      setStatus("idle");
      setErrorMessage("");
    }
  }, [open, user, steamLoading]);

  useEffect(() => {
    if (!open || step !== "form") return;
    setTimeout(() => firstFieldRef.current?.focus(), 50);
  }, [step, open]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  function updateField(field: keyof FormState, value: string) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      saveDraft(next, step);
      return next;
    });
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const clientErrors = validate(form);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      setStatus("idle");
      return;
    }

    setStatus("loading");
    setErrors({});
    setErrorMessage("");

    try {
      const res = await fetch("/api/whitelist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
        }),
      });

      const data = await res.json();

      if (res.status === 422 && data.errors) {
        setErrors(data.errors);
        setStatus("idle");
        return;
      }

      if (!res.ok) {
        setErrorMessage(data.error || "Não foi possível enviar. Tente novamente.");
        setStatus("error");
        return;
      }

      clearDraft();
      setStatus("success");
    } catch {
      setErrorMessage(
        "Não foi possível enviar. Verifique sua conexão e tente novamente."
      );
      setStatus("error");
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="whitelist-title"
            className="w-full max-w-md bg-[#18181c] border border-white/10 rounded-2xl p-5 md:p-6 shadow-2xl"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* ===== SUCCESS ===== */}
            {status === "success" ? (
              <div className="py-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="2"
                  >
                    <path
                      d="M20 6L9 17l-5-5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h2
                  id="whitelist-title"
                  className="text-lg font-semibold text-white mb-2"
                >
                  Whitelist enviada!
                </h2>
                <p className="text-sm text-gray-400 mb-6">
                  Nossa equipe vai analisar e responder em breve.
                </p>
                <button
                  onClick={onClose}
                  className="w-full rounded-lg bg-indigo-500 hover:bg-indigo-400 transition-colors text-white font-medium py-2.5"
                >
                  Fechar
                </button>
              </div>

            /* ===== STEP 1: LOGIN ===== */
            ) : step === "login" ? (
              <div className="py-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FF2E44]/15">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="#FF2E44"
                  >
                    <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.731L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 12.001-5.373 12.001-12S18.606 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.296.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.754-1.121-1.386-1.384c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.49 1.013 2.445-.397.957-1.49 1.41-2.45 1.022zm8.9-9.24c0-1.663-1.353-3.016-3.016-3.016-1.661 0-3.014 1.353-3.014 3.016 0 1.665 1.353 3.018 3.014 3.018 1.663 0 3.016-1.353 3.016-3.018z" />
                  </svg>
                </div>
                <h2
                  id="whitelist-title"
                  className="text-lg font-semibold text-white mb-2"
                >
                  Login necessário
                </h2>
                <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                  Você precisa estar com uma conta{" "}
                  <strong className="text-white">STEAM LOGADA</strong> (não
                  precisa ter o GTA V nela) para continuar com a whitelist.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white text-sm font-medium py-2.5"
                  >
                    Cancelar
                  </button>
                  <a
                    href="/api/auth/steam"
                    className="flex-1 rounded-lg bg-[#FF2E44] hover:bg-[#FF2E44]/80 transition-colors text-white text-sm font-medium py-2.5 flex items-center justify-center gap-2"
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 30 30"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M2.56967 20.0269C4.30041 25.7964 9.65423 30 15.9906 30C23.7274 30 29.9995 23.7318 29.9995 16C29.9995 8.26803 23.7274 2 15.9906 2C8.56634 2 2.49151 7.77172 2.01172 15.0699C2.01172 17.1667 2.01172 18.0417 2.56967 20.0269Z"
                        fill="url(#steamGradModal)"
                      />
                      <path
                        d="M15.2706 12.5629L11.8426 17.5395C11.0345 17.5028 10.221 17.7314 9.54572 18.1752L2.01829 15.0784C2.01829 15.0784 1.84411 17.9421 2.56999 20.0763L7.89147 22.2707C8.15866 23.464 8.97779 24.5107 10.1863 25.0142C12.1635 25.8398 14.4433 24.8988 15.2658 22.922C15.4799 22.4052 15.5797 21.8633 15.5652 21.3225L20.5904 17.8219C23.5257 17.8219 25.9114 15.4305 25.9114 12.4937C25.9114 9.55673 23.5257 7.16748 20.5904 7.16748C17.7553 7.16748 15.1117 9.64126 15.2706 12.5629ZM14.4469 22.5783C13.8103 24.1057 12.054 24.8303 10.5273 24.1946C9.82302 23.9014 9.29128 23.3642 8.98452 22.7237L10.7167 23.4411C11.8426 23.9098 13.1343 23.3762 13.6023 22.2514C14.0718 21.1254 13.5392 19.8324 12.4139 19.3637L10.6233 18.6222C11.3142 18.3603 12.0997 18.3507 12.8336 18.6559C13.5734 18.9635 14.1475 19.5428 14.4517 20.283C14.756 21.0233 14.7548 21.8404 14.4469 22.5783ZM20.5904 16.0434C18.6364 16.0434 17.0455 14.4511 17.0455 12.4937C17.0455 10.5379 18.6364 8.94518 20.5904 8.94518C22.5457 8.94518 24.1365 10.5379 24.1365 12.4937C24.1365 14.4511 22.5457 16.0434 20.5904 16.0434ZM17.9341 12.4883C17.9341 11.0159 19.127 9.82159 20.5964 9.82159C22.0671 9.82159 23.2599 11.0159 23.2599 12.4883C23.2599 13.9609 22.0671 15.1541 20.5964 15.1541C19.127 15.1541 17.9341 13.9609 17.9341 12.4883Z"
                        fill="white"
                      />
                      <defs>
                        <linearGradient
                          id="steamGradModal"
                          x1="16.0056"
                          y1="2"
                          x2="16.0056"
                          y2="30"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#111D2E" />
                          <stop offset="0.554721" stopColor="#23272A" />
                          <stop offset="1" stopColor="#2C2F33" />
                        </linearGradient>
                      </defs>
                    </svg>
                    Entrar com Steam
                  </a>
                </div>
              </div>

            /* ===== STEP 2: FORM ===== */
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl" aria-hidden="true">
                      🎓
                    </span>
                    <h2
                      id="whitelist-title"
                      className="text-lg font-semibold text-white"
                    >
                      Whitelist Atlas RP
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Fechar formulário"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        d="M18 6L6 18M6 6l12 12"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4 max-h-[60vh] sm:max-h-[50vh] overflow-y-auto pr-1 scrollbar-hide">
                  <Field
                    inputRef={firstFieldRef}
                    label="Qual é o seu ID na cidade?"
                    placeholder="Digite seu ID da cidade"
                    value={form.cityId}
                    onChange={(v) => updateField("cityId", v)}
                    error={errors.cityId}
                  />
                  <Field
                    label="Qual é o nome do seu personagem?"
                    placeholder="Exemplo: João Silva"
                    value={form.characterName}
                    onChange={(v) => updateField("characterName", v)}
                    error={errors.characterName}
                  />
                  <Field
                    label="Idade"
                    placeholder="ex: 18"
                    type="number"
                    value={form.age}
                    onChange={(v) => updateField("age", v)}
                    error={errors.age}
                  />
                  <div>
                    <label className="block text-sm font-medium text-white mb-1.5">
                      Já jogou RP? <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={form.rpExperience}
                      onChange={(e) => {
                        updateField("rpExperience", e.target.value);
                        const textarea = e.target;
                        textarea.style.height = "auto";
                        const newHeight = Math.min(textarea.scrollHeight, 200);
                        textarea.style.height = `${newHeight}px`;
                      }}
                      placeholder="Fale um pouco"
                      rows={2}
                      className={`w-full resize-none rounded-lg border bg-[#0f0f12] px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none scrollbar-hide overflow-hidden transition-all duration-200 ${
                        errors.rpExperience
                          ? "border-red-500/60 focus:border-red-400"
                          : "border-white/10 focus:border-indigo-400"
                      }`}
                      style={{ scrollbarWidth: "none", msOverflowStyle: "none", minHeight: "42px" }}
                    />
                    {errors.rpExperience && (
                      <p className="mt-1 text-xs text-red-400">
                        {errors.rpExperience}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-1.5">
                      História do personagem{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      ref={storyRef}
                      value={form.characterStory}
                      onChange={(e) => {
                        updateField("characterStory", e.target.value);
                        const textarea = e.target;
                        textarea.style.height = "auto";
                        const newHeight = Math.min(textarea.scrollHeight, 200);
                        textarea.style.height = `${newHeight}px`;
                      }}
                      placeholder="Crie uma história breve para seu personagem"
                      rows={2}
                      className={`w-full resize-none rounded-lg border bg-[#0f0f12] px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none scrollbar-hide overflow-hidden transition-all duration-200 ${
                        errors.characterStory
                          ? "border-red-500/60 focus:border-red-400"
                          : "border-white/10 focus:border-indigo-400"
                      }`}
                      style={{ scrollbarWidth: "none", msOverflowStyle: "none", minHeight: "42px" }}
                    />
                    {errors.characterStory && (
                      <p className="mt-1 text-xs text-red-400">
                        {errors.characterStory}
                      </p>
                    )}
                  </div>
                </div>

                {status === "error" && (
                  <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                    <p className="text-sm text-red-400">{errorMessage}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setStatus("idle");
                        setErrorMessage("");
                      }}
                      className="mt-2 text-xs text-red-300 underline hover:text-red-200"
                    >
                      Tentar novamente
                    </button>
                  </div>
                )}

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white text-sm font-medium px-5 py-2.5"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="rounded-lg bg-indigo-500 hover:bg-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-white text-sm font-medium px-5 py-2.5 flex items-center gap-2"
                  >
                    {status === "loading" && (
                      <span className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    )}
                    {status === "loading" ? "Enviando..." : "Enviar"}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  error,
  type = "text",
  inputRef,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-white mb-1.5">
        {label} <span className="text-red-500">*</span>
      </label>
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-lg border bg-[#0f0f12] px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none ${
          error
            ? "border-red-500/60 focus:border-red-400"
            : "border-white/10 focus:border-indigo-400"
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
