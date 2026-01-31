import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Loader2, AlertCircle, Key, ArrowLeft } from 'lucide-react';
import HamburgerHeader from '@/components/HamburgerHeader';

export default function MfaVerify() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isBackupMode, setIsBackupMode] = useState(false);
  const [backupCode, setBackupCode] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const verifyMfa = trpc.mfa.verify.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        // Store MFA verification in session
        sessionStorage.setItem('mfa_verified', 'true');
        sessionStorage.setItem('mfa_verified_at', Date.now().toString());
        
        // Redirect to intended destination or dashboard
        const redirectTo = sessionStorage.getItem('mfa_redirect') || '/';
        sessionStorage.removeItem('mfa_redirect');
        setLocation(redirectTo);
      }
    },
    onError: (err) => {
      setError(err.message || 'Invalid verification code');
      // Clear code on error
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    },
  });

  // Auto-focus first input on mount
  useEffect(() => {
    if (!authLoading && user) {
      inputRefs.current[0]?.focus();
    }
  }, [authLoading, user]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation('/');
    }
  }, [authLoading, user, setLocation]);

  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (value && index === 5 && newCode.every(c => c)) {
      handleSubmit(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setCode(newCode);
      handleSubmit(pastedData);
    }
  };

  const handleSubmit = (codeString?: string) => {
    const verificationCode = codeString || code.join('');
    if (verificationCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }
    verifyMfa.mutate({ code: verificationCode });
  };

  const handleBackupSubmit = () => {
    if (backupCode.length !== 8) {
      setError('Backup codes are 8 characters');
      return;
    }
    verifyMfa.mutate({ code: backupCode });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#c8ff00] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <HamburgerHeader variant="default" />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <Card className="bg-gray-900/50 border-[#c8ff00]/30 w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-[#c8ff00]/20 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-[#c8ff00]" />
            </div>
            <CardTitle className="text-2xl text-white">
              Two-Factor Authentication
            </CardTitle>
            <CardDescription className="text-white/60">
              {isBackupMode 
                ? 'Enter one of your backup codes to verify your identity'
                : 'Enter the 6-digit code from your authenticator app'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {!isBackupMode ? (
              <>
                {/* TOTP Code Input */}
                <div className="flex justify-center gap-2" onPaste={handlePaste}>
                  {code.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 text-center text-2xl font-mono bg-gray-800 border-gray-700 text-white focus:border-[#c8ff00] focus:ring-[#c8ff00]"
                      disabled={verifyMfa.isPending}
                    />
                  ))}
                </div>

                <Button
                  onClick={() => handleSubmit()}
                  disabled={code.some(c => !c) || verifyMfa.isPending}
                  className="w-full bg-[#c8ff00] text-black hover:bg-[#b8ef00] font-semibold h-12"
                >
                  {verifyMfa.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Code'
                  )}
                </Button>

                <div className="text-center">
                  <button
                    onClick={() => {
                      setIsBackupMode(true);
                      setError('');
                    }}
                    className="text-sm text-[#c8ff00] hover:underline"
                  >
                    <Key className="w-3 h-3 inline mr-1" />
                    Use a backup code instead
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Backup Code Input */}
                <div>
                  <Input
                    type="text"
                    placeholder="Enter 8-character backup code"
                    value={backupCode}
                    onChange={(e) => {
                      setBackupCode(e.target.value.toUpperCase());
                      setError('');
                    }}
                    maxLength={8}
                    className="text-center text-lg font-mono bg-gray-800 border-gray-700 text-white focus:border-[#c8ff00] focus:ring-[#c8ff00] h-14"
                    disabled={verifyMfa.isPending}
                  />
                  <p className="text-xs text-white/40 mt-2 text-center">
                    Backup codes are single-use. This code will be invalidated after use.
                  </p>
                </div>

                <Button
                  onClick={handleBackupSubmit}
                  disabled={backupCode.length !== 8 || verifyMfa.isPending}
                  className="w-full bg-[#c8ff00] text-black hover:bg-[#b8ef00] font-semibold h-12"
                >
                  {verifyMfa.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Backup Code'
                  )}
                </Button>

                <div className="text-center">
                  <button
                    onClick={() => {
                      setIsBackupMode(false);
                      setBackupCode('');
                      setError('');
                    }}
                    className="text-sm text-white/60 hover:text-white"
                  >
                    <ArrowLeft className="w-3 h-3 inline mr-1" />
                    Back to authenticator code
                  </button>
                </div>
              </>
            )}

            <div className="pt-4 border-t border-gray-800">
              <p className="text-xs text-white/40 text-center">
                Having trouble? Contact support if you've lost access to your authenticator and backup codes.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
