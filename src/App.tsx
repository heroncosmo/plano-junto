import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import App from "./pages/App";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AllGroups from "./pages/AllGroups";
import GroupDetails from "./pages/GroupDetails";
import JoinGroup from "./pages/JoinGroup";
import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";
import LoyaltyGroup from "./pages/LoyaltyGroup";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import CreateGroup from "./pages/CreateGroup";
import AllServices from "./pages/AllServices";
import CreateGroupPlan from "./pages/CreateGroupPlan";
import CreateGroupInfo from "./pages/CreateGroupInfo";
import CreateGroupFidelity from "./pages/CreateGroupFidelity";
import CreateGroupConfirmation from "./pages/CreateGroupConfirmation";
import Creditos from "./pages/Creditos";
import AdicionarCreditos from "./pages/AdicionarCreditos";
import SacarCreditos from "./pages/SacarCreditos";
import DetalhesTransacao from "./pages/DetalhesTransacao";
import MyGroups from "./pages/MyGroups";
import Perfil from "./pages/Perfil";
import Ajuda from "./pages/Ajuda";
import TermosDeUso from "./pages/TermosDeUso";
import PoliticaDePrivacidade from "./pages/PoliticaDePrivacidade";
import Taxas from "./pages/Taxas";

const queryClient = new QueryClient();

// Component to handle scroll to top on route changes
const ScrollToTop = () => {
  useScrollToTop();
  return null;
};

const AppRouter = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              {/* Landing page para visitantes - redireciona usuários logados para /app */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Landing />
                </ProtectedRoute>
              } />
              
              {/* App para usuários logados */}
              <Route path="/app" element={<App />} />
              
              {/* Outras rotas */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/groups" element={<AllGroups />} />
              <Route path="/my-groups" element={<MyGroups />} />
              <Route path="/group/:id" element={<GroupDetails />} />
              <Route path="/join-group/:id" element={<JoinGroup />} />
              <Route path="/loyalty-group" element={<LoyaltyGroup />} />
              <Route path="/payment/:id" element={<Payment />} />
              <Route path="/payment/success/:id" element={<PaymentSuccess />} />
              
                                      {/* Create Group Flow */}
                      <Route path="/create-group" element={<CreateGroup />} />
                      <Route path="/create-group/all-services" element={<AllServices />} />
                      <Route path="/create-group/plan/:serviceId" element={<CreateGroupPlan />} />
                      <Route path="/create-group/info" element={<CreateGroupInfo />} />
                      <Route path="/create-group/fidelity" element={<CreateGroupFidelity />} />
                      <Route path="/create-group/confirmation" element={<CreateGroupConfirmation />} />
              
              {/* Créditos Routes */}
              <Route path="/creditos" element={<Creditos />} />
              <Route path="/creditos/adicionar" element={<AdicionarCreditos />} />
              <Route path="/creditos/sacar" element={<SacarCreditos />} />
              <Route path="/creditos/transacao/:id" element={<DetalhesTransacao />} />
              
              {/* Perfil e Ajuda */}
              <Route path="/perfil" element={<Perfil />} />
              <Route path="/ajuda" element={<Ajuda />} />
              
              {/* Legal */}
              <Route path="/termos-de-uso" element={<TermosDeUso />} />
              <Route path="/politica-de-privacidade" element={<PoliticaDePrivacidade />} />
              <Route path="/taxas" element={<Taxas />} />
              
              {/* Rota catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default AppRouter;
