import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Menu, X, LogOut, Settings, Search, CreditCard, FileText, HelpCircle, Shield, Bell, AlertTriangle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import NotificationPanel from "@/components/NotificationPanel";
import { useNotifications } from "@/hooks/useNotifications";

const Header = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const { stats } = useNotifications();

  const handleSignOut = async () => {
    console.log('🔍 DEBUG - Header: Iniciando handleSignOut...');
    try {
      await signOut();
      console.log('🔍 DEBUG - Header: signOut concluído, redirecionando...');
      navigate("/");
      console.log('🔍 DEBUG - Header: Redirecionamento concluído');
    } catch (error) {
      console.error('❌ ERRO no handleSignOut:', error);
    }
  };

  const getUserInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  // Verificar se é admin
  const isAdmin = user?.email === 'calcadosdrielle@gmail.com';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/groups?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/groups');
    }
  };

  // Redirecionar usuários logados para o app
  const handleLogoClick = () => {
    if (user) {
      navigate("/app");
    } else {
      navigate("/");
    }
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-8">
        <div className="flex h-16 items-center gap-6">
          {/* Logo */}
          <button onClick={handleLogoClick} className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">J</span>
            </div>
            <span className="text-xl font-bold">JuntaPlay</span>
          </button>

          {/* Search Bar - Centro */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-auto hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Descubra o que estão compartilhando"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-muted/50 border-0 focus:bg-background"
              />
            </div>
          </form>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-4">
                         <Link to="/my-groups" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
               Meus Grupos
             </Link>
            <Link to="/creditos" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              Meus Créditos
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-3 flex-shrink-0">
            {user ? (
              <>
                <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600 text-white font-medium px-4 py-2 rounded-lg" asChild>
                  <Link to="/create-group">+ Criar Grupo</Link>
                </Button>
                
                {/* Notification Bell */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative p-2"
                    onClick={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)}
                  >
                    <Bell className="h-5 w-5 text-gray-600" />
                    {stats.unread_count > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                        {stats.unread_count > 9 ? '9+' : stats.unread_count}
                      </div>
                    )}
                  </Button>
                  
                  {/* Notification Panel */}
                  <NotificationPanel 
                    isOpen={isNotificationPanelOpen}
                    onClose={() => setIsNotificationPanelOpen(false)}
                  />
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {getUserInitials(user.email || '')}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                                     <DropdownMenuContent className="w-56" align="end" forceMount>
                     <DropdownMenuItem onClick={() => navigate("/perfil")}>
                       <User className="mr-2 h-4 w-4" />
                       Perfil
                     </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => navigate("/creditos")}>
                       <CreditCard className="mr-2 h-4 w-4" />
                       Créditos
                     </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => navigate("/reclamacoes")}>
                       <AlertTriangle className="mr-2 h-4 w-4" />
                       Reclamações
                     </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => navigate("/creditos")}>
                       <FileText className="mr-2 h-4 w-4" />
                       Faturas
                     </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => navigate("/groups")}>
                       <Search className="mr-2 h-4 w-4" />
                       Pesquisar
                     </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => navigate("/ajuda")}>
                       <HelpCircle className="mr-2 h-4 w-4" />
                       Ajuda
                     </DropdownMenuItem>
                     {isAdmin && (
                       <>
                         <DropdownMenuSeparator />
                         <DropdownMenuItem onClick={() => navigate("/admin")}>
                           <Shield className="mr-2 h-4 w-4" />
                           Painel Admin
                         </DropdownMenuItem>
                       </>
                     )}
                     <DropdownMenuSeparator />
                     <DropdownMenuItem onClick={handleSignOut}>
                       <LogOut className="mr-2 h-4 w-4" />
                       Sair
                     </DropdownMenuItem>
                   </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/auth">Entrar</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/auth">Cadastrar gratuitamente</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

                  {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <nav className="space-y-2">
                {/* Notification Bell for Mobile */}
                {user && (
                  <button
                    onClick={() => {
                      setIsNotificationPanelOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Notificações
                    {stats.unread_count > 0 && (
                      <div className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                        {stats.unread_count > 9 ? '9+' : stats.unread_count}
                      </div>
                    )}
                  </button>
                )}
                
                <Link
                  to="/my-groups"
                  className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Meus Grupos
                </Link>
              <Link
                to="/creditos"
                className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                Meus Créditos
              </Link>
                             {user ? (
                 <>
                   <Link
                     to="/perfil"
                     className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                     onClick={() => setIsMenuOpen(false)}
                   >
                     Perfil
                   </Link>
                   <Link
                     to="/creditos"
                     className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                     onClick={() => setIsMenuOpen(false)}
                   >
                     Créditos
                   </Link>
                   <Link
                     to="/creditos"
                     className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                     onClick={() => setIsMenuOpen(false)}
                   >
                     Faturas
                   </Link>
                   <Link
                     to="/groups"
                     className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                     onClick={() => setIsMenuOpen(false)}
                   >
                     Pesquisar
                   </Link>
                   <Link
                     to="/ajuda"
                     className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                     onClick={() => setIsMenuOpen(false)}
                   >
                     Ajuda
                   </Link>
                   <button
                     onClick={() => {
                       handleSignOut();
                       setIsMenuOpen(false);
                     }}
                     className="block w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                   >
                     Sair
                   </button>
                 </>
               ) : (
                <>
                  <Link
                    to="/auth"
                    className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Entrar
                  </Link>
                  <Link
                    to="/auth"
                    className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Cadastrar gratuitamente
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;