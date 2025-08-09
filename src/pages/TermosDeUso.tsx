import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const TermosDeUso: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Termos de Uso da Plataforma Junta Play
            </CardTitle>
            <p className="text-center text-gray-600">
              Última atualização: 06/08/2025
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <div className="space-y-6">
              {/* 1. OBJETO */}
              <section>
                <h2 className="text-xl font-semibold mb-4">1. OBJETO</h2>
                <p>
                  Estes Termos de Uso regulam a utilização da plataforma digital Junta Play, que tem por objetivo intermediar o encontro de pessoas interessadas em compartilhar custos de serviços digitais de forma legal e transparente, respeitando os termos e condições dos serviços terceiros envolvidos. Ao utilizar a plataforma, o usuário declara estar ciente e de acordo com os termos abaixo.
                </p>
              </section>

              {/* 2. DEFINIÇÕES */}
              <section>
                <h2 className="text-xl font-semibold mb-4">2. DEFINIÇÕES</h2>
                <p>Para fins de interpretação e aplicação destes Termos de Uso, as expressões abaixo terão os seguintes significados:</p>
                <div className="space-y-3">
                  <h3 className="font-semibold">2.1. Plataforma</h3>
                  <p>
                    Sistema digital de propriedade da Junta Play, disponibilizado por meio de website e/ou aplicativo, que tem por finalidade facilitar a conexão entre usuários interessados em compartilhar os custos de serviços digitais (tais como streaming, softwares, armazenamento em nuvem, entre outros), sem fornecer acesso direto ou atuar como revendedora dos serviços contratados.
                  </p>

                  <h3 className="font-semibold">2.2. Usuário</h3>
                  <p>
                    Toda pessoa física ou jurídica que se cadastra na Plataforma, independentemente de seu papel (Administrador ou Participante). Ao se registrar, o Usuário concorda com os presentes Termos de Uso e com a Política de Privacidade da Plataforma.
                  </p>

                  <h3 className="font-semibold">2.3. Administrador</h3>
                  <p>
                    Usuário que detém uma assinatura válida de um serviço digital elegível para uso compartilhado (de acordo com os termos do próprio serviço) e que, por sua livre iniciativa, cria um Grupo na Plataforma para dividir o custo da assinatura com outros usuários. É responsável por manter a assinatura ativa, fornecer acesso aos Participantes e gerir a composição do Grupo.
                  </p>

                  <h3 className="font-semibold">2.4. Participante</h3>
                  <p>
                    Usuário que se junta a um Grupo criado por um Administrador, contribuindo financeiramente com a divisão de custos de um serviço digital compartilhado. O Participante não tem vínculo direto com o serviço digital compartilhado, tampouco com o fornecedor do serviço, sendo sua relação limitada ao compartilhamento com o Administrador via Plataforma.
                  </p>

                  <h3 className="font-semibold">2.5. Grupo</h3>
                  <p>
                    Estrutura virtual gerenciada dentro da Plataforma, composta por um Administrador e um ou mais participantes, com a finalidade exclusiva de divisão proporcional de custos de um serviço digital de assinatura. Cada Grupo é limitado às regras do serviço digital original e às condições estabelecidas pelo Administrador no momento da criação.
                  </p>

                  <h3 className="font-semibold">2.6. Serviço Digital Compartilhado</h3>
                  <p>
                    Qualquer serviço de assinatura online, pago, que ofereça planos multiusuário ou compartilhamento familiar/legal, e que possa ser dividido entre pessoas conforme os termos e condições do próprio fornecedor do serviço. A Plataforma não representa, licencia, revende ou interfere diretamente nesses serviços.
                  </p>

                  <h3 className="font-semibold">2.7. Fornecedor Externo</h3>
                  <p>
                    Empresa responsável pela oferta do Serviço Digital Compartilhado. A Junta Play não possui qualquer vínculo societário, contratual ou de representação com os Fornecedores Externos, salvo se explicitamente informado.
                  </p>

                  <h3 className="font-semibold">2.8. Caução</h3>
                  <p>
                    Valor opcional ou obrigatório, definido pelo Administrador ou pela própria Plataforma, destinado a garantir o cumprimento das obrigações do Participante, como forma de segurança contra inadimplemento, saída antecipada ou descumprimento de regras do Grupo.
                  </p>
                </div>
              </section>

              {/* 3. FUNCIONALIDADE DA PLATAFORMA */}
              <section>
                <h2 className="text-xl font-semibold mb-4">3. FUNCIONALIDADE DA PLATAFORMA</h2>
                <p>
                  A Junta Play atua como uma intermediadora digital que facilita a conexão entre pessoas interessadas em dividir os custos de serviços digitais de assinatura, por meio da formação de grupos colaborativos dentro da própria plataforma. A Plataforma não comercializa, revende, licencia ou garante acesso direto a quaisquer serviços digitais de terceiros. A relação contratual com tais serviços é de responsabilidade exclusiva do Administrador do Grupo.
                </p>
                <div className="space-y-4 mt-4">
                  <div>
                    <h3 className="font-semibold">3.1. Cadastro e Criação de Conta</h3>
                    <p>Usuários podem criar contas individuais, mediante fornecimento de informações pessoais, com o objetivo de participar ou administrar Grupos de compartilhamento.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">3.2. Formação e Gerenciamento de Grupos</h3>
                    <p>A Plataforma permite que usuários cadastrem assinaturas válidas de serviços digitais compatíveis com uso multiusuário ou compartilhamento familiar/legal, organizando Grupos para divisão de custos com outros usuários interessados.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">3.3. Sistema de Pagamento</h3>
                    <p>A Plataforma disponibiliza um sistema intermediado de cobranças e repasses, permitindo que Participantes contribuam financeiramente com o custo do serviço compartilhado, e que o Administrador receba os valores correspondentes, conforme as regras estabelecidas no Grupo.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">3.4. Garantias e Cauções</h3>
                    <p>A Plataforma pode exigir, a critério próprio ou do Administrador, pagamento de caução ou taxas administrativas como forma de minimizar riscos de inadimplência ou abandono por parte dos Participantes. Os critérios para devolução ou retenção da caução serão definidos nas regras específicas do Grupo.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">3.5. Ferramentas de Comunicação</h3>
                    <p>A Plataforma pode disponibilizar recursos básicos para comunicação entre os membros de um Grupo, com o objetivo exclusivo de tratar do funcionamento da divisão de custos e uso do serviço em comum.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">3.6. Limitações da Atuação da Plataforma</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Cancelamentos, alterações contratuais, limitações técnicas ou interrupções de serviços prestados por terceiros;</li>
                      <li>Regras de uso, bloqueios de acesso, exclusões de conta ou restrições impostas por fornecedores externos;</li>
                      <li>Falhas no fornecimento do serviço por parte do Administrador;</li>
                      <li>Descumprimento das obrigações financeiras ou comportamentais por parte dos Participantes;</li>
                      <li>Uso indevido ou em desacordo com os Termos de Serviço dos próprios fornecedores de assinatura.</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold">3.7. Isenção de Vínculo com Fornecedores</h3>
                    <p>
                      A Junta Play não é representante, distribuidora, autorizada, parceira comercial, afiliada, patrocinada ou endossada por quaisquer empresas cujos serviços venham a ser compartilhados entre os usuários. Toda e qualquer marca, nome comercial ou logotipo eventualmente mencionados na plataforma são de propriedade de seus respectivos titulares, sendo utilizados apenas para fins de referência.
                    </p>
                  </div>
                </div>
              </section>

              {/* 4. RESPONSABILIDADES DOS USUÁRIOS */}
              <section>
                <h2 className="text-xl font-semibold mb-4">4. RESPONSABILIDADES DOS USUÁRIOS</h2>
                <p>
                  Todos os usuários da Junta Play, ao aceitarem estes Termos de Uso, comprometem-se a utilizar a plataforma de forma ética, segura e em conformidade com as leis brasileiras e com as regras específicas dos serviços digitais compartilhados. As responsabilidades se dividem conforme o papel exercido dentro da plataforma.
                </p>
                <div className="space-y-4 mt-4">
                  <div>
                    <h3 className="font-semibold">4.1. Responsabilidades Gerais dos Usuários</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Fornecer informações verdadeiras, completas e atualizadas no momento do cadastro;</li>
                      <li>Utilizar a plataforma exclusivamente para os fins previstos nestes Termos, abstendo-se de qualquer uso ilícito, fraudulento ou que viole direitos de terceiros;</li>
                      <li>Observar as regras de uso do serviço digital original, incluindo limitações de número de usuários, local de acesso, compartilhamento familiar ou empresarial, conforme aplicável;</li>
                      <li>Manter confidencialidade de logins, senhas, acessos ou quaisquer dados obtidos por meio da participação em um Grupo;</li>
                      <li>Responder civil e criminalmente por qualquer uso indevido, compartilhamento não autorizado ou violação das condições estabelecidas pelo fornecedor externo do serviço compartilhado.</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold">4.2. Responsabilidades Específicas do Administrador</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Manter ativa, válida e acessível a assinatura do serviço que será objeto do compartilhamento, durante todo o período acordado com os Participantes;</li>
                      <li>Garantir que o plano utilizado permita legalmente o compartilhamento entre múltiplos usuários, conforme as regras do próprio fornecedor (ex.: plano familiar, multiusuário ou empresarial);</li>
                      <li>Disponibilizar acesso aos Participantes de forma clara, funcional e dentro dos prazos acordados;</li>
                      <li>Informar com antecedência mínima de 07 dias qualquer alteração, cancelamento ou problema com o serviço compartilhado;</li>
                      <li>Zelar pela boa convivência e comunicação com os Participantes do Grupo;</li>
                      <li>Restituir eventuais valores pagos pelos Participantes em caso de cancelamento não justificado, salvo disposição contratual ou cláusula específica de retenção ou caução.</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold">4.3. Responsabilidades Específicas do Participante</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Realizar o pagamento integral e pontual das quantias acordadas para participação no Grupo;</li>
                      <li>Não repassar, divulgar ou comercializar o acesso ao serviço recebido, sob qualquer hipótese;</li>
                      <li>Comunicar imediatamente ao Administrador e/ou à Plataforma qualquer falha no acesso, suspeita de uso indevido ou descontinuidade do serviço;</li>
                      <li>Respeitar o número máximo de acessos e dispositivos permitidos pelo serviço digital compartilhado;</li>
                      <li>Arcar com eventuais penalidades previstas no Grupo (ex.: perda de caução) caso desista da participação antes do prazo acordado.</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold">4.4. Penalidades pelo Descumprimento</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Advertência formal;</li>
                      <li>Suspensão temporária ou definitiva do cadastro;</li>
                      <li>Retenção de valores pagos a título de caução ou taxa de cancelamento, quando aplicável;</li>
                      <li>Exclusão do Grupo;</li>
                      <li>Encaminhamento da ocorrência às autoridades competentes, em caso de indícios de fraude, má-fé ou infração penal.</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold">4.5. Isenção de Solidariedade</h3>
                    <p>
                      A Junta Play não se responsabiliza por quaisquer perdas, danos ou prejuízos decorrentes de condutas de usuários dentro dos Grupos, sendo certo que a relação jurídica entre Administrador e Participantes é de natureza privada, baseada em acordo entre as partes.
                    </p>
                  </div>
                </div>
              </section>

              {/* 5. LIMITAÇÕES E ISENÇÃO DE RESPONSABILIDADE */}
              <section>
                <h2 className="text-xl font-semibold mb-4">5. LIMITAÇÕES E ISENÇÃO DE RESPONSABILIDADE</h2>
                <p>
                  Ao utilizar a Junta Play, o Usuário reconhece e concorda que a atuação da Plataforma está limitada à intermediação digital entre pessoas interessadas em compartilhar custos de serviços digitais e, portanto, não possui qualquer responsabilidade direta sobre o conteúdo, a operação ou a qualidade dos serviços de terceiros utilizados nos Grupos formados.
                </p>
                <div className="space-y-4 mt-4">
                  <div>
                    <h3 className="font-semibold">5.1. Isenção quanto aos serviços digitais compartilhados</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Não possui qualquer vínculo societário, contratual ou técnico com os fornecedores dos serviços digitais que venham a ser compartilhados pelos usuários;</li>
                      <li>Não garante o funcionamento, estabilidade, qualidade, disponibilidade ou continuidade de qualquer serviço digital utilizado pelos Grupos;</li>
                      <li>Não realiza suporte técnico relacionado ao funcionamento dos serviços de terceiros (como streaming, armazenamento, cursos, softwares etc.);</li>
                      <li>Não é responsável por suspensões, bloqueios, exclusões de contas, alterações contratuais ou limitações impostas pelos próprios fornecedores aos usuários ou assinantes originais (Administradores).</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold">5.2. Isenção quanto à conduta dos usuários</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Falta de pagamento por parte do Participante;</li>
                      <li>Cancelamento antecipado ou má gestão do serviço por parte do Administrador;</li>
                      <li>Compartilhamento indevido de senhas, logins ou conteúdos protegidos por direitos autorais;</li>
                      <li>Utilização dos serviços em desconformidade com os contratos originais firmados com os fornecedores;</li>
                      <li>Conflitos internos entre membros de um mesmo Grupo.</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold">5.3. Isenção quanto à legalidade do uso compartilhado</h3>
                    <p>
                      A Plataforma atua sob a premissa de que somente serão compartilhados planos ou assinaturas que permitam legalmente o uso multiusuário ou familiar, conforme os termos dos fornecedores originais. A responsabilidade por verificar a legalidade e elegibilidade do plano compartilhado é exclusiva do Administrador do Grupo. A Plataforma não se responsabiliza por eventuais violações contratuais cometidas pelos usuários perante os fornecedores dos serviços digitais, incluindo:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 mt-2">
                      <li>Violação de cláusulas de uso restrito a membros da mesma família ou residência;</li>
                      <li>Comercialização indireta de acesso, quando proibida pelo fornecedor;</li>
                      <li>Uso simultâneo acima do número de telas, dispositivos ou usuários permitidos pelo plano.</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold">5.4. Isenção quanto a perdas financeiras</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Falha de pagamento entre usuários;</li>
                      <li>Saída de membros de um Grupo;</li>
                      <li>Cancelamento de assinatura por parte do Administrador;</li>
                      <li>Encerramento da conta do usuário pela plataforma de origem;</li>
                      <li>Suspensão ou modificação dos serviços externos contratados diretamente pelos usuários.</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold">5.5. Funcionamento da Plataforma</h3>
                    <p>
                      Embora se comprometa a manter a Plataforma operacional e segura, a Junta Play não garante a disponibilidade contínua e ininterrupta dos seus serviços, podendo realizar manutenções, atualizações ou suspensões temporárias por motivos técnicos, legais ou operacionais.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold">5.6. Responsabilidade limitada da Plataforma</h3>
                    <p>
                      A responsabilidade da Junta Play, quando aplicável e legalmente reconhecida, ficará sempre limitada ao valor eventualmente pago pelo usuário à própria Plataforma nos últimos 3 (três) meses, não se estendendo a valores repassados a terceiros, como Administradores de Grupos ou fornecedores externos.
                    </p>
                  </div>
                </div>
              </section>

              {/* 6. PROPRIEDADE INTELECTUAL */}
              <section>
                <h2 className="text-xl font-semibold mb-4">6. PROPRIEDADE INTELECTUAL</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">6.1. Direitos sobre a Plataforma</h3>
                    <p>
                      Todo o conteúdo disponibilizado pela Junta Play — incluindo, mas não se limitando a logotipos, nome empresarial, marca, layout, design, interfaces, código-fonte, banco de dados, textos, imagens, gráficos, vídeos, ilustrações, funcionalidades e demais elementos visuais ou estruturais da plataforma — constitui propriedade intelectual exclusiva da empresa Junta Play ou de seus licenciantes. Esses conteúdos são protegidos pelas leis brasileiras de propriedade intelectual (Lei nº 9.610/1998 e Lei nº 9.279/1996), e por tratados internacionais dos quais o Brasil é signatário. É vedada a reprodução, cópia, modificação, distribuição, exibição, engenharia reversa ou qualquer forma de utilização indevida dos elementos protegidos da Plataforma, salvo mediante autorização expressa, formal e prévia da titular.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold">6.2. Licença de Uso</h3>
                    <p>
                      A Junta Play concede ao Usuário uma licença limitada, não exclusiva, intransferível e revogável para acessar e utilizar a Plataforma, única e exclusivamente para fins pessoais ou comerciais legítimos, em conformidade com os presentes Termos de Uso. Essa licença não confere qualquer direito de propriedade intelectual ao Usuário, tampouco o autoriza a reproduzir, redistribuir ou explorar comercialmente qualquer parte da Plataforma sem autorização.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold">6.3. Marcas e serviços de terceiros</h3>
                    <p>
                      A Junta Play não possui qualquer vínculo, associação, autorização, endosso, parceria, sociedade ou representação oficial com as empresas fornecedoras dos serviços digitais que eventualmente sejam referenciadas ou utilizadas pelos usuários nos Grupos. Todas as marcas, nomes comerciais, logotipos, nomes de produtos, slogans e identidades visuais eventualmente mencionados na Plataforma pertencem exclusivamente aos seus respectivos titulares, sendo utilizadas apenas com fins informativos, descritivos ou comparativos (art. 132 da Lei da Propriedade Industrial – LPI). A menção a qualquer serviço, marca ou empresa não implica em qualquer tipo de coautoria, vínculo contratual, responsabilidade solidária ou envolvimento direto da Junta Play.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold">6.4. Conteúdo gerado por usuários</h3>
                    <p>
                      Os conteúdos eventualmente inseridos por usuários na Plataforma — tais como textos de perfil, nomes de grupo, mensagens, imagens, avaliações ou sugestões — são de responsabilidade exclusiva de seus respectivos autores, que assumem integral responsabilidade por qualquer infração a direitos de terceiros, incluindo direitos autorais, morais, de imagem ou marcas registradas. A Junta Play poderá, a seu critério, remover qualquer conteúdo que infrinja normas legais, regulamentos, direitos de terceiros ou os presentes Termos, sem necessidade de notificação prévia.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold">6.5. Notificações de infração (takedown)</h3>
                    <p>
                      Caso qualquer pessoa física ou jurídica identifique que seu conteúdo, marca, obra ou direito foi utilizado de forma indevida na Plataforma, poderá entrar em contato com a Junta Play por meio do canal de atendimento oficial, apresentando:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 mt-2">
                      <li>Identificação do titular dos direitos alegadamente violados;</li>
                      <li>Descrição clara e objetiva do conteúdo infringente;</li>
                      <li>Documentos que comprovem a titularidade dos direitos;</li>
                      <li>Dados de contato para retorno.</li>
                    </ul>
                    <p className="mt-2">A Plataforma se compromete a analisar o pedido dentro de prazo razoável e, caso confirmada a infração, remover o conteúdo ou restringir o acesso conforme necessário.</p>
                  </div>
                </div>
              </section>

              {/* 7. PRIVACIDADE E PROTEÇÃO DE DADOS */}
              <section>
                <h2 className="text-xl font-semibold mb-4">7. PRIVACIDADE E PROTEÇÃO DE DADOS</h2>
                <p>
                  A Junta Play se compromete a tratar os dados pessoais dos usuários com responsabilidade, transparência e em conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD – Lei nº 13.709/2018). Ao utilizar a plataforma, o usuário concorda com a coleta, uso, armazenamento e compartilhamento de suas informações, conforme as regras estabelecidas neste tópico.
                </p>
                <div className="space-y-4 mt-4">
                  <div>
                    <h3 className="font-semibold">7.1. Dados Coletados</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Dados de cadastro: nome completo, e-mail, CPF, número de celular, data de nascimento, dados bancários ou de pagamento;</li>
                      <li>Dados de navegação: endereço IP, tipo de navegador, páginas acessadas, horários de acesso, localização aproximada;</li>
                      <li>Dados de uso da plataforma: interações com grupos, criação ou participação em grupos, avaliações, mensagens e comunicações dentro da plataforma;</li>
                      <li>Cookies e tecnologias similares: para personalização da experiência, segurança e estatísticas de uso.</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold">7.2. Finalidade do Tratamento de Dados</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Permitir o correto funcionamento da plataforma e autenticação do usuário;</li>
                      <li>Viabilizar a intermediação entre Administradores e Participantes, conforme os serviços oferecidos;</li>
                      <li>Realizar o processamento de pagamentos, envio de notificações e suporte técnico;</li>
                      <li>Prevenir fraudes, garantir a segurança das contas e cumprir obrigações legais ou regulatórias;</li>
                      <li>Melhorar os serviços e funcionalidades da plataforma com base na análise de comportamento dos usuários;</li>
                      <li>Enviar comunicações promocionais ou informativas, respeitando a opção de cancelamento (opt-out).</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold">7.3. Compartilhamento de Dados com Terceiros</h3>
                    <p>O compartilhamento poderá ocorrer apenas nos seguintes casos:</p>
                    <ul className="list-disc pl-6 space-y-1 mt-2">
                      <li>Com prestadores de serviços essenciais à operação da plataforma (como serviços de pagamento, hospedagem, autenticação ou análise de dados), sob cláusulas de confidencialidade;</li>
                      <li>Quando exigido por ordem judicial, obrigação legal ou regulatória;</li>
                      <li>Com o Administrador ou Participante do grupo, exclusivamente para fins de operacionalização do grupo, como liberação de acesso ou comunicação entre as partes;</li>
                      <li>Em casos de reorganização societária, fusão ou aquisição, desde que respeitada a confidencialidade.</li>
                    </ul>
                    <p className="mt-2">Os dados pessoais dos usuários não serão vendidos, alugados ou repassados a terceiros de forma indiscriminada.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">7.4. Armazenamento e Segurança dos Dados</h3>
                    <p>
                      A Junta Play adota medidas técnicas e administrativas adequadas para proteger os dados pessoais contra acessos não autorizados, vazamentos, destruição acidental ou ilícita, e outras formas de tratamento inadequado. Os dados são armazenados em servidores seguros, podendo estar localizados no Brasil ou no exterior, em países que possuam nível de proteção de dados equivalente ao exigido pela LGPD.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold">7.5. Direitos do Titular dos Dados</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Confirmação da existência de tratamento;</li>
                      <li>Acesso aos dados pessoais tratados;</li>
                      <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
                      <li>Anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade;</li>
                      <li>Portabilidade dos dados, nos termos da regulamentação da ANPD;</li>
                      <li>Revogação do consentimento e eliminação dos dados tratados com base nesse consentimento;</li>
                      <li>Informação sobre compartilhamentos realizados;</li>
                      <li>Oposição ao tratamento, nos casos permitidos por lei.</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold">7.6. Tempo de Retenção dos Dados</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Durante o período em que o usuário estiver ativo na plataforma;</li>
                      <li>Após a exclusão da conta, por prazo necessário ao cumprimento de obrigações legais, defesa em processos judiciais ou administrativos, e prevenção de fraudes.</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold">7.7. Encarregado pelo Tratamento de Dados (DPO)</h3>
                    <p>
                      O encarregado pela proteção de dados (Data Protection Officer – DPO) da Junta Play é: Nome: Rodrigo | E-mail para contato: <a href="mailto:suporte@juntaplay.com.br">suporte@juntaplay.com.br</a>
                    </p>
                  </div>
                </div>
              </section>

              {/* 8. MODIFICAÇÕES NOS TERMOS */}
              <section>
                <h2 className="text-xl font-semibold mb-4">8. MODIFICAÇÕES NOS TERMOS</h2>
                <p>
                  A Junta Play poderá modificar estes Termos a qualquer momento, com aviso aos usuários por e-mail ou notificação no site. A continuidade do uso após as alterações será considerada aceitação tácita.
                </p>
              </section>

              {/* 9. CANCELAMENTO DE CONTA */}
              <section>
                <h2 className="text-xl font-semibold mb-4">9. CANCELAMENTO DE CONTA</h2>
                <p>
                  O usuário pode solicitar a exclusão da sua conta a qualquer momento. A plataforma se reserva o direito de suspender ou encerrar contas que estejam em desacordo com estes Termos.
                </p>
              </section>

              {/* 10. LEI APLICÁVEL E FORO */}
              <section>
                <h2 className="text-xl font-semibold mb-4">10. LEI APLICÁVEL E FORO</h2>
                <p>
                  Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca de Juiz de fora/MG, com exclusão de qualquer outro, por mais privilegiado que seja. Ao continuar navegando ou utilizando nossos serviços, você declara ter lido, compreendido e aceitado os Termos de Uso acima.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default TermosDeUso; 