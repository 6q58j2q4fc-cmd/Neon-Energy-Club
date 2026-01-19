import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { Mail, MessageCircle, Phone, MapPin, ChevronDown, Send } from "lucide-react";
import HamburgerHeader from "@/components/HamburgerHeader";

const faqCategories = [
  {
    category: "Product & Ingredients",
    questions: [
      {
        q: "What makes NEON Energy Drink different from other energy drinks?",
        a: "NEON features a revolutionary formula with natural caffeine sources, zero sugar, and a unique blend of vitamins and amino acids. Our new formula provides sustained energy without the crash, using cutting-edge nutritional science developed over years of research."
      },
      {
        q: "What are the main ingredients in NEON?",
        a: "NEON contains natural caffeine (160mg per can), taurine, B-vitamins (B3, B6, B12), L-carnitine, ginseng extract, and natural flavors. We use zero artificial colors or preservatives. Both Original and Organic variants are available."
      },
      {
        q: "Is NEON suitable for vegans?",
        a: "Yes! Both NEON Original and NEON Organic are 100% vegan-friendly. All our ingredients are plant-based, and we never test on animals."
      },
      {
        q: "How much caffeine is in each can?",
        a: "Each 8.4 fl oz (250ml) can contains 160mg of natural caffeine, equivalent to about 1.5 cups of coffee. We recommend not exceeding 2 cans per day."
      },
    ],
  },
  {
    category: "Crowdfunding & Pre-Orders",
    questions: [
      {
        q: "When will I receive my crowdfunding rewards?",
        a: "Reward fulfillment begins immediately after our official relaunch (approximately 90 days from now). Physical rewards like merchandise ship within 2-4 weeks of the relaunch date. Digital rewards are delivered via email within 48 hours of your contribution."
      },
      {
        q: "Can I change my reward tier after backing?",
        a: "Yes! Contact us at support@neonenergy.com within 7 days of your contribution to modify your tier. After 7 days, changes may not be possible as we begin production planning."
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit cards (Visa, Mastercard, American Express, Discover) through our secure Stripe payment processor. We also accept promotional codes for special discounts."
      },
      {
        q: "Is my contribution refundable?",
        a: "Contributions are generally non-refundable as they go directly toward production costs. However, if we fail to reach our funding goal or cannot fulfill the relaunch, all contributions will be fully refunded within 14 business days."
      },
    ],
  },
  {
    category: "Franchise Opportunities",
    questions: [
      {
        q: "How does the franchise territory licensing work?",
        a: "You select an exclusive territory on our interactive map, choosing the size (minimum 10 square miles) and term length (6-60 months). Pricing varies by location demand, typically $75-$250 per square mile per month. You pay a 20% deposit upfront, with flexible financing options for the balance."
      },
      {
        q: "What's included in the franchise license?",
        a: "Your license includes exclusive vending machine placement rights in your territory, AI-powered smart vending machines with remote monitoring, initial product inventory, marketing materials, ongoing support, and territory protection. You keep 100% of vending revenue minus product costs."
      },
      {
        q: "What are the expected returns on a franchise investment?",
        a: "Average franchisees report 35-50% profit margins after product costs. A typical high-traffic location generates $500-$1,500 per machine per month. ROI timelines vary by location, but most franchisees break even within 8-14 months."
      },
      {
        q: "Can I own multiple territories?",
        a: "Absolutely! Many of our most successful franchisees operate multiple territories. We offer volume discounts for multi-territory licenses and priority access to adjacent territories as they become available."
      },
    ],
  },
  {
    category: "Shipping & Delivery",
    questions: [
      {
        q: "Which countries do you ship to?",
        a: "Currently, we ship to all 50 US states and 14 international countries including Canada, UK, Germany, France, Australia, and Japan. International shipping rates and delivery times vary by location."
      },
      {
        q: "How much does shipping cost?",
        a: "US domestic shipping is FREE for orders over $50. Standard shipping (5-7 business days) is $8.99 for smaller orders. International shipping starts at $24.99 depending on destination and weight."
      },
      {
        q: "Can I track my order?",
        a: "Yes! Once your order ships, you'll receive a tracking number via email. You can track your shipment in real-time through our website or directly with the carrier (USPS, UPS, or FedEx)."
      },
    ],
  },
  {
    category: "Returns & Support",
    questions: [
      {
        q: "What is your return policy?",
        a: "We offer a 30-day satisfaction guarantee. If you're not completely satisfied with your NEON products, contact us for a full refund or replacement. Products must be unopened and in original packaging for returns."
      },
      {
        q: "How do I contact customer support?",
        a: "Reach us via email at support@neonenergy.com, phone at 1-800-NEON-ENERGY, or use the contact form below. Our support team responds within 24 hours on business days."
      },
      {
        q: "Do you offer wholesale pricing?",
        a: "Yes! We offer wholesale pricing for retailers, gyms, and businesses ordering 50+ cases. Contact our B2B team at wholesale@neonenergy.com for pricing and terms."
      },
    ],
  },
];

export default function FAQ() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success("Message sent! We'll get back to you within 24 hours.");
    setFormData({ name: "", email: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1a1a] via-[#0d2818] to-[#0a1a1a] text-white relative overflow-hidden">
      {/* Background Graphics */}
      <div className="synthwave-grid-bg" />
      <div className="floating-neon-orb green w-96 h-96 -top-48 -left-48" style={{ animationDelay: '0s' }} />
      <div className="floating-neon-orb pink w-80 h-80 top-1/3 -right-40" style={{ animationDelay: '-5s' }} />
      
      <HamburgerHeader variant="default" />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 animated-bg">
        <div className={`container mx-auto max-w-4xl text-center ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <MessageCircle className="w-16 h-16 text-[#c8ff00] mx-auto mb-6 neon-glow" />
          <h2 className="text-5xl md:text-6xl font-black mb-6">
            FREQUENTLY ASKED <span className="text-[#c8ff00] neon-text">QUESTIONS</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Find answers to common questions about NEON products, crowdfunding, franchise opportunities, and more.
          </p>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="py-12 px-4 bg-gradient-to-b from-black to-[#0a0a0a]">
        <div className="container mx-auto max-w-4xl">
          {faqCategories.map((category, idx) => (
            <div key={idx} className="mb-12">
              <h3 className="text-2xl font-bold text-[#c8ff00] mb-6 flex items-center gap-3">
                <ChevronDown className="w-6 h-6" />
                {category.category}
              </h3>
              <Accordion type="single" collapsible className="space-y-4">
                {category.questions.map((item, qIdx) => (
                  <AccordionItem
                    key={qIdx}
                    value={`${idx}-${qIdx}`}
                    className="bg-[#0a0a0a] border border-[#c8ff00]/20 rounded-xl px-6 hover:border-[#c8ff00]/40 transition-colors"
                  >
                    <AccordionTrigger className="text-left text-white hover:text-[#c8ff00] font-semibold py-5">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-400 leading-relaxed pb-5">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 px-4 bg-gradient-to-b from-[#0a0a0a] to-black">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <Mail className="w-12 h-12 text-[#c8ff00] mx-auto mb-4 neon-glow" />
            <h3 className="text-4xl font-black mb-4">
              STILL HAVE <span className="text-[#c8ff00]">QUESTIONS?</span>
            </h3>
            <p className="text-gray-400">Send us a message and we'll get back to you within 24 hours.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Contact Info */}
            <div className="space-y-6">
              <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Mail className="w-6 h-6 text-[#c8ff00] mt-1" />
                    <div>
                      <div className="font-bold text-white mb-1">Email</div>
                      <div className="text-gray-400">support@neonenergy.com</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Phone className="w-6 h-6 text-[#c8ff00] mt-1" />
                    <div>
                      <div className="font-bold text-white mb-1">Phone</div>
                      <div className="text-gray-400">1-800-NEON-ENERGY</div>
                      <div className="text-sm text-gray-500">Mon-Fri, 9am-6pm EST</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <MapPin className="w-6 h-6 text-[#c8ff00] mt-1" />
                    <div>
                      <div className="font-bold text-white mb-1">Address</div>
                      <div className="text-gray-400">
                        NEON Energy Drink HQ<br />
                        123 Energy Boulevard<br />
                        Los Angeles, CA 90001
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <Card className="bg-[#0a0a0a] border-[#c8ff00]/30 neon-border">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-[#c8ff00]">Send Us a Message</CardTitle>
                <CardDescription className="text-gray-400">We'll respond within 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="bg-black border-[#c8ff00]/30 text-white focus:border-[#c8ff00]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="bg-black border-[#c8ff00]/30 text-white focus:border-[#c8ff00]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="bg-black border-[#c8ff00]/30 text-white focus:border-[#c8ff00]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      className="bg-black border-[#c8ff00]/30 text-white min-h-[120px] focus:border-[#c8ff00]"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold py-6 neon-pulse"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                    <Send className="w-5 h-5 ml-2" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-[#c8ff00]/20">
        <div className="container mx-auto text-center text-gray-400">
          <p>&copy; 2025 NEON Energy Drink. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
