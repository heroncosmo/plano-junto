import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
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
import CreateGroupPlan from "./pages/CreateGroupPlan";
import CreateGroupInfo from "./pages/CreateGroupInfo";
import CreateGroupFidelity from "./pages/CreateGroupFidelity";
import CreateGroupConfirmation from "./pages/CreateGroupConfirmation";

const queryClient = new QueryClient();

const AppRouter = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
            <Route path="/group/:id" element={<GroupDetails />} />
            <Route path="/join-group/:id" element={<JoinGroup />} />
            <Route path="/loyalty-group" element={<LoyaltyGroup />} />
            <Route path="/payment/:id" element={<Payment />} />
            <Route path="/payment/success/:id" element={<PaymentSuccess />} />
            
            {/* Create Group Flow */}
            <Route path="/create-group" element={<CreateGroup />} />
            <Route path="/create-group/plan/:serviceId" element={<CreateGroupPlan />} />
            <Route path="/create-group/info" element={<CreateGroupInfo />} />
            <Route path="/create-group/fidelity" element={<CreateGroupFidelity />} />
            <Route path="/create-group/confirmation" element={<CreateGroupConfirmation />} />
            
            {/* Rota catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default AppRouter;
