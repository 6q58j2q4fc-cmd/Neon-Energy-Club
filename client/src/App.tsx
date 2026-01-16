import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AnimatePresence, motion } from "framer-motion";
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

// Scroll to top on route change
function ScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location]);
  
  return null;
}

// Page transition wrapper
const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 }
};

const pageTransition = {
  type: "tween" as const,
  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
  duration: 0.4
};

function AnimatedPage({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
}

function Router() {
  const [location] = useLocation();
  
  // make sure to consider if you need authentication for certain routes
  return (
    <>
    <ScrollToTop />
    <AnimatePresence mode="wait">
    <Switch key={location}>
      <Route path={"/"} component={Home} />
      <Route path={"/about"} component={About} />
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
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
    </AnimatePresence>
    </>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
