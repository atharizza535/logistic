import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import MerchantSimulator from "./pages/MerchantSimulator";
import PartnerTracker from "./pages/PartnerTracker";
import NotFound from "./pages/NotFound";
import OperationsSimulator from "./pages/OperationsSimulator";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner 
        theme="dark" 
        position="top-right"
        toastOptions={{
          style: {
            background: 'hsl(222 47% 8%)',
            border: '1px solid hsl(217 33% 17%)',
            color: 'hsl(210 40% 98%)',
          },
        }}
      />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/merchant" element={<MerchantSimulator />} />
            <Route path="/tracker" element={<PartnerTracker />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/operations" element={<OperationsSimulator />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
