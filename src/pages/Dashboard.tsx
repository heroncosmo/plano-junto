import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGroups } from '@/hooks/useGroups';
import { ChevronRight, ChevronLeft, ShoppingCart, TrendingUp, Users, Star } from 'lucide-react';

const Dashboard = () => {
  const { groups, loading, error } = useGroups();
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollRef2 = useRef<HTMLDivElement>(null);
  const scrollRef3 = useRef<HTMLDivElement>(null);
  const scrollRef4 = useRef<HTMLDivElement>(null);

  // Debug logs
  console.log('🎯 Estado no Dashboard:', { groups, loading, error });
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

  const getServiceInitial = (serviceName: string) => {
    return serviceName.charAt(0).toUpperCase();
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'ai_tools': 'bg-emerald-500',
      'streaming': 'bg-red-500',
      'design': 'bg-purple-500',
      'productivity': 'bg-blue-500',
      'gaming': 'bg-green-500',
      'education': 'bg-orange-500',
      'ai': 'bg-emerald-500',
      'music': 'bg-pink-500',
      'other': 'bg-gray-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  const formatPrice = (priceCents: number) => {
    return `R$ ${(priceCents / 100).toFixed(2).replace('.', ',')}`;
  };

  const getStatusText = (availableSpots: number, isAssinado: boolean = true) => {
    if (isAssinado) {
      return availableSpots > 0 ? 'Aguardando membros' : 'Grupo completo';
    }
    return availableSpots > 0 ? 'Aguardando membros' : 'Grupo completo';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-5xl mx-auto px-6 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
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
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden flex items-center justify-between">
          <div className="space-y-3 z-10">
            <h1 className="text-3xl font-bold">
              Quer economizar até
              <br />
              <span className="text-yellow-400">80% em assinaturas?</span>
            </h1>
            <p className="text-lg opacity-90">
              Junte-se a milhares de pessoas economizando juntas!
            </p>
          </div>
          <div className="flex-shrink-0 z-10">
            <Link to="/groups">
              <Button size="lg" className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-lg px-8 flex items-center gap-2">
                <span className="text-black">🎁</span>
                Começar a economizar
              </Button>
            </Link>
          </div>
          <div className="absolute right-0 top-0 text-9xl text-green-400 opacity-20 z-0 transform -translate-y-1/4 translate-x-1/4">
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
            <Link to="/groups" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
              Ver Tudo
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          
          {/* Container com scroll horizontal e botões de navegação */}
          <div className="relative group">
            {/* Botão esquerdo */}
            <button
              onClick={() => scrollLeft(scrollRef)}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 nav-button opacity-0 group-hover:opacity-100 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            
            {/* Botão direito */}
            <button
              onClick={() => scrollRight(scrollRef)}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 nav-button opacity-0 group-hover:opacity-100 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
            
            {/* Scroll horizontal */}
            <div 
              ref={scrollRef}
              className="overflow-x-auto pb-4 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="flex gap-4 min-w-max px-4">
                {dividedGroups.selected.map((group) => {
                  const availableSpots = group.max_members - group.current_members;
                  
                  return (
                    <Card key={group.id} className="bg-white rounded-xl border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer min-w-[200px]">
                      <Link to={`/group/${group.id}`}>
                        <CardContent className="p-6 text-center space-y-3">
                          {/* Avatar com inicial */}
                          <div className={`w-16 h-16 mx-auto ${getCategoryColor(group.service.category)} rounded-full flex items-center justify-center text-white text-xl font-bold`}>
                            {getServiceInitial(group.service.name)}
                          </div>
                          {/* Nome do serviço */}
                          <h3 className="font-semibold text-gray-900 text-sm">
                            {group.service.name}
                          </h3>
                          {/* Número de vagas */}
                          <p className="text-sm text-gray-600 font-medium">
                            {group.max_members} Vagas
                          </p>
                          {/* Preço */}
                          <p className="text-xl font-bold text-gray-900">
                            {formatPrice(group.price_per_slot_cents)}
                          </p>
                          {/* Status com design de selo */}
                          <div className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-xs text-gray-600 font-medium">
                            {getStatusText(availableSpots)}
                          </div>
                        </CardContent>
                      </Link>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Seção: Descobrir */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Descobrir
            </h2>
            <Link to="/groups" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
              Ver Tudo
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          
          {/* Container com scroll horizontal e botões de navegação */}
          <div className="relative group">
            {/* Botão esquerdo */}
            <button
              onClick={() => scrollLeft(scrollRef2)}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 nav-button opacity-0 group-hover:opacity-100 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            
            {/* Botão direito */}
            <button
              onClick={() => scrollRight(scrollRef2)}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 nav-button opacity-0 group-hover:opacity-100 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
            
            {/* Scroll horizontal */}
            <div 
              ref={scrollRef2}
              className="overflow-x-auto pb-4 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="flex gap-4 min-w-max px-4">
                {dividedGroups.discovery.map((group) => {
                  const availableSpots = group.max_members - group.current_members;
                  
                  return (
                    <Card key={group.id} className="bg-white rounded-xl border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer min-w-[200px]">
                      <Link to={`/group/${group.id}`}>
                        <CardContent className="p-6 text-center space-y-3">
                          {/* Avatar com inicial */}
                          <div className={`w-16 h-16 mx-auto ${getCategoryColor(group.service.category)} rounded-full flex items-center justify-center text-white text-xl font-bold`}>
                            {getServiceInitial(group.service.name)}
                          </div>
                          {/* Nome do serviço */}
                          <h3 className="font-semibold text-gray-900 text-sm">
                            {group.service.name}
                          </h3>
                          {/* Número de vagas */}
                          <p className="text-sm text-gray-600 font-medium">
                            {group.max_members} Vagas
                          </p>
                          {/* Preço */}
                          <p className="text-xl font-bold text-gray-900">
                            {formatPrice(group.price_per_slot_cents)}
                          </p>
                          {/* Status com design de selo */}
                          <div className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-xs text-gray-600 font-medium">
                            {getStatusText(availableSpots)}
                          </div>
                        </CardContent>
                      </Link>
                    </Card>
                  );
                })}
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
            <Link to="/groups" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
              Ver Tudo
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          
          {/* Container com scroll horizontal e botões de navegação */}
          <div className="relative group">
            {/* Botão esquerdo */}
            <button
              onClick={() => scrollLeft(scrollRef3)}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 nav-button opacity-0 group-hover:opacity-100 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            
            {/* Botão direito */}
            <button
              onClick={() => scrollRight(scrollRef3)}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 nav-button opacity-0 group-hover:opacity-100 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
            
            {/* Scroll horizontal */}
            <div 
              ref={scrollRef3}
              className="overflow-x-auto pb-4 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="flex gap-4 min-w-max px-4">
                {dividedGroups.trending.map((group) => {
                  const availableSpots = group.max_members - group.current_members;
                  
                  return (
                    <Card key={group.id} className="bg-white rounded-xl border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer min-w-[200px]">
                      <Link to={`/group/${group.id}`}>
                        <CardContent className="p-6 text-center space-y-3">
                          {/* Avatar com inicial */}
                          <div className={`w-16 h-16 mx-auto ${getCategoryColor(group.service.category)} rounded-full flex items-center justify-center text-white text-xl font-bold`}>
                            {getServiceInitial(group.service.name)}
                          </div>
                          {/* Nome do serviço */}
                          <h3 className="font-semibold text-gray-900 text-sm">
                            {group.service.name}
                          </h3>
                          {/* Número de vagas */}
                          <p className="text-sm text-gray-600 font-medium">
                            {group.max_members} Vagas
                          </p>
                          {/* Preço */}
                          <p className="text-xl font-bold text-gray-900">
                            {formatPrice(group.price_per_slot_cents)}
                          </p>
                          {/* Status com design de selo */}
                          <div className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-xs text-gray-600 font-medium">
                            {getStatusText(availableSpots)}
                          </div>
                        </CardContent>
                      </Link>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;