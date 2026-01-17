import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { MobileLayout } from "./components/layout/MobileLayout";
import { ScrollToTop } from "./components/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Report from "./pages/Report";
import Safety from "./pages/Safety";
import Schemes from "./pages/Schemes";
import Payments from "./pages/Payments";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import EmergencyContacts from "./pages/EmergencyContacts";
import SafetyCheckin from "./pages/SafetyCheckin";
import SafeShelterLocator from "./pages/SafeShelterLocator";
import Library from "./pages/Library";
import LocalOffices from "./pages/LocalOffices";
import ProcessNavigator from "./pages/ProcessNavigator";
import AntiBribery from "./pages/AntiBribery";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />

                {/* Protected routes with layout */}
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <MobileLayout>
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/report" element={<Report />} />
                          <Route path="/safety" element={<Safety />} />
                          <Route
                            path="/safety/emergency-contacts"
                            element={<EmergencyContacts />}
                          />
                          <Route
                            path="/safety/check-in"
                            element={<SafetyCheckin />}
                          />
                          <Route
                            path="/safety/shelter-locator"
                            element={<SafeShelterLocator />}
                          />
                          <Route path="/schemes" element={<Schemes />} />
                          <Route path="/payments" element={<Payments />} />
                          <Route path="/profile" element={<Profile />} />
                          <Route path="/library" element={<Library />} />
                          <Route
                            path="/local-offices"
                            element={<LocalOffices />}
                          />
                          <Route
                            path="/process-navigator"
                            element={<ProcessNavigator />}
                          />
                          <Route
                            path="/anti-bribery"
                            element={<AntiBribery />}
                          />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </MobileLayout>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
