"use client";

import {
  motion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useRef, useState } from "react";
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
  filter: saturate(0.6) brightness(0.8);

  ${({ $side }) =>
    $side === "left"
      ? `
    left: 0;
    background-image: url('/Imagens/mecanica.webp');
    transform-origin: left center;
    clip-path: polygon(0 0, 40vw 0, 60vw 100vh, 0 100vh);
  `
      : `
    left: 0;
    background-image: url('/Imagens/hospital.webp');
    transform-origin: right center;
    clip-path: polygon(40vw 0, 100vw 0, 100vw 100vh, 60vw 100vh);
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
      rgba(245,166,35,0.55) 25%,
      rgba(255,210,100,0.9) 50%,
      rgba(245,166,35,0.55) 75%,
      transparent 95%
    );
    box-shadow:
      0 0 50px rgba(245,166,35,0.3),
      0 0 100px rgba(245,166,35,0.12);
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
  margin-top: 5rem;
  justify-content: center;
  padding: 1.5rem;
  gap: 0.5rem;

  @media (max-width: 768px) {
    height: auto;
    margin-top: 0rem;
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
    font-size: clamp(0.95rem, 5.5vw, 1.4rem);
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

const NarrativeBlock = styled(motion.div)`
  flex: 1;
  min-width: min(280px, 100%);
  max-width: 420px;
  position: relative;
  padding: 1.2rem 1.2rem;
  border-radius: 6px;
  background: linear-gradient(
    135deg,
    rgba(245, 166, 35, 0.07),
    rgba(11, 15, 26, 0.5)
  );
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1.5px solid rgba(245, 166, 35, 0.2);
  overflow: hidden;
  transition: border-color 0.5s ease, box-shadow 0.5s ease;

  &:hover {
    border-color: rgba(245, 166, 35, 0.4);
    box-shadow: 0 0 30px rgba(245, 166, 35, 0.1);
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent, rgba(245, 166, 35, 0.5), transparent);
  }

  @media (max-width: 768px) {
    min-width: 0;
    flex: 1 1 45%;
    max-width: none;
    padding: 0.8rem 0.6rem;
  }
`;

const HeraldIcon = styled.div<{ $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0;
  margin-right: 0.6rem;
  flex-shrink: 0;
  background: rgba(${({ $color }) => $color}, 0.1);
  border: 1.5px solid rgba(${({ $color }) => $color}, 0.3);
  box-shadow: 0 0 20px rgba(${({ $color }) => $color}, 0.15);

  svg {
    width: 20px;
    height: 20px;
    color: ${({ $color }) => {
      if ($color === "245,166,35") return "#F5A623";
      if ($color === "80,180,120") return "#50B478";
      return "#F5A623";
    }};
  }

  @media (max-width: 768px) {
    width: 24px;
    height: 24px;
    margin-right: 0.4rem;

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
  font-size: 0.95rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.7;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    font-size: 0.8rem;
    line-height: 1.5;
    margin-bottom: 0.8rem;
  }
`;

const NarrativeDivider = styled.div`
  width: 36px;
  height: 2px;
  background: linear-gradient(90deg, rgba(245, 166, 35, 0.6), transparent);
  margin-bottom: 0.9rem;

  @media (max-width: 768px) {
    width: 28px;
    margin-bottom: 0.65rem;
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

const FormCard = styled(motion.div)`
  flex: 1;
  min-width: 0;
  max-width: 340px;
  position: relative;
  padding: 1.6rem 1.5rem;
  border-radius: 6px;
  background: linear-gradient(
    135deg,
    rgba(245, 166, 35, 0.06),
    rgba(11, 15, 26, 0.55)
  );
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1.5px solid rgba(245, 166, 35, 0.18);
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent, rgba(245, 166, 35, 0.45), transparent);
  }

  @media (max-width: 900px) {
    flex: 1 1 100%;
    max-width: none;
  }

  order: 2;

  @media (max-width: 768px) {
    max-width: none;
    padding: 1.2rem;
    order: unset;
  }
`;

const FormTitle = styled.h3`
  font-family: "Cinzel", serif;
  font-size: 0.88rem;
  font-weight: 700;
  color: #F5A623;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 1rem;
  text-align: center;
  text-shadow: 0 0 15px rgba(245, 166, 35, 0.25);

  @media (max-width: 768px) {
    font-size: 0.78rem;
    margin-bottom: 0.7rem;
  }
`;

const FormBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  @media (max-width: 768px) {
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
  font-family: "Cinzel", serif;
  font-size: 0.5rem;
  font-weight: 700;
  color: rgba(245, 166, 35, 0.65);
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
  background: rgba(245, 166, 35, 0.05);
  border: 1px solid rgba(245, 166, 35, 0.15);
  border-radius: 3px;
  padding: 8px 12px;
  outline: none;
  transition: border-color 0.4s ease, box-shadow 0.4s ease;

  &::placeholder {
    color: rgba(255, 255, 255, 0.25);
  }

  &:focus {
    border-color: rgba(245, 166, 35, 0.45);
    box-shadow: 0 0 12px rgba(245, 166, 35, 0.1);
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
  background: rgba(245, 166, 35, 0.05);
  border: 1px solid rgba(245, 166, 35, 0.15);
  border-radius: 3px;
  padding: 8px 12px;
  outline: none;
  cursor: pointer;
  transition: border-color 0.4s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(245,166,35,0.4)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;

  &:focus {
    border-color: rgba(245, 166, 35, 0.45);
  }

  @media (max-width: 768px) {
    font-size: 0.7rem;
    padding: 6px 8px;
  }

  option {
    background: #0B0F1A;
    color: #fff;
  }
`;

const FormTextarea = styled.textarea`
  font-family: "Rajdhani", sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: #fff;
  background: rgba(245, 166, 35, 0.05);
  border: 1px solid rgba(245, 166, 35, 0.15);
  border-radius: 3px;
  padding: 8px 12px;
  outline: none;
  resize: none;
  min-height: 60px;
  transition: border-color 0.4s ease;

  &::placeholder {
    color: rgba(255, 255, 255, 0.25);
  }

  &:focus {
    border-color: rgba(245, 166, 35, 0.45);
    box-shadow: 0 0 12px rgba(245, 166, 35, 0.1);
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
  font-family: "Cinzel", serif;
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #0B0F1A;
  background: linear-gradient(135deg, #F5A623, #E8941D);
  border: none;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.4s ease;
  box-shadow: 0 4px 20px rgba(245, 166, 35, 0.25);

  @media (max-width: 768px) {
    padding: 7px 10px;
    font-size: 0.48rem;
    letter-spacing: 0.06em;
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 28px rgba(245, 166, 35, 0.35);
  }
`;

function GoldenParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none z-[1] overflow-hidden">
      {Array.from({ length: 10 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            left: `${8 + Math.random() * 84}%`,
            bottom: "-3%",
            background: i % 2 === 0
              ? "rgba(245,166,35,0.45)"
              : "rgba(255,200,87,0.4)",
          }}
          animate={{
            y: [0, -window.innerHeight * 0.75 - Math.random() * 200],
            opacity: [0, 0.6, 0],
            x: [0, (Math.random() - 0.5) * 50],
          }}
          transition={{
            duration: 7 + Math.random() * 4,
            repeat: Infinity,
            delay: i * 0.9,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

export default function ProfessionsSectionV2() {
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
    [0.23, 0.28, 0.33, 0.37],
    [0, 1, 1, 0]
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

        {/* Warm cinematic overlay */}
        <Overlay
          style={{
            background:
              "linear-gradient(to right, rgba(15,10,5,0.5) 0%, rgba(15,10,5,0.25) 35%, rgba(245,166,35,0.04) 50%, rgba(15,10,5,0.25) 65%, rgba(15,10,5,0.5) 100%)",
          }}
        />
        <Overlay
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.15) 30%, transparent 50%, rgba(0,0,0,0.2) 80%, rgba(0,0,0,0.5) 100%)",
          }}
        />

        <ImpactLine
          style={{
            opacity: impactOpacity,
            scale: impactScale,
          }}
        />

        <GoldenParticles />

        <ContentLayer>
          <Eyebrow style={{ opacity: layer1Opacity, y: layer1Y }}>
            PROFISSÕES ATIVAS
          </Eyebrow>
          <MainTitle style={{ opacity: layer1Opacity, y: layer1Y }}>
            Sua profissão, seu{" "}
            <span style={{ color: "#F5A623" }}>legado</span> <br />O que você faz move Atlas
          </MainTitle>
          <Subtitle style={{ opacity: layer1Opacity, y: layer1Y }}>
            Nenhum império se sustenta sozinho. Assim como o Titã Atlas carrega o peso dos céus, são os trabalhadores do dia a dia que sustentam a nossa cidade.
            <br />
            Aqui, sua profissão não é só uma rotina — é a engrenagem que impede o caos de vencer.
          </Subtitle>

          <CardsRow>
            {/* A OFICINA */}
            <NarrativeBlock
              style={{ opacity: cardLeftOpacity, y: cardLeftY }}
            >
              <div className="flex items-center justify-center">
                <HeraldIcon $color="245,166,35">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.384 5.384a2.025 2.025 0 01-2.864-2.864l5.384-5.384m2.864 2.864L16.5 9.5m-5.08 5.67l-1.59 1.59a2.025 2.025 0 01-2.864 0 2.025 2.025 0 010-2.864l1.59-1.59m5.08-5.67l1.59-1.59a2.025 2.025 0 012.864 0 2.025 2.025 0 010 2.864l-1.59 1.59" />
                  </svg>
                </HeraldIcon>
                <NarrativeTitle>A Oficina</NarrativeTitle>
              </div>
            
              <NarrativeText>
                Mãos calejadas de graxa e ferramentas pesadas esculpem o futuro
                do asfalto. Na oficina, metal retorcido ganha vida nova e
                mecânicos de verdade constroem o respeito com o suor da própria
                testa. Do aprendiz ao dono, cada motor que ruge nas ruas é o eco
                do seu orgulho.
              </NarrativeText>
              <ClosingLine>O motor da cidade nunca para. Você tem o que é preciso para mantê-lo vivo?</ClosingLine>
            </NarrativeBlock>

       
            {/* O SOCORRO */}
            <NarrativeBlock
              style={{ opacity: cardRightOpacity, y: cardRightY }}
            >
              <div className="flex items-center justify-center">
                <HeraldIcon $color="80,180,120">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </HeraldIcon>
                <NarrativeTitle>O Socorro</NarrativeTitle>
              </div>
             
              <NarrativeText>
                Quando o desespero consome as ruas, você é o milagre que chega
                na hora exata. O hospital é o pulso incansável que mantém Atlas
                respirando — heróis de jaleco que lutam contra o tempo para
                resgatar vidas do abismo. Cada plantão é uma guerra silenciosa,
                e cada batimento recuperado é a sua maior vitória.
              </NarrativeText>
              <ClosingLine>O coração da cidade depende de você. Atenda ao chamado e salve o amanhã.</ClosingLine>
            </NarrativeBlock>
          </CardsRow>

          {/* Closing text */}
          <motion.p
            style={{ opacity: layer1Opacity, y: layer1Y }}
            className="font-rajdhani text-sm md:text-base text-white/80 italic text-center mt-6 md:mt-2 max-w-xl mx-auto"
          >
            Escreva o seu nome na história. Qual será o seu propósito?
          </motion.p>
        </ContentLayer>
      </StickyContainer>
    </Section>
  );
}
