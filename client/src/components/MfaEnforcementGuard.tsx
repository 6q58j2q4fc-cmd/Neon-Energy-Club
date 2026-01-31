import { useEffect, useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Loader2 } from 'lucide-react';

interface MfaEnforcementGuardProps {
  children: React.ReactNode;
  requiredFor?: ('distributor' | 'vending_owner')[];
}

/**
 * MFA Enforcement Guard
 * Wraps protected pages that require MFA for distributors and vending machine owners.
 * If MFA is required but not set up, redirects to MFA settings page.
 */
export function MfaEnforcementGuard({ 
  children, 
  requiredFor = ['distributor', 'vending_owner'] 
}: MfaEnforcementGuardProps) {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [showWarning, setShowWarning] = useState(false);
  
  const { data: mfaStatus, isLoading: mfaLoading } = trpc.auth.checkMfaRequired.useQuery(
    undefined,
    { enabled: !!user }
  );

  useEffect(() => {
    if (!authLoading && !mfaLoading && mfaStatus) {
      // Check if this user's role requires MFA
      const roleRequiresMfa = mfaStatus.requiresMfa && 
        requiredFor.includes(mfaStatus.role as 'distributor' | 'vending_owner');
      
      if (roleRequiresMfa && mfaStatus.needsSetup) {
        setShowWarning(true);
      } else {
        setShowWarning(false);
      }
    }
  }, [authLoading, mfaLoading, mfaStatus, requiredFor]);

  // Show loading while checking
  if (authLoading || mfaLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#c8ff00] animate-spin mx-auto mb-4" />
          <p className="text-white/60">Verifying security status...</p>
        </div>
      </div>
    );
  }

  // Show MFA setup required warning
  if (showWarning) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
        <Card className="bg-gray-900/50 border-yellow-500/30 max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
            </div>
            <CardTitle className="text-xl text-white">
              Two-Factor Authentication Required
            </CardTitle>
            <CardDescription className="text-white/60">
              {mfaStatus?.role === 'distributor' 
                ? 'As a NEON distributor, you must enable two-factor authentication to protect your account and commissions.'
                : 'As a vending machine owner, you must enable two-factor authentication to protect your account and revenue data.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#c8ff00]" />
                Why is MFA required?
              </h4>
              <ul className="text-white/60 text-sm space-y-1">
                <li>• Protects your commissions and earnings</li>
                <li>• Prevents unauthorized access to your account</li>
                <li>• Required for all business-level accounts</li>
                <li>• Industry standard security practice</li>
              </ul>
            </div>
            
            <Button 
              onClick={() => setLocation('/mfa-settings')}
              className="w-full bg-[#c8ff00] text-black hover:bg-[#b8ef00] font-semibold"
            >
              <Shield className="w-4 h-4 mr-2" />
              Set Up Two-Factor Authentication
            </Button>
            
            <Button 
              variant="ghost"
              onClick={() => setLocation('/')}
              className="w-full text-white/60 hover:text-white"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // MFA is set up or not required, render children
  return <>{children}</>;
}

export default MfaEnforcementGuard;
