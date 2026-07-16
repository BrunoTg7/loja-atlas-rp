"use client";

import {
  motion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useRef, useState } from "react";
import styled, { keyframes } from "styled-components";

const Section = styled.section`
  position: relative;
  height: 400vh;
  background: #000;

  @media (max-width: 768px) {
    height: 500vh;
  }
`;

const StickyContainer = styled.div`
  position: sticky;
  top: 0;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const HalfImage = styled(motion.div)<{ $side: "left" | "right" }>`
  position: absolute;
  top: 0;
  width: 50%;
  height: 100%;
  background-size: cover;
  background-position: center;
  will-change: transform;

  ${({ $side }) =>
    $side === "left"
      ? `
    left: 0;
    background-image: url('/Imagens/policia.webp');

    @media (max-width: 768px) {
      width: 100%;
      clip-path: polygon(0 0, 50% 0, 50% 100%, 0 100%);
    }
  `
      : `
    right: 0;
    background-image: url('/Imagens/bandido.webp');

    @media (max-width: 768px) {
      width: 100%;
      clip-path: polygon(50% 0, 100% 0, 100% 100%, 50% 100%);
    }
  `}
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
`;

const ImpactLine = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 50%;
  width: 4px;
  height: 100%;
  transform: translateX(-50%);
  z-index: 5;
  pointer-events: none;
`;

const ContentLayer = styled.div`
  position: relative;
  z-index: 10;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;

  @media (max-width: 768px) {
    height: auto;
    min-height: 100vh;
    justify-content: center;
    padding: 4rem 1rem 2rem;
    gap: 0.4rem;
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const Eyebrow = styled(motion.p)`
  font-family: "Orbitron", sans-serif;
  font-size: 0.6rem;
  font-weight: 700;
  color: #d4af37;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 20px rgba(212, 175, 55, 0.5);

  @media (max-width: 768px) {
    font-size: 0.5rem;
    letter-spacing: 0.3em;
    margin-bottom: 0.15rem;
  }
`;

const MainTitle = styled(motion.h2)`
  font-family: "Orbitron", sans-serif;
  font-size: clamp(1.2rem, 3vw, 2.2rem);
  font-weight: 900;
  color: #fff;
  text-align: center;
  text-shadow:
    0 0 30px rgba(255, 255, 255, 0.4),
    0 0 60px rgba(255, 255, 255, 0.2);
  max-width: 600px;
  line-height: 1.2;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: clamp(0.85rem, 5vw, 1.3rem);
    margin-bottom: 0.15rem;
  }
`;

const Subtitle = styled(motion.p)`
  font-family: "Rajdhani", sans-serif;
  font-size: clamp(0.9rem, 1.5vw, 1rem);
  color: rgba(247, 247, 247, 1);
  text-align: center;
  max-width: 500px;
  line-height: 1.5;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    font-size: 0.72rem;
    margin-bottom: 0.6rem;
    line-height: 1.3;
  }
`;

const CardsRow = styled(motion.div)`
  display: flex;
  gap: 1.5rem;
  width: 100%;
  max-width: 1100px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
    gap: 0.5rem;
    max-width: 100%;
    margin: 0;
    padding: 0 0.25rem;
  }
`;

const stampSlam = keyframes`
  0% { transform: rotate(-8deg) scale(1.5); opacity: 0; }
  50% { transform: rotate(-5deg) scale(0.95); opacity: 1; }
  70% { transform: rotate(-6deg) scale(1.05); }
  100% { transform: rotate(-6deg) scale(1); }
`;

const DocumentCard = styled(motion.div)<{ $faction: "police" | "criminal" | "wanted" }>`
  flex: 1;
  min-width: min(260px, 100%);
  max-width: 340px;
  position: relative;
  background: ${({ $faction }) =>
    $faction === "police"
      ? "linear-gradient(170deg, rgba(20,30,60,0.95), rgba(10,15,30,0.98))"
      : $faction === "criminal"
        ? "linear-gradient(170deg, rgba(40,15,15,0.95), rgba(20,8,8,0.98))"
        : "linear-gradient(170deg, rgba(30,25,15,0.95), rgba(15,12,8,0.98))"};
  border: 1.5px solid ${({ $faction }) =>
    $faction === "police"
      ? "rgba(59,130,246,0.3)"
      : $faction === "criminal"
        ? "rgba(239,68,68,0.3)"
        : "rgba(249,115,22,0.3)"};
  clip-path: polygon(
    0 12px,
    12px 0,
    calc(100% - 12px) 0,
    100% 12px,
    100% calc(100% - 12px),
    calc(100% - 12px) 100%,
    12px 100%,
    0 calc(100% - 12px)
  );
  padding: 0;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.2'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 0;
  }

  &:hover .stamp {
    animation: ${stampSlam} 0.4s ease forwards;
  }

  @media (max-width: 768px) {
    flex: unset;
    min-width: 0;
    max-width: none;
    clip-path: none;
    border-radius: 8px;

    ${({ $faction }) =>
      $faction === "wanted" &&
      `
      grid-column: 1 / -1;
    `}
  }
`;

const StampBanner = styled.div<{ $faction: "police" | "criminal" | "wanted" }>`
  position: relative;
  z-index: 1;
  padding: 10px 16px;
  background: ${({ $faction }) =>
    $faction === "police"
      ? "linear-gradient(90deg, rgba(37,99,235,0.95), rgba(59,130,246,0.8))"
      : $faction === "criminal"
        ? "linear-gradient(90deg, rgba(220,38,38,0.95), rgba(239,68,68,0.8))"
        : "linear-gradient(90deg, rgba(234,88,12,0.95), rgba(249,115,22,0.8))"};
  border-bottom: 1px solid rgba(255,255,255,0.1);

  @media (max-width: 768px) {
    padding: 8px 12px;
  }
`;

const StampText = styled.span<{ $faction: "police" | "criminal" | "wanted" }>`
  font-family: "Orbitron", sans-serif;
  font-size: 0.55rem;
  font-weight: 900;
  letter-spacing: 0.2em;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
  display: inline-block;
  padding: 4px 12px;
  border: 2px solid rgba(255,255,255,0.6);
  border-radius: 4px;
  transform: rotate(-6deg);
  opacity: 0.9;

  @media (max-width: 768px) {
    font-size: 0.45rem;
    padding: 3px 8px;
    letter-spacing: 0.12em;
  }

  ${({ $faction }) =>
    $faction === "criminal" &&
    `
    transform: rotate(-4deg) translateX(4px);
  `}
  ${({ $faction }) =>
    $faction === "wanted" &&
    `
    transform: rotate(-5deg);
  `}
`;

const DocumentBody = styled.div`
  position: relative;
  z-index: 1;
  padding: 16px 18px 12px;

  @media (max-width: 768px) {
    padding: 8px 10px 6px;
  }
`;

const FieldRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    padding: 3px 0;
    gap: 4px;
  }
`;

const FieldLabel = styled.span`
  font-family: "Orbitron", sans-serif;
  font-size: 0.5rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.73);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  min-width: 80px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    min-width: 50px;
    font-size: 0.35rem;
    letter-spacing: 0.04em;
  }
`;

const FieldValue = styled.span`
  font-family: "Rajdhani", sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(255,255,255,0.75);

  @media (max-width: 768px) {
    font-size: 0.58rem;
  }
`;

const ProgressionValue = styled.span`
  font-family: "Rajdhani", sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255,255,255,0.75);
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;

  @media (max-width: 768px) {
    font-size: 0.5rem;
    gap: 2px;
  }
`;

const ProgStep = styled.span<{ $faction: "police" | "criminal" }>`
  padding: 1px 6px;
  background: ${({ $faction }) =>
    $faction === "police"
      ? "rgba(59,130,246,0.15)"
      : "rgba(239,68,68,0.15)"};
  border-radius: 3px;
  font-size: 0.7rem;
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 0.45rem;
    padding: 1px 3px;
  }
`;

const ProgArrow = styled.span`
  color: rgba(255,255,255,0.2);
  font-size: 0.6rem;
`;

const DocumentFooter = styled.div`
  position: relative;
  z-index: 1;
  padding: 0 18px 16px;

  @media (max-width: 768px) {
    padding: 0 10px 8px;
  }
`;

const DottedLine = styled.div<{ $faction: "police" | "criminal" | "wanted" }>`
  border-top: 1.5px dashed rgba(255, 255, 255, 0.45);
  margin-bottom: 18px;
  margin-top: 18px;
  position: relative;

  @media (max-width: 768px) {
    margin-bottom: 6px;
    margin-top: 4px;
  }

  &::after {
    content: "ASSINATURA DIGITAL";
    position: absolute;
    top: 2px;
    left: 50%;
    transform: translateX(-50%);
    font-family: "Orbitron", sans-serif;
    font-size: 0.5rem;
    color: rgba(255, 255, 255, 0.7);
    letter-spacing: 0.15em;
    background: ${({ $faction }) =>
      $faction === "police"
        ? "rgba(20,30,60,0.95)"
        : $faction === "criminal"
          ? "rgba(40,15,15,0.95)"
          : "rgba(30,25,15,0.95)"};
    padding: 0 8px;

    @media (max-width: 768px) {
      font-size: 0.3rem;
      letter-spacing: 0.06em;
      padding: 0 4px;
    }
  }
`;

const ActionButton = styled.a<{ $faction: "police" | "criminal" | "wanted" }>`
  display: block;
  width: 100%;
  text-align: center;
  padding: 10px 16px;
  font-family: "Orbitron", sans-serif;
  font-size: 0.55rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  color: #fff;
  background: ${({ $faction }) =>
    $faction === "police"
      ? "linear-gradient(135deg, rgba(37,99,235,0.9), rgba(59,130,246,0.7))"
      : $faction === "criminal"
        ? "linear-gradient(135deg, rgba(220,38,38,0.9), rgba(239,68,68,0.7))"
        : "linear-gradient(135deg, rgba(234,88,12,0.9), rgba(249,115,22,0.7))"};
  border: 1px solid ${({ $faction }) =>
    $faction === "police"
      ? "rgba(59,130,246,0.4)"
      : $faction === "criminal"
        ? "rgba(239,68,68,0.4)"
        : "rgba(249,115,22,0.4)"};
  clip-path: polygon(
    0 6px,
    6px 0,
    calc(100% - 6px) 0,
    100% 6px,
    100% calc(100% - 6px),
    calc(100% - 6px) 100%,
    6px 100%,
    0 calc(100% - 6px)
  );
  cursor: pointer;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    padding: 6px 8px;
    font-size: 0.4rem;
    letter-spacing: 0.06em;
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${({ $faction }) =>
      $faction === "police"
        ? "0 4px 20px rgba(59,130,246,0.4)"
        : $faction === "criminal"
          ? "0 4px 20px rgba(239,68,68,0.4)"
          : "0 4px 20px rgba(249,115,22,0.4)"};
  }
`;

const StarsRow = styled.div`
  display: flex;
  flex-direction: row-reverse;
  gap: 0.4rem;
  justify-content: center;
  margin: 12px 0;

  @media (max-width: 768px) {
    margin: 4px 0;
    gap: 0.15rem;
  }
`;

const StarInput = styled.input`
  display: none;
`;

const StarLabel = styled.label<{ $filled: boolean }>`
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.2);
  }

  svg {
    width: 1.8rem;
    height: 1.8rem;
    fill: ${({ $filled }) => ($filled ? "#f97316" : "transparent")};
    stroke: ${({ $filled }) => ($filled ? "#f97316" : "rgba(255,255,255,0.2)")};
    stroke-width: 1.5;
    stroke-linejoin: bevel;
    filter: ${({ $filled }) =>
      $filled ? "drop-shadow(0 0 8px rgba(249,115,22,0.5))" : "none"};
    transition: fill 0.3s ease, stroke 0.3s ease, filter 0.3s ease;

    @media (max-width: 768px) {
      width: 1rem;
      height: 1rem;
    }
  }
`;

const LegendBox = styled.div<{ $level: number }>`
  padding: 10px 14px;
  background: ${({ $level }) =>
    $level === 0
      ? "rgba(255,255,255,0.02)"
      : $level <= 2
        ? "rgba(249,115,22,0.06)"
        : $level <= 4
          ? "rgba(239,68,68,0.08)"
          : "rgba(220,38,38,0.12)"};
  border: 1px solid ${({ $level }) =>
    $level === 0
      ? "rgba(255,255,255,0.04)"
      : $level <= 2
        ? "rgba(249,115,22,0.15)"
        : $level <= 4
          ? "rgba(239,68,68,0.2)"
          : "rgba(220,38,38,0.3)"};
  border-radius: 6px;
  min-height: 60px;
  transition: all 0.4s ease;

  @media (max-width: 768px) {
    padding: 5px 7px;
    min-height: 35px;
  }
`;

const LegendTitle = styled.p<{ $level: number }>`
  font-family: "Orbitron", sans-serif;
  font-size: 0.6rem;
  font-weight: 700;
  color: ${({ $level }) =>
    $level === 0
      ? "rgba(255,255,255,0.35)"
      : $level <= 2
        ? "#f97316"
        : $level <= 4
          ? "#ef4444"
          : "#dc2626"};
  margin-bottom: 0.2rem;
  letter-spacing: 0.5px;

  @media (max-width: 768px) {
    font-size: 0.38rem;
    margin-bottom: 0.05rem;
  }
`;

const LegendDesc = styled.p`
  font-family: "Rajdhani", sans-serif;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;

  @media (max-width: 768px) {
    font-size: 0.5rem;
    line-height: 1.2;
  }
`;

const ClosingPhrase = styled(motion.p)`
  font-family: "Rajdhani", sans-serif;
  font-size: 0.7rem;
  font-style: italic;
  color: rgba(255, 255, 255, 0.66);
  margin-top: 0.75rem;

  @media (max-width: 768px) {
    font-size: 0.45rem;
    margin-top: 0.3rem;
  }
`;

const wantedLevels = [
  { title: "", desc: "Clique nas estrelas e veja o que acontece em cada nível." },
  { title: "1 — Perturbação leve", desc: "Uma patrulha próxima já te notou. Nada demais, por enquanto." },
  { title: "2 — Foragido", desc: "Bloqueios estão sendo montados nas vias principais da região." },
  { title: "3 — Procurado", desc: "Unidades táticas foram acionadas. A perseguição está só começando." },
  { title: "4 — Alta periculosidade", desc: "Reforços chegando de todos os lados. Fugir não vai ser fácil." },
  { title: "5 — Inimigo público", desc: "Toda a força policial de Atlas City está atrás de você agora." },
];

const starSvg = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path
      pathLength={360}
      d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"
    />
  </svg>
);

export default function ConfrontationSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [rating, setRating] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 20,
    restDelta: 0.001,
  });

  const leftX = useTransform(smoothProgress, [0, 0.2], ["-100%", "0%"]);
  const rightX = useTransform(smoothProgress, [0, 0.2], ["100%", "0%"]);

  const impactOpacity = useTransform(
    smoothProgress,
    [0.18, 0.22, 0.24, 0.26, 0.28, 0.32],
    [0, 1, 0.3, 1, 0.5, 0]
  );
  const impactScale = useTransform(smoothProgress, [0.18, 0.28], [0.5, 2]);

  const layer1Opacity = useTransform(smoothProgress, [0.28, 0.36], [0, 1]);
  const layer1Y = useTransform(smoothProgress, [0.28, 0.36], [30, 0]);

  const cardLeftY = useTransform(smoothProgress, [0.38, 0.48], [60, 0]);
  const cardLeftOpacity = useTransform(smoothProgress, [0.38, 0.48], [0, 1]);

  const cardRightY = useTransform(smoothProgress, [0.4, 0.5], [60, 0]);
  const cardRightOpacity = useTransform(smoothProgress, [0.4, 0.5], [0, 1]);

  const wantedOpacity = useTransform(smoothProgress, [0.55, 0.65], [0, 1]);
  const wantedY = useTransform(smoothProgress, [0.55, 0.65], [40, 0]);

  const currentLevel = wantedLevels[rating];

  return (
    <Section ref={sectionRef}>
      <StickyContainer>
        <HalfImage $side="left" style={{ x: leftX }} />
        <HalfImage $side="right" style={{ x: rightX }} />

        <Overlay
          style={{
            background:
              "linear-gradient(to right, rgba(30,58,138,0.5) 0%, rgba(30,58,138,0.2) 35%, transparent 50%, rgba(153,27,27,0.2) 65%, rgba(153,27,27,0.5) 100%)",
          }}
        />
        <Overlay
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 30%, transparent 50%, rgba(0,0,0,0.4) 80%, rgba(0,0,0,0.7) 100%)",
          }}
        />

        <ImpactLine
          style={{
            opacity: impactOpacity,
            scale: impactScale,
            background:
              "linear-gradient(to bottom, transparent 5%, rgba(59,130,246,0.8) 25%, rgba(255,255,255,0.95) 50%, rgba(239,68,68,0.8) 75%, transparent 95%)",
            boxShadow:
              "0 0 40px rgba(255,255,255,0.5), 0 0 80px rgba(59,130,246,0.3), 0 0 80px rgba(239,68,68,0.3)",
          }}
        />

        <ContentLayer>
          <Eyebrow style={{ opacity: layer1Opacity, y: layer1Y }}>
            FACÇÕES ATIVAS
          </Eyebrow>
          <MainTitle style={{ opacity: layer1Opacity, y: layer1Y }}>
            Policial ou fora da lei?<br/>
            <span style={{ color: "#d4af37" }}>A escolha é sua</span>
          </MainTitle>
          <Subtitle style={{ opacity: layer1Opacity, y: layer1Y }}>
            Em Atlas RP, lei e crime não são só estética são sistemas reais.<br/>
            Escolha seu caminho e viva as consequências dele.
          </Subtitle>

          <CardsRow>
            {/* FICHA POLÍCIA */}
            <DocumentCard
              $faction="police"
              style={{ opacity: cardLeftOpacity, y: cardLeftY }}
            >
              <StampBanner $faction="police">
                <StampText $faction="police" className="stamp">
                  REGISTRO OFICIAL
                </StampText>
              </StampBanner>
              <DocumentBody>
                <FieldRow>
                  <FieldLabel>CORPORAÇÃO</FieldLabel>
                  <FieldValue>Corporação Policial</FieldValue>
                </FieldRow>
                <FieldRow>
                  <FieldLabel>FUNÇÃO</FieldLabel>
                  <FieldValue>Manter a lei em Atlas City</FieldValue>
                </FieldRow>
                <FieldRow>
                  <FieldLabel>PROGRESSÃO</FieldLabel>
                  <ProgressionValue>
                    <ProgStep $faction="police">Recruta</ProgStep>
                    <ProgArrow>›</ProgArrow>
                    <ProgStep $faction="police">Oficial</ProgStep>
                    <ProgArrow>›</ProgArrow>
                    <ProgStep $faction="police">Sargento</ProgStep>
                    <ProgArrow>›</ProgArrow>
                    <ProgStep $faction="police">Delegado</ProgStep>
                  </ProgressionValue>
                </FieldRow>
                <FieldRow>
                  <FieldLabel>STATUS</FieldLabel>
                  <FieldValue style={{ color: "#60a5fa" }}>
                    Recrutamento aberto
                  </FieldValue>
                </FieldRow>
              </DocumentBody>
              <DocumentFooter>
                <DottedLine $faction="police" />
                <ActionButton $faction="police" href="/atlas">
                  Assinar meu Alistamento
                </ActionButton>
              </DocumentFooter>
            </DocumentCard>

            {/* FICHA CRIMINOSA */}
            <DocumentCard
              $faction="criminal"
              style={{ opacity: cardRightOpacity, y: cardRightY }}
            >
              <StampBanner $faction="criminal">
                <StampText $faction="criminal" className="stamp">
                  FICHA CRIMINAL
                </StampText>
              </StampBanner>
              <DocumentBody>
                <FieldRow>
                  <FieldLabel>ORGANIZAÇÃO</FieldLabel>
                  <FieldValue>Facções Criminosas</FieldValue>
                </FieldRow>
                <FieldRow>
                  <FieldLabel>FUNÇÃO</FieldLabel>
                  <FieldValue>Dominar o submundo de Atlas City</FieldValue>
                </FieldRow>
                <FieldRow>
                  <FieldLabel>PROGRESSÃO</FieldLabel>
                  <ProgressionValue>
                    <ProgStep $faction="criminal">Novato</ProgStep>
                    <ProgArrow>›</ProgArrow>
                    <ProgStep $faction="criminal">Membro</ProgStep>
                    <ProgArrow>›</ProgArrow>
                    <ProgStep $faction="criminal">Braço Direito</ProgStep>
                    <ProgArrow>›</ProgArrow>
                    <ProgStep $faction="criminal">Chefe</ProgStep>
                  </ProgressionValue>
                </FieldRow>
                <FieldRow>
                  <FieldLabel>STATUS</FieldLabel>
                  <FieldValue style={{ color: "#f87171" }}>
                    Território em disputa
                  </FieldValue>
                </FieldRow>
              </DocumentBody>
              <DocumentFooter>
                <DottedLine $faction="criminal" />
                <ActionButton $faction="criminal" href="/atlas">
                  Assinar minha Entrada
                </ActionButton>
              </DocumentFooter>
            </DocumentCard>

            {/* FICHA PROCURADO */}
            <DocumentCard
              $faction="wanted"
              style={{ opacity: wantedOpacity, y: wantedY }}
            >
              <StampBanner $faction="wanted">
                <StampText $faction="wanted" className="stamp">
                  NÍVEL DE AMEAÇA
                </StampText>
              </StampBanner>
              <DocumentBody>
                <FieldRow>
                  <FieldLabel>SISTEMA</FieldLabel>
                  <FieldValue>Procurado em Atlas City</FieldValue>
                </FieldRow>
                <StarsRow>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star}>
                      <StarInput
                        type="radio"
                        id={`wanted-star-${star}`}
                        name="wanted-rating"
                        value={star}
                        checked={rating === star}
                        onChange={() => setRating(star)}
                      />
                      <StarLabel
                        htmlFor={`wanted-star-${star}`}
                        $filled={star <= rating}
                      >
                        {starSvg}
                      </StarLabel>
                    </span>
                  ))}
                </StarsRow>
                <LegendBox $level={rating}>
                  <LegendTitle $level={rating}>{currentLevel.title}</LegendTitle>
                  <LegendDesc>{currentLevel.desc}</LegendDesc>
                </LegendBox>
              </DocumentBody>
              <DocumentFooter>
                <DottedLine $faction="wanted" />
                <ClosingPhrase>
                  Cada escolha tem peso. Cada estrela conta uma história.
                </ClosingPhrase>
              </DocumentFooter>
            </DocumentCard>
          </CardsRow>
        </ContentLayer>
      </StickyContainer>
    </Section>
  );
}
