import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useEffect } from "react";
import Home from "./pages/Home";
import Franchise from "./pages/Franchise";
import Celebrities from "./pages/Celebrities";
import Success from "./pages/Success";
import Admin from "./pages/Admin";
import About from "./pages/About";
import Products from "./pages/Products";
import Crowdfund from "./pages/Crowdfund";
import FAQ from "./pages/FAQ";
import JoinNow from "./pages/JoinNow";
import DistributorDashboard from "./pages/DistributorDashboard";
import DistributorSite from "./pages/DistributorSite";
import Shop from "./pages/Shop";
import Compensation from "./pages/Compensation";
import DistributorPortal from "./pages/DistributorPortal";
import Blog from "./pages/Blog";
import VendingMachines from "./pages/VendingMachines";
import AdminTerritories from "./pages/AdminTerritories";
import AdminDashboard from "./pages/AdminDashboard";
import NFTGallery from "./pages/NFTGallery";
import NFTDetail from "./pages/NFTDetail";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Policies from "./pages/Policies";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import Leaderboard from "./pages/Leaderboard";
import Investors from "./pages/Investors";
import AmbientSoundToggle from "./components/AmbientSoundToggle";
import FloatingChatBot from "./components/FloatingChatBot";
import CartDrawer from "./components/CartDrawer";
import VoiceMuteButton from "./components/VoiceMuteButton";
import { LanguageProvider } from "./contexts/LanguageContext";

// Scroll to top on route change
function ScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location]);
  
  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/about"} component={About} />
        <Route path={"/story"} component={About} />
        <Route path={"/products"} component={Products} />
        <Route path={"/success"} component={Success} />
        <Route path={"/admin"} component={Admin} />
        <Route path={"/franchise"} component={Franchise} />
        <Route path={"/celebrities"} component={Celebrities} />
        <Route path={"/crowdfund"} component={Crowdfund} />
        <Route path={"/faq"} component={FAQ} />
        <Route path={"/join"} component={JoinNow} />
        <Route path={"/distributor/dashboard"} component={DistributorDashboard} />
        <Route path={"/d/:code"} component={DistributorSite} />
        <Route path={"/shop"} component={Shop} />
        <Route path={"/compensation"} component={Compensation} />
        <Route path={"/portal"} component={DistributorPortal} />
        <Route path={"/blog"} component={Blog} />
        <Route path={"/blog/:slug"} component={Blog} />
        <Route path={"/vending"} component={VendingMachines} />
        <Route path="/admin/dashboard" component={AdminDashboard} />
        <Route path="/admin/territories" component={AdminTerritories} />
        <Route path="/nft-gallery" component={NFTGallery} />
        <Route path="/nft/:tokenId" component={NFTDetail} />
        <Route path={"/nfts"} component={NFTGallery} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route path="/policies" component={Policies} />
        <Route path="/profile" component={Profile} />
        <Route path="/orders" component={Orders} />
        <Route path="/leaderboard" component={Leaderboard} />
        <Route path="/investors" component={Investors} />
        <Route path="/invest" component={Investors} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider defaultTheme="dark">
          <TooltipProvider>
            <Toaster />
            <Router />
            <CartDrawer />
            <VoiceMuteButton />
            <AmbientSoundToggle />
            <FloatingChatBot />
          </TooltipProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
