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
import Product from "./pages/Product";
import Crowdfund from "./pages/Crowdfund";
import FAQ from "./pages/FAQ";
import JoinNow from "./pages/JoinNow";
import DistributorDashboard from "./pages/DistributorDashboard";
import DistributorSite from "./pages/DistributorSite";
import Shop from "./pages/Shop";
import Checkout from "./pages/Checkout";
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
import PreOrder from "./pages/PreOrder";
import AdminPanel from "./pages/AdminPanel";
import EmailPreferences from "./pages/EmailPreferences";
import Leaderboard from "./pages/Leaderboard";
import DistributorLeaderboard from "./pages/DistributorLeaderboard";
import Investors from "./pages/Investors";
import CustomerPortal from "./pages/CustomerPortal";
import MLMAdminPanel from "./pages/MLMAdminPanel";
import FranchiseDashboard from "./pages/FranchiseDashboard";
import PersonalizedLanding from "./pages/PersonalizedLanding";
import AmbientSoundToggle from "./components/AmbientSoundToggle";
import UnifiedChatBot from "./components/UnifiedChatBot";
import CartDrawer from "./components/CartDrawer";
import VoiceMuteButton from "./components/VoiceMuteButton";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AvatarJungleAtmosphere } from "./components/BioluminescentParticles";

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
        <Route path={"/product"} component={Product} />
        <Route path={"/success"} component={Success} />
        {/* OLD Admin route removed - using AdminPanel instead */}
        <Route path={"/franchise"} component={Franchise} />
        <Route path={"/celebrities"} component={Celebrities} />
        <Route path={"/crowdfund"} component={Crowdfund} />
        <Route path={"/faq"} component={FAQ} />
        <Route path={"/join"} component={JoinNow} />
        <Route path={"/distributor/dashboard"} component={DistributorDashboard} />
        <Route path={"/d/:code"} component={DistributorSite} />
        <Route path={"/r/:slug"} component={PersonalizedLanding} />
        <Route path={"/shop"} component={Shop} />
        <Route path={"/checkout"} component={Checkout} />
        <Route path={"/compensation"} component={Compensation} />
        <Route path={"/portal"} component={DistributorPortal} />
        <Route path={"/blog"} component={Blog} />
        <Route path={"/blog/:slug"} component={Blog} />
        <Route path={"/vending"} component={VendingMachines} />
        <Route path="/admin/dashboard" component={AdminDashboard} />
        <Route path="/admin/mlm" component={MLMAdminPanel} />
        <Route path="/admin/territories" component={AdminTerritories} />
        <Route path="/admin/users" component={AdminPanel} />
        <Route path="/admin/distributors" component={AdminPanel} />
        <Route path="/admin/orders" component={AdminPanel} />
        <Route path="/admin/commissions" component={AdminPanel} />
        <Route path="/admin/settings" component={AdminPanel} />
        <Route path="/franchise/territories" component={FranchiseDashboard} />
        <Route path="/franchise/vending" component={FranchiseDashboard} />
        <Route path="/franchise/earnings" component={FranchiseDashboard} />
        <Route path="/franchise/applications" component={FranchiseDashboard} />
        <Route path="/orders" component={CustomerPortal} />
        <Route path="/nft-gallery" component={NFTGallery} />
        <Route path="/nft" component={NFTGallery} />
        <Route path="/nft/:tokenId" component={NFTDetail} />
        <Route path={"/nfts"} component={NFTGallery} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route path="/policies" component={Policies} />
        <Route path="/profile" component={Profile} />
          <Route path="/pre-order" component={PreOrder} />
          <Route path="/admin" component={AdminPanel} />
          <Route path="/preferences" component={EmailPreferences} />
        <Route path="/leaderboard" component={Leaderboard} />
        <Route path="/distributor-leaderboard" component={DistributorLeaderboard} />
        <Route path="/investors" component={Investors} />
        <Route path="/invest" component={Investors} />
        <Route path="/customer-portal" component={CustomerPortal} />
        <Route path="/my-rewards" component={CustomerPortal} />
        <Route path="/franchise/dashboard" component={FranchiseDashboard} />
        <Route path="/distributor" component={DistributorPortal} />
        <Route path="/distributor-portal" component={DistributorPortal} />
        <Route path="/404" component={NotFound} />
        {/* Catch-all route for personalized landing pages (neonenergyclub.com/uniquereferralid) */}
        <Route path="/:slug" component={PersonalizedLanding} />
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
            <AvatarJungleAtmosphere intensity="low" />
            <Router />
            <CartDrawer />
            <VoiceMuteButton />
            <AmbientSoundToggle />
            <UnifiedChatBot />
          </TooltipProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
