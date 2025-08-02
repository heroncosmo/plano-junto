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
              Termos de Uso - JuntaPlay
            </CardTitle>
            <p className="text-center text-gray-600">
              Em vigor à partir de 1 de janeiro de 2024 | Atualizado em 1 de janeiro de 2024
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-4">DEFINIÇÕES</h2>
                <div className="space-y-3">
                  <p><strong>Usuário:</strong> Toda e qualquer pessoa física que navegue ou faça uso do site do JuntaPlay, incluindo o administrador, criador e membro.</p>
                  <p><strong>Criador:</strong> Usuário do JuntaPlay interessado em angariar fundos para realização de uma assinatura de um serviço.</p>
                  <p><strong>Membro:</strong> Usuário do JuntaPlay interessado em contribuir financeiramente com os grupos de um ou mais criadores, recebendo o acesso à assinatura, de acordo com as regras estabelecidas em cada grupo pelo administrador.</p>
                  <p><strong>Administrador:</strong> Membro responsável pela assinatura de um grupo, pelo pagamento em dia do serviço contratado e o repasse do acesso aos demais membros. Um administrador é sempre um membro, podendo ou não ser o criador.</p>
                  <p><strong>Grupo:</strong> Forma pela qual é proposta a assinatura de um serviço externo divulgado na plataforma JuntaPlay pelo criador com o objetivo de angariar fundos para a sua concretização. Os grupos devem cumprir integralmente o Termo de Uso do serviço compartilhado, sendo que qualquer grupo que estiver em desacordo com tais diretrizes, poderá ser removido do site pelo JuntaPlay.</p>
                  <p><strong>Grupo Ativo:</strong> é o grupo que no prazo determinado, após preencher o número de quotas estabelecidas pelo criador e confirmado o pagamento de todos os membros envolvidos, é assinado pelo administrador.</p>
                  <p><strong>Estorno:</strong> Devolução dos valores de compra de crédito. O estorno será realizado de acordo com o descrito na seção estornos e retiradas de créditos deste documento.</p>
                  <p><strong>Retirada De Crédito:</strong> Retiradas de saldo disponível de créditos na plataforma JuntaPlay que não se enquadram no prazo de estorno exigidos pelos meios de pagamentos utilizados no site.</p>
                  <p><strong>Inscrição:</strong> é a entrada com pagamento confirmado do MEMBRO no GRUPO de assinatura.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">INTRODUÇÃO</h2>
                <p>O JuntaPlay é uma plataforma online que se destina a aproximar pessoas que desejam assinar um serviço em conjunto, com o objetivo de facilitar a gestão de recorrência de pagamentos na angariação coletiva de fundos (crowdfunding). O JuntaPlay permite que um criador de grupos apresente uma ideia de grupo de assinatura e angarie fundos de membros interessados em usufruir do serviço prestado.</p>
                <p>A plataforma JuntaPlay reúne os valores desembolsados pelos membros destinados a cada grupo até o prazo determinado pelo respectivo criador ou administrador.</p>
                <p>O presente Termo de Uso estabelece obrigações contratadas de livre e espontânea vontade, por tempo indeterminado, entre o JuntaPlay e as pessoas físicas usuárias da plataforma. Este instrumento segue fielmente os princípios do marco civil da internet (Lei nº 12.965/14), em especial o Art. 3º, VIII.</p>
                <p>Toda a relação entre a empresa JuntaPlay e seus usuários é regida por este termo, de forma que essas regras devem ser aplicadas à exclusão de todas as outras condições.</p>
                <p>Ao utilizar a plataforma, o usuário também concorda com a Política de Privacidade. O JuntaPlay recomenda que todos os documentos sejam lidos antes de utilizar a plataforma.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">DELIMITAÇÃO DOS LIMITES DA PLATAFORMA</h2>
                <p>A plataforma JuntaPlay oferece soluções na angariação coletiva de recursos financeiros (Crowdfunding).</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">DISPOSIÇÕES GERAIS</h2>
                <div className="space-y-3">
                  <p>Ao efetivar o cadastro na plataforma, o usuário garante que as informações de registro estão corretas, completas e são verídicas. O usuário deverá ainda manter e atualizar suas informações de modo a mantê-las verdadeiras, exatas, atuais e completas.</p>
                  <p>O usuário será responsabilizado por qualquer informação falsa, incorreta, desatualizada ou incompleta fornecida. Caso o JuntaPlay tenha razões suficientes para suspeitar da veracidade ou da exatidão de tais informações, terá o direito de suspender ou cancelar, imediatamente e independente de qualquer aviso ou notificação, a conta do usuário.</p>
                  <p>O cadastro é exclusivo para pessoas físicas, inscritas com CPF, maiores de 18 (dezoito) anos. Caso seja verificada eventual infração desta disposição, o JuntaPlay poderá cancelar o cadastro do usuário.</p>
                  <p>É permitido o uso da plataforma por usuários internacionais desde que se adequem quanto ao fornecimento de dados necessários para a utilização da plataforma, como telefone e formas de pagamento compatíveis com os serviços parceiros vinculados na plataforma.</p>
                  <p>Ao se cadastrar na plataforma o usuário deverá criar uma senha, sendo esta confidencial não podendo ser compartilhada com terceiros. O usuário será integralmente responsabilizado civil e criminalmente pelo uso da senha ou quaisquer informações alimentadas, ou serviços compartilhados na plataforma.</p>
                  <p>Mesmo que firmado eletronicamente, o presente Termo de Uso constitui um contrato com validade e eficácia jurídica plena, em conformidade com a legislação civil.</p>
                  <p>A aceitação do presente instrumento é necessária para a utilização de qualquer serviço oferecido pela plataforma. Ao realizar cadastro na plataforma, o usuário confirma que leu, compreendeu e aceitou, sem restrições, o presente Termo de Uso.</p>
                  <p>O JuntaPlay se reserva o direito de, a qualquer momento, modificar o presente Termo de Uso, publicando neste site uma versão com a data atualizada. Ao fazer uso da plataforma após a publicação de uma nova versão do Termo de Uso ou Política de Privacidade, o usuário concorda com a versão vigente.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">FUNÇÕES E RESPONSABILIDADES DOS USUÁRIOS</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Criador:</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Descreve o grupo de assinatura, que deve ser necessariamente lícito e de acordo com a legislação brasileira.</li>
                      <li>Estipula o valor total da assinatura que deseja se obter.</li>
                      <li>Define o número de membros que poderão se beneficiar dessa assinatura.</li>
                      <li>Todo criador que pertence a um grupo é membro deste, portanto tem as mesmas responsabilidades do membro.</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold">Administrador:</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Estabelece as regras e as condições da assinatura do serviço.</li>
                      <li>Ao decidir assinar determinado serviço, o administrador assume a responsabilidade de manter seu cadastro atualizado e o pagamento do serviço em dia.</li>
                      <li>Fornece seus dados para transferência dos recursos captados, descontadas as taxas de serviço do JuntaPlay.</li>
                      <li>É responsável pela solicitação antecipada de atualização do valor do grupo quando necessário.</li>
                      <li>Após o grupo se completar e for autorizada a assinatura do serviço, o administrador tem até 3 (três) dias úteis para retornar aos seus membros com as informações de acesso.</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold">Membro:</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Escolhe livremente o grupo que deseja apoiar.</li>
                      <li>Efetua o pagamento por meio de cartão de crédito, boleto bancário ou créditos comprados na plataforma JuntaPlay.</li>
                      <li>É o único responsável pelo acompanhamento do desenvolvimento do grupo.</li>
                      <li>Poderá enviar ao JuntaPlay sugestões ou críticas à forma como um grupo divulgado está estruturado.</li>
                      <li>Assume a responsabilidade integral e exclusiva por tributos de quaisquer naturezas incidentes sobre o grupo.</li>
                      <li>Respeitar regras de uso do serviço de assinatura descrita em campo específico do grupo pelo administrador.</li>
                      <li>Não compartilhar ou deixar gravado credenciais de acesso em dispositivo eletrônico.</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">TAXAS E PAGAMENTOS</h2>
                <div className="space-y-3">
                  <p>Os membros estão plenamente cientes e concordam que todos os valores destinados ao apoio dos grupos só poderão ser arrecadados por meio de créditos na plataforma JuntaPlay adquiridos através dos parceiros financeiros responsáveis pelo recebimento do pagamento disponível no site.</p>
                  <p>É dever de todos os usuários conferir o recebimento de todas as cobranças por qualquer meio que tenha sido escolhido. O não recebimento de qualquer cobrança não isenta a obrigação de seu pagamento, estando o usuário sujeito às penalidades previstas.</p>
                  <p>Se o grupo se tornar um grupo ativo, o valor total arrecadado para esse grupo será transferido pelo JuntaPlay para uma conta informada pelo administrador, descontando-se deste valor o montante que contempla a taxa de intermediação do JuntaPlay, bem como as tarifas cobradas pelos meios de pagamento.</p>
                  <p>Se o grupo não for assinado, os membros que tiverem realizado a inscrição terão o crédito referente ao pagamento de assinatura do grupo devolvido em sua conta do JuntaPlay.</p>
                  <p>Todas as taxas são cotadas em reais (R$). O usuário é o responsável pelo pagamento de todas as taxas e impostos associados com o uso do JuntaPlay.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">PROIBIÇÕES E PENALIDADES</h2>
                <div className="space-y-3">
                  <p>Todos os usuários poderão se cadastrar, mantendo apenas um único cadastro ativo na plataforma do JuntaPlay. Será considerado uma infração manter duas ou mais contas simultâneas na plataforma.</p>
                  <p>Sendo identificada a existência de contas diversas sobre a mesma titularidade, o JuntaPlay se reserva o direito de banir todas as contas, impedindo o usuário de proceder a novo cadastro.</p>
                  <p>Todos os usuários deverão prezar pelo respeito, sobretudo quanto à não exposição de dados pessoais uns dos outros. Não é permitido o compartilhamento de dados, quaisquer destes, sobretudo telefone, em outros meios ou com outras pessoas além do grupo específico do JuntaPlay em que o usuário participa.</p>
                  <p>O compartilhamento indevido dos dados de qualquer usuário resultará na penalidade de suspensão, que impedirá o acesso do usuário infrator durante 30 (trinta) dias.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">CANCELAMENTO DE GRUPOS PELO JUNTAPLAY</h2>
                <p>O JuntaPlay se reserva o direito de cancelar grupos nas seguintes hipóteses:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Que infrinjam a lei ou a regulamentação do país;</li>
                  <li>Que contenham conteúdo obsceno, ofensivo e que possuam, por lei, restrição de idade mínima de 18 (dezoito) anos para o acesso;</li>
                  <li>Que partilhem direito autoral de outro detentor, promovendo acesso não formal de serviços;</li>
                  <li>Que promovam a pirataria, sendo de qualquer produto por qualquer meio;</li>
                  <li>Que não apresentem quantidade mínima de usuários;</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">SUPORTE</h2>
                <p>O suporte do JUNTAPLAY se dará única e exclusivamente nos seguintes tópicos:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Dúvidas de como utilizar a plataforma JuntaPlay.</li>
                  <li>Dúvidas ou problemas referentes ao aspecto financeiro do compartilhamento oferecido pela plataforma JuntaPlay.</li>
                  <li>Disputa de casos pertinentes ao funcionamento do compartilhamento oferecido.</li>
                </ul>
                <p>Suporte de outra natureza como dúvidas de utilização do serviço externo contratado devem ser sanadas diretamente com o suporte do serviço em questão ou com o administrador do seu grupo.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">DIREITOS AUTORAIS E PROPRIEDADE INTELECTUAL</h2>
                <div className="space-y-3">
                  <p>Os textos, fotografias, imagens, logomarcas presentes no site, API, aplicativos para dispositivos móveis e software se encontram protegidos por direitos autorais ou outros direitos de propriedade intelectual.</p>
                  <p>O usuário que acessa a plataforma declara que irá respeitar todos os direitos de propriedade intelectual e industrial decorrentes da proteção de marca registrada.</p>
                  <p>A reprodução dos conteúdos descritos está proibida, salvo prévia autorização por escrito da empresa JuntaPlay, ou que se destinem exclusivamente ao uso pessoal.</p>
                  <p>É vedada a sua utilização para finalidades comerciais, publicitárias ou qualquer outra que contrarie a realidade para qual foi concebido.</p>
                  <p>O usuário assume toda e qualquer responsabilidade de caráter civil ou criminal pela utilização indevida das informações, textos, gráficos, marcas, obras, ou seja, todo e qualquer direito de propriedade intelectual ou industrial.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">DISPOSIÇÕES FINAIS</h2>
                <div className="space-y-3">
                  <p>A tolerância do eventual descumprimento de quaisquer cláusulas e condições do presente contrato não constituirá novação das obrigações fixadas neste termo, nem tampouco impedirá ou inibirá a exigibilidade das mesmas a qualquer tempo.</p>
                  <p>O usuário declara ter lido integralmente o Termo de Uso, bem como a Política de Privacidade, tendo compreendido o sentido de todas as disposições.</p>
                  <p>Este Termo de Uso é regido pelas leis da República Federativa do Brasil e atende ao sistema legal brasileiro, aos princípios gerais de direito e às normas internacionais de comércio eletrônico.</p>
                  <p>Em conformidade com a legislação em vigor, o foro para dirimir eventuais controvérsias que decorram deste contrato será o do consumidor.</p>
                  <p>O usuário declara ter lido e compreendido o termo e disposições deste acordo de utilização e que está ciente de seu inteiro teor, aceitando todas as suas condições.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">CONTATO COM O JUNTAPLAY PARA ESCLARECIMENTO DE DÚVIDAS</h2>
                <p>Qualquer dúvida em relação ao nosso Termo de Uso pode ser esclarecida entrando em contato conosco.</p>
                <p>Envie uma mensagem pelo formulário de contato disponível na plataforma.</p>
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