import { useEffect, useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';

/**
 * Hook to check if user needs MFA verification
 * Returns verification status and handles redirect to MFA verify page
 */
export function useMfaVerification() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [isVerified, setIsVerified] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const { data: mfaStatus, isLoading: mfaLoading } = trpc.mfa.getStatus.useQuery(
    undefined,
    { enabled: !!user }
  );

  useEffect(() => {
    if (authLoading || mfaLoading) {
      setIsChecking(true);
      return;
    }

    setIsChecking(false);

    // If user doesn't have MFA enabled, they're "verified" by default
    if (!mfaStatus?.isEnabled) {
      setIsVerified(true);
      return;
    }

    // Check session storage for MFA verification
    const mfaVerified = sessionStorage.getItem('mfa_verified');
    const mfaVerifiedAt = sessionStorage.getItem('mfa_verified_at');
    
    if (mfaVerified === 'true' && mfaVerifiedAt) {
      // Check if verification is still valid (within 24 hours)
      const verifiedTime = parseInt(mfaVerifiedAt, 10);
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      if (now - verifiedTime < twentyFourHours) {
        setIsVerified(true);
        return;
      }
    }

    // MFA is enabled but not verified in this session
    setIsVerified(false);
  }, [authLoading, mfaLoading, mfaStatus]);

  const redirectToVerify = (returnPath?: string) => {
    if (returnPath) {
      sessionStorage.setItem('mfa_redirect', returnPath);
    }
    setLocation('/mfa-verify');
  };

  return {
    isVerified,
    isChecking,
    mfaEnabled: mfaStatus?.isEnabled || false,
    redirectToVerify,
  };
}

/**
 * Check if MFA verification is needed and redirect if so
 * Use this in protected pages that require MFA verification
 */
export function useMfaProtection(returnPath?: string) {
  const { isVerified, isChecking, mfaEnabled, redirectToVerify } = useMfaVerification();
  const [location] = useLocation();

  useEffect(() => {
    if (!isChecking && mfaEnabled && !isVerified) {
      redirectToVerify(returnPath || location);
    }
  }, [isChecking, mfaEnabled, isVerified, returnPath, location, redirectToVerify]);

  return {
    isReady: !isChecking && (!mfaEnabled || isVerified),
    isVerified,
    mfaEnabled,
  };
}
