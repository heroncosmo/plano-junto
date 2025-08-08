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
import PaymentPending from "./pages/PaymentPending";
import LoyaltyGroup from "./pages/LoyaltyGroup";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import RequireAuth from "./components/RequireAuth";
import CreateGroup from "./pages/CreateGroup";
import AllServices from "./pages/AllServices";
import CreateGroupPlan from "./pages/CreateGroupPlan";
import CreateGroupInfo from "./pages/CreateGroupInfo";
import CreateGroupFidelity from "./pages/CreateGroupFidelity";
import CreateGroupConfirmation from "./pages/CreateGroupConfirmation";
import ManageGroup from "./pages/ManageGroup";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminClients from "./pages/admin/AdminClients";
import AdminTransactions from "./pages/admin/AdminTransactions";
import AdminGroups from "./pages/admin/AdminGroups";
import AdminWithdrawals from "./pages/admin/AdminWithdrawals";
import AdminComplaints from "./pages/admin/AdminComplaints";
import Creditos from "./pages/Creditos";
import AdicionarCreditos from "./pages/AdicionarCreditos";
import SacarCreditos from "./pages/SacarCreditos";
import DetalhesTransacao from "./pages/DetalhesTransacao";
import Faturas from "./pages/Faturas";
import MyGroups from "./pages/MyGroups";
import Perfil from "./pages/Perfil";
import Ajuda from "./pages/Ajuda";
import TermosDeUso from "./pages/TermosDeUso";
import PoliticaDePrivacidade from "./pages/PoliticaDePrivacidade";
import Taxas from "./pages/Taxas";
import ChangeGroupValue from "./pages/ChangeGroupValue";
import Notificacoes from "./pages/Notificacoes";
import ReclamacaoInicial from "./pages/ReclamacaoInicial";
import ReclamacaoFAQ from "./pages/ReclamacaoFAQ";
import ReclamacaoDadosGrupo from "./pages/ReclamacaoDadosGrupo";
import ReclamacaoOqueAconteceu from "./pages/ReclamacaoOqueAconteceu";
import ReclamacaoSolucaoDesejada from "./pages/ReclamacaoSolucaoDesejada";
import ReclamacaoHistorico from "./pages/ReclamacaoHistorico";
import ReclamacaoStatus from "./pages/ReclamacaoStatus";
import VerReclamacao from "./pages/VerReclamacao";
import Reclamacoes from "./pages/Reclamacoes";
import AdminReclamacoes from "./pages/AdminReclamacoes";
import ReclamacoesUnificadas from "./pages/ReclamacoesUnificadas";
import CancelamentoInicial from "./pages/CancelamentoInicial";
import CancelamentoReclamacao from "./pages/CancelamentoReclamacao";
import CancelamentoMotivo from "./pages/CancelamentoMotivo";
import CancelamentoConfirmacao from "./pages/CancelamentoConfirmacao";
import CancelamentoSucesso from "./pages/CancelamentoSucesso";
import LogoPrint from "./pages/LogoPrint";

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
              <Route path="/app" element={
                <RequireAuth>
                  <App />
                </RequireAuth>
              } />
              
              {/* Outras rotas */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/groups" element={<AllGroups />} />
              <Route path="/my-groups" element={
                <RequireAuth>
                  <MyGroups />
                </RequireAuth>
              } />
              <Route path="/group/:id" element={<GroupDetails />} />
              <Route path="/group/:id/change-value" element={
                <RequireAuth>
                  <ChangeGroupValue />
                </RequireAuth>
              } />
              <Route path="/grupo/:id/gerenciar" element={
                <RequireAuth>
                  <ManageGroup />
                </RequireAuth>
              } />
              {/* Admin Routes */}
              <Route path="/admin" element={
                <RequireAuth>
                  <AdminLayout />
                </RequireAuth>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="clients" element={<AdminClients />} />
                <Route path="transactions" element={<AdminTransactions />} />
                <Route path="groups" element={<AdminGroups />} />
                <Route path="withdrawals" element={<AdminWithdrawals />} />
                <Route path="complaints" element={<AdminComplaints />} />
              </Route>
              <Route path="/join-group/:id" element={
                <RequireAuth>
                  <JoinGroup />
                </RequireAuth>
              } />
              <Route path="/loyalty-group" element={
                <RequireAuth>
                  <LoyaltyGroup />
                </RequireAuth>
              } />
              <Route path="/payment/:id" element={
                <RequireAuth>
                  <Payment />
                </RequireAuth>
              } />
              <Route path="/payment/success/:id" element={
                <RequireAuth>
                  <PaymentSuccess />
                </RequireAuth>
              } />
              <Route path="/payment/pending/:paymentId" element={
                <RequireAuth>
                  <PaymentPending />
                </RequireAuth>
              } />
              
                                      {/* Create Group Flow */}
                      <Route path="/create-group" element={
                        <RequireAuth>
                          <CreateGroup />
                        </RequireAuth>
                      } />
                      <Route path="/create-group/all-services" element={
                        <RequireAuth>
                          <AllServices />
                        </RequireAuth>
                      } />
                      <Route path="/create-group/plan/:serviceId" element={
                        <RequireAuth>
                          <CreateGroupPlan />
                        </RequireAuth>
                      } />
                      <Route path="/create-group/info" element={
                        <RequireAuth>
                          <CreateGroupInfo />
                        </RequireAuth>
                      } />
                      <Route path="/create-group/fidelity" element={
                        <RequireAuth>
                          <CreateGroupFidelity />
                        </RequireAuth>
                      } />
                      <Route path="/create-group/confirmation" element={
                        <RequireAuth>
                          <CreateGroupConfirmation />
                        </RequireAuth>
                      } />
              
              {/* Créditos Routes */}
              <Route path="/creditos" element={
                <RequireAuth>
                  <Creditos />
                </RequireAuth>
              } />
              <Route path="/creditos/adicionar" element={
                <RequireAuth>
                  <AdicionarCreditos />
                </RequireAuth>
              } />
              <Route path="/creditos/sacar" element={
                <RequireAuth>
                  <SacarCreditos />
                </RequireAuth>
              } />
              <Route path="/creditos/transacao/:id" element={
                <RequireAuth>
                  <DetalhesTransacao />
                </RequireAuth>
              } />
              <Route path="/faturas" element={
                <RequireAuth>
                  <Faturas />
                </RequireAuth>
              } />
              
              {/* Perfil e Ajuda */}
              <Route path="/perfil" element={
                <RequireAuth>
                  <Perfil />
                </RequireAuth>
              } />
              <Route path="/notificacoes" element={
                <RequireAuth>
                  <Notificacoes />
                </RequireAuth>
              } />
              
              {/* Sistema de Reclamações */}
              <Route path="/reclamacao/inicial" element={
                <RequireAuth>
                  <ReclamacaoInicial />
                </RequireAuth>
              } />
              <Route path="/reclamacao/perguntas-frequentes" element={
                <RequireAuth>
                  <ReclamacaoFAQ />
                </RequireAuth>
              } />
              <Route path="/reclamacao/dados-grupo" element={
                <RequireAuth>
                  <ReclamacaoDadosGrupo />
                </RequireAuth>
              } />
              <Route path="/reclamacao/oque-aconteceu" element={
                <RequireAuth>
                  <ReclamacaoOqueAconteceu />
                </RequireAuth>
              } />
              <Route path="/reclamacao/solucao-desejada" element={
                <RequireAuth>
                  <ReclamacaoSolucaoDesejada />
                </RequireAuth>
              } />
              <Route path="/reclamacao/historico" element={
                <RequireAuth>
                  <ReclamacaoHistorico />
                </RequireAuth>
              } />
              <Route path="/reclamacao/status" element={
                <RequireAuth>
                  <ReclamacaoStatus />
                </RequireAuth>
              } />
              <Route path="/ver-reclamacao/:complaintId" element={
                <RequireAuth>
                  <VerReclamacao />
                </RequireAuth>
              } />
              <Route path="/reclamacoes" element={
                <RequireAuth>
                  <ReclamacoesUnificadas />
                </RequireAuth>
              } />
              <Route path="/admin-reclamacoes" element={
                <RequireAuth>
                  <AdminReclamacoes />
                </RequireAuth>
              } />
              
              {/* Sistema de Cancelamento */}
              <Route path="/grupo/membro/:memberId/cancelamento/informacoes" element={
                <RequireAuth>
                  <CancelamentoInicial />
                </RequireAuth>
              } />
              <Route path="/grupo/membro/:memberId/cancelamento/reclamacao" element={
                <RequireAuth>
                  <CancelamentoReclamacao />
                </RequireAuth>
              } />
              <Route path="/grupo/membro/:memberId/cancelamento/motivo" element={
                <RequireAuth>
                  <CancelamentoMotivo />
                </RequireAuth>
              } />
              <Route path="/grupo/membro/:memberId/cancelamento/confirmacao" element={
                <RequireAuth>
                  <CancelamentoConfirmacao />
                </RequireAuth>
              } />
              <Route path="/grupo/membro/:memberId/cancelamento/sucesso" element={
                <RequireAuth>
                  <CancelamentoSucesso />
                </RequireAuth>
              } />
              
              <Route path="/ajuda" element={<Ajuda />} />
              
              {/* Legal */}
              <Route path="/termos-de-uso" element={<TermosDeUso />} />
              <Route path="/politica-de-privacidade" element={<PoliticaDePrivacidade />} />
              <Route path="/taxas" element={<Taxas />} />
              
              {/* Logo Print - Página para capturar a logo */}
              <Route path="/logo-print" element={<LogoPrint />} />
              
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
