"use client";

import { useState } from "react";
import styled from "styled-components";
import BaseModal from "@/components/BaseModal";

const SocialLink = styled.a`
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(145deg, #1a1714, #0d0b09);
  border: 1px solid rgba(212, 175, 55, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  color: #d4af37;

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(212, 175, 55, 0.6);
    box-shadow: 0 6px 20px rgba(212, 175, 55, 0.25);
    color: #ffd277;
  }

  .tip {
    position: absolute;
    bottom: calc(100% + 10px);
    left: 50%;
    transform: translateX(-50%) translateY(6px);
    background: linear-gradient(145deg, #1a1714, #0d0b0d);
    border: 1px solid rgba(212, 175, 55, 0.35);
    border-radius: 8px;
    padding: 5px 10px;
    white-space: nowrap;
    font-family: "Orbitron", sans-serif;
    font-size: 0.55rem;
    font-weight: 600;
    color: #d4af37;
    letter-spacing: 1px;
    text-transform: uppercase;
    opacity: 0;
    pointer-events: none;
    transition: all 0.3s ease;
  }

  .tip::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: rgba(212, 175, 55, 0.35);
  }

  &:hover .tip {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
`;

export default function Footer() {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <>
      <footer suppressHydrationWarning className="relative z-10 border-t border-[#d4af37]/30 bg-gradient-to-b from-[#0B1725] to-[#05080F]">
        <div className="max-w-full mx-auto px-4 pt-12 pb-8">
          {/* Social */}
          <div className="text-center mb-8">
            <p className="font-orbitron text-[14px] font-bold text-[#d4af37] uppercase tracking-[0.25em] mb-1">
              Siga-nos
            </p>
            <p className="font-rajdhani text-white/80 text-[12px] mb-5">
              Fique por dentro de todas as novidades
            </p>

            <div className="flex justify-center gap-3 flex-wrap">
              <SocialLink href="https://discord.gg/e426pZyTCp" target="_blank" rel="noopener noreferrer" suppressHydrationWarning>
                <span className="tip">Discord</span>
                <svg viewBox="0 0 16 16" height={20} width={20} fill="currentColor">
                  <path d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.658 0 8.258 8.258 0 0 0-.412-.833.051.051 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059.051.051 0 0 0-.018-.011 8.875 8.875 0 0 1-1.248-.595.05.05 0 0 1-.02-.066.051.051 0 0 1 .015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 0 1 .053.007c.08.066.164.132.248.195a.051.051 0 0 1-.004.085 8.254 8.254 0 0 1-1.249.594.05.05 0 0 0-.03.03.052.052 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.235 13.235 0 0 0 4.001-2.02.049.049 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 0 0-.02-.019Zm-8.198 7.307c-.789 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612Zm5.316 0c-.788 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612Z" />
                </svg>
              </SocialLink>

              <SocialLink href="https://www.instagram.com/atlasrp__/" target="_blank" rel="noopener noreferrer" suppressHydrationWarning>
                <span className="tip">Instagram</span>
                <svg viewBox="0 0 24 24" height={20} width={20} fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </SocialLink>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent mb-6" />

          {/* Bottom */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="font-rajdhani text-white/90 text-[14px]">
                &copy; 2026 <span className="text-[#d4af37]/80">Atlas RP</span>. Todos os direitos reservados.
              </p>
              <p className="font-rajdhani text-white/70 text-[12px] mt-0.5">
                Este produto não é afiliado, endossado ou patrocinado pela Rockstar Games.
              </p>
            </div>

            <div className="flex items-center gap-5">
              <button
                onClick={() => setShowTerms(true)}
                className="font-rajdhani text-white/70 hover:text-[#d4af37] transition-colors text-[12px]"
              >
                Termos de Uso
              </button>
              <button
                onClick={() => setShowPrivacy(true)}
                className="font-rajdhani text-white/70 hover:text-[#d4af37] transition-colors text-[12px]"
              >
                Política de Privacidade
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Terms Modal */}
      <BaseModal
        open={showTerms}
        onClose={() => setShowTerms(false)}
        title="Termos de Uso"
        maxWidth="2xl"
        icon={
          <svg className="w-5 h-5 text-[#d4af37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        }
        footer={
          <>
            <BaseModal.SecondaryButton onClick={() => setShowTerms(false)}>Fechar</BaseModal.SecondaryButton>
            <BaseModal.PrimaryButton onClick={() => setShowTerms(false)}>Aceitar e Fechar</BaseModal.PrimaryButton>
          </>
        }
      >
        <div className="font-rajdhani text-white/50 space-y-4 text-sm leading-relaxed">
          <p className="text-white/40 text-xs italic">Última Atualização: 13 de Julho de 2026</p>
          <p>Bem-vindo à área de apoio oficial do Atlas RP. Ao acessar este site, interagir com nossa plataforma ou contribuir através de nosso sistema de checkout, você (doravante denominado &quot;Apoiador&quot;) concorda integralmente e sem reservas com as condições estabelecidas nestes Termos de Uso. Caso não concorde com qualquer disposição aqui presente, solicitamos que interrompa a utilização de nossos serviços de imediato.</p>
          <p className="text-white/40 text-xs italic">Nota importante: Para fins legais, toda contribuição feita nesta plataforma, em troca da qual o Apoiador recebe moedas virtuais (&quot;Atlas&quot;) ou benefícios digitais, constitui uma relação de consumo regida pelo Código de Defesa do Consumidor (Lei nº 8.078/1990), independentemente da nomenclatura &quot;apoio&quot;, &quot;contribuição&quot; ou &quot;doação&quot; utilizada nesta comunicação. Isso significa que todos os direitos do consumidor descritos abaixo (incluindo o direito de arrependimento) permanecem plenamente aplicáveis e garantidos.</p>

          <p><strong className="text-white/70">1. ACEITAÇÃO, VINCULAÇÃO E MAIORIDADE (IDADE RESTRITA)</strong></p>
          <p><strong className="text-white/60">Maioridade Legal:</strong> Para contribuir em nossa plataforma, o Apoiador declara, sob as penas da lei, ser maior de 18 (dezoito) anos e plenamente capaz para a prática de atos da vida civil.</p>
          <p><strong className="text-white/60">Menores de Idade:</strong> Caso o Apoiador seja menor de 18 anos, a contribuição somente poderá ser realizada sob a supervisão direta, anuência e responsabilidade de seus pais ou responsáveis legais, que responderão integralmente por qualquer ato ou contribuição realizada pelo menor.</p>
          <p><strong className="text-white/60">Consentimento:</strong> Ao concluir uma contribuição, o Apoiador expressa sua concordância irrevogável com todas as regras aqui dispostas, constituindo este instrumento um contrato eletrônico válido e vinculativo.</p>

          <p><strong className="text-white/70">2. NATUREZA DOS BENEFÍCIOS, APOIO À INFRAESTRUTURA E PLENA CIÊNCIA DIGITAL</strong></p>
          <p><strong className="text-white/60">Ciência e Responsabilidade do Apoiador:</strong> O Apoiador declara estar plenamente ciente, esclarecido e de acordo de que sua contribuição resulta no recebimento de um benefício 100% digital, sem existência física ou entrega material. Ao prosseguir, o Apoiador assume total e exclusiva responsabilidade civil, fiscal e financeira por esta contribuição voluntária, reconhecendo o caráter recreativo da transação.</p>
          <p><strong className="text-white/60">Licenciamento Digital e Recreativo:</strong> Todos os benefícios oferecidos em retribuição ao apoio (itens, caixas, planos de benefícios VIP e demais itens estritamente digitais) são bens intangíveis de consumo imediato dentro do ambiente de simulação do jogo Atlas RP. Eles não possuem valor monetário na vida real, não rendem dividendos e não podem ser convertidos ou resgatados em dinheiro (Real - R$).</p>
          <p><strong className="text-white/60">Fomento ao Projeto:</strong> O Apoiador declara compreender que os valores contribuídos são integralmente revertidos para o custeio, manutenção e estabilidade da cidade no ar (cobrindo custos de infraestrutura de rede, servidores dedicados, proteção contra ataques virtuais e taxas de hospedagem), bem como para financiar o desenvolvimento contínuo de inovações tecnológicas, mapas personalizados, roteiros e melhorias gerais para toda a comunidade. Os benefícios digitais recebidos são a forma de agradecimento do Atlas RP a quem apoia o projeto.</p>

          <p><strong className="text-white/70">3. CADASTRO, SEGURANÇA E CONDUTA NO JOGO</strong></p>
          <p><strong className="text-white/60">Informações de Entrega:</strong> O Apoiador é o único responsável por preencher corretamente seus identificadores de jogo (Steam ID, Steam HEX e ID de Personagem/Char ID) no checkout. O Atlas RP não se responsabiliza pelo envio de benefícios virtuais para identificadores incorretos decorrentes de erros de digitação do Apoiador.</p>
          <p><strong className="text-white/60">Vínculo Pessoal:</strong> Os benefícios virtuais recebidos são pessoais e intransferíveis, sendo proibida a revenda de itens ou a comercialização de contas por dinheiro real fora dos canais autorizados do servidor.</p>
          <p><strong className="text-white/60">Punições e Suspensões:</strong> O Apoiador compreende que apoiar o projeto não concede qualquer imunidade em relação às regras de Roleplay internas da cidade. Caso o Apoiador cometa infrações de conduta e venha a ser suspenso ou banido (temporária ou permanentemente) pelas regras internas do servidor, nenhum valor contribuído será elegível para estorno, compensação ou transferência para outros personagens.</p>

          <p><strong className="text-white/70">4. PROCESSAMENTO FINANCEIRO E VERIFICAÇÃO ANTIFRAUDE (VALIDAÇÃO DE CPF)</strong></p>
          <p><strong className="text-white/60">Meios de Pagamento:</strong> As contribuições são processadas exclusivamente através de gateways e subprocessadores financeiros de confiança parceiros, operando com faturamento via Pix e cartão de crédito.</p>
          <p><strong className="text-white/60">Validação Cadastral via CPF:</strong> Como medida obrigatória para a prevenção de fraudes, prevenção de lavagem de dinheiro, contenção de tentativas ilícitas de chargeback e proteção do próprio Apoiador, o sistema de faturamento poderá exigir a validação do CPF do pagador na finalização da transação via Pix. O Atlas RP reserva-se o direito de reter a entrega automática dos benefícios ou realizar o estorno imediato do pagamento caso sejam identificadas divergências cadastrais severas.</p>

          <p><strong className="text-white/70">5. SUPORTE TÉCNICO E COMUNIDADE</strong></p>
          <p>Eventuais falhas no processamento, dúvidas de entrega ou problemas técnicos com os benefícios recebidos deverão ser reportados exclusivamente por meio do canal oficial de suporte integrado na nossa comunidade de comunicação. O suporte compromete-se a analisar o caso e fornecer uma resposta ou resolução em um prazo estimado de até 24 (vinte e quatro) horas.</p>

          <p><strong className="text-white/70">6. LIMITAÇÃO DE RESPONSABILIDADE</strong></p>
          <p>A administração do Atlas RP empenha-se para manter o ambiente de jogo estável e disponível. Contudo, não nos responsabilizamos por atualizações técnicas de plataformas de terceiros (como desenvolvedores do jogo de base ou plataformas de modificação de multiplayer) que venham a alterar, limitar ou impedir temporariamente o uso ou funcionamento dos benefícios virtuais recebidos no jogo.</p>

          <p><strong className="text-white/70">7. FORO E LEGISLAÇÃO APLICÁVEL</strong></p>
          <p>Estes termos são regidos e interpretados em conformidade com as leis da República Federativa do Brasil. Fica eleito o foro da comarca de administração do servidor para dirimir quaisquer controvérsias decorrentes deste contrato eletrônico.</p>
        </div>
      </BaseModal>

      {/* Privacy Modal */}
      <BaseModal
        open={showPrivacy}
        onClose={() => setShowPrivacy(false)}
        title="Política de Privacidade"
        maxWidth="2xl"
        icon={
          <svg className="w-5 h-5 text-[#d4af37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        }
        footer={
          <>
            <BaseModal.SecondaryButton onClick={() => setShowPrivacy(false)}>Fechar</BaseModal.SecondaryButton>
            <BaseModal.PrimaryButton onClick={() => setShowPrivacy(false)}>Aceitar e Fechar</BaseModal.PrimaryButton>
          </>
        }
      >
        <div className="font-rajdhani text-white/50 space-y-4 text-sm leading-relaxed">
          <p className="text-white/40 text-xs italic">Última Atualização: 13 de Julho de 2026</p>
          <p>Esta Política de Privacidade descreve de forma clara e transparente como tratamos, armazenamos e protegemos os seus dados pessoais ao navegar e apoiar o Atlas RP, em total conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD).</p>

          <p><strong className="text-white/70">1. DADOS COLETADOS</strong></p>
          <p>Coletamos estritamente os dados necessários para o cumprimento do contrato de apoio, autenticação de segurança e entrega dos benefícios:</p>
          <p><strong className="text-white/60">Identificadores de Jogo:</strong> Nome de exibição na plataforma parceira, identificadores de conexão (Steam ID / Steam HEX) e o ID numérico do personagem (Char ID) para localização e depósito correto das moedas virtuais.</p>
          <p><strong className="text-white/60">Informações de Contato e Faturamento:</strong> Endereço de e-mail (para confirmação da contribuição e envio de recibos), nome completo do pagador e o número do CPF (utilizado unicamente na validação antifraude das transações Pix).</p>
          <p><strong className="text-white/60">Dados de Conexão:</strong> Endereço IP do dispositivo utilizado no momento da finalização da contribuição, bem como registro de data e hora do aceite eletrônico das diretrizes de reembolso.</p>
          <p className="text-white/40 text-xs">Nota: Não armazenamos ou tratamos dados de cartão de crédito. Todo o ambiente de captura de dados de pagamento com cartão ocorre em ambiente criptografado e isolado dos servidores do próprio gateway de pagamento contratado.</p>

          <p><strong className="text-white/70">2. FINALIDADE DO TRATAMENTO DE DADOS</strong></p>
          <p>A base legal para o tratamento das informações baseia-se na Execução de Contrato e no Legítimo Interesse do controlador, limitando-se aos seguintes fins:</p>
          <p>Processar, validar e conciliar as transações financeiras com nossos processadores de pagamento.</p>
          <p>Enviar de forma automatizada e protegida os registros de contribuições aprovadas para as nossas ferramentas internas de controle para crédito dos benefícios virtuais no jogo.</p>
          <p>Garantir segurança jurídica, prevenindo tentativas de fraude eletrônica e respondendo formalmente a disputas financeiras abusivas de pagamento.</p>

          <p><strong className="text-white/70">3. COMPARTILHAMENTO DE INFORMAÇÕES COM TERCEIROS</strong></p>
          <p>Zelamos pela privacidade do Apoiador e não comercializamos bases de dados em hipótese alguma. O compartilhamento ocorre de forma puramente operacional com os seguintes tipos de parceiros:</p>
          <p><strong className="text-white/60">Provedores de Infraestrutura em Nuvem e Bases de Dados:</strong> Para a hospedagem segura das tabelas operacionais e segurança de persistência do site.</p>
          <p><strong className="text-white/60">Gateways de Pagamento Parceiros:</strong> Para a realização direta do faturamento do Pix/Cartão de Crédito e validação de segurança da transação.</p>
          <p><strong className="text-white/60">Ferramentas de Automação e Comunicação Interna:</strong> Para o roteamento seguro de logs de transação e gerenciamento centralizado do atendimento de suporte aos Apoiadores.</p>

          <p><strong className="text-white/70">4. MEDIDAS DE SEGURANÇA DA INFORMAÇÃO</strong></p>
          <p>Os dados pessoais do Apoiador são mantidos sob elevados padrões de proteção técnica. Empregamos:</p>
          <p>Mecanismos modernos de autenticação e criptografia para a transmissão segura de dados e tokens de acesso de ponta a ponta.</p>
          <p>Armazenamento e gerenciamento de sessões de usuário através de cookies de segurança essenciais, que impedem o acesso e interceptação maliciosa por scripts externos ao site.</p>
          <p>Barreiras lógicas de isolamento para blindar as comunicações das APIs internas.</p>

          <p><strong className="text-white/70">5. USO DE COOKIES ESSENCIAIS</strong></p>
          <p>Nosso portal utiliza unicamente cookies operacionais essenciais para as funções básicas de navegação, tais como: reter a identidade de login do jogador durante a sessão de apoio e proteger os formulários contra preenchimentos automáticos maliciosos. Não utilizamos cookies de publicidade direcionada, rastreamento comportamental de rede ou ferramentas de monitoramento estatístico (analytics) de terceiros que possam violar a privacidade de navegação do Apoiador.</p>

          <p><strong className="text-white/70">6. RETENÇÃO E ANONIMIZAÇÃO DE DADOS</strong></p>
          <p>Em respeito ao princípio da minimização da LGPD, os dados pessoais do Apoiador são mantidos apenas pelo período indispensável para fins operacionais, tributários e de defesa em disputas jurídicas:</p>
          <p><strong className="text-white/60">Política de Expiração de Logs:</strong> Visando a proteção de dados a longo prazo, todos os logs detalhados de transações contendo o IP de conexão do Apoiador e metadados operacionais de requisições são automaticamente apagados ou anonimizados permanentemente no banco de dados em até 180 (cento e oitenta) dias após a criação da contribuição.</p>
          <p>Dados consolidados e notas fiscais de conformidade fiscal e financeira são mantidos arquivados sob prazos regulamentares específicos exigidos pela legislação tributária nacional.</p>

          <p><strong className="text-white/70">7. SEUS DIREITOS COMO TITULAR DOS DADOS</strong></p>
          <p>A LGPD assegura ao Apoiador direitos fundamentais em relação aos seus dados, os quais podem ser exercidos mediante requisição em nosso canal oficial de suporte integrado na nossa comunidade de comunicação, incluindo:</p>
          <p>Confirmar a existência do tratamento e ter acesso aos dados coletados sob sua titularidade.</p>
          <p>Solicitar a correção de dados incompletos, inexatos ou desatualizados.</p>
          <p>Solicitar a eliminação de dados que não sejam necessários para o cumprimento de obrigações legais, regulatórias ou de defesa técnica em disputas financeiras legítimas do Atlas RP.</p>
        </div>
      </BaseModal>
    </>
  );
}
