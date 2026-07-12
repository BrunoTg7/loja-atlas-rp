"use client";

import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const slotSpin = keyframes`
  0% { transform: translateY(0); }
  100% { transform: translateY(-100%); }
`;

const glowPulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
`;

const lockBounce = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
`;

const TicketWrapper = styled.div<{ $unlocked: boolean }>`
  position: relative;
  width: min(320px, 85vw);
  height: auto;
  aspect-ratio: 320 / 420;
  filter: ${p => p.$unlocked ? "none" : "saturate(0.3) brightness(0.7)"};
  transition: filter 0.8s ease;
`;

const TicketSVG = styled.svg`
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 8px 32px rgba(212, 175, 55, 0.15));
`;

const HoloOverlay = styled.div<{ $unlocked: boolean }>`
  position: absolute;
  inset: 0;
  border-radius: 16px;
  background: linear-gradient(
    105deg,
    transparent 20%,
    rgba(212, 175, 55, 0.08) 30%,
    rgba(255, 210, 119, 0.12) 40%,
    rgba(212, 175, 55, 0.08) 50%,
    transparent 60%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 3s linear infinite;
  pointer-events: none;
  opacity: ${p => p.$unlocked ? 1 : 0.3};
  transition: opacity 0.8s ease;
`;

const IDSlot = styled.div`
  position: absolute;
  bottom: 12.5%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  overflow: hidden;
  height: 28px;
`;

const SlotDigit = styled.span<{ $rolling: boolean }>`
  display: inline-block;
  width: 22px;
  text-align: center;
  font-family: 'Rajdhani', monospace;
  font-size: 1.1rem;
  font-weight: 700;
  color: #d4af37;
  line-height: 28px;
  overflow: hidden;
  position: relative;

  ${p => p.$rolling && `
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(212,175,55,0.3), transparent 30%, transparent 70%, rgba(212,175,55,0.3));
      animation: ${slotSpin} 0.1s linear infinite;
    }
  `}
`;

const LockIcon = styled.div<{ $unlocked: boolean }>`
  position: absolute;
  bottom: 4.3%;
  right: 10%;
  font-size: 16px;
  transition: all 0.5s ease;
  animation: ${({ $unlocked }) => $unlocked ? "none" : `lockBounce 2s ease infinite`};
  filter: ${({ $unlocked }) => $unlocked ? "none" : "grayscale(1) brightness(0.5)"};
`;

const GlowRing = styled.div<{ $unlocked: boolean }>`
  position: absolute;
  inset: -4px;
  border-radius: 20px;
  border: 2px solid rgba(212, 175, 55, ${({ $unlocked }) => $unlocked ? 0.4 : 0});
  box-shadow: ${({ $unlocked }) => $unlocked
    ? "0 0 20px rgba(212,175,55,0.3), inset 0 0 20px rgba(212,175,55,0.1)"
    : "none"};
  transition: all 0.8s ease;
  pointer-events: none;
  animation: ${({ $unlocked }) => $unlocked ? "glowPulse 3s ease infinite" : "none"};
`;

export default function TicketHolografico({
  unlocked = false,
  avatar = "",
  name = "",
  cityId = "",
}: {
  unlocked?: boolean;
  avatar?: string;
  name?: string;
  cityId?: string;
}) {
  const [displayId, setDisplayId] = useState<string[]>(["—", "—", "—", "—"]);
  const [rolling, setRolling] = useState(false);

  useEffect(() => {
    if (unlocked && cityId) {
      setRolling(true);
      const target = cityId.padStart(4, "0").slice(0, 4);
      let step = 0;
      const interval = setInterval(() => {
        setDisplayId(
          target.split("").map((_, i) =>
            i <= step ? target[i] : String(Math.floor(Math.random() * 10))
          )
        );
        step++;
        if (step > target.length) {
          clearInterval(interval);
          setRolling(false);
        }
      }, 300);
      return () => clearInterval(interval);
    } else {
      setDisplayId(["—", "—", "—", "—"]);
    }
  }, [unlocked, cityId]);

  return (
    <TicketWrapper $unlocked={unlocked}>
      <GlowRing $unlocked={unlocked} />

      <TicketSVG viewBox="0 0 320 420" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="ticketBg" x1="0" y1="0" x2="320" y2="420">
            <stop offset="0%" stopColor="#1a1714" />
            <stop offset="50%" stopColor="#0d0b09" />
            <stop offset="100%" stopColor="#1a1714" />
          </linearGradient>
          <linearGradient id="goldBorder" x1="0" y1="0" x2="320" y2="420">
            <stop offset="0%" stopColor="#d4af37" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#ffd277" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#d4af37" stopOpacity="0.6" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="holoLight">
            <feSpecularLighting result="specOut" specularExponent="20" lightingColor="#ffd277" surfaceScale="3">
              <fePointLight x="160" y="100" z="200" />
            </feSpecularLighting>
            <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="0.3" k4="0" />
          </filter>
        </defs>

        {/* Ticket shape with perforations */}
        <path
          d="M16 0 H304 Q320 0 320 16 V170 Q304 170 304 190 Q320 190 320 210 V404 Q320 420 304 420 H16 Q0 420 0 404 V210 Q16 210 16 190 Q0 190 0 170 V16 Q0 0 16 0 Z"
          fill="url(#ticketBg)"
          stroke="url(#goldBorder)"
          strokeWidth="1.5"
        />

        {/* Perforation dots - top section */}
        {Array.from({ length: 15 }).map((_, i) => (
          <circle key={`perf-top-${i}`} cx={30 + i * 20} cy="185" r="3" fill="#0d0b09" stroke="#d4af37" strokeWidth="0.5" strokeOpacity="0.3" />
        ))}

        {/* Perforation dots - left */}
        {Array.from({ length: 3 }).map((_, i) => (
          <circle key={`perf-left-${i}`} cx="6" cy={240 + i * 40} r="3" fill="#0d0b09" stroke="#d4af37" strokeWidth="0.5" strokeOpacity="0.3" />
        ))}

        {/* Perforation dots - right */}
        {Array.from({ length: 3 }).map((_, i) => (
          <circle key={`perf-right-${i}`} cx="314" cy={240 + i * 40} r="3" fill="#0d0b09" stroke="#d4af37" strokeWidth="0.5" strokeOpacity="0.3" />
        ))}

        {/* Header section */}
        <text x="160" y="55" textAnchor="middle" fontFamily="Rajdhani, sans-serif" fontSize="16" fontWeight="800" fill="#d4af37" letterSpacing="4">
          ATLAS RP
        </text>

        {/* Decorative line */}
        <line x1="80" y1="70" x2="240" y2="70" stroke="#d4af37" strokeWidth="0.5" strokeOpacity="0.3" />

        {/* Body text */}
        <text x="160" y="105" textAnchor="middle" fontFamily="Rajdhani, sans-serif" fontSize="11" fontWeight="600" fill={unlocked ? "#ffd277" : "#666"} letterSpacing="1">
          {unlocked ? "TICKET DE ACESSO" : "WHITELIST PENDENTE"}
        </text>

        <text x="160" y="130" textAnchor="middle" fontFamily="Rajdhani, sans-serif" fontSize="12" fill={unlocked ? "rgba(255,210,119,0.7)" : "rgba(255,255,255,0.3)"}>
          {unlocked ? "Cidade de Los Santos, Atlas RP" : "Complete o formulário para desbloquear"}
        </text>

        {/* Divider */}
        <line x1="40" y1="155" x2="280" y2="155" stroke="#d4af37" strokeWidth="0.5" strokeOpacity="0.2" strokeDasharray="4 4" />

        {/* Center decorative emblem */}
        <g transform="translate(160, 260)" filter="url(#holoLight)">
          <circle r="40" fill="none" stroke="#d4af37" strokeWidth="1" strokeOpacity="0.3" />
          <circle r="30" fill="none" stroke="#d4af37" strokeWidth="0.5" strokeOpacity="0.2" />
          {avatar ? (
            <>
              <clipPath id="avatarClip">
                <circle r="28" />
              </clipPath>
              <image
                href={avatar}
                x="-28"
                y="-28"
                width="56"
                height="56"
                clipPath="url(#avatarClip)"
                preserveAspectRatio="xMidYMid slice"
              />
            </>
          ) : (
            <text y="22" textAnchor="middle" fontFamily="Rajdhani, sans-serif" fontSize="75" fontWeight="900" fill="#d4af37" fillOpacity="0.2">
              A
            </text>
          )}
        </g>

        {/* Player name */}
        {name && (
          <text x="160" y="310" textAnchor="middle" fontFamily="Rajdhani, sans-serif" fontSize="12" fontWeight="700" fill="#d4af37" fillOpacity="0.8">
            {name}
          </text>
        )}

        {/* Footer label */}
        <text x="160" y="370" textAnchor="middle" fontFamily="Rajdhani, sans-serif" fontSize="10" fill="rgba(255,255,255,0.25)" letterSpacing="2">
          ID DE ACESSO
        </text>

        {/* Decorative corners */}
        <path d="M30 30 L50 30 L50 35 L35 35 L35 50 L30 50 Z" fill="none" stroke="#d4af37" strokeWidth="0.5" strokeOpacity="0.4" />
        <path d="M290 30 L270 30 L270 35 L285 35 L285 50 L290 50 Z" fill="none" stroke="#d4af37" strokeWidth="0.5" strokeOpacity="0.4" />
        <path d="M30 390 L50 390 L50 385 L35 385 L35 370 L30 370 Z" fill="none" stroke="#d4af37" strokeWidth="0.5" strokeOpacity="0.4" />
        <path d="M290 390 L270 390 L270 385 L285 385 L285 370 L290 370 Z" fill="none" stroke="#d4af37" strokeWidth="0.5" strokeOpacity="0.4" />

        {/* Holographic overlay lines */}
        {Array.from({ length: 8 }).map((_, i) => (
          <line
            key={`holo-${i}`}
            x1={0}
            y1={50 + i * 45}
            x2={320}
            y2={50 + i * 45}
            stroke="#d4af37"
            strokeWidth="0.3"
            strokeOpacity={0.05 + (i % 2) * 0.03}
          />
        ))}
      </TicketSVG>

      {/* ID digits overlay */}
      <IDSlot>
        {displayId.map((digit, i) => (
          <SlotDigit key={i} $rolling={rolling}>
            {digit}
          </SlotDigit>
        ))}
      </IDSlot>

      

      {/* Holographic color overlay */}
      <HoloOverlay $unlocked={unlocked} />
    </TicketWrapper>
  );
}
