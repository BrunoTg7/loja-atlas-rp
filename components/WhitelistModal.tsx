"use client";

import { useSteam } from "@/context/SteamContext";
import { useEffect, useRef, useState } from "react";
import { getEncryptedCookie, setEncryptedCookie, deleteCookie } from "@/lib/cookies";
import BaseModal from "@/components/BaseModal";

interface WhitelistModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormState {
  cityId: string;
  characterName: string;
  discord: string;
  birthDate: string;
  rpExperience: string;
  characterStory: string;
}

const initialForm: FormState = {
  cityId: "",
  characterName: "",
  discord: "",
  birthDate: "",
  rpExperience: "",
  characterStory: "",
};

type Step = "login" | "form" | "error-underage" | "already-pending" | "already-approved" | "resubmit-after-reject";
type Status = "idle" | "loading" | "success" | "error";

const COOKIE_KEY = "jK5nB3xQ8wM2pL6";
const COOKIE_DAYS = 1;
const MIN_AGE = 18;
const DISCORD_INVITE = "https://discord.gg/e426pZyTCp";

function saveDraft(form: FormState, step: Step) {
  setEncryptedCookie(COOKIE_KEY, JSON.stringify({ form, step, ts: Date.now() }), COOKIE_DAYS);
}

function loadDraft(): { form: FormState; step: Step } | null {
  const raw = getEncryptedCookie(COOKIE_KEY);
  if (!raw) return null;
  try {
    const { form, step, ts } = JSON.parse(raw);
    if (Date.now() - ts > 24 * 60 * 60 * 1000) {
      deleteCookie(COOKIE_KEY);
      return null;
    }
    return { form, step: step || "form" };
  } catch {
    deleteCookie(COOKIE_KEY);
    return null;
  }
}

function clearDraft() {
  deleteCookie(COOKIE_KEY);
}

function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function validate(form: FormState): Record<string, string> {
  const e: Record<string, string> = {};
  if (!form.cityId.trim()) e.cityId = "Informe o ID da cidade.";
  if (!form.characterName.trim())
    e.characterName = "Informe o nome do personagem.";
  if (!form.discord.trim()) {
    e.discord = "Informe seu Discord.";
  } else if (!/^\d{17,20}$/.test(form.discord.trim())) {
    e.discord = "Informe um Discord User ID válido (número).";
  }
  if (!form.birthDate.trim()) {
    e.birthDate = "Informe sua data de nascimento.";
  } else {
    const parts = form.birthDate.split("-");
    const year = parseInt(parts[0], 10);
    if (year < 1950 || year > 2008) {
      e.birthDate = "Data de nascimento inválida.";
    } else {
      const age = calculateAge(form.birthDate);
      if (age < MIN_AGE) {
        e.birthDate = `Idade mínima de ${MIN_AGE} anos.`;
      }
    }
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

const inputClass = `w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[rgba(201,162,39,0.4)] focus:ring-1 focus:ring-[rgba(201,162,39,0.2)] transition-colors`;
const inputErrorClass = `w-full rounded-xl border border-red-500/60 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400/20 transition-colors`;

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
        className={error ? inputErrorClass : inputClass}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

export default function WhitelistModal({ open, onClose }: WhitelistModalProps) {
  const { user, loading: steamLoading } = useSteam();
  const [step, setStep] = useState<Step>("login");
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [rejectReason, setRejectReason] = useState<string | null>(null);
  const firstFieldRef = useRef<HTMLInputElement | null>(null);
  const storyRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (open) {
      if (steamLoading) return;

      if (!user) {
        setStep("login");
        setForm(initialForm);
      } else {
        fetch("/api/whitelist/status")
          .then((res) => res.json())
          .then((data) => {
            if (data.status === "approved") {
              setStep("already-approved");
            } else if (data.status === "pending") {
              setStep("already-pending");
            } else if (data.status === "rejected") {
              setRejectReason(data.rejectReason || null);
              setStep("resubmit-after-reject");
            } else {
              const draft = loadDraft();
              if (draft && draft.form.cityId && draft.step === "form") {
                setForm(draft.form);
              } else {
                setForm(draft?.form || initialForm);
              }
              setStep("form");
            }
          })
          .catch(() => {
            const draft = loadDraft();
            if (draft && draft.form.cityId && draft.step === "form") {
              setForm(draft.form);
            } else {
              setForm(draft?.form || initialForm);
            }
            setStep("form");
          });
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

  function updateField(field: keyof FormState, value: string) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      saveDraft(next, step);
      return next;
    });
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function handleBirthDateChange(value: string) {
    updateField("birthDate", value);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const clientErrors = validate(form);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      setStatus("idle");
      return;
    }

    const age = calculateAge(form.birthDate);
    if (age < MIN_AGE) {
      setStep("error-underage");
      return;
    }

    setStatus("loading");
    setErrors({});
    setErrorMessage("");

    try {
      const res = await fetch("/api/whitelist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form }),
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
      setErrorMessage("Não foi possível enviar. Verifique sua conexão e tente novamente.");
      setStatus("error");
    }
  }

  /* ─── Step content renderers ─── */

  function renderSuccess() {
    return (
      <BaseModal
        open={open}
        onClose={onClose}
        title="Whitelist enviada!"
        maxWidth="sm"
        icon={
          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        footer={<BaseModal.PrimaryButton onClick={onClose}>Entendido</BaseModal.PrimaryButton>}
      >
        <p className="font-rajdhani text-sm text-white/50 leading-relaxed">
          Entre no nosso Discord e aguarde na sala &apos;Liberar ID&apos;.
          Nossa equipe vai analisar sua solicitação em breve.
        </p>
        <a
          href={DISCORD_INVITE}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 block text-center h-11 leading-[44px] rounded-xl bg-gradient-to-r from-[#5865F2] to-[#4752C4] hover:from-[#6c7df5] hover:to-[#5865F2] transition-all text-white text-sm font-bold uppercase tracking-wider font-cinzel shadow-[0_2px_12px_rgba(88,101,242,0.25)]"
        >
          Entrar no Discord
        </a>
      </BaseModal>
    );
  }

  function renderUnderage() {
    return (
      <BaseModal
        open={open}
        onClose={onClose}
        title="Não foi possível concluir"
        maxWidth="sm"
        icon={
          <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        }
        footer={
          <>
            <BaseModal.SecondaryButton onClick={() => { setStep("form"); setErrors({}); }}>
              Voltar ao formulário
            </BaseModal.SecondaryButton>
            <a
              href={DISCORD_INVITE}
              target="_blank"
              rel="noopener noreferrer"
              className="h-11 px-6 rounded-xl bg-gradient-to-r from-[#5865F2] to-[#4752C4] hover:from-[#6c7df5] hover:to-[#5865F2] transition-all text-white text-sm font-bold uppercase tracking-wider font-cinzel shadow-[0_2px_12px_rgba(88,101,242,0.25)] inline-flex items-center justify-center"
            >
              Entrar no Discord
            </a>
          </>
        }
      >
        <p className="font-rajdhani text-sm text-white/50 leading-relaxed">
          Nossa comunidade é destinada a maiores de 18 anos.
          Se você acredita que isso é um engano ou deseja explicar seu caso,
          entre no nosso Discord e abra um ticket detalhando a situação.
        </p>
      </BaseModal>
    );
  }

  function renderAlreadyPending() {
    return (
      <BaseModal
        open={open}
        onClose={onClose}
        title="Whitelist já enviada"
        maxWidth="sm"
        icon={
          <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        footer={
          <a
            href={DISCORD_INVITE}
            target="_blank"
            rel="noopener noreferrer"
            className="h-11 px-6 rounded-xl bg-gradient-to-r from-[#5865F2] to-[#4752C4] hover:from-[#6c7df5] hover:to-[#5865F2] transition-all text-white text-sm font-bold uppercase tracking-wider font-cinzel shadow-[0_2px_12px_rgba(88,101,242,0.25)] inline-flex items-center justify-center"
          >
            Entrar no Discord
          </a>
        }
      >
        <p className="font-rajdhani text-sm text-white/50 leading-relaxed">
          Você já possui uma solicitação de whitelist em análise.
          Aguarde a aprovação ou reprovação da nossa equipe.
        </p>
      </BaseModal>
    );
  }

  function renderAlreadyApproved() {
    return (
      <BaseModal
        open={open}
        onClose={onClose}
        title="Whitelist aprovada!"
        maxWidth="sm"
        icon={
          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        footer={
          <a
            href={DISCORD_INVITE}
            target="_blank"
            rel="noopener noreferrer"
            className="h-11 px-6 rounded-xl bg-gradient-to-r from-[#5865F2] to-[#4752C4] hover:from-[#6c7df5] hover:to-[#5865F2] transition-all text-white text-sm font-bold uppercase tracking-wider font-cinzel shadow-[0_2px_12px_rgba(88,101,242,0.25)] inline-flex items-center justify-center"
          >
            Entrar no Discord
          </a>
        }
      >
        <p className="font-rajdhani text-sm text-white/50 leading-relaxed">
          Sua whitelist já foi aprovada e está ativa.
          Você já pode acessar o servidor!
        </p>
      </BaseModal>
    );
  }

  function renderResubmitAfterReject() {
    return (
      <BaseModal
        open={open}
        onClose={onClose}
        title="Whitelist reprovada"
        maxWidth="sm"
        icon={
          <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
          </svg>
        }
        footer={
          <BaseModal.PrimaryButton
            onClick={() => {
              const draft = loadDraft();
              if (draft && draft.form.cityId && draft.step === "form") {
                setForm(draft.form);
              } else {
                setForm(initialForm);
              }
              setStep("form");
            }}
          >
            Enviar nova solicitação
          </BaseModal.PrimaryButton>
        }
      >
        <p className="font-rajdhani text-sm text-white/50 leading-relaxed mb-3">
          Sua anterior foi reprovada pela equipe.
        </p>
        {rejectReason && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-xs text-red-400 uppercase tracking-wider mb-1">Motivo:</p>
            <p className="font-rajdhani text-sm text-white/70">{rejectReason}</p>
          </div>
        )}
        <p className="font-rajdhani text-sm text-white/40">
          Você pode enviar uma nova solicitação. Corrija os problemas mencionados acima.
        </p>
      </BaseModal>
    );
  }

  function renderLogin() {
    return (
      <BaseModal
        open={open}
        onClose={onClose}
        title="Login necessário"
        maxWidth="sm"
        icon={
          <svg className="w-5 h-5 text-[#d4af37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
          </svg>
        }
        footer={
          <>
            <BaseModal.SecondaryButton onClick={onClose}>Cancelar</BaseModal.SecondaryButton>
            <a
              href="/api/auth/steam"
              className="h-11 px-6 rounded-xl bg-gradient-to-r from-[#FF2E44] to-[#cc2537] hover:from-[#FF4561] hover:to-[#FF2E44] transition-all text-white text-sm font-bold uppercase tracking-wider font-cinzel shadow-[0_2px_12px_rgba(255,46,68,0.25)] inline-flex items-center justify-center gap-2"
            >
              <svg className="h-4 w-4" viewBox="0 0 30 30" fill="none">
                <path d="M2.56967 20.0269C4.30041 25.7964 9.65423 30 15.9906 30C23.7274 30 29.9995 23.7318 29.9995 16C29.9995 8.26803 23.7274 2 15.9906 2C8.56634 2 2.49151 7.77172 2.01172 15.0699C2.01172 17.1667 2.01172 18.0417 2.56967 20.0269Z" fill="url(#steamGradModal)" />
                <path d="M15.2706 12.5629L11.8426 17.5395C11.0345 17.5028 10.221 17.7314 9.54572 18.1752L2.01829 15.0784C2.01829 15.0784 1.84411 17.9421 2.56999 20.0763L7.89147 22.2707C8.15866 23.464 8.97779 24.5107 10.1863 25.0142C12.1635 25.8398 14.4433 24.8988 15.2658 22.922C15.4799 22.4052 15.5797 21.8633 15.5652 21.3225L20.5904 17.8219C23.5257 17.8219 25.9114 15.4305 25.9114 12.4937C25.9114 9.55673 23.5257 7.16748 20.5904 7.16748C17.7553 7.16748 15.1117 9.64126 15.2706 12.5629ZM14.4469 22.5783C13.8103 24.1057 12.054 24.8303 10.5273 24.1946C9.82302 23.9014 9.29128 23.3642 8.98452 22.7237L10.7167 23.4411C11.8426 23.9098 13.1343 23.3762 13.6023 22.2514C14.0718 21.1254 13.5392 19.8324 12.4139 19.3637L10.6233 18.6222C11.3142 18.3603 12.0997 18.3507 12.8336 18.6559C13.5734 18.9635 14.1475 19.5428 14.4517 20.283C14.756 21.0233 14.7548 21.8404 14.4469 22.5783ZM20.5904 16.0434C18.6364 16.0434 17.0455 14.4511 17.0455 12.4937C17.0455 10.5379 18.6364 8.94518 20.5904 8.94518C22.5457 8.94518 24.1365 10.5379 24.1365 12.4937C24.1365 14.4511 22.5457 16.0434 20.5904 16.0434ZM17.9341 12.4883C17.9341 11.0159 19.127 9.82159 20.5964 9.82159C22.0671 9.82159 23.2599 11.0159 23.2599 12.4883C23.2599 13.9609 22.0671 15.1541 20.5964 15.1541C19.127 15.1541 17.9341 13.9609 17.9341 12.4883Z" fill="white" />
                <defs>
                  <linearGradient id="steamGradModal" x1="16.0056" y1="2" x2="16.0056" y2="30" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#111D2E" />
                    <stop offset="0.554721" stopColor="#23272A" />
                    <stop offset="1" stopColor="#2C2F33" />
                  </linearGradient>
                </defs>
              </svg>
              Entrar com Steam
            </a>
          </>
        }
      >
        <p className="font-rajdhani text-sm text-white/50 leading-relaxed">
          Você precisa estar com uma conta{" "}
          <strong className="text-white">STEAM LOGADA</strong> (não
          precisa ter o GTA V nela) para continuar com a whitelist.
        </p>
      </BaseModal>
    );
  }

  function renderForm() {
    return (
      <BaseModal
        open={open}
        onClose={onClose}
        title="Whitelist Atlas RP"
        maxWidth="md"
        closeOnEscape={status !== "loading"}
        icon={
          <svg className="w-5 h-5 text-[#d4af37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
          </svg>
        }
        footer={
          <>
            <BaseModal.SecondaryButton onClick={onClose}>Cancelar</BaseModal.SecondaryButton>
            <BaseModal.PrimaryButton
              type="submit"
              disabled={status === "loading"}
              onClick={() => {
                const formEl = document.getElementById("whitelist-form") as HTMLFormElement | null;
                formEl?.requestSubmit();
              }}
            >
              {status === "loading" && (
                <span className="h-3.5 w-3.5 rounded-full border-2 border-[#0a0a0a]/40 border-t-[#0a0a0a] animate-spin" />
              )}
              {status === "loading" ? "Enviando..." : "Enviar"}
            </BaseModal.PrimaryButton>
          </>
        }
      >
        <form id="whitelist-form" onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
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
              label="Seu Discord (User ID)"
              placeholder="Exemplo: 1184991819952562199"
              value={form.discord}
              onChange={(v) => updateField("discord", v)}
              error={errors.discord}
            />
            <p className="text-xs text-white/30 -mt-2">
              Ative o Modo Desenvolvedor no Discord e copie seu ID com botão direito no seu nome.
            </p>
            <div>
              <label className="block text-sm font-medium text-white mb-1.5">
                Data de Nascimento <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.birthDate}
                onChange={(e) => handleBirthDateChange(e.target.value)}
                min="1950-01-01"
                max="2008-12-31"
                className={errors.birthDate ? inputErrorClass : inputClass}
              />
              {errors.birthDate && (
                <p className="mt-1 text-xs text-red-400">{errors.birthDate}</p>
              )}
              <p className="mt-1 text-xs text-white/30">Apenas maiores de 18 anos.</p>
            </div>
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
                className={`${errors.rpExperience ? inputErrorClass : inputClass} resize-none overflow-hidden`}
                style={{ minHeight: "42px" }}
              />
              {errors.rpExperience && (
                <p className="mt-1 text-xs text-red-400">{errors.rpExperience}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1.5">
                História do personagem <span className="text-red-500">*</span>
              </label>
              <textarea
                ref={storyRef}
                value={form.characterStory}
                onChange={(e) => {
                  updateField("characterStory", e.target.value);
                  const textarea = e.target;
                  textarea.style.height = "auto";
                  textarea.style.height = `${textarea.scrollHeight}px`;
                }}
                placeholder="Crie uma história breve para seu personagem"
                rows={4}
                className={`${errors.characterStory ? inputErrorClass : inputClass} resize-y`}
                style={{ minHeight: "100px", maxHeight: "400px" }}
              />
              {errors.characterStory && (
                <p className="mt-1 text-xs text-red-400">{errors.characterStory}</p>
              )}
            </div>
          </div>

          {status === "error" && (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3">
              <p className="font-rajdhani text-sm text-red-400">{errorMessage}</p>
              <button
                type="button"
                onClick={() => { setStatus("idle"); setErrorMessage(""); }}
                className="mt-2 text-xs text-red-300 underline hover:text-red-200"
              >
                Tentar novamente
              </button>
            </div>
          )}
        </form>
      </BaseModal>
    );
  }

  /* ─── Render by step/status ─── */

  if (status === "success") return renderSuccess();
  if (step === "error-underage") return renderUnderage();
  if (step === "already-pending") return renderAlreadyPending();
  if (step === "already-approved") return renderAlreadyApproved();
  if (step === "resubmit-after-reject") return renderResubmitAfterReject();
  if (step === "login") return renderLogin();
  return renderForm();
}
