
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Conversation from "./pages/Conversation";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import Holmes from "./pages/Holmes";
import Mark from "./pages/Mark";
import Assistant from "./pages/Assistant";
import ResearchAgent from "./pages/ResearchAgent";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/conversation" element={<Conversation />} />
          <Route path="/holmes" element={<Holmes />} />
          <Route path="/mark" element={<Mark />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/research-agent" element={<ResearchAgent />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
