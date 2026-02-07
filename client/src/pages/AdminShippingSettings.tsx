import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { 
  ArrowLeft, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Loader2,
  ExternalLink,
  Shield,
  Info
} from "lucide-react";

interface CarrierConfig {
  name: string;
  logo: string;
  docsUrl: string;
  description: string;
  fields: {
    key: string;
    label: string;
    placeholder: string;
    type: 'text' | 'password';
    required: boolean;
  }[];
}

const CARRIERS: Record<string, CarrierConfig> = {
  ups: {
    name: 'UPS',
    logo: '🟤',
    docsUrl: 'https://developer.ups.com/',
    description: 'United Parcel Service - Ground, 2-Day, Next Day shipping',
    fields: [
      { key: 'UPS_CLIENT_ID', label: 'Client ID', placeholder: 'Enter UPS Client ID', type: 'text', required: true },
      { key: 'UPS_CLIENT_SECRET', label: 'Client Secret', placeholder: 'Enter UPS Client Secret', type: 'password', required: true },
      { key: 'UPS_ACCOUNT_NUMBER', label: 'Account Number', placeholder: 'Enter UPS Account Number', type: 'text', required: true },
    ],
  },
  fedex: {
    name: 'FedEx',
    logo: '🟣',
    docsUrl: 'https://developer.fedex.com/',
    description: 'FedEx - Ground, Express, Priority Overnight shipping',
    fields: [
      { key: 'FEDEX_API_KEY', label: 'API Key', placeholder: 'Enter FedEx API Key', type: 'text', required: true },
      { key: 'FEDEX_SECRET_KEY', label: 'Secret Key', placeholder: 'Enter FedEx Secret Key', type: 'password', required: true },
      { key: 'FEDEX_ACCOUNT_NUMBER', label: 'Account Number', placeholder: 'Enter FedEx Account Number', type: 'text', required: true },
      { key: 'FEDEX_METER_NUMBER', label: 'Meter Number', placeholder: 'Enter FedEx Meter Number', type: 'text', required: false },
    ],
  },
  usps: {
    name: 'USPS',
    logo: '🔵',
    docsUrl: 'https://www.usps.com/business/web-tools-apis/',
    description: 'United States Postal Service - Priority Mail, Express shipping',
    fields: [
      { key: 'USPS_USER_ID', label: 'User ID', placeholder: 'Enter USPS Web Tools User ID', type: 'text', required: true },
      { key: 'USPS_PASSWORD', label: 'Password', placeholder: 'Enter USPS Password (if required)', type: 'password', required: false },
    ],
  },
};

export default function AdminShippingSettings() {
  const { t, language } = useLanguage();
  const [activeCarrier, setActiveCarrier] = useState('ups');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [environment, setEnvironment] = useState<'sandbox' | 'production'>('sandbox');
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string } | null>>({});
  const [isTesting, setIsTesting] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const testConnection = trpc.admin.testShippingConnection.useMutation();

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleTestConnection = async (carrier: string) => {
    setIsTesting(carrier);
    try {
      const result = await testConnection.mutateAsync({ carrier: carrier, credentials: formData });
      setTestResults(prev => ({ ...prev, [carrier]: result }));
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        [carrier]: { success: false, message: 'Connection test failed' } 
      }));
    } finally {
      setIsTesting(null);
    }
  };

  const handleSaveCredentials = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      // In a real implementation, this would save to environment variables
      // For now, show instructions to add via Settings > Secrets
      setSaveMessage({
        type: 'success',
        text: 'To save these credentials, please add them via Settings → Secrets in the Management UI. The environment variable names are shown below each field.'
      });
    } catch (error) {
      setSaveMessage({
        type: 'error',
        text: 'Failed to save credentials. Please try again.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const carrier = CARRIERS[activeCarrier];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Shipping Settings</h1>
              <p className="text-muted-foreground">Configure carrier API credentials for label generation</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>How Shipping Integration Works</AlertTitle>
            <AlertDescription>
              Configure your carrier API credentials below to enable real-time rate calculation and label generation. 
              Without credentials, the system uses placeholder rates. All credentials are stored securely as environment variables.
            </AlertDescription>
          </Alert>

          {/* Carrier Tabs */}
          <Tabs value={activeCarrier} onValueChange={setActiveCarrier}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ups" className="gap-2">
                <span>🟤</span> UPS
              </TabsTrigger>
              <TabsTrigger value="fedex" className="gap-2">
                <span>🟣</span> FedEx
              </TabsTrigger>
              <TabsTrigger value="usps" className="gap-2">
                <span>🔵</span> USPS
              </TabsTrigger>
            </TabsList>

            {Object.entries(CARRIERS).map(([key, config]) => (
              <TabsContent key={key} value={key} className="space-y-6">
                <Card as any>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <span className="text-2xl">{config.logo}</span>
                          {config.name} Integration
                        </CardTitle>
                        <CardDescription>{config.description}</CardDescription>
                      </div>
                      <a 
                        href={config.docsUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        API Documentation <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Environment Selection */}
                    <div className="space-y-2">
                      <Label>Environment</Label>
                      <Select 
                        value={environment} 
                        onValueChange={(v) => setEnvironment(v as 'sandbox' | 'production')}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sandbox">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">Sandbox</Badge>
                              Test Mode
                            </div>
                          </SelectItem>
                          <SelectItem value="production">
                            <div className="flex items-center gap-2">
                              <Badge variant="default">Production</Badge>
                              Live Mode
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Use Sandbox for testing, Production for live shipments
                      </p>
                    </div>

                    {/* Credential Fields */}
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        API Credentials
                      </h4>
                      
                      {config.fields.map((field) => (
                        <div key={field.key} className="space-y-2">
                          <Label htmlFor={field.key}>
                            {field.label}
                            {field.required && <span className="text-destructive ml-1">*</span>}
                          </Label>
                          <Input
                            id={field.key}
                            type={field.type}
                            placeholder={field.placeholder}
                            value={formData[field.key] || ''}
                            onChange={(e) => handleInputChange(field.key, e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">
                            Environment variable: <code className="bg-muted px-1 rounded">{field.key}</code>
                          </p>
                        </div>
                      ))}

                      {/* Environment variable for environment setting */}
                      <div className="space-y-2">
                        <Label>Environment Setting</Label>
                        <p className="text-xs text-muted-foreground">
                          Environment variable: <code className="bg-muted px-1 rounded">{key.toUpperCase()}_ENVIRONMENT</code> = "{environment}"
                        </p>
                      </div>
                    </div>

                    {/* Test Connection */}
                    <div className="flex items-center gap-4 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => handleTestConnection(key)}
                        disabled={isTesting === key}
                      >
                        {isTesting === key ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Testing...
                          </>
                        ) : (
                          <>
                            <Truck className="h-4 w-4 mr-2" />
                            Test Connection
                          </>
                        )}
                      </Button>

                      {testResults[key] && (
                        <div className={`flex items-center gap-2 ${
                          testResults[key]?.success ? 'text-green-500' : 'text-destructive'
                        }`}>
                          {testResults[key]?.success ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                          <span className="text-sm">{testResults[key]?.message}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* How to Get Credentials */}
                <Card as any>
                  <CardHeader>
                    <CardTitle className="text-lg">How to Get {config.name} API Credentials</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {key === 'ups' && (
                      <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                        <li>Go to <a href="https://developer.ups.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">UPS Developer Portal</a></li>
                        <li>Sign in or create a UPS account</li>
                        <li>Navigate to "My Apps" and create a new application</li>
                        <li>Select the APIs you need (Rating, Shipping, Tracking)</li>
                        <li>Copy your Client ID and Client Secret</li>
                        <li>Your Account Number is on your UPS invoices or account settings</li>
                      </ol>
                    )}
                    {key === 'fedex' && (
                      <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                        <li>Go to <a href="https://developer.fedex.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">FedEx Developer Portal</a></li>
                        <li>Sign in or create a FedEx Developer account</li>
                        <li>Create a new project and select the APIs (Rate, Ship, Track)</li>
                        <li>Generate API credentials for your project</li>
                        <li>Copy your API Key and Secret Key</li>
                        <li>Account and Meter numbers are in your FedEx account settings</li>
                      </ol>
                    )}
                    {key === 'usps' && (
                      <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                        <li>Go to <a href="https://www.usps.com/business/web-tools-apis/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">USPS Web Tools</a></li>
                        <li>Register for a Web Tools account</li>
                        <li>Request access to the APIs you need (Rate Calculator, Label)</li>
                        <li>USPS will email you your User ID after approval</li>
                        <li>Some APIs require additional registration for production access</li>
                      </ol>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>

          {/* Save Message */}
          {saveMessage && (
            <Alert variant={saveMessage.type === 'error' ? 'destructive' : 'default'}>
              {saveMessage.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription>{saveMessage.text}</AlertDescription>
            </Alert>
          )}

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <Link href="/admin">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button onClick={handleSaveCredentials} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'View Save Instructions'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
