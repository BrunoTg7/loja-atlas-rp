"use client";

import {
  motion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useRef, useState, useEffect } from "react";
import styled from "styled-components";

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
  filter: saturate(0.7) brightness(0.85);

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
  margin-top: 5rem;
  padding: 1.5rem;
  gap: 0.5rem;

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
  font-family: "Cinzel", serif;
  font-size: 1rem;
  font-weight: 700;
  color: #ffa109ff;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 25px rgba(245, 166, 35, 0.5);

  @media (max-width: 768px) {
    font-size: 0.8rem;
    letter-spacing: 0.3em;
    margin-bottom: 0.15rem;
  }
`;

const MainTitle = styled(motion.h2)`
  font-family: "Cinzel", serif;
  font-size: clamp(1rem, 3vw, 1.9rem);
  font-weight: 900;
  color: #fff;
  text-align: center;
  text-shadow:
    0 0 40px rgba(245, 166, 35, 0.3),
    0 2px 20px rgba(0, 0, 0, 0.5);
  max-width: 650px;
  line-height: 1.3;
  margin-bottom: 0.3rem;


  @media (max-width: 768px) {
    font-size: clamp(0.9rem, 5.5vw, 1.4rem);
    margin-bottom: 0.15rem;
  }
`;

const Subtitle = styled(motion.p)`
  font-family: "Rajdhani", sans-serif;
  font-size: clamp(1rem, 1.6vw, 1.18rem);
  color: rgba(255, 255, 255, 1);
  text-align: center;
  max-width: 520px;
  line-height: 1.4;
  margin-bottom: 0.8rem;

  @media (max-width: 768px) {
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
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
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
    max-width: 100%;
    margin: 0;
    padding: 0 0.25rem;
  }
`;

const NarrativeBlock = styled(motion.div)<{ $accent: string }>`
  flex: 1;
  min-width: min(280px, 100%);
  max-width: 420px;
  position: relative;
  padding: 1.2rem 1.2rem;
  border-radius: 6px;
  background: linear-gradient(
    135deg,
    rgba(245, 166, 35, 0.08),
    rgba(${({ $accent }) => $accent}, 0.06),
    rgba(11, 15, 26, 0.5)
  );
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1.5px solid rgba(${({ $accent }) => $accent}, 0.25);
  overflow: hidden;
  transition: border-color 0.5s ease, box-shadow 0.5s ease;

  &:hover {
    border-color: rgba(${({ $accent }) => $accent}, 0.45);
    box-shadow: 0 0 30px rgba(${({ $accent }) => $accent}, 0.1);
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent, rgba(${({ $accent }) => $accent}, 0.6), transparent);
  }

  @media (max-width: 768px) {
    min-width: 0;
    flex: 1 1 45%;
    max-width: none;
    padding: 0.8rem 0.6rem;
  }
`;

const NarrativeIcon = styled.div<{ $color: string }>`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.8rem;
  background: rgba(${({ $color }) => $color}, 0.12);
  border: 1.5px solid rgba(${({ $color }) => $color}, 0.3);
  box-shadow: 0 0 20px rgba(${({ $color }) => $color}, 0.15);

  svg {
    width: 24px;
    height: 24px;
    color: ${({ $color }) => {
      if ($color === "245,166,35") return "#F5A623";
      if ($color === "220,80,60") return "#DC503C";
      return "#F5A623";
    }};
  }

  @media (max-width: 768px) {
    width: 24px;
    height: 24px;
    margin-bottom: 0;
    margin-right: 0.4rem;
    flex-shrink: 0;

    svg {
      width: 12px;
      height: 12px;
    }
  }
`;

const NarrativeTitle = styled.h3`
  font-family: "Cinzel", serif;
  font-size: 0.9rem;
  font-weight: 700;
  color: #F5A623;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin: 0;
  text-shadow: 0 0 20px rgba(245, 166, 35, 0.35);
  text-align: center;
  flex: 1;

  @media (max-width: 768px) {
    font-size: 0.7rem;
    letter-spacing: 0.05em;
  }
`;


const NarrativeText = styled.p`
  font-family: "Rajdhani", sans-serif;
  font-size: 1rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
  margin-bottom: 0.8rem;

  @media (max-width: 768px) {
    font-size: 0.88rem;
    line-height: 1.4;
    margin-bottom: 0.5rem;
  }
`;



const ClosingLine = styled.p`
  font-family: "Cinzel", serif;
  font-size: 0.72rem;
  font-style: italic;
  color: rgba(245, 165, 35, 1);
  letter-spacing: 0.05em;

  @media (max-width: 768px) {
    font-size: 0.65rem;
  }
`;

function GoldenParticles() {
  const [particles, setParticles] = useState<{ left: string; bg: string; yEnd: number; xEnd: number; duration: number }[]>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 14 }).map((_, i) => ({
        left: `${8 + Math.random() * 84}%`,
        bg: i % 3 === 0
          ? "rgba(245,166,35,0.5)"
          : i % 3 === 1
            ? "rgba(220,80,60,0.4)"
            : "rgba(255,200,87,0.45)",
        yEnd: -800 - Math.random() * 250,
        xEnd: (Math.random() - 0.5) * 70,
        duration: 6 + Math.random() * 4,
      }))
    );
  }, []);

  if (particles.length === 0) return <div className="absolute inset-0 pointer-events-none z-[1] overflow-hidden" />;

  return (
    <div className="absolute inset-0 pointer-events-none z-[1] overflow-hidden">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{ left: p.left, bottom: "-3%", background: p.bg }}
          animate={{ y: [0, p.yEnd], opacity: [0, 0.7, 0], x: [0, p.xEnd] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: i * 0.7, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

export default function ConfrontationSectionV2() {
  const sectionRef = useRef<HTMLDivElement>(null);

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

  return (
    <Section ref={sectionRef}>
      <StickyContainer>
        <HalfImage $side="left" style={{ x: leftX }} />
        <HalfImage $side="right" style={{ x: rightX }} />

    {/* Subtle golden cinematic overlay */}
<Overlay
  style={{
    background:
      "linear-gradient(to right, rgba(15,10,5,0.5) 0%, rgba(15,10,5,0.25) 30%, rgba(255,215,0,0.12) 50%, rgba(15,10,5,0.25) 70%, rgba(15,10,5,0.5) 100%)",
  }}
/>
<Overlay
  style={{
    background:
      "linear-gradient(to top, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.18) 30%, rgba(255,215,0,0.08) 50%, rgba(0,0,0,0.25) 80%, rgba(0,0,0,0.45) 100%)",
  }}
/>

        {/* Golden impact line */}
        <ImpactLine
          style={{
            opacity: impactOpacity,
            scale: impactScale,
            background:
              "linear-gradient(to bottom, transparent 5%, rgba(245,166,35,0.6) 25%, rgba(255,210,100,0.95) 50%, rgba(245,166,35,0.6) 75%, transparent 95%)",
            boxShadow:
              "0 0 50px rgba(245,166,35,0.35), 0 0 100px rgba(245,166,35,0.15)",
          }}
        />

        <GoldenParticles />

        <ContentLayer>
          <Eyebrow style={{ opacity: layer1Opacity, y: layer1Y }}>
            DUAS FORMAS DE PERTENCER
          </Eyebrow>
          <MainTitle style={{ opacity: layer1Opacity, y: layer1Y }}>
            Herói da farda ou dono das ruas?
            <br />
            <span style={{ color: "#F5A623" }}>Quem decide o seu legado é você</span>
          </MainTitle>
          <Subtitle style={{ opacity: layer1Opacity, y: layer1Y }}>
            Em Atlas RP, lei e crime não são aparências são caminhos de poder.
            <br />
            Inspirada na força do Titã Atlas, nossa cidade se sustenta sobre as escolhas de quem joga.
            <br />
            Aqui, cada ação deixa uma marca e cada aliança molda o futuro.
          </Subtitle>

          <CardsRow>
            {/* A ORDEM */}
            <NarrativeBlock
              $accent="245,166,35"
              style={{ opacity: cardLeftOpacity, y: cardLeftY }}
            >
              <div className="flex items-center">
                <NarrativeIcon $color="245,166,35">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </NarrativeIcon>
                <NarrativeTitle>A Ordem</NarrativeTitle>
              </div>
              
              <NarrativeText>
                Atlas City não se sustenta sozinha. Enquanto o caos tenta engolir
                as ruas, a Ordem protege o que foi construído. Recruta, oficial ou
                delegado: cada distintivo é a promessa de que a cidade não vai cair.
              </NarrativeText>
              <ClosingLine>A cidade precisa da sua força. Você está pronto para o fardo?</ClosingLine>
            </NarrativeBlock>

            {/* AS SOMBRAS */}
            <NarrativeBlock
              $accent="220,80,60"
              style={{ opacity: cardRightOpacity, y: cardRightY }}
            >
              <div className="flex items-center">
                <NarrativeIcon $color="220,80,60">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </NarrativeIcon>
                <NarrativeTitle>As Sombras</NarrativeTitle>
              </div>
             
              <NarrativeText>
                Nem toda história de respeito segue as regras. Nos becos de Atlas
                City, impérios nascem da pura determinação. Aqui, o respeito é
                conquistado à força. Do novato ao chefe que move as peças, cada
                passo é uma aposta real.
              </NarrativeText>
              <ClosingLine>O submundo não espera por fracos. Ele espera por você.</ClosingLine>
            </NarrativeBlock>
          </CardsRow>

          {/* Closing text */}
          <motion.p
            style={{ opacity: layer1Opacity, y: layer1Y }}
            className="font-rajdhani text-sm md:text-base text-white/80 italic text-center mt-6 max-w-xl mx-auto"
          >
            A história já começou. O resto depende de você. Bem-vindo a Atlas RP.
          </motion.p>
        </ContentLayer>
      </StickyContainer>
    </Section>
  );
}
