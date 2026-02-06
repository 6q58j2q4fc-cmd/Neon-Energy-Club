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
import TaxInformation from "./pages/distributor/TaxInformation";
import DistributorData from "./pages/admin/DistributorData";
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
import VerifyEmail from "./pages/VerifyEmail";
import GiveBack from "./pages/GiveBack";
import OrderHistory from "./pages/OrderHistory";
import GenealogyTutorial from "./pages/GenealogyTutorial";
import CharityImpact from "@/pages/CharityImpact";
import ImpactAnalytics from "@/pages/ImpactAnalytics";
import ImpactLeaderboard from "./pages/ImpactLeaderboard";
import VendingDashboard from "./pages/VendingDashboard";
import MfaSettings from "./pages/MfaSettings";
import PoliciesAndProcedures from "./pages/PoliciesAndProcedures";
import TermsAndConditions from "./pages/TermsAndConditions";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import MfaVerify from "./pages/MfaVerify";
import MfaRecovery from "./pages/MfaRecovery";
import NotificationPreferences from "./pages/NotificationPreferences";
import NftDisclosure from "./pages/NftDisclosure";
import OrderTracking from "./pages/OrderTracking";
import AdminOrders from "./pages/AdminOrders";
import MyOrders from "./pages/MyOrders";
import AdminShippingSettings from "./pages/AdminShippingSettings";
import NeonOriginal from "./pages/NeonOriginal";
import NeonPink from "./pages/NeonPink";
import ApplicationForms from "./pages/ApplicationForms";
import Search from "./pages/Search";
import PackageSelection from "./pages/PackageSelection";
import MarketingAssets from "./pages/MarketingAssets";
import AmbientSoundToggle from "./components/AmbientSoundToggle";
import UnifiedChatBot from "./components/UnifiedChatBot";
import CookieConsent from "./components/CookieConsent";
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
        <Route path="/product" component={Product} />
        <Route path="/neon-original" component={NeonOriginal} />
        <Route path="/neon-pink" component={NeonPink} />
        <Route path="/application-forms" component={ApplicationForms} />
        <Route path="/search" component={Search} />
        <Route path="/success" component={Success} />
        {/* Authentication routes */}
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/forgot-password" component={ForgotPassword} />
        {/* OLD Admin route removed - using AdminPanel instead */}
        <Route path={"/franchise"} component={Franchise} />
        <Route path={"/celebrities"} component={Celebrities} />
        <Route path={"/crowdfund"} component={Crowdfund} />
        <Route path={"/faq"} component={FAQ} />
          <Route path="/join" component={JoinNow} />
        <Route path="/package-selection" component={PackageSelection} />
        <Route path="/marketing-assets" component={MarketingAssets} />
        <Route path={"/distributor/dashboard"} component={DistributorDashboard} />
        <Route path={"/distributor/tax-information"} component={TaxInformation} />
        <Route path={"/admin/distributor-data"} component={DistributorData} />
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
        <Route path="/admin/orders" component={AdminOrders} />
        <Route path="/admin/shipping" component={AdminShippingSettings} />
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
        <Route path="/nft-disclosure" component={NftDisclosure} />
        <Route path="/track-order" component={OrderTracking} />
        <Route path="/my-orders" component={MyOrders} />
        <Route path="/policies" component={Policies} />
        <Route path="/policies-and-procedures" component={PoliciesAndProcedures} />
        <Route path="/terms-and-conditions" component={TermsAndConditions} />
        <Route path="/profile" component={Profile} />
          <Route path="/pre-order" component={PreOrder} />
          <Route path="/admin" component={AdminPanel} />
          <Route path="/preferences" component={EmailPreferences} />
        <Route path="/leaderboard" component={Leaderboard} />
        <Route path="/distributor-leaderboard" component={DistributorLeaderboard} />
        <Route path="/investors" component={Investors} />
        <Route path="/invest" component={Investors} />
        <Route path="/verify-email" component={VerifyEmail} />
        <Route path="/give-back" component={GiveBack} />
        <Route path="/customer-portal" component={CustomerPortal} />
        <Route path="/order-history" component={OrderHistory} />
        <Route path="/genealogy-tutorial" component={GenealogyTutorial} />
          <Route path="/charity-impact" component={CharityImpact} />
          <Route path="/impact-analytics" component={ImpactAnalytics} />
          <Route path="/impact-leaderboard" component={ImpactLeaderboard} />
        <Route path="/impact" component={CharityImpact} />
        <Route path="/vending-dashboard" component={VendingDashboard} />
        <Route path="/mfa-settings" component={MfaSettings} />
        <Route path="/security" component={MfaSettings} />
        <Route path="/mfa-verify" component={MfaVerify} />
        <Route path="/mfa-recovery" component={MfaRecovery} />
        <Route path="/notification-preferences" component={NotificationPreferences} />
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
            <AmbientSoundToggle />
            <UnifiedChatBot />
            <CookieConsent />
          </TooltipProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
