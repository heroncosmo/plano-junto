import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Menu, X, LogOut, Settings, Search } from "lucide-react";
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

const Header = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getUserInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

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
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">J</span>
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
            <Link to="/groups" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
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
                <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600 text-white font-medium px-4 py-2 rounded-lg">
                  + Criar Grupo
                </Button>
                <div className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                  1
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
                    <DropdownMenuItem onClick={() => navigate("/app")}>
                      <User className="mr-2 h-4 w-4" />
                      App
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                      <Settings className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
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
              <Link
                to="/groups"
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
                    to="/app"
                    className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    App
                  </Link>
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
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