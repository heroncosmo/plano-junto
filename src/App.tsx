import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AllGroups from "./pages/AllGroups";
import GroupDetails from "./pages/GroupDetails";
import JoinGroup from "./pages/JoinGroup";
import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";
import LoyaltyGroup from "./pages/LoyaltyGroup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/groups" element={<Navigate to="/dashboard" replace />} />
            <Route path="/all-groups" element={<AllGroups />} />
            <Route path="/group/:id" element={<GroupDetails />} />
            <Route path="/join-group/:id" element={<JoinGroup />} />
            <Route path="/loyalty-group" element={<LoyaltyGroup />} />
            <Route path="/payment/:id" element={<Payment />} />
            <Route path="/payment/success/:id" element={<PaymentSuccess />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
