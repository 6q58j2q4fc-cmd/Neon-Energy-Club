import { useState } from "react";
import HamburgerHeader from "@/components/HamburgerHeader";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, FileText, Users, Truck, ShoppingCart, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ApplicationForms() {
  const { t, language } = useLanguage();
  const [downloadingForm, setDownloadingForm] = useState<string | null>(null);

  const forms = [
    {
      id: "distributor",
      title: "New Distributor Application",
      description: "Join the NEON Energy team as an independent distributor. Start your journey to financial freedom.",
      icon: Users,
      color: "from-[#c8ff00] to-[#88ff00]",
      features: [
        "Personal information",
        "Sponsor details",
        "Business structure selection",
        "Payment preferences",
        "Terms & conditions agreement"
      ]
    },
    {
      id: "vending",
      title: "Vending Machine Application",
      description: "Apply to place NEON Energy vending machines at your location or become a vending operator.",
      icon: Truck,
      color: "from-[#ff0080] to-[#ff00ff]",
      features: [
        "Location details",
        "Traffic estimates",
        "Business license info",
        "Revenue sharing terms",
        "Installation requirements"
      ]
    },
    {
      id: "customer",
      title: "New Customer Registration",
      description: "Register as a preferred customer to enjoy exclusive discounts and early access to new products.",
      icon: ShoppingCart,
      color: "from-[#00ffff] to-[#00ff88]",
      features: [
        "Contact information",
        "Shipping address",
        "Payment method",
        "Newsletter preferences",
        "Referral source"
      ]
    }
  ];

  const handleDownload = (formId: string) => {
    setDownloadingForm(formId);
    
    // Generate and download PDF form
    const formContent = generateFormContent(formId);
    const blob = new Blob([formContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NEON_${formId}_application.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setTimeout(() => setDownloadingForm(null), 1000);
  };

  const generateFormContent = (formId: string) => {
    const formTitles: Record<string, string> = {
      distributor: "New Distributor Application",
      vending: "Vending Machine Application",
      customer: "New Customer Registration"
    };

    const formFields: Record<string, string[]> = {
      distributor: [
        "Full Legal Name", "Date of Birth", "Social Security Number (last 4 digits)",
        "Street Address", "City", "State", "ZIP Code", "Country",
        "Email Address", "Phone Number",
        "Sponsor Name", "Sponsor ID Number",
        "Business Type (Individual/LLC/Corporation)",
        "Tax ID (if applicable)",
        "Preferred Payment Method",
        "Bank Name", "Account Number", "Routing Number",
        "Signature", "Date"
      ],
      vending: [
        "Business Name", "Contact Person", "Title",
        "Business Address", "City", "State", "ZIP Code",
        "Email Address", "Phone Number",
        "Proposed Location Address", "Location Type (Mall/Office/School/Other)",
        "Estimated Daily Foot Traffic",
        "Business License Number", "Tax ID",
        "Preferred Machine Type", "Number of Machines Requested",
        "Electrical Access Available (Yes/No)",
        "Signature", "Date"
      ],
      customer: [
        "Full Name", "Email Address", "Phone Number",
        "Shipping Address", "City", "State", "ZIP Code", "Country",
        "Billing Address (if different)",
        "Preferred Payment Method",
        "How did you hear about NEON?",
        "Referring Distributor Code (if any)",
        "Newsletter Subscription (Yes/No)",
        "Signature", "Date"
      ]
    };

    return `<!DOCTYPE html>
<html>
<head>
  <title>NEON Energy - ${formTitles[formId]}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; }
    h1 { color: #c8ff00; background: #0a1a1a; padding: 20px; text-align: center; }
    .logo { text-align: center; font-size: 32px; font-weight: bold; color: #c8ff00; margin-bottom: 10px; }
    .form-field { margin: 15px 0; }
    .form-field label { display: block; font-weight: bold; margin-bottom: 5px; }
    .form-field input, .form-field select { width: 100%; padding: 10px; border: 1px solid #ccc; box-sizing: border-box; }
    .signature-line { border-bottom: 1px solid #000; height: 40px; margin-top: 10px; }
    .instructions { background: #f5f5f5; padding: 15px; margin: 20px 0; border-left: 4px solid #c8ff00; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="logo">⚡ NEON ENERGY</div>
  <h1>${formTitles[formId]}</h1>
  
  <div class="instructions">
    <strong>Instructions:</strong> Please complete all fields. Print this form, fill it out, and submit via email to applications@neonenergy.com or mail to: NEON Energy, 123 Energy Way, Bend, OR 97701
  </div>
  
  ${formFields[formId].map(field => `
    <div class="form-field">
      <label>${field}:</label>
      ${field.includes('Signature') ? '<div class="signature-line"></div>' : '<input type="text" />'}
    </div>
  `).join('')}
  
  <div class="instructions" style="margin-top: 30px;">
    <strong>Agreement:</strong> By signing this application, I certify that all information provided is accurate and complete. I agree to the NEON Energy Terms & Conditions and Policies & Procedures.
  </div>
  
  <p style="text-align: center; margin-top: 40px; color: #666;">
    © ${new Date().getFullYear()} NEON Energy Drink. All rights reserved.
  </p>
</body>
</html>`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1a1a] via-[#0d2818] to-[#0a1a1a] text-white">
      <SEO 
        title="Application Forms - NEON Energy"
        description="Download application forms to become a NEON Energy distributor, vending operator, or preferred customer."
      />
      <HamburgerHeader variant="vice" />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 relative">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-6xl font-black mb-6">
            <span className="text-[#c8ff00]">APPLICATION</span> FORMS
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Download and complete the appropriate form to join the NEON Energy family
          </p>
        </div>
      </section>

      {/* Forms Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            {forms.map((form) => (
              <Card key={form.id} className="bg-black/50 border-white/10 hover:border-[#c8ff00]/50 transition-all">
                <CardHeader>
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${form.color} flex items-center justify-center mb-4`}>
                    <form.icon className="w-8 h-8 text-black" />
                  </div>
                  <CardTitle className="text-white text-xl">{form.title}</CardTitle>
                  <CardDescription className="text-white/60">{form.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {form.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-white/70">
                        <CheckCircle className="w-4 h-4 text-[#c8ff00]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => handleDownload(form.id)}
                    disabled={downloadingForm === form.id}
                    className="w-full bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold"
                  >
                    {downloadingForm === form.id ? (
                      <>Downloading...</>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Download Form
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Online Application CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-[#c8ff00]/10 to-transparent">
        <div className="container mx-auto max-w-4xl text-center">
          <FileText className="w-16 h-16 text-[#c8ff00] mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Prefer to Apply Online?</h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            Skip the paperwork! Apply directly through our website for faster processing.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild className="bg-[#c8ff00] text-black hover:bg-[#a8d600]">
              <a href="/join">Become a Distributor</a>
            </Button>
            <Button asChild variant="outline" className="border-[#ff0080] text-[#ff0080] hover:bg-[#ff0080]/10">
              <a href="/vending">Apply for Vending</a>
            </Button>
            <Button asChild variant="outline" className="border-[#00ffff] text-[#00ffff] hover:bg-[#00ffff]/10">
              <a href="/pre-order">Register as Customer</a>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
