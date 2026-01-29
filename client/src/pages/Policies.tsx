import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import MobileTOC from "@/components/MobileTOC";

const sections = [
  { id: "purpose", title: "1. Purpose", level: 1 },
  { id: "eligibility", title: "2. Distributor Eligibility", level: 1 },
  { id: "territory", title: "3. Territory Rights", level: 1 },
  { id: "compensation", title: "4. Compensation Plan Rules", level: 1 },
  { id: "marketing", title: "5. Marketing & Advertising", level: 1 },
  { id: "nft", title: "6. NFT Program Policies", level: 1 },
  { id: "vending", title: "7. Vending Machine Operations", level: 1 },
  { id: "ethics", title: "8. Code of Ethics", level: 1 },
  { id: "disciplinary", title: "9. Disciplinary Actions", level: 1 },
  { id: "termination", title: "10. Termination & Resignation", level: 1 },
  { id: "disputes", title: "11. Dispute Resolution", level: 1 },
  { id: "updates", title: "12. Policy Updates", level: 1 },
  { id: "contact", title: "13. Contact", level: 1 },
];

export default function Policies() {
  const [activeSection, setActiveSection] = useState<string>("");

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i].id);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <SEO 
        title="Policies & Procedures | NEON Energy Drink"
        description="Official policies and procedures for NEON Energy Drink distributors and partners."
      />
      <Header />
      
      {/* Mobile TOC Drawer */}
      <MobileTOC 
        items={sections} 
        activeId={activeSection}
        onItemClick={setActiveSection}
      />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex gap-8">
            {/* Desktop Sidebar TOC - hidden on mobile */}
            <aside className="hidden xl:block w-64 flex-shrink-0">
              <div className="sticky top-28 bg-black/40 border border-white/10 rounded-lg p-4">
                <h3 className="text-sm font-bold text-[#c8ff00] uppercase tracking-wider mb-4">
                  Table of Contents
                </h3>
                <nav>
                  <ul className="space-y-1">
                    {sections.map((section) => (
                      <li key={section.id}>
                        <a
                          href={`#${section.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth" });
                          }}
                          className={`block px-3 py-1.5 rounded text-sm transition-all ${
                            activeSection === section.id
                              ? "bg-[#c8ff00]/20 text-[#c8ff00] font-medium"
                              : "text-white/60 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          {section.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 max-w-4xl">
              <h1 className="text-4xl font-black text-white mb-8">Policies & Procedures</h1>
              <p className="text-white/60 mb-8">Effective Date: January 19, 2026</p>
              
              <div className="prose prose-invert max-w-none space-y-8">
                <section id="purpose" className="bg-black/40 border border-white/10 rounded-lg p-6 scroll-mt-28">
                  <h2 className="text-2xl font-bold text-[#c8ff00] mb-4">1. Purpose</h2>
                  <p className="text-white/80 leading-relaxed">
                    These Policies & Procedures ("P&P") govern the relationship between Neon Corporation ("Company") and its independent distributors ("Distributors"). All Distributors must read, understand, and comply with these policies to maintain their distributor status and participate in the NEON compensation plan.
                  </p>
                </section>

                <section id="eligibility" className="bg-black/40 border border-white/10 rounded-lg p-6 scroll-mt-28">
                  <h2 className="text-2xl font-bold text-[#c8ff00] mb-4">2. Distributor Eligibility</h2>
                  <div className="space-y-4 text-white/80">
                    <p>To become a NEON Distributor, you must:</p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Be at least 18 years of age (or age of majority in your jurisdiction)</li>
                      <li>Provide valid government-issued identification</li>
                      <li>Complete the official Distributor Application</li>
                      <li>Agree to these Policies & Procedures</li>
                      <li>Pay any applicable enrollment fees</li>
                      <li>Not be currently enrolled as a NEON Distributor under another account</li>
                    </ul>
                  </div>
                </section>

                <section id="territory" className="bg-black/40 border border-white/10 rounded-lg p-6 scroll-mt-28">
                  <h2 className="text-2xl font-bold text-[#c8ff00] mb-4">3. Territory Rights</h2>
                  <div className="space-y-4 text-white/80">
                    <h3 className="text-lg font-semibold text-white">3.1 Territory Assignment</h3>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Territories are assigned based on geographic boundaries and population density</li>
                      <li>All territory applications are subject to Company approval</li>
                      <li>Territory fees are non-refundable once approved</li>
                      <li>Territories may not be transferred without written Company approval</li>
                    </ul>
                    
                    <h3 className="text-lg font-semibold text-white mt-4">3.2 Territory Maintenance</h3>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Distributors must maintain minimum monthly sales volume to retain territory rights</li>
                      <li>Inactive territories may be reassigned after 90 days of no activity</li>
                      <li>Territory expansion is available based on performance metrics</li>
                    </ul>
                  </div>
                </section>

                <section id="compensation" className="bg-black/40 border border-white/10 rounded-lg p-6 scroll-mt-28">
                  <h2 className="text-2xl font-bold text-[#c8ff00] mb-4">4. Compensation Plan Rules</h2>
                  <div className="space-y-4 text-white/80">
                    <h3 className="text-lg font-semibold text-white">4.1 Commission Payments</h3>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Commissions are paid monthly, by the 15th of the following month</li>
                      <li>Minimum payout threshold is $50</li>
                      <li>Distributors must provide valid tax information (W-9 for US residents)</li>
                      <li>Commission rates are subject to change with 30 days notice</li>
                    </ul>
                    
                    <h3 className="text-lg font-semibold text-white mt-4">4.2 Rank Advancement</h3>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Ranks are calculated monthly based on personal and team volume</li>
                      <li>Rank maintenance requires consistent performance</li>
                      <li>Rank demotions occur after two consecutive months below requirements</li>
                    </ul>
                  </div>
                </section>

                <section id="marketing" className="bg-black/40 border border-white/10 rounded-lg p-6 scroll-mt-28">
                  <h2 className="text-2xl font-bold text-[#c8ff00] mb-4">5. Marketing & Advertising</h2>
                  <div className="space-y-4 text-white/80">
                    <h3 className="text-lg font-semibold text-white">5.1 Approved Materials</h3>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Distributors may only use Company-approved marketing materials</li>
                      <li>Custom materials must be submitted for approval before use</li>
                      <li>All materials must comply with FTC guidelines</li>
                    </ul>
                    
                    <h3 className="text-lg font-semibold text-white mt-4">5.2 Prohibited Claims</h3>
                    <ul className="list-disc list-inside space-y-2">
                      <li>No medical or health claims beyond approved product descriptions</li>
                      <li>No guaranteed income claims or specific earnings projections</li>
                      <li>No misrepresentation of the business opportunity</li>
                      <li>No disparagement of competitors or other distributors</li>
                    </ul>
                    
                    <h3 className="text-lg font-semibold text-white mt-4">5.3 Social Media</h3>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Distributors must identify themselves as independent distributors</li>
                      <li>Income testimonials must include typical results disclaimer</li>
                      <li>Paid advertisements must comply with platform policies</li>
                    </ul>
                  </div>
                </section>

                <section id="nft" className="bg-black/40 border border-white/10 rounded-lg p-6 scroll-mt-28">
                  <h2 className="text-2xl font-bold text-[#c8ff00] mb-4">6. NFT Program Policies</h2>
                  <div className="space-y-4 text-white/80">
                    <ul className="list-disc list-inside space-y-2">
                      <li>NFTs are issued automatically with qualifying pre-orders</li>
                      <li>NFT rarity is determined by order number and cannot be changed</li>
                      <li>Distributors may not make guarantees about NFT values</li>
                      <li>NFT trading is subject to marketplace terms and blockchain fees</li>
                      <li>Company is not responsible for NFT market fluctuations</li>
                    </ul>
                  </div>
                </section>

                <section id="vending" className="bg-black/40 border border-white/10 rounded-lg p-6 scroll-mt-28">
                  <h2 className="text-2xl font-bold text-[#c8ff00] mb-4">7. Vending Machine Operations</h2>
                  <div className="space-y-4 text-white/80">
                    <h3 className="text-lg font-semibold text-white">7.1 Equipment</h3>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Vending machines remain Company property during lease period</li>
                      <li>Distributors are responsible for maintenance and restocking</li>
                      <li>Location changes require Company approval</li>
                    </ul>
                    
                    <h3 className="text-lg font-semibold text-white mt-4">7.2 Revenue Sharing</h3>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Revenue splits are defined in individual vending agreements</li>
                      <li>Location owners receive agreed-upon commissions</li>
                      <li>Sales data must be accurately reported</li>
                    </ul>
                  </div>
                </section>

                <section id="ethics" className="bg-black/40 border border-white/10 rounded-lg p-6 scroll-mt-28">
                  <h2 className="text-2xl font-bold text-[#c8ff00] mb-4">8. Code of Ethics</h2>
                  <div className="space-y-4 text-white/80">
                    <p>All Distributors must:</p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Conduct business with honesty and integrity</li>
                      <li>Respect the rights of other distributors</li>
                      <li>Not engage in cross-line recruiting or interference</li>
                      <li>Maintain confidentiality of Company information</li>
                      <li>Comply with all applicable laws and regulations</li>
                      <li>Represent products and opportunity accurately</li>
                    </ul>
                  </div>
                </section>

                <section id="disciplinary" className="bg-black/40 border border-white/10 rounded-lg p-6 scroll-mt-28">
                  <h2 className="text-2xl font-bold text-[#c8ff00] mb-4">9. Disciplinary Actions</h2>
                  <div className="space-y-4 text-white/80">
                    <p>Violations of these policies may result in:</p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Written warning</li>
                      <li>Commission withholding</li>
                      <li>Territory suspension</li>
                      <li>Rank demotion</li>
                      <li>Termination of distributor agreement</li>
                      <li>Legal action for serious violations</li>
                    </ul>
                    <p className="mt-4">
                      The Company reserves the right to determine appropriate disciplinary measures based on the severity of violations.
                    </p>
                  </div>
                </section>

                <section id="termination" className="bg-black/40 border border-white/10 rounded-lg p-6 scroll-mt-28">
                  <h2 className="text-2xl font-bold text-[#c8ff00] mb-4">10. Termination & Resignation</h2>
                  <div className="space-y-4 text-white/80">
                    <h3 className="text-lg font-semibold text-white">10.1 Voluntary Resignation</h3>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Distributors may resign at any time with written notice</li>
                      <li>Outstanding commissions will be paid within 30 days</li>
                      <li>Territory rights are forfeited upon resignation</li>
                    </ul>
                    
                    <h3 className="text-lg font-semibold text-white mt-4">10.2 Involuntary Termination</h3>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Company may terminate for policy violations</li>
                      <li>Terminated distributors may appeal within 15 days</li>
                      <li>Re-enrollment requires 6-month waiting period</li>
                    </ul>
                  </div>
                </section>

                <section id="disputes" className="bg-black/40 border border-white/10 rounded-lg p-6 scroll-mt-28">
                  <h2 className="text-2xl font-bold text-[#c8ff00] mb-4">11. Dispute Resolution</h2>
                  <p className="text-white/80 leading-relaxed">
                    Any disputes between Distributors and the Company shall first be addressed through our internal grievance process. If unresolved, disputes will be submitted to binding arbitration in Miami-Dade County, Florida, in accordance with the rules of the American Arbitration Association.
                  </p>
                </section>

                <section id="updates" className="bg-black/40 border border-white/10 rounded-lg p-6 scroll-mt-28">
                  <h2 className="text-2xl font-bold text-[#c8ff00] mb-4">12. Policy Updates</h2>
                  <p className="text-white/80 leading-relaxed">
                    The Company reserves the right to modify these Policies & Procedures at any time. Distributors will be notified of material changes via email and through the distributor portal. Continued participation in the program constitutes acceptance of updated policies.
                  </p>
                </section>

                <section id="contact" className="bg-black/40 border border-white/10 rounded-lg p-6 scroll-mt-28">
                  <h2 className="text-2xl font-bold text-[#c8ff00] mb-4">13. Contact</h2>
                  <p className="text-white/80 leading-relaxed">
                    For questions about these Policies & Procedures:
                  </p>
                  <div className="mt-4 text-white/80">
                    <p><strong>NEON Distributor Support</strong></p>
                    <p>Email: distributors@neonenergy.com</p>
                    <p>Phone: 1-800-NEON-ENERGY</p>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
