import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Info, CreditCard, Building2, Calculator } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Taxas = () => {
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
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Taxas e Custos</h1>
          <p className="text-gray-600">Informações transparentes sobre nossas taxas e custos operacionais</p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Como Funcionam as Taxas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed mb-4">
                Membros e administradores contribuem igualmente com sua parte na assinatura. Para fazer tudo funcionar por aqui, existem as taxas administrativas e de pagamentos.
              </p>
            </CardContent>
          </Card>

          {/* Administrative Fees */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Taxas Administrativas do JuntaPlay
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed mb-4">
                O JuntaPlay tem uma taxa de administração padrão de R$3,50 por participação, este valor está inserido na mensalidade dos grupos. A taxa serve para cobrir custos da empresa como servidores, suporte, marketing, etc.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-blue-800 font-medium mb-1">Taxa Administrativa</p>
                    <p className="text-blue-700 text-sm">
                      R$ 3,50 por participação mensal - Incluída automaticamente no valor da vaga
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Processing Fees */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Taxas de Processamento de Pagamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed mb-4">
                Para todo pagamento efetuado no JuntaPlay, utilizamos um intermediador parceiro, chamado de gateway de pagamento, para processar essa transação.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Essa operação tem custos, como, por exemplo: taxas bancárias, emissão e compensação de boletos, taxas das bandeiras de cartão de crédito, sistema antifraude, impostos, entre outros.
              </p>
            </CardContent>
          </Card>

          {/* PIX Fees */}
          <Card>
            <CardHeader>
              <CardTitle>O JuntaPlay cobra Pix?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed mb-4">
                Muitos perguntam se o JuntaPlay cobra Pix, mas é importante entender que, diferente de pessoas físicas, empresas pagam taxas para processar transações via Pix. O JuntaPlay não fica com nenhum valor dessas transações; nós apenas repassamos os custos que os processadores de pagamento nos cobram.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Este valor é cobrado diretamente pelo meio de pagamento selecionado, e poderá variar de acordo com a opção escolhida. Isso torna mais transparente os custos reais de cada meio de pagamento, possibilitando que o membro opte pelo mais vantajoso no momento.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-green-800 font-medium mb-1">Transparência Total</p>
                    <p className="text-green-700 text-sm">
                      Você pode conferir o detalhamento das taxas, clicando no ícone de informação em qualquer tela de pagamento.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fee Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo das Taxas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Taxa Administrativa</span>
                  <span className="text-green-600 font-semibold">R$ 3,50</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Taxa de Pagamento (PIX)</span>
                  <span className="text-blue-600 font-semibold">Variável</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Taxa de Pagamento (Cartão)</span>
                  <span className="text-blue-600 font-semibold">Variável</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Section */}
          <Card>
            <CardHeader>
              <CardTitle>Precisa de Mais Informações?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed mb-4">
                Veja mais sobre taxas de participação de grupos no nosso blog, mas se ainda assim ficou com dúvidas, entre em contato com nosso suporte.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => navigate('/ajuda')}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white"
                >
                  Central de Ajuda
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/groups')}
                >
                  Ver Grupos Disponíveis
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Taxas; 