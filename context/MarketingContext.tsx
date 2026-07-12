"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useSteam } from "./SteamContext";
import { getEncryptedCookie, setEncryptedCookie } from "@/lib/cookies";

interface MarketingContextType {
  showNotification: boolean;
  showConsentForm: boolean;
  showConfirmation: boolean;
  openNotification: () => void;
  openConsentForm: () => void;
  closeAll: () => void;
  submitConsent: (email: string, phone: string, consent: boolean) => Promise<void>;
}

const MarketingContext = createContext<MarketingContextType | null>(null);

const COOKIE_KEY = "qW8xL2mN9kP4vR7";
const COOKIE_DAYS = 365;

interface StoredData {
  consentGiven: boolean;
  userSteamId: string | null;
}

function getStored(): StoredData | null {
  const raw = getEncryptedCookie(COOKIE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredData;
  } catch {
    return null;
  }
}

function setStored(data: StoredData) {
  setEncryptedCookie(COOKIE_KEY, JSON.stringify(data), COOKIE_DAYS);
}

export function MarketingProvider({ children }: { children: ReactNode }) {
  const { user } = useSteam();
  const [showNotification, setShowNotification] = useState(false);
  const [showConsentForm, setShowConsentForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [storedData, setStoredData] = useState<StoredData | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setStoredData(getStored());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !user) return;
    if (storedData?.consentGiven) return;
    setShowNotification(true);
  }, [ready, user, storedData]);

  const openNotification = useCallback(() => {
    setShowNotification(true);
    setShowConsentForm(false);
    setShowConfirmation(false);
  }, []);

  const openConsentForm = useCallback(() => {
    setShowNotification(false);
    setShowConsentForm(true);
    setShowConfirmation(false);
  }, []);

  const closeAll = useCallback(() => {
    setShowNotification(false);
    setShowConsentForm(false);
    setShowConfirmation(false);
  }, []);

  const submitConsent = useCallback(async (email: string, phone: string, consent: boolean) => {
    if (!consent) {
      closeAll();
      return;
    }

    if (!email?.trim()) return;
    if (!user) return;

    const consentText = "Aceito receber mensagens de marketing do Atlas RP sobre eventos, novidades e promoções.";
    const payload = {
      email: email.trim(),
      phone: phone.trim(),
      consent: true,
      consentText,
      timestamp: new Date().toISOString(),
      steamId: user.steamId,
      personaName: user.personaName,
    };

    try {
      const res = await fetch("/api/marketing/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowConsentForm(false);
        setShowConfirmation(true);

        const data: StoredData = {
          consentGiven: true,
          userSteamId: user.steamId,
        };
        setStored(data);
        setStoredData(data);
      }
    } catch {
      // Silently fail - user can try again
    }
  }, [user, closeAll]);

  return (
    <MarketingContext.Provider
      value={{
        showNotification,
        showConsentForm,
        showConfirmation,
        openNotification,
        openConsentForm,
        closeAll,
        submitConsent,
      }}
    >
      {children}
    </MarketingContext.Provider>
  );
}

export function useMarketing() {
  const ctx = useContext(MarketingContext);
  if (!ctx) {
    throw new Error("useMarketing must be used within MarketingProvider");
  }
  return ctx;
}