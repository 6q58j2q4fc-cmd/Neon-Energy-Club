import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Shield, Lock, FileText, AlertCircle, CheckCircle2 } from "lucide-react";

export default function TaxInformation() {
  const { data: distributor, isLoading } = trpc.distributor.me.useQuery();
  const [taxIdType, setTaxIdType] = useState<"ssn" | "ein">("ssn");
  const [taxId, setTaxId] = useState("");
  const [confirmTaxId, setConfirmTaxId] = useState("");
  const [error, setError] = useState("");

  const submitTaxInfo = trpc.distributor.submitTaxInformation.useMutation({
    onSuccess: () => {
      toast.success("Tax information submitted successfully");
      setTaxId("");
      setConfirmTaxId("");
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate tax ID format
    const cleaned = taxId.replace(/\D/g, "");
    
    if (taxIdType === "ssn") {
      if (cleaned.length !== 9) {
        setError("SSN must be 9 digits");
        return;
      }
      if (cleaned === "000000000" || cleaned.startsWith("000") || cleaned.startsWith("666") || parseInt(cleaned.substring(0, 3)) >= 900) {
        setError("Invalid SSN format");
        return;
      }
    } else {
      if (cleaned.length !== 9) {
        setError("EIN must be 9 digits");
        return;
      }
      if (cleaned === "000000000") {
        setError("Invalid EIN format");
        return;
      }
    }

    // Confirm tax ID match
    if (taxId !== confirmTaxId) {
      setError("Tax ID numbers do not match");
      return;
    }

    submitTaxInfo.mutate({
      taxIdType,
      taxId: cleaned,
    });
  };

  const formatTaxId = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    
    if (taxIdType === "ssn") {
      // Format as XXX-XX-XXXX
      if (cleaned.length <= 3) return cleaned;
      if (cleaned.length <= 5) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5, 9)}`;
    } else {
      // Format as XX-XXXXXXX
      if (cleaned.length <= 2) return cleaned;
      return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 9)}`;
    }
  };

  const handleTaxIdChange = (value: string, setter: (val: string) => void) => {
    const formatted = formatTaxId(value);
    setter(formatted);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-[#c8ff00]">Loading...</div>
      </div>
    );
  }

  const taxInfoCompleted = distributor?.taxInfoCompleted;

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2">Tax Information</h1>
        <p className="text-gray-400">Secure submission for IRS 1099 reporting</p>
      </div>

      {/* IRS Compliance Explanation */}
      <Card className="mb-6 border-blue-500/30 bg-blue-500/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            <CardTitle className="text-lg">Why is this required?</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            The IRS requires all businesses to collect tax information from independent contractors and distributors who earn $600 or more per year. This information is used to generate Form 1099-NEC for tax reporting purposes.
          </p>
          <p>
            <strong>What we need:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Individuals:</strong> Social Security Number (SSN)</li>
            <li><strong>Businesses:</strong> Employer Identification Number (EIN)</li>
          </ul>
          <p className="text-xs text-gray-500 mt-4">
            This is equivalent to completing a W-9 form, which is standard practice for all MLM companies including Herbalife, Amway, and other major direct sales organizations.
          </p>
        </CardContent>
      </Card>

      {/* Data Protection Notice */}
      <Card className="mb-6 border-green-500/30 bg-green-500/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" />
            <CardTitle className="text-lg">How is your information protected?</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <Lock className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Bank-Level Encryption</p>
              <p className="text-gray-400">Your tax information is encrypted using AES-256-GCM encryption, the same standard used by financial institutions.</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Lock className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Internal Use Only</p>
              <p className="text-gray-400">Your SSN/EIN is only accessible to authorized personnel for tax reporting and compliance purposes. It is never shared with third parties.</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Lock className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Secure Storage</p>
              <p className="text-gray-400">All sensitive data is stored in encrypted format in our secure database with restricted access controls and audit logging.</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Lock className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Compliance</p>
              <p className="text-gray-400">We comply with all federal and state data protection regulations including SOC 2 Type II standards.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Information Form */}
      <Card>
        <CardHeader>
          <CardTitle>Submit Tax Information</CardTitle>
          <CardDescription>
            {taxInfoCompleted 
              ? "Your tax information has been submitted. Contact support if you need to update it."
              : "Complete this form to enable commission payments"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {taxInfoCompleted ? (
            <Alert className="bg-green-500/10 border-green-500/30">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-500">
                Tax information submitted on {new Date(distributor?.taxInfoCompletedAt || "").toLocaleDateString()}
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Tax ID Type Selection */}
              <div className="space-y-3">
                <Label>I am submitting as:</Label>
                <RadioGroup value={taxIdType} onValueChange={(value: "ssn" | "ein") => {
                  setTaxIdType(value);
                  setTaxId("");
                  setConfirmTaxId("");
                }}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ssn" id="ssn" />
                    <Label htmlFor="ssn" className="font-normal cursor-pointer">
                      Individual (Social Security Number)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ein" id="ein" />
                    <Label htmlFor="ein" className="font-normal cursor-pointer">
                      Business Entity (Employer Identification Number)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Tax ID Input */}
              <div className="space-y-2">
                <Label htmlFor="taxId">
                  {taxIdType === "ssn" ? "Social Security Number" : "Employer Identification Number"}
                </Label>
                <Input
                  id="taxId"
                  type="text"
                  value={taxId}
                  onChange={(e) => handleTaxIdChange(e.target.value, setTaxId)}
                  placeholder={taxIdType === "ssn" ? "XXX-XX-XXXX" : "XX-XXXXXXX"}
                  maxLength={taxIdType === "ssn" ? 11 : 10}
                  required
                  autoComplete="off"
                  className="font-mono"
                />
                <p className="text-xs text-gray-500">
                  {taxIdType === "ssn" ? "Format: 123-45-6789" : "Format: 12-3456789"}
                </p>
              </div>

              {/* Confirm Tax ID Input */}
              <div className="space-y-2">
                <Label htmlFor="confirmTaxId">
                  Confirm {taxIdType === "ssn" ? "Social Security Number" : "Employer Identification Number"}
                </Label>
                <Input
                  id="confirmTaxId"
                  type="text"
                  value={confirmTaxId}
                  onChange={(e) => handleTaxIdChange(e.target.value, setConfirmTaxId)}
                  placeholder={taxIdType === "ssn" ? "XXX-XX-XXXX" : "XX-XXXXXXX"}
                  maxLength={taxIdType === "ssn" ? 11 : 10}
                  required
                  autoComplete="off"
                  className="font-mono"
                />
              </div>

              {/* Certification Statement */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 text-sm">
                <p className="font-semibold mb-2">Certification</p>
                <p className="text-gray-400">
                  By submitting this form, I certify that the information provided is true, correct, and complete. I understand that this information will be used for IRS tax reporting purposes and that providing false information may result in penalties under federal law.
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={submitTaxInfo.isPending}
              >
                {submitTaxInfo.isPending ? "Submitting..." : "Submit Tax Information"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
