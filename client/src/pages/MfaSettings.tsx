import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { 
  Shield, 
  ShieldCheck, 
  ShieldOff, 
  Smartphone, 
  Key, 
  Copy, 
  Check,
  ArrowLeft,
  Zap,
  AlertTriangle,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { Link } from 'wouter';

export default function MfaSettings() {
  const { user } = useAuth();
  const [setupStep, setSetupStep] = useState<'idle' | 'scanning' | 'verifying'>('idle');
  const [verificationCode, setVerificationCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [qrData, setQrData] = useState<{ qrCodeDataUrl: string; secret: string } | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Queries
  const { data: mfaStatus, refetch: refetchStatus } = trpc.mfa.getStatus.useQuery();

  // Mutations
  const initSetup = trpc.mfa.initSetup.useMutation({
    onSuccess: (data) => {
      setQrData({ qrCodeDataUrl: data.qrCodeDataUrl, secret: data.secret });
      setSetupStep('scanning');
      setMessage(null);
    },
    onError: (error) => {
      setMessage({ type: 'error', text: error.message });
    },
  });

  const verifyAndEnable = trpc.mfa.verifyAndEnable.useMutation({
    onSuccess: (data) => {
      setBackupCodes(data.backupCodes);
      setSetupStep('idle');
      setQrData(null);
      setVerificationCode('');
      refetchStatus();
      setMessage({ type: 'success', text: 'Two-factor authentication has been enabled!' });
    },
    onError: (error) => {
      setMessage({ type: 'error', text: error.message });
    },
  });

  const disable = trpc.mfa.disable.useMutation({
    onSuccess: () => {
      setDisableCode('');
      refetchStatus();
      setMessage({ type: 'success', text: 'Two-factor authentication has been disabled.' });
    },
    onError: (error) => {
      setMessage({ type: 'error', text: error.message });
    },
  });

  const regenerateBackupCodes = trpc.mfa.regenerateBackupCodes.useMutation({
    onSuccess: (data) => {
      setBackupCodes(data.backupCodes);
      setMessage({ type: 'success', text: 'Backup codes regenerated. Old codes are no longer valid.' });
    },
    onError: (error) => {
      setMessage({ type: 'error', text: error.message });
    },
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCopyAllCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setMessage({ type: 'success', text: 'All backup codes copied to clipboard.' });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <Card className="bg-gray-900/50 border-gray-800 max-w-md">
          <CardContent className="pt-6 text-center">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-white mb-4">Please log in to manage MFA settings.</p>
            <Link href="/">
              <Button className="bg-[#c8ff00] text-black hover:bg-[#b8ef00]">
                Go to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-lg border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <Link href="/" className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-[#c8ff00]" />
            <span className="font-bold text-white">NEON</span>
          </Link>
          
          <div className="w-24" />
        </div>
      </nav>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white flex items-center justify-center gap-2">
              <Shield className="w-8 h-8 text-[#c8ff00]" />
              Two-Factor Authentication
            </h1>
            <p className="text-gray-400 mt-2">
              Add an extra layer of security to your account
            </p>
          </div>

          {/* Message display */}
          {message && (
            <div className={`p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-500/20 border border-green-500/30 text-green-400' 
                : 'bg-red-500/20 border border-red-500/30 text-red-400'
            }`}>
              {message.text}
            </div>
          )}

          {/* Status card */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">MFA Status</CardTitle>
                {mfaStatus?.isEnabled ? (
                  <Badge className="bg-green-500/20 text-green-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Enabled
                  </Badge>
                ) : (
                  <Badge className="bg-gray-500/20 text-gray-400 flex items-center gap-1">
                    <ShieldOff className="w-3 h-3" />
                    Disabled
                  </Badge>
                )}
              </div>
              <CardDescription>
                {mfaStatus?.isEnabled 
                  ? 'Your account is protected with two-factor authentication.'
                  : 'Enable MFA to protect your account from unauthorized access.'}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Setup flow */}
          {!mfaStatus?.isEnabled && setupStep === 'idle' && (
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-[#c8ff00]" />
                  Set Up Authenticator App
                </CardTitle>
                <CardDescription>
                  Use an authenticator app like Google Authenticator, Authy, or 1Password 
                  to generate verification codes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => initSetup.mutate()}
                  disabled={initSetup.isPending}
                  className="bg-[#c8ff00] text-black hover:bg-[#b8ef00]"
                >
                  {initSetup.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Shield className="w-4 h-4 mr-2" />
                  )}
                  Begin Setup
                </Button>
              </CardContent>
            </Card>
          )}

          {/* QR Code scanning step */}
          {setupStep === 'scanning' && qrData && (
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">Step 1: Scan QR Code</CardTitle>
                <CardDescription>
                  Open your authenticator app and scan this QR code.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-lg">
                    <img 
                      src={qrData.qrCodeDataUrl} 
                      alt="MFA QR Code" 
                      className="w-48 h-48"
                    />
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-2">
                    Can't scan? Enter this code manually:
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <code className="bg-gray-800 px-4 py-2 rounded text-[#c8ff00] font-mono">
                      {qrData.secret}
                    </code>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleCopyCode(qrData.secret)}
                    >
                      {copiedCode === qrData.secret ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-800">
                  <p className="text-sm text-gray-400 mb-3">
                    Step 2: Enter the 6-digit code from your app
                  </p>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="text-center text-2xl tracking-widest font-mono"
                      maxLength={6}
                    />
                    <Button
                      onClick={() => verifyAndEnable.mutate({ code: verificationCode })}
                      disabled={verificationCode.length !== 6 || verifyAndEnable.isPending}
                      className="bg-[#c8ff00] text-black hover:bg-[#b8ef00]"
                    >
                      {verifyAndEnable.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Verify'
                      )}
                    </Button>
                  </div>
                </div>

                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setSetupStep('idle');
                    setQrData(null);
                  }}
                  className="w-full"
                >
                  Cancel Setup
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Backup codes display */}
          {backupCodes.length > 0 && (
            <Card className="bg-yellow-500/10 border-yellow-500/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-yellow-400">
                  <AlertTriangle className="w-5 h-5" />
                  Save Your Backup Codes
                </CardTitle>
                <CardDescription className="text-yellow-200/70">
                  Store these codes in a safe place. Each code can only be used once 
                  to access your account if you lose your authenticator.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between bg-gray-900/50 px-3 py-2 rounded"
                    >
                      <code className="font-mono text-white">{code}</code>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleCopyCode(code)}
                      >
                        {copiedCode === code ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleCopyAllCodes}
                  className="w-full"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy All Codes
                </Button>
                <Button 
                  onClick={() => setBackupCodes([])}
                  className="w-full bg-[#c8ff00] text-black hover:bg-[#b8ef00]"
                >
                  I've Saved My Codes
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Manage MFA (when enabled) */}
          {mfaStatus?.isEnabled && backupCodes.length === 0 && (
            <>
              {/* Regenerate backup codes */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Key className="w-5 h-5 text-[#c8ff00]" />
                    Backup Codes
                  </CardTitle>
                  <CardDescription>
                    Generate new backup codes if you've lost or used your existing ones.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="text-center font-mono"
                      maxLength={6}
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        regenerateBackupCodes.mutate({ code: verificationCode });
                        setVerificationCode('');
                      }}
                      disabled={verificationCode.length !== 6 || regenerateBackupCodes.isPending}
                    >
                      {regenerateBackupCodes.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-2" />
                      )}
                      Regenerate
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Disable MFA */}
              <Card className="bg-red-500/10 border-red-500/30">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-red-400">
                    <ShieldOff className="w-5 h-5" />
                    Disable Two-Factor Authentication
                  </CardTitle>
                  <CardDescription className="text-red-200/70">
                    This will remove the extra security from your account. 
                    You'll need to enter a code from your authenticator app.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={disableCode}
                      onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="text-center font-mono"
                      maxLength={6}
                    />
                    <Button
                      variant="destructive"
                      onClick={() => disable.mutate({ code: disableCode })}
                      disabled={disableCode.length !== 6 || disable.isPending}
                    >
                      {disable.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Disable MFA'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Info card */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg">Why Use MFA?</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-start gap-2">
                  <ShieldCheck className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Protects your account even if your password is compromised</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Required for distributor and vending machine owner accounts</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Backup codes ensure you never lose access to your account</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
