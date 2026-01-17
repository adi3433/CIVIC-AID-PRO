import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { MobileLayout } from "./components/layout/MobileLayout";
import { ScrollToTop } from "./components/ScrollToTop";
import Home from "./pages/Home";
import Report from "./pages/Report";
import Safety from "./pages/Safety";
import Schemes from "./pages/Schemes";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import EmergencyContacts from "./pages/EmergencyContacts";
import SafetyCheckin from "./pages/SafetyCheckin";
import SafeShelterLocator from "./pages/SafeShelterLocator";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <MobileLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/report" element={<Report />} />
              <Route path="/safety" element={<Safety />} />
              <Route
                path="/safety/emergency-contacts"
                element={<EmergencyContacts />}
              />
              <Route path="/safety/check-in" element={<SafetyCheckin />} />
              <Route
                path="/safety/shelter-locator"
                element={<SafeShelterLocator />}
              />
              <Route path="/schemes" element={<Schemes />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MobileLayout>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
