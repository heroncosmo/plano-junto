import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, Shield, DollarSign } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 hero-gradient opacity-5"></div>
      
      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Divida assinaturas e{" "}
                            <span className="text-cyan-600">economize até 80%</span> em{" "}
            <span className="text-cyan-600">Streamings</span>
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-xl">
                Com o JuntaPlay você pode compartilhar mais de 500 serviços e assinaturas 
                de forma fácil, rápida e segura.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="shadow-button text-lg px-8 py-6">
                <Link to="/cadastro">Cadastrar gratuitamente</Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="text-lg px-8 py-6">
                <Link to="/como-funciona">Como funciona</Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center space-x-8 pt-8">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-cyan-600" />
                <span className="text-sm text-muted-foreground">+50k usuários</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-cyan-600" />
                <span className="text-sm text-muted-foreground">100% seguro</span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-cyan-600" />
                <span className="text-sm text-muted-foreground">Economize até 80%</span>
              </div>
            </div>
          </div>

          {/* Illustration */}
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl p-8 flex items-center justify-center">
              <div className="grid grid-cols-3 gap-4 max-w-sm">
                {/* Service icons placeholder */}
                {[
                  "YouTube", "Netflix", "Spotify", "Disney+", 
                  "Amazon", "HBO", "Udemy", "ChatGPT", "Canva"
                ].map((service, index) => (
                  <div
                    key={service}
                    className="aspect-square bg-background rounded-2xl shadow-card flex items-center justify-center text-sm font-medium"
                    style={{ 
                      animationDelay: `${index * 0.1}s`,
                      animation: "fadeInUp 0.6s ease-out forwards"
                    }}
                  >
                    {service}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-16 bg-muted/50 py-4">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground">
            ⚠️ <strong>Importante:</strong> Este site atua apenas como intermediador de pagamentos e gestão de membros. 
            Não somos afiliados, licenciados, ou aprovados por qualquer um dos serviços mencionados.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;