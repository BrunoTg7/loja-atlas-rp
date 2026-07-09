"use client";

import { useSteam } from "@/context/SteamContext";
import Link from "next/link";
import { useEffect, useState } from "react";

const SteamIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.56967 20.0269C4.30041 25.7964 9.65423 30 15.9906 30C23.7274 30 29.9995 23.7318 29.9995 16C29.9995 8.26803 23.7274 2 15.9906 2C8.56634 2 2.49151 7.77172 2.01172 15.0699C2.01172 17.1667 2.01172 18.0417 2.56967 20.0269Z" fill="url(#steamGrad)" />
    <path d="M15.2706 12.5629L11.8426 17.5395C11.0345 17.5028 10.221 17.7314 9.54572 18.1752L2.01829 15.0784C2.01829 15.0784 1.84411 17.9421 2.56999 20.0763L7.89147 22.2707C8.15866 23.464 8.97779 24.5107 10.1863 25.0142C12.1635 25.8398 14.4433 24.8988 15.2658 22.922C15.4799 22.4052 15.5797 21.8633 15.5652 21.3225L20.5904 17.8219C23.5257 17.8219 25.9114 15.4305 25.9114 12.4937C25.9114 9.55673 23.5257 7.16748 20.5904 7.16748C17.7553 7.16748 15.1117 9.64126 15.2706 12.5629ZM14.4469 22.5783C13.8103 24.1057 12.054 24.8303 10.5273 24.1946C9.82302 23.9014 9.29128 23.3642 8.98452 22.7237L10.7167 23.4411C11.8426 23.9098 13.1343 23.3762 13.6023 22.2514C14.0718 21.1254 13.5392 19.8324 12.4139 19.3637L10.6233 18.6222C11.3142 18.3603 12.0997 18.3507 12.8336 18.6559C13.5734 18.9635 14.1475 19.5428 14.4517 20.283C14.756 21.0233 14.7548 21.8404 14.4469 22.5783ZM20.5904 16.0434C18.6364 16.0434 17.0455 14.4511 17.0455 12.4937C17.0455 10.5379 18.6364 8.94518 20.5904 8.94518C22.5457 8.94518 24.1365 10.5379 24.1365 12.4937C24.1365 14.4511 22.5457 16.0434 20.5904 16.0434ZM17.9341 12.4883C17.9341 11.0159 19.127 9.82159 20.5964 9.82159C22.0671 9.82159 23.2599 11.0159 23.2599 12.4883C23.2599 13.9609 22.0671 15.1541 20.5964 15.1541C19.127 15.1541 17.9341 13.9609 17.9341 12.4883Z" fill="white" />
    <defs>
      <linearGradient id="steamGrad" x1="16.0056" y1="2" x2="16.0056" y2="30" gradientUnits="userSpaceOnUse">
        <stop stopColor="#111D2E" />
        <stop offset="0.554721" stopColor="#23272A" />
        <stop offset="1" stopColor="#2C2F33" />
      </linearGradient>
    </defs>
  </svg>
);

export default function Header() {
  const { user, loading } = useSteam();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    fetch("/api/admin/check")
      .then((res) => res.json())
      .then((data) => setIsAdmin(data.isAdmin === true))
      .catch(() => setIsAdmin(false));
  }, [user]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-md border-b border-[#FF2E44]/20">
      <div className="max-w-7xl mx-auto py-2 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div className="relative h-16 w-auto">
            <img
              src="/Imagens/logo-atlas-rp.webp"
              alt="Atlas RP Logo"
              className="h-full w-40 object-contain"
            />
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          <Link
            href="/"
            className="font-rajdhani text-sm lg:text-base text-gray-400 hover:text-white transition-colors duration-300 uppercase tracking-wider"
          >
            Início
          </Link>
          <Link
            href="/atlas-coins"
            className="font-rajdhani text-sm lg:text-base text-yellow-500 hover:text-yellow-400 transition-colors duration-300 uppercase tracking-wider"
          >
            Atlas Coins
          </Link>
          {isAdmin && (
            <Link
              href="/admin/whitelist"
              className="font-rajdhani text-sm lg:text-base text-indigo-400 hover:text-indigo-300 transition-colors duration-300 uppercase tracking-wider"
            >
              Admin
            </Link>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-white/5 text-gray-500 font-rajdhani text-sm rounded-xl">
              <span className="h-4 w-4 rounded-full border-2 border-gray-500/40 border-t-gray-400 animate-spin" />
            </div>
          ) : user ? (
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl">
                {user.avatar && (
                  <img
                    src={user.avatar}
                    alt={user.personaName}
                    className="h-6 w-6 rounded-full"
                  />
                )}
                <span className="font-rajdhani text-sm text-white font-medium max-w-[100px] truncate">
                  {user.personaName}
                </span>
              </div>
              <a
                href="/api/auth/logout"
                className="p-2.5 text-gray-400 hover:text-red-400 bg-white/5 hover:bg-red-400/10 rounded-xl transition-all duration-300"
                title="Sair"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </a>
            </div>
          ) : (
            <a
              href="/api/auth/steam"
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-[#FF2E44]/90 hover:bg-[#FF2E44] text-white font-rajdhani font-semibold text-sm uppercase tracking-wider rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-[#FF2E44]/20"
            >
              <SteamIcon />
              Entrar com Steam
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
