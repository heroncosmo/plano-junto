import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGroups } from '@/hooks/useGroups';
import { ChevronRight, ChevronLeft, ShoppingCart, TrendingUp, Users, Star, DollarSign, Clock, ExternalLink } from 'lucide-react';

const App = () => {
  const { groups, loading, error } = useGroups();
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollRef2 = useRef<HTMLDivElement>(null);
  const scrollRef3 = useRef<HTMLDivElement>(null);
  const scrollRef4 = useRef<HTMLDivElement>(null);

  // Debug logs
  console.log('🎯 Estado no App:', { groups, loading, error });
  console.log('📈 Total grupos recebidos:', groups?.length || 0);

  // Função para embaralhar array aleatoriamente
  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Dividir grupos em seções com dados aleatórios
  const dividedGroups = {
    selected: groups?.slice(0, 8) || [], // Selecionados para você
    discovery: shuffleArray(groups || []).slice(0, 10) || [], // Descobrir - aleatório
    trending: shuffleArray(groups || []).slice(0, 8) || [], // Descubra o que estão compartilhando
    popular: shuffleArray(groups || []).slice(0, 6) || [] // Populares
  };

  console.log('🔍 Grupos divididos:', {
    selected: dividedGroups.selected.length,
    discovery: dividedGroups.discovery.length,
    trending: dividedGroups.trending.length,
    popular: dividedGroups.popular.length
  });

  const formatCurrency = (centavos: number) => {
    return `R$ ${(centavos / 100).toFixed(2).replace('.', ',')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getCategoryLabel = (category: string) => {
    const categories: { [key: string]: string } = {
      'streaming': 'Streaming',
      'music': 'Música',
      'education': 'Educação',
      'ai': 'IA',
      'gaming': 'Jogos',
      'productivity': 'Produtividade',
      'other': 'Outros'
    };
    return categories[category] || 'Outros';
  };

  const getRelationshipLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'family': 'Família',
      'friends': 'Amigos',
      'work': 'Trabalho',
      'other': 'Outros'
    };
    return types[type] || 'Outros';
  };

  const getAvailabilityColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'available': 'bg-green-100 text-green-800',
      'full': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getAvailabilityLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'available': 'Disponível',
      'full': 'Completo'
    };
    return labels[status] || 'Indisponível';
  };

  const scrollLeft = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  // Função para detectar scroll e mostrar efeitos
  const handleScroll = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      const { scrollLeft, scrollWidth, clientWidth } = ref.current;
      const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 10;
      
      if (isAtEnd) {
        // Adicionar efeito de bounce quando chega ao final
        ref.current.classList.add('bounce-end');
        setTimeout(() => {
          ref.current?.classList.remove('bounce-end');
        }, 600);
      }
    }
  };

  // Adicionar event listeners para scroll
  useEffect(() => {
    const addScrollListeners = () => {
      [scrollRef, scrollRef2, scrollRef3].forEach(ref => {
        if (ref.current) {
          ref.current.addEventListener('scroll', () => handleScroll(ref));
        }
      });
    };

    // Aguardar um pouco para os refs estarem prontos
    const timer = setTimeout(addScrollListeners, 100);
    return () => clearTimeout(timer);
  }, [groups]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-5xl mx-auto px-6 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando grupos...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-5xl mx-auto px-6 py-8">
          <div className="text-center py-12">
            <p className="text-red-600">Erro ao carregar grupos: {error}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-10">
        
        {/* Hero Banner - ECONOMIA EM ASSINATURAS */}
        <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 z-10 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">
              Quer economizar até
              <br />
              <span className="text-white font-extrabold">80% em assinaturas?</span>
            </h1>
            <p className="text-base md:text-lg opacity-95">
              Junte-se a milhares de pessoas economizando juntas!
            </p>
          </div>
          <div className="flex-shrink-0 z-10">
            <Link to="/groups">
              <Button size="lg" className="bg-white hover:bg-gray-100 text-cyan-600 font-bold rounded-lg px-6 md:px-8 py-3 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200">
                <span className="text-cyan-600">🎁</span>
                Começar a economizar
              </Button>
            </Link>
          </div>
          <div className="absolute right-0 top-0 text-6xl md:text-9xl text-cyan-400 opacity-10 z-0 transform -translate-y-1/4 translate-x-1/4">
            🍀
          </div>
        </div>

        {/* Seção: Selecionados para você */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Selecionados para você
            </h2>
            <Link to="/groups" className="text-cyan-600 hover:text-cyan-700 text-sm font-medium flex items-center gap-1">
              Ver Tudo
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          
          {/* Container com scroll horizontal e botões de navegação */}
          <div className="relative group">
            {/* Botão esquerdo - Desktop */}
            <button
              onClick={() => scrollLeft(scrollRef)}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 nav-button opacity-0 group-hover:opacity-100 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 hidden md:flex"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            
            {/* Botão direito - Desktop */}
            <button
              onClick={() => scrollRight(scrollRef)}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 nav-button opacity-0 group-hover:opacity-100 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 hidden md:flex"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
            
            {/* Scroll horizontal */}
            <div 
              ref={scrollRef}
              className="mobile-scroll-container"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="flex gap-4 min-w-max px-4">
                {dividedGroups.selected.map((group) => (
                  <Card key={group.id} className="hover:shadow-lg transition-shadow min-w-[280px] max-w-[320px]">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {group.services?.icon_url && (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <img 
                                src={group.services.icon_url} 
                                alt={group.services.name}
                                className="w-8 h-8"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          <div>
                            <CardTitle className="text-lg">{group.name}</CardTitle>
                            <CardDescription>{group.services?.name || 'Serviço não disponível'}</CardDescription>
                          </div>
                        </div>
                        <Badge className={getAvailabilityColor(group.current_members >= group.max_members ? 'full' : 'available')}>
                          {getAvailabilityLabel(group.current_members >= group.max_members ? 'full' : 'available')}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Vagas:</span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {group.current_members}/{group.max_members}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Preço por vaga:</span>
                          <span className="flex items-center gap-1 font-medium text-green-600">
                            <DollarSign className="h-4 w-4" />
                            {formatCurrency(group.price_per_slot_cents)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Criado em:</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatDate(group.created_at)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {getCategoryLabel(group.services?.category || 'unknown')}
                          </Badge>
                          <Badge variant="outline">
                            {getRelationshipLabel(group.relationship_type)}
                          </Badge>
                        </div>
                        
                        {group.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {group.description}
                          </p>
                        )}
                        
                        <Button
                          onClick={() => window.location.href = `/group/${group.id}`}
                          className="w-full"
                          disabled={group.current_members >= group.max_members}
                        >
                          {group.current_members >= group.max_members ? (
                            'Grupo Completo'
                          ) : (
                            <>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </>
                          )}
                        </Button>
                          </div>
                        </CardContent>
                    </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Seção: Descobrir */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-cyan-500" />
              Descobrir
            </h2>
            <Link to="/groups" className="text-cyan-600 hover:text-cyan-700 text-sm font-medium flex items-center gap-1">
              Ver Tudo
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          
          {/* Container com scroll horizontal e botões de navegação */}
          <div className="relative group">
            {/* Botão esquerdo - Desktop */}
            <button
              onClick={() => scrollLeft(scrollRef2)}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 nav-button opacity-0 group-hover:opacity-100 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 hidden md:flex"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            
            {/* Botão direito - Desktop */}
            <button
              onClick={() => scrollRight(scrollRef2)}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 nav-button opacity-0 group-hover:opacity-100 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 hidden md:flex"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
            
            {/* Scroll horizontal */}
            <div 
              ref={scrollRef2}
              className="mobile-scroll-container"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="flex gap-4 min-w-max px-4">
                {dividedGroups.discovery.map((group) => (
                  <Card key={group.id} className="hover:shadow-lg transition-shadow min-w-[280px] max-w-[320px]">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {group.services?.icon_url && (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <img 
                                src={group.services.icon_url} 
                                alt={group.services.name}
                                className="w-8 h-8"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          <div>
                            <CardTitle className="text-lg">{group.name}</CardTitle>
                            <CardDescription>{group.services?.name || 'Serviço não disponível'}</CardDescription>
                          </div>
                        </div>
                        <Badge className={getAvailabilityColor(group.current_members >= group.max_members ? 'full' : 'available')}>
                          {getAvailabilityLabel(group.current_members >= group.max_members ? 'full' : 'available')}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Vagas:</span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {group.current_members}/{group.max_members}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Preço por vaga:</span>
                          <span className="flex items-center gap-1 font-medium text-green-600">
                            <DollarSign className="h-4 w-4" />
                            {formatCurrency(group.price_per_slot_cents)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Criado em:</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatDate(group.created_at)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {getCategoryLabel(group.services?.category || 'unknown')}
                          </Badge>
                          <Badge variant="outline">
                            {getRelationshipLabel(group.relationship_type)}
                          </Badge>
                        </div>
                        
                        {group.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {group.description}
                          </p>
                        )}
                        
                        <Button
                          onClick={() => window.location.href = `/group/${group.id}`}
                          className="w-full"
                          disabled={group.current_members >= group.max_members}
                        >
                          {group.current_members >= group.max_members ? (
                            'Grupo Completo'
                          ) : (
                            <>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </>
                          )}
                        </Button>
                          </div>
                        </CardContent>
                    </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Seção: Descubra o que estão compartilhando */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              Descubra o que estão compartilhando
            </h2>
            <Link to="/groups" className="text-cyan-600 hover:text-cyan-700 text-sm font-medium flex items-center gap-1">
              Ver Tudo
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          
          {/* Container com scroll horizontal e botões de navegação */}
          <div className="relative group">
            {/* Botão esquerdo - Desktop */}
            <button
              onClick={() => scrollLeft(scrollRef3)}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 nav-button opacity-0 group-hover:opacity-100 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 hidden md:flex"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            
            {/* Botão direito - Desktop */}
            <button
              onClick={() => scrollRight(scrollRef3)}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 nav-button opacity-0 group-hover:opacity-100 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 hidden md:flex"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
            
            {/* Scroll horizontal */}
            <div 
              ref={scrollRef3}
              className="mobile-scroll-container"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="flex gap-4 min-w-max px-4">
                {dividedGroups.trending.map((group) => (
                  <Card key={group.id} className="hover:shadow-lg transition-shadow min-w-[280px] max-w-[320px]">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {group.services?.icon_url && (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <img 
                                src={group.services.icon_url} 
                                alt={group.services.name}
                                className="w-8 h-8"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          <div>
                            <CardTitle className="text-lg">{group.name}</CardTitle>
                            <CardDescription>{group.services?.name || 'Serviço não disponível'}</CardDescription>
                          </div>
                        </div>
                        <Badge className={getAvailabilityColor(group.current_members >= group.max_members ? 'full' : 'available')}>
                          {getAvailabilityLabel(group.current_members >= group.max_members ? 'full' : 'available')}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Vagas:</span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {group.current_members}/{group.max_members}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Preço por vaga:</span>
                          <span className="flex items-center gap-1 font-medium text-green-600">
                            <DollarSign className="h-4 w-4" />
                            {formatCurrency(group.price_per_slot_cents)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Criado em:</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatDate(group.created_at)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {getCategoryLabel(group.services?.category || 'unknown')}
                          </Badge>
                          <Badge variant="outline">
                            {getRelationshipLabel(group.relationship_type)}
                          </Badge>
                        </div>
                        
                        {group.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {group.description}
                          </p>
                        )}
                        
                        <Button
                          onClick={() => window.location.href = `/group/${group.id}`}
                          className="w-full"
                          disabled={group.current_members >= group.max_members}
                        >
                          {group.current_members >= group.max_members ? (
                            'Grupo Completo'
                          ) : (
                            <>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </>
                          )}
                        </Button>
                          </div>
                        </CardContent>
                    </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default App; 