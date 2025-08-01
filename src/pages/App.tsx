import { useState, useEffect, useRef } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, Star, Gift, TrendingUp, Sparkles, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useGroups, formatPrice, formatCategory } from "@/hooks/useGroups";

const UserDashboard = () => {
  const { groups, loading, error } = useGroups();

  // Dividir grupos em categorias para exibição
  const featuredGroups = groups.slice(0, 4);
  const trendingGroups = groups.slice(4, 8);
  const discoveryGroups = groups.slice(8, 12);

  const getGroupImage = (category: string) => {
    const imageMap: Record<string, string> = {
      'ai_tools': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400',
      'streaming': 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=400',
      'gaming': 'https://images.unsplash.com/photo-1606318664588-f04fcec5f817?w=400',
      'design': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
      'education': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400',
      'productivity': 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=400'
    };
    return imageMap[category] || 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400';
  };

  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, string> = {
      'ai_tools': 'bg-purple-500',
      'streaming': 'bg-red-500',
      'gaming': 'bg-green-500',
      'design': 'bg-pink-500',
      'education': 'bg-blue-500',
      'productivity': 'bg-orange-500'
    };
    return colorMap[category] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Carregando grupos...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-red-600">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Tentar novamente
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-8 py-8 space-y-12">
        {/* Hero Banner - Estilo Kotas */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <h1 className="text-3xl font-bold">
                  Quer economizar até
                  <span className="block text-4xl text-yellow-300">80% em assinaturas?</span>
                </h1>
                <p className="text-lg opacity-90">
                  Junte-se a milhares de pessoas economizando juntas!
                </p>
                <Button size="default" className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg">
                  <Gift className="mr-2 h-4 w-4" />
                  Começar a economizar
                </Button>
              </div>
              <div className="hidden md:block">
                <div className="text-5xl">🍀</div>
              </div>
            </div>
          </div>
        </div>

        {/* Selecionados para você */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Selecionados para você</h2>
            <Button variant="ghost" asChild>
              <Link to="/groups">Ver Tudo</Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredGroups.map((group) => {
              const availableSpots = group.max_members - group.current_members;
              const getServiceInitial = (name: string) => name.charAt(0).toUpperCase();
              const groupCode = `#${group.id.slice(-6).toUpperCase()}`;
              
              return (
                <Card key={group.id} className="bg-white rounded-xl border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
                  <Link to={`/group/${group.id}`}>
                    <CardContent className="p-6 text-center space-y-3">
                      {/* Avatar com inicial */}
                      <div className="w-16 h-16 mx-auto bg-emerald-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                        {getServiceInitial(group.service.name)}
                      </div>
                      
                      {/* Nome do serviço */}
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {group.service.name}
                      </h3>
                      
                      {/* Código do grupo */}
                      <p className="text-xs text-gray-400">{groupCode}</p>
                      
                      {/* Número de vagas */}
                      <p className="text-sm text-gray-600 font-medium">
                        {group.max_members} Vagas
                      </p>
                      
                      {/* Preço */}
                      <p className="text-xl font-bold text-gray-900">
                        {formatPrice(group.price_per_slot_cents)}
                      </p>
                      
                      {/* Status */}
                      <p className="text-xs text-gray-500">
                        {availableSpots > 0 ? 'Aguardando membros' : 'Grupo completo'}
                      </p>
                    </CardContent>
                  </Link>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Os grupos estão bombando */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-bold text-gray-900">Os grupos estão bombando</h2>
              <TrendingUp className="h-6 w-6 text-orange-500" />
              <Sparkles className="h-6 w-6 text-yellow-500" />
            </div>
            <Button variant="ghost" asChild>
              <Link to="/groups">Ver Tudo</Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trendingGroups.map((group) => {
              const availableSpots = group.max_members - group.current_members;
              const getServiceInitial = (name: string) => name.charAt(0).toUpperCase();
              const groupCode = `#${group.id.slice(-6).toUpperCase()}`;
              
              return (
                <Card key={group.id} className="bg-white rounded-xl border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
                  <Link to={`/group/${group.id}`}>
                    <CardContent className="p-6 text-center space-y-3">
                      {/* Avatar com inicial */}
                      <div className="w-16 h-16 mx-auto bg-emerald-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                        {getServiceInitial(group.service.name)}
                      </div>
                      
                      {/* Nome do serviço */}
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {group.service.name}
                      </h3>
                      
                      {/* Código do grupo */}
                      <p className="text-xs text-gray-400">{groupCode}</p>
                      
                      {/* Número de vagas */}
                      <p className="text-sm text-gray-600 font-medium">
                        {group.max_members} Vagas
                      </p>
                      
                      {/* Preço */}
                      <p className="text-xl font-bold text-gray-900">
                        {formatPrice(group.price_per_slot_cents)}
                      </p>
                      
                      {/* Status */}
                      <p className="text-xs text-gray-500">
                        {availableSpots > 0 ? 'Aguardando membros' : 'Grupo completo'}
                      </p>
                    </CardContent>
                  </Link>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Descubra o que estão compartilhando */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Descubra o que estão compartilhando</h2>
            <Button variant="ghost" asChild>
              <Link to="/groups">Ver Tudo</Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {discoveryGroups.map((group) => {
              const availableSpots = group.max_members - group.current_members;
              const getServiceInitial = (name: string) => name.charAt(0).toUpperCase();
              const groupCode = `#${group.id.slice(-6).toUpperCase()}`;
              
              return (
                <Card key={group.id} className="bg-white rounded-xl border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
                  <Link to={`/group/${group.id}`}>
                    <CardContent className="p-6 text-center space-y-3">
                      {/* Avatar com inicial */}
                      <div className="w-16 h-16 mx-auto bg-emerald-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                        {getServiceInitial(group.service.name)}
                      </div>
                      
                      {/* Nome do serviço */}
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {group.service.name}
                      </h3>
                      
                      {/* Código do grupo */}
                      <p className="text-xs text-gray-400">{groupCode}</p>
                      
                      {/* Número de vagas */}
                      <p className="text-sm text-gray-600 font-medium">
                        {group.max_members} Vagas
                      </p>
                      
                      {/* Preço */}
                      <p className="text-xl font-bold text-gray-900">
                        {formatPrice(group.price_per_slot_cents)}
                      </p>
                      
                      {/* Status */}
                      <p className="text-xs text-gray-500">
                        {availableSpots > 0 ? 'Aguardando membros' : 'Grupo completo'}
                      </p>
                    </CardContent>
                  </Link>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Call to Action Bottom */}
        <section className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-8 text-white text-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Todo mundo ganha</h2>
            <p className="text-lg opacity-90">
              Cada pessoa que você indicar recebe desconto na primeira inscrição e você ganha 
              créditos para usar em qualquer grupo. É o verdadeiro win-win!
            </p>
            <div className="flex justify-center space-x-4">
              <Button size="lg" variant="secondary">
                Indicar amigos
              </Button>
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <div className="text-6xl">🎉</div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default UserDashboard;