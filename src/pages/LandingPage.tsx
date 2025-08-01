import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import GroupsSection from "@/components/GroupsSection";

const LandingPage = () => {
  const { user, loading } = useAuth();

  // Se estiver carregando, não mostrar nada
  if (loading) {
    return null;
  }

  // Se estiver logado, redirecionar para dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Se não estiver logado, mostrar landing page
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <GroupsSection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;