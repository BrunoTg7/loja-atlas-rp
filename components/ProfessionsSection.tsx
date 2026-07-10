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
  perspective: 1000px;
`;

const HalfImage = styled(motion.div)<{ $side: "left" | "right" }>`
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  will-change: transform;
  backface-visibility: hidden;

  ${({ $side }) =>
    $side === "left"
      ? `
    left: 0;
    background-image: url('/Imagens/mecanica.webp');
    transform-origin: left center;
    clip-path: polygon(0 0, 40vw 0, 60vw 100vh, 0 100vh);

    @media (max-width: 768px) {
      clip-path: polygon(0 0, 35vw 0, 55vw 100vh, 0 100vh);
    }
  `
      : `
    left: 0;
    background-image: url('/Imagens/hospital.webp');
    transform-origin: right center;
    clip-path: polygon(40vw 0, 100vw 0, 100vw 100vh, 60vw 100vh);

    @media (max-width: 768px) {
      clip-path: polygon(35vw 0, 100vw 0, 100vw 100vh, 55vw 100vh);
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
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 5;
  pointer-events: none;

  @media (max-width: 768px) {
    display: none;
  }

  &::after {
    content: "";
    position: absolute;
    top: -10%;
    left: 50%;
    width: 4px;
    height: 120%;
    background: linear-gradient(
      to bottom,
      transparent 5%,
      rgba(249,115,22,0.8) 25%,
      rgba(255,255,255,0.95) 50%,
      rgba(34,197,94,0.8) 75%,
      transparent 95%
    );
    box-shadow:
      0 0 40px rgba(255,255,255,0.5),
      0 0 80px rgba(249,115,22,0.3),
      0 0 80px rgba(34,197,94,0.3);
    transform-origin: center center;
    transform: skewX(22.7deg);
  }
`;

const ContentLayer = styled.div`
  position: relative;
  z-index: 10;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding: 0 1.8rem 3vh;
  overflow: hidden;

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
  font-size: clamp(1rem, 3vw, 2.2rem);
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
  font-size: clamp(0.8rem, 1.5vw, 1rem);
  color: rgba(247, 247, 247, 1);
  text-align: center;
  max-width: 500px;
  line-height: 1.5;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    font-size: 0.72rem;
    margin-bottom: 0.6rem;
    line-height: 1.3;
  }
`;

const CardsRow = styled(motion.div)`
  display: flex;
  gap: 1rem;
  width: 100%;
  max-width: 1100px;
  justify-content: center;
  align-items: stretch;
  flex-wrap: nowrap;
  margin-bottom: 1rem;

  @media (max-width: 900px) {
    flex-wrap: wrap;
    gap: 0.75rem;
  }

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

const MobileBottomRow = styled.div`
  display: contents;

  @media (max-width: 768px) {
    display: contents;
  }
`;

const stampSlam = keyframes`
  0% { transform: rotate(-8deg) scale(1.5); opacity: 0; }
  50% { transform: rotate(-5deg) scale(0.95); opacity: 1; }
  70% { transform: rotate(-6deg) scale(1.05); }
  100% { transform: rotate(-6deg) scale(1); }
`;

const DocumentCard = styled(motion.div)<{ $faction: "mechanic" | "hospital" }>`
  flex: 1;
  min-width: 0;
  max-width: 340px;
  position: relative;
  background: ${({ $faction }) =>
    $faction === "mechanic"
      ? "linear-gradient(170deg, rgba(40,25,10,0.95), rgba(20,12,5,0.98))"
      : "linear-gradient(170deg, rgba(10,35,20,0.95), rgba(5,18,10,0.98))"};
  border: 1.5px solid ${({ $faction }) =>
    $faction === "mechanic"
      ? "rgba(249,115,22,0.3)"
      : "rgba(34,197,94,0.3)"};
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
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 0;
  }

  &:hover .stamp {
    animation: ${stampSlam} 0.4s ease forwards;
  }

  @media (max-width: 900px) {
    flex: 1 1 calc(50% - 0.75rem);
    max-width: none;
  }

  @media (max-width: 768px) {
    flex: unset;
    min-width: 0;
    max-width: none;
    clip-path: none;
    border-radius: 8px;
  }
`;

const StampBanner = styled.div<{ $faction: "mechanic" | "hospital" }>`
  position: relative;
  z-index: 1;
  padding: 8px 14px;
  background: ${({ $faction }) =>
    $faction === "mechanic"
      ? "linear-gradient(90deg, rgba(234,88,12,0.95), rgba(249,115,22,0.8))"
      : "linear-gradient(90deg, rgba(21,128,61,0.95), rgba(34,197,94,0.8))"};
  border-bottom: 1px solid rgba(255,255,255,0.1);

  @media (max-width: 768px) {
    padding: 4px 4px;
  }
`;

const StampText = styled.span<{ $faction: "mechanic" | "hospital" }>`
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
    $faction === "hospital" &&
    `
    transform: rotate(-4deg) translateX(4px);
  `}
`;

const DocumentBody = styled.div`
  position: relative;
  z-index: 1;
  padding: 14px 16px 10px;

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

const ProgStep = styled.span<{ $faction: "mechanic" | "hospital" }>`
  padding: 1px 6px;
  background: ${({ $faction }) =>
    $faction === "mechanic"
      ? "rgba(249,115,22,0.15)"
      : "rgba(34,197,94,0.15)"};
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
  padding: 0 16px 14px;

  @media (max-width: 768px) {
    padding: 0 10px 8px;
  }
`;

const DottedLine = styled.div<{ $faction: "mechanic" | "hospital" }>`
  border-top: 1.5px dashed rgba(255, 255, 255, 0.45);
  margin-bottom: 18px;
  margin-top: 8px;
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
      $faction === "mechanic"
        ? "rgba(40,25,10,0.95)"
        : "rgba(10,35,20,0.95)"};
    padding: 0 8px;

    @media (max-width: 768px) {
      display: none;
    }
  }
`;

const ActionButton = styled.a<{ $faction: "mechanic" | "hospital" }>`
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
    $faction === "mechanic"
      ? "linear-gradient(135deg, rgba(234,88,12,0.9), rgba(249,115,22,0.7))"
      : "linear-gradient(135deg, rgba(21,128,61,0.9), rgba(34,197,94,0.7))"};
  border: 1px solid ${({ $faction }) =>
    $faction === "mechanic"
      ? "rgba(249,115,22,0.4)"
      : "rgba(34,197,94,0.4)"};
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
      $faction === "mechanic"
        ? "0 4px 20px rgba(249,115,22,0.4)"
        : "0 4px 20px rgba(34,197,94,0.4)"};
  }
`;

const FormCard = styled(motion.div)`
  flex: 1;
  min-width: 0;
  max-width: 340px;
  position: relative;
  background: linear-gradient(170deg, rgba(20,22,34,0.95), rgba(12,14,22,0.98));
  border: 1.5px solid rgba(212,175,55,0.3);
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

  @media (max-width: 900px) {
    flex: 1 1 100%;
    max-width: none;
  }

  order: 2;

  @media (max-width: 768px) {
    grid-column: 1 / -1;
    grid-row: 1;
    clip-path: none;
    border-radius: 8px;
    order: unset;
  }
`;

const FormBanner = styled.div`
  position: relative;
  z-index: 1;
  padding: 8px 14px;
  background: linear-gradient(90deg, rgba(180,150,50,0.95), rgba(212,175,55,0.8));
  border-bottom: 1px solid rgba(255,255,255,0.1);

  @media (max-width: 768px) {
    padding: 3px 4px;
  }
`;

const FormBannerText = styled.span`
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
    font-size: 0.38rem;
    padding: 2px 6px;
    letter-spacing: 0.1em;
  }
`;

const FormBody = styled.div`
  position: relative;
  z-index: 1;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  @media (max-width: 768px) {
    padding: 8px 10px;
    gap: 6px;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  @media (max-width: 768px) {
    gap: 2px;
  }
`;

const FormLabel = styled.label`
  font-family: "Orbitron", sans-serif;
  font-size: 0.5rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.63);
  letter-spacing: 0.1em;
  text-transform: uppercase;

  @media (max-width: 768px) {
    font-size: 0.38rem;
  }
`;

const FormInput = styled.input`
  font-family: "Rajdhani", sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: #fff;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  padding: 8px 12px;
  outline: none;
  transition: border-color 0.3s ease;

  &::placeholder {
    color: rgba(255,255,255,0.2);
  }

  &:focus {
    border-color: rgba(212,175,55,0.5);
  }

  @media (max-width: 768px) {
    font-size: 0.7rem;
    padding: 6px 8px;
  }
`;

const FormSelect = styled.select`
  font-family: "Rajdhani", sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: #fff;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  padding: 8px 12px;
  outline: none;
  cursor: pointer;
  transition: border-color 0.3s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;

  &:focus {
    border-color: rgba(212,175,55,0.5);
  }

  @media (max-width: 768px) {
    font-size: 0.7rem;
    padding: 6px 8px;
  }

  option {
    background: #121622;
    color: #fff;
  }
`;

const FormTextarea = styled.textarea`
  font-family: "Rajdhani", sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: #fff;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  padding: 8px 12px;
  outline: none;
  resize: none;
  min-height: 60px;
  transition: border-color 0.3s ease;

  &::placeholder {
    color: rgba(255,255,255,0.2);
  }

  &:focus {
    border-color: rgba(212,175,55,0.5);
  }

  @media (max-width: 768px) {
    font-size: 0.7rem;
    padding: 6px 8px;
    min-height: 35px;
  }
`;

const FormButton = styled.button`
  display: block;
  width: 100%;
  text-align: center;
  padding: 10px 16px;
  font-family: "Orbitron", sans-serif;
  font-size: 0.55rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #fff;
  background: linear-gradient(135deg, rgba(180,150,50,0.9), rgba(212,175,55,0.7));
  border: 1px solid rgba(212,175,55,0.4);
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
    box-shadow: 0 4px 20px rgba(212,175,55,0.4);
  }
`;

const FormFooter = styled.div`
  position: relative;
  z-index: 1;
  padding: 0 16px 14px;

  @media (max-width: 768px) {
    padding: 0 10px 8px;
  }
`;

const ClosingPhrase = styled(motion.p)`
  font-family: "Rajdhani", sans-serif;
  font-size: 0.7rem;
  font-style: italic;
  color: rgba(255,255,255,0.2);
  margin-top: 0.75rem;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 0.45rem;
    margin-top: 0.3rem;
  }
`;

export default function ProfessionsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    area: "",
    nome: "",
    motivo: "",
  });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 20,
    restDelta: 0.001,
  });

  const leftRotateY = useTransform(smoothProgress, [0, 0.25], ["-90deg", "0deg"]);
  const rightRotateY = useTransform(smoothProgress, [0, 0.25], ["90deg", "0deg"]);

  const impactOpacity = useTransform(
    smoothProgress,
    [0.23, 0.27, 0.29, 0.31, 0.33, 0.37],
    [0, 1, 0.3, 1, 0.5, 0]
  );
  const impactScale = useTransform(smoothProgress, [0.23, 0.33], [0.5, 2]);

  const layer1Opacity = useTransform(smoothProgress, [0.30, 0.40], [0, 1]);
  const layer1Y = useTransform(smoothProgress, [0.30, 0.40], [30, 0]);

  const cardLeftY = useTransform(smoothProgress, [0.40, 0.55], [60, 0]);
  const cardLeftOpacity = useTransform(smoothProgress, [0.40, 0.55], [0, 1]);

  const cardCenterY = useTransform(smoothProgress, [0.42, 0.57], [60, 0]);
  const cardCenterOpacity = useTransform(smoothProgress, [0.42, 0.57], [0, 1]);

  const cardRightY = useTransform(smoothProgress, [0.44, 0.59], [60, 0]);
  const cardRightOpacity = useTransform(smoothProgress, [0.44, 0.59], [0, 1]);

  return (
    <Section ref={sectionRef}>
      <StickyContainer>
        <HalfImage $side="left" style={{ rotateY: leftRotateY }} />
        <HalfImage $side="right" style={{ rotateY: rightRotateY }} />

        <Overlay
          style={{
            background:
              "linear-gradient(to right, rgba(234,88,12,0.5) 0%, rgba(234,88,12,0.2) 35%, transparent 50%, rgba(21,128,61,0.2) 65%, rgba(21,128,61,0.5) 100%)",
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
              "linear-gradient(to bottom, transparent 5%, rgba(249,115,22,0.8) 25%, rgba(255,255,255,0.95) 50%, rgba(34,197,94,0.8) 75%, transparent 95%)",
            boxShadow:
              "0 0 40px rgba(255,255,255,0.5), 0 0 80px rgba(249,115,22,0.3), 0 0 80px rgba(34,197,94,0.3)",
          }}
        />

        <ContentLayer>
          <Eyebrow style={{ opacity: layer1Opacity, y: layer1Y }}>
            PROFISSÕES ATIVAS
          </Eyebrow>
          <MainTitle style={{ opacity: layer1Opacity, y: layer1Y }}>
            Sua profissão, sua{" "}
            <span style={{ color: "#d4af37" }}>contribuição</span> para Atlas City
          </MainTitle>
          <Subtitle style={{ opacity: layer1Opacity, y: layer1Y }}>
            Essas profissões movimentam a economia e o dia a dia da cidade,<br/>
            com sistemas reais de trabalho.
          </Subtitle>

          <CardsRow>
            {/* FICHA MECÂNICA */}
            <DocumentCard
              $faction="mechanic"
              style={{ opacity: cardLeftOpacity, y: cardLeftY }}
            >
              <StampBanner $faction="mechanic">
                <StampText $faction="mechanic" className="stamp">
                  OFICINA MECÂNICA
                </StampText>
              </StampBanner>
              <DocumentBody>
                <FieldRow>
                  <FieldLabel>ÁREA</FieldLabel>
                  <FieldValue>Mecânica Automotiva</FieldValue>
                </FieldRow>
                <FieldRow>
                  <FieldLabel>FUNÇÃO</FieldLabel>
                  <FieldValue>Reparar veículos e vender peças</FieldValue>
                </FieldRow>
                <FieldRow>
                  <FieldLabel>PROGRESSÃO</FieldLabel>
                  <ProgressionValue>
                    <ProgStep $faction="mechanic">Aprendiz</ProgStep>
                    <ProgArrow>›</ProgArrow>
                    <ProgStep $faction="mechanic">Mecânico</ProgStep>
                    <ProgArrow>›</ProgArrow>
                    <ProgStep $faction="mechanic">Especialista</ProgStep>
                    <ProgArrow>›</ProgArrow>
                    <ProgStep $faction="mechanic">Dono</ProgStep>
                  </ProgressionValue>
                </FieldRow>
                <FieldRow>
                  <FieldLabel>SALÁRIO</FieldLabel>
                  <FieldValue style={{ color: "#fb923c" }}>
                    $5k — $25k/dia
                  </FieldValue>
                </FieldRow>
                <FieldRow>
                  <FieldLabel>STATUS</FieldLabel>
                  <FieldValue style={{ color: "#fb923c" }}>
                    Vagas abertas
                  </FieldValue>
                </FieldRow>
              </DocumentBody>
              <DocumentFooter>
                <DottedLine $faction="mechanic" />
                <ActionButton $faction="mechanic" href="/vips">
                  Trabalhar na Oficina
                </ActionButton>
              </DocumentFooter>
            </DocumentCard>

            {/* FICHA FORMULÁRIO */}
            <FormCard
              style={{ opacity: cardCenterOpacity, y: cardCenterY }}
            >
              <FormBanner>
                <FormBannerText className="stamp">
                  CANDIDATURA
                </FormBannerText>
              </FormBanner>
              <FormBody>
                <FormGroup>
                  <FormLabel>Escolha sua área</FormLabel>
                  <FormSelect
                    value={formData.area}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, area: e.target.value }))
                    }
                  >
                    <option value="">Selecione...</option>
                    <option value="mecanica">Mecânica</option>
                    <option value="hospital">Hospital</option>
                  </FormSelect>
                </FormGroup>
                <FormGroup>
                  <FormLabel>Nome do personagem</FormLabel>
                  <FormInput
                    type="text"
                    placeholder="Ex: João Silva"
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, nome: e.target.value }))
                    }
                  />
                </FormGroup>
                <FormGroup>
                  <FormLabel>Por que quer essa profissão?</FormLabel>
                  <FormTextarea
                    placeholder="Conte um pouco..."
                    value={formData.motivo}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, motivo: e.target.value }))
                    }
                  />
                </FormGroup>
              </FormBody>
              <FormFooter>
                <DottedLine $faction="mechanic" />
                <FormButton>Enviar Candidatura</FormButton>
              </FormFooter>
            </FormCard>

            {/* FICHA HOSPITAL */}
            <DocumentCard
              $faction="hospital"
              style={{ opacity: cardRightOpacity, y: cardRightY }}
            >
              <StampBanner $faction="hospital">
                <StampText $faction="hospital" className="stamp">
                  CORPO MÉDICO
                </StampText>
              </StampBanner>
              <DocumentBody>
                <FieldRow>
                  <FieldLabel>ÁREA</FieldLabel>
                  <FieldValue>Medicina de Emergência</FieldValue>
                </FieldRow>
                <FieldRow>
                  <FieldLabel>FUNÇÃO</FieldLabel>
                  <FieldValue>Salvar vidas e atender emergências</FieldValue>
                </FieldRow>
                <FieldRow>
                  <FieldLabel>PROGRESSÃO</FieldLabel>
                  <ProgressionValue>
                    <ProgStep $faction="hospital">Estagiário</ProgStep>
                    <ProgArrow>›</ProgArrow>
                    <ProgStep $faction="hospital">Enfermeiro</ProgStep>
                    <ProgArrow>›</ProgArrow>
                    <ProgStep $faction="hospital">Médico</ProgStep>
                    <ProgArrow>›</ProgArrow>
                    <ProgStep $faction="hospital">Diretor</ProgStep>
                  </ProgressionValue>
                </FieldRow>
                <FieldRow>
                  <FieldLabel>SALÁRIO</FieldLabel>
                  <FieldValue style={{ color: "#4ade80" }}>
                    $7k — $30k/dia
                  </FieldValue>
                </FieldRow>
                <FieldRow>
                  <FieldLabel>STATUS</FieldLabel>
                  <FieldValue style={{ color: "#4ade80" }}>
                    Recrutamento ativo
                  </FieldValue>
                </FieldRow>
              </DocumentBody>
              <DocumentFooter>
                <DottedLine $faction="hospital" />
                <ActionButton $faction="hospital" href="/vips">
                  Entrar para a Medicina
                </ActionButton>
              </DocumentFooter>
            </DocumentCard>
          </CardsRow>
        </ContentLayer>
      </StickyContainer>
    </Section>
  );
}
