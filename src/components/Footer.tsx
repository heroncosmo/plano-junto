import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">J</span>
              </div>
              <span className="text-xl font-bold">JuntaPlay</span>
            </div>
            <p className="text-sm text-muted-foreground">
              A plataforma para dividir assinaturas de forma segura e econômica.
            </p>
            <p className="text-xs text-muted-foreground">
              <strong>Aviso Legal:</strong> Não somos afiliados aos serviços mencionados. 
              Atuamos apenas como intermediador de pagamentos.
            </p>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="font-semibold">Serviços</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/groups" className="text-muted-foreground hover:text-foreground transition-colors">
                  Encontrar Grupos
                </Link>
              </li>
              <li>
                <Link to="/create-group" className="text-muted-foreground hover:text-foreground transition-colors">
                  Criar Grupo
                </Link>
              </li>
              <li>
                <Link to="/ajuda" className="text-muted-foreground hover:text-foreground transition-colors">
                  Como Funciona
                </Link>
              </li>
              <li>
                <Link to="/groups" className="text-muted-foreground hover:text-foreground transition-colors">
                  Serviços Disponíveis
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold">Suporte</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/ajuda" className="text-muted-foreground hover:text-foreground transition-colors">
                  Central de Ajuda
                </Link>
              </li>
              <li>
                <Link to="/ajuda" className="text-muted-foreground hover:text-foreground transition-colors">
                  Fale Conosco
                </Link>
              </li>
              <li>
                <Link to="/ajuda" className="text-muted-foreground hover:text-foreground transition-colors">
                  Perguntas Frequentes
                </Link>
              </li>
              <li>
                <Link to="/ajuda" className="text-muted-foreground hover:text-foreground transition-colors">
                  Segurança
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/termos-de-uso" className="text-muted-foreground hover:text-foreground transition-colors">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link to="/politica-de-privacidade" className="text-muted-foreground hover:text-foreground transition-colors">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link to="/taxas" className="text-muted-foreground hover:text-foreground transition-colors">
                  Taxas
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © 2025 JuntaPlay. Todos os direitos reservados.
            </p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>🔒 SSL Seguro</span>
              <span>🇧🇷 Feito no Brasil</span>
              <span>⚡ 99.9% Uptime</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;