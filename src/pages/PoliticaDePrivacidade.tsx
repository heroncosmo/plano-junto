import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

const PoliticaDePrivacidade = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6 p-0 h-auto text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Voltar
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">POLÍTICA DE PRIVACIDADE</h1>
          <p className="text-gray-600">Em vigor a partir de 01 de agosto de 2021.</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">INTRODUÇÃO</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              O JuntaPlay se preocupa com a privacidade do usuário, implementando integral cumprimento a lei nº 13.709/2018 (Lei Geral de Proteção de Dados – LGPD).
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Nosso objetivo é garantir ao nosso usuário proteção, segurança e transparência, assegurando uma privacidade adequada.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              O intuito deste documento é esclarecer quais informações são coletadas dos usuários de nossos sites: https://www.juntaplay.com; https://ptbr.facebook.com/juntaplayoficial/ e respectivos subdomínios, bem como de que forma esses dados são manipulados e utilizados.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Alertamos ao usuário que caso não concorde com o conteúdo desta política, não faça uso de nossa plataforma.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Ao acessar qualquer dos sites mencionados, bem como aplicativos e serviços, todos os usuários consentem com os termos apresentados nessa política.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Caso ocorra atualização dos termos, estes serão informados diretamente na plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">COLETA DE DADOS</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Em nossos sites, as informações são coletadas das seguintes formas:
            </p>
            
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Informações fornecidas pelo usuário</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Coletamos informações de identificação pessoal – Nome, sobrenome, e-mail, senha, CPF, endereço completo, nome de usuário e dados bancários, via preenchimento dos formulários para análise de casos. Eventualmente, as solicitações de algumas informações podem ser feitas por meio de contato direto com o JuntaPlay, para com os usuários via e-mail ou telefone.
            </p>

            <h3 className="text-lg font-semibold mb-3 text-gray-800">Informações de navegação no site</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Quando o usuário acessa nosso site, é inserido um 'cookie' no seu navegador por meio do software Google Analytics, para identificar quantas vezes você retorna ao nosso endereço. São coletadas, anonimamente, informações, como endereço IP, localização geográfica, fonte de referência, tipo de navegador, duração da visita e páginas visitadas.
            </p>

            <h3 className="text-lg font-semibold mb-3 text-gray-800">Histórico de contato</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Armazenamos informações a respeito de todos os contatos já realizados com nossos usuários, como páginas e interações via e-mail.
            </p>

            <h3 className="text-lg font-semibold mb-3 text-gray-800">Histórico financeiro</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              A plataforma tem registro de todas as retiradas, compras e estornos feitos pelos usuários.
            </p>

            <p className="text-gray-700 leading-relaxed">
              Os dados coletados são necessários para o funcionamento da plataforma, bem como para atender a determinações legais. Não nos responsabilizamos pela qualidade e veracidade dos dados, a responsabilidade de mantê-los atualizados é do usuário.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">CONSENTIMENTO</h2>
            <p className="text-gray-700 leading-relaxed">
              Por se tratar de um serviço prestado de forma eletrônica, o consentimento será manifestado por meio da plataforma, quer seja site, quer seja aplicativo, de forma que usuário tenha ciência inequívoca do consentimento que está manifestando.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">PROTEÇÃO E ARMAZENAMENTO</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              O JuntaPlay coleta diversas informações pessoais do usuário e, por essa razão, fizemos da segurança de dados nossa prioridade.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              O JuntaPlay nunca compartilhará os dados pessoais do usuário, a menos que:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Seja a pedido ou autorizado pelo usuário.</li>
              <li>Sejamos obrigados a disponibilizar os dados em razão de lei ou ordem judicial.</li>
              <li>Sejam necessárias para prestarmos o serviço da forma que o usuário contratou.</li>
              <li>Sejam necessárias para concluir a requisição de pagamento ou recebimento efetuada pelo usuário.</li>
              <li>Seja identificada violação ao Termo de Uso, falha no cumprimento do grupo ou atraso na entrega do acesso aos serviços assinados. Os dados cadastrais que poderão ser fornecidos são: nome completo, endereço, CPF, telefone e e-mail, nos limites do inciso VIII, do art. 7º da Lei 12.965 (Marco Civil da Internet).</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              O JuntaPlay obriga-se a utilizar as informações cadastrais fornecidas pelo usuário exclusivamente na forma e nos limites do necessário para a realização da aproximação entre membros e administrador na forma aqui prevista.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Infelizmente, não podemos garantir a segurança do aparelho pelo qual o usuário acessa o JuntaPlay, por isso tome sempre as precauções de segurança básicas:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Não confie em e-mails estranhos;</li>
              <li>Não acesse sites suspeitos;</li>
              <li>Tenha mecanismos de proteção ativos e atualizados, tais como; antivírus e antimalware;</li>
              <li>Não instale programas de fontes estranhas ou ilegais;</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              O JuntaPlay preza em manter os dados pessoais que coleta em sigilo e fará todo o possível para garantir que a confiança que o usuário deposita em nos seja justificada.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">USO DE SUAS INFORMAÇÕES PESSOAIS</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Os dados são fundamentais para cadastro e organização da plataforma, bem como para o cumprimento de obrigações legais em razão das transações financeiras realizadas na plataforma.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Mantemos os dados de usuário armazenados apenas pelo tempo necessário conforme a respectiva finalidade.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Quanto às finalidades específicas dos dados coletados:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Os dados básicos, como nome, sobrenome, e-mail, telefone e endereço, têm como finalidade o cadastro do usuário. É de fundamental importância que tenhamos dados mínimos que assegurem um correto e seguro cadastramento de cada pessoa na plataforma. A coleta do número de telefone e e-mail também tem uma finalidade de segurança, na hipótese de confirmações seguras de duas etapas ou troca de senha;</li>
              <li>Os dados de natureza fiscal e financeiros, no caso o nº de CPF e dados bancários, são uma obrigação legal quando há transações financeiras na plataforma, até mesmo por serem dados fundamentais para os parceiros financeiros que realizam o processamento de pagamentos, bem como retiradas e devoluções de valores.</li>
              <li>Os cookies têm como finalidade otimizar a experiência do usuário no uso da plataforma, facilitando a personalidade de quaisquer características, evitando que seja necessário que o usuário preste a mesma informação de forma recorrente.</li>
              <li>Dados de transações são utilizados por questões de segurança de forma a validar qualquer tipo de devolução ou estorno, bem como para monitoramento antifraude.</li>
              <li>Dados anonimizados são armazenados apenas com finalidade estatística, servindo de base para avaliações da empresa quanto a suas métricas, permitindo uma melhor prestação de serviços.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">ACESSO ÀS SUAS INFORMAÇÕES PESSOAIS</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Poderão ver as informações pessoais apenas funcionários do JuntaPlay. Eventualmente, caso a inserção de suas informações se dê em ações criadas em parcerias, os parceiros explicitamente identificados também terão acesso à informação. Nenhuma informação pessoal poderá ser divulgada publicamente.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              O JuntaPlay também se compromete a não vender, alugar ou repassar informações para terceiros. A única exceção está em casos em que essas informações forem exigidas judicialmente.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Além disso, embora trabalhemos com boas práticas de proteção e segurança, nenhum serviço web possui 100% (cem por cento) de garantia contra invasões e não podemos nos responsabilizar caso isso ocorra.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">COMPARTILHAMENTO DOS DADOS PESSOAIS DOS USUÁRIOS</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              É fundamental o compartilhamento de dados com alguns parceiros, visto que sem esses elementos não é possível, por exemplo, efetivar uma transação bancária. Primamos pela privacidade do usuário, informando exclusivamente a cada parceiro apenas os dados estritamente necessários, de modo a zelar ao máximo por cada informação que nos é cedida pelo usuário.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Os dados variam conforme a natureza do parceiro, podendo ser classificados da seguinte forma:
            </p>

            <h3 className="text-lg font-semibold mb-3 text-gray-800">Comunicação</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Ao entrar em contato com a plataforma, alguns dados são necessários para que nosso parceiro possa organizar as informações. Desta forma, conseguimos prestar um atendimento adequado, identificando cada usuário usando estritamente os dados essenciais. Nesta hipótese, compartilhamos:
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Nome, sobrenome, e-mail e telefone.
            </p>

            <h3 className="text-lg font-semibold mb-3 text-gray-800">Financeiro</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Quando transações são realizadas, é fundamental que a plataforma disponha de alguma forma de pagamento, serviço este que é realizado por parceiros. Os dados compartilhados com nossos parceiros financeiros são:
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Nome, sobrenome, e-mail, CPF, e-mail de cobrança, nome de usuário, telefone, apelido, endereço completo e dados bancários (Banco, agência, conta, dígito de conta).
            </p>

            <h3 className="text-lg font-semibold mb-3 text-gray-800">Obrigações Legais</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              A plataforma precisa prestar algumas informações a parceiros por exigência legal, nesse caso, os dados compartilhados são:
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Nome, sobrenome, e-mail, CPF, e-mail de cobrança, nome de usuário, telefone, apelido e endereço completo.
            </p>

            <h3 className="text-lg font-semibold mb-3 text-gray-800">Antifraude</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Como tratamos de transações, fraudes são possíveis, contexto em que precisamos de métodos para aumentar a segurança no monitoramento dos procedimentos realizados. Nossos parceiros que atuam nesse quesito necessitam dos seguintes dados:
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Nome, sobrenome, e-mail, CPF, e-mail de cobrança, nome de usuário, telefone, apelido, endereço completo e imagem do documento de identidade.
            </p>

            <h3 className="text-lg font-semibold mb-3 text-gray-800">Suporte</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Quando o usuário precisa de atendimento na plataforma para resolver alguma questão, temos parceiros que atuam diretamente nos oferecendo ferramentas de atendimento para este tipo de demanda. Para estes casos, os dados necessários são:
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Nome, sobrenome, e-mail, CPF, e-mail de cobrança, nome de usuário, telefone, apelido, endereço completo e dados bancários (Banco, agência, conta, dígito de conta).
            </p>

            <h3 className="text-lg font-semibold mb-3 text-gray-800">Anúncios e Marketing</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Há também parceiros quanto a ações de marketing e anúncios, sendo compartilhados os seguintes dados:
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Nome de usuário e e-mail.
            </p>

            <h3 className="text-lg font-semibold mb-3 text-gray-800">Hipóteses excepcionais</h3>
            <p className="text-gray-700 leading-relaxed">
              Pode haver ainda a necessidade de compartilhar os dados de usuário para cumprimento de ordem judicial, solicitações administrativas como, por exemplo, Procon, Agências Reguladoras, investigações policiais, investigações de antifraude etc. São situações incomuns, mas que são possíveis de ocorrer. Os dados compartilhados irão variar conforme a determinação a cada caso.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">COMPARTILHAMENTO DE CONTEÚDO NAS REDES SOCIAIS</h2>
            <p className="text-gray-700 leading-relaxed">
              Ao clicar nos botões de compartilhamento de conteúdo nas mídias sociais disponíveis em nossas páginas, o usuário publicará o conteúdo por meio de seu perfil na rede selecionada.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">CANCELAMENTO DA ASSINATURA E ALTERAÇÃO/EXCLUSÃO DE INFORMAÇÕES PESSOAIS</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              O usuário pode optar por não receber mais qualquer tipo de e-mail do JuntaPlay.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Em todos os e-mails que enviamos, há sempre um link para cancelar a assinatura disponível nas últimas linhas. Ao clicar nesse link, o usuário será automaticamente descadastrado da lista.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              É importante mencionar que ao preencher qualquer formulário novamente ficará caracterizada a reinserção do seu e-mail a lista. Portanto, a requisição de cancelamento deve ser feita novamente caso seja de interesse.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Para alterar suas informações pessoais ou mesmo excluí-las do nosso banco de dados, o usuário deverá entrar em contato conosco por meio do formulário de contato.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">MUDANÇAS NA POLÍTICA DE PRIVACIDADE</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Essa Política de Privacidade pode passar por atualizações. Desta forma, recomendamos visitar periodicamente esta página para que o usuário tenha conhecimento sobre as modificações.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Antes de usar informações para outros fins que não os definidos nesta Política de Privacidade, solicitaremos autorização.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">MANIFESTAÇÃO DE VONTADE DO USUÁRIO</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              De modo a facilitar o acesso do usuário no que tange à gestão de seus dados, caso deseje, poderá enviar uma solicitação por meio do canal suporte@juntaplay.com.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Será por meio deste canal que o usuário poderá solicitar acesso aos seus dados, podendo administrar todos os consentimentos concedidos (se for o caso, podendo deixar de conceder algum consentimento), bem como poderá editar qualquer dado ou excluir qualquer destes, exercendo os direitos garantidos pela LGPD.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Mesmo que haja a exclusão, alguns destes dados serão mantidos para assegurar o cumprimento de legislações, mas após o fim do período correspondente a essas obrigações os dados serão definitivamente excluídos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">DISPOSIÇÕES FINAIS</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              O usuário reconhece e concorda com os termos desta política de privacidade. Reconhece também que são aplicáveis as leis do Brasil para tratar suas informações. Bem como reconhece que esta Política de Privacidade é complementar ao Termo de Uso.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">CONTATO COM O JUNTAPLAY PARA ESCLARECIMENTO DE DÚVIDAS</h2>
            <p className="text-gray-700 leading-relaxed">
              Qualquer dúvida em relação à nossa Política De Privacidade pode ser esclarecida entrando em contato conosco através do formulário de contato ou através da nossa <button onClick={() => navigate('/ajuda')} className="text-cyan-600 hover:underline">Central de Ajuda</button>.
            </p>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PoliticaDePrivacidade; 