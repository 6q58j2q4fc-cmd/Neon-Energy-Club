import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { AlertTriangle, Shield, Scale, FileText, Info } from "lucide-react";

export default function NftDisclosure() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <SEO 
        title="NFT Gift Program Disclosure | NEON Energy Drink"
        description="Important legal disclosures regarding NEON Energy's NFT gift program, including SEC compliance and securities disclaimers."
      />
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-10 w-10 text-[#c8ff00]" />
            <h1 className="text-4xl font-black text-white">NFT Gift Program Disclosure</h1>
          </div>
          <p className="text-white/60 mb-8">Last Updated: January 31, 2026</p>
          
          {/* Important Notice Banner */}
          <div className="bg-red-900/30 border-2 border-red-500/50 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-8 w-8 text-red-400 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-red-400 mb-2">IMPORTANT LEGAL NOTICE</h2>
                <p className="text-white/80 leading-relaxed">
                  This document contains important legal disclosures regarding NEON Energy's NFT Gift Program. 
                  Please read this entire disclosure carefully before accepting any NFT gift. By accepting an NFT 
                  from NEON Energy, you acknowledge that you have read, understood, and agree to the terms outlined 
                  in this disclosure and our Terms & Conditions.
                </p>
              </div>
            </div>
          </div>

          <div className="prose prose-invert max-w-none space-y-8">
            
            {/* Section 1: Program Overview */}
            <section className="bg-black/40 border border-white/10 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Info className="h-6 w-6 text-[#c8ff00]" />
                <h2 className="text-2xl font-bold text-[#c8ff00] m-0">1. NFT Gift Program Overview</h2>
              </div>
              <div className="space-y-4 text-white/80">
                <p>
                  NEON Energy Corporation ("NEON," "Company," "we," "us," or "our") offers a promotional NFT Gift 
                  Program to customers who purchase qualifying NEON Energy products. This program is designed to 
                  enhance the customer experience by providing unique digital collectible artwork as a complimentary 
                  gift with product purchases.
                </p>
                <div className="bg-[#c8ff00]/10 border border-[#c8ff00]/30 rounded-lg p-4">
                  <p className="font-semibold text-[#c8ff00] mb-2">Key Program Facts:</p>
                  <ul className="list-disc list-inside space-y-1 text-white/70">
                    <li>NFTs are provided as FREE gifts with qualifying product purchases</li>
                    <li>NFTs are NOT sold separately or as standalone products</li>
                    <li>Each NFT features unique AI-generated artwork themed around NEON Energy</li>
                    <li>NFT minting occurs after the 90-day pre-launch period and crowdfunding goal achievement</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 2: Securities Disclaimer */}
            <section className="bg-black/40 border border-white/10 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Scale className="h-6 w-6 text-[#c8ff00]" />
                <h2 className="text-2xl font-bold text-[#c8ff00] m-0">2. Securities Law Disclaimer</h2>
              </div>
              <div className="space-y-4 text-white/80">
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                  <p className="font-bold text-yellow-400 mb-2">NOT A SECURITIES OFFERING</p>
                  <p className="text-white/70">
                    The NFTs provided through this program are NOT securities, investment contracts, or financial 
                    instruments under U.S. federal securities laws, including the Securities Act of 1933 and the 
                    Securities Exchange Act of 1934, or any state securities laws.
                  </p>
                </div>

                <h3 className="text-lg font-semibold text-white mt-6">2.1 Explicit Disclaimers</h3>
                <p>NEON Energy Corporation explicitly represents and warrants that:</p>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li><strong>No Sale of NFTs:</strong> We do not sell, offer for sale, or market NFTs or any digital assets as standalone products or securities</li>
                  <li><strong>No Investment Contract:</strong> NFTs provided through this program do not constitute investment contracts as defined under the Howey Test or any other applicable legal standard</li>
                  <li><strong>No Profit Expectation:</strong> We make no representations, warranties, or promises regarding any potential monetary value, price appreciation, or return on investment</li>
                  <li><strong>No Equity Interest:</strong> NFTs do not represent any equity, ownership interest, voting rights, or profit-sharing rights in NEON Energy Corporation</li>
                  <li><strong>No Dividends or Distributions:</strong> NFT holders are not entitled to dividends, distributions, or any form of financial return from the Company</li>
                  <li><strong>No Common Enterprise:</strong> The NFT Gift Program does not create a common enterprise between NEON Energy and NFT recipients</li>
                </ul>

                <h3 className="text-lg font-semibold text-white mt-6">2.2 Howey Test Analysis</h3>
                <p>
                  Under the U.S. Supreme Court's decision in SEC v. W.J. Howey Co. (1946), an "investment contract" 
                  exists when there is: (1) an investment of money, (2) in a common enterprise, (3) with an expectation 
                  of profits, (4) derived from the efforts of others. NEON Energy's NFT Gift Program does not meet 
                  these criteria because:
                </p>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li><strong>No Investment of Money:</strong> NFTs are provided as free gifts; customers pay only for NEON Energy products</li>
                  <li><strong>No Common Enterprise:</strong> NFT recipients have no ongoing relationship with or stake in NEON Energy's business operations</li>
                  <li><strong>No Expectation of Profits:</strong> NFTs are promotional gifts with no promised or implied monetary value</li>
                  <li><strong>No Reliance on Efforts of Others:</strong> Any value of NFTs, if any, is not dependent on NEON Energy's managerial efforts</li>
                </ul>
              </div>
            </section>

            {/* Section 3: Regulatory Compliance */}
            <section className="bg-black/40 border border-white/10 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-6 w-6 text-[#c8ff00]" />
                <h2 className="text-2xl font-bold text-[#c8ff00] m-0">3. Regulatory Compliance Commitment</h2>
              </div>
              <div className="space-y-4 text-white/80">
                <p>
                  NEON Energy Corporation is committed to full compliance with all applicable federal, state, and 
                  international laws and regulations governing digital assets, cryptocurrencies, and NFTs.
                </p>

                <h3 className="text-lg font-semibold text-white mt-6">3.1 SEC Registration</h3>
                <p>
                  If at any time the U.S. Securities and Exchange Commission (SEC), any state securities regulator, 
                  or any other governmental authority determines that the NFTs provided through this program constitute 
                  securities or require registration, NEON Energy Corporation commits to:
                </p>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li>Promptly register the NFT Gift Program with the appropriate regulatory authorities</li>
                  <li>Comply with all applicable registration, disclosure, and reporting requirements</li>
                  <li>Provide NFT recipients with any required prospectus or disclosure documents</li>
                  <li>Modify or suspend the program as necessary to ensure compliance</li>
                </ul>

                <h3 className="text-lg font-semibold text-white mt-6">3.2 Ongoing Monitoring</h3>
                <p>We actively monitor:</p>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li>SEC guidance and enforcement actions related to NFTs and digital assets</li>
                  <li>FinCEN regulations regarding virtual currencies</li>
                  <li>State-level cryptocurrency and digital asset regulations</li>
                  <li>International regulatory developments in jurisdictions where we operate</li>
                </ul>

                <h3 className="text-lg font-semibold text-white mt-6">3.3 Anti-Money Laundering (AML) Compliance</h3>
                <p>
                  NEON Energy maintains appropriate Know Your Customer (KYC) and Anti-Money Laundering (AML) 
                  procedures in connection with the NFT Gift Program, including identity verification for 
                  NFT recipients where required by law.
                </p>
              </div>
            </section>

            {/* Section 4: Risk Disclosures */}
            <section className="bg-black/40 border border-white/10 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-[#c8ff00]" />
                <h2 className="text-2xl font-bold text-[#c8ff00] m-0">4. Risk Disclosures</h2>
              </div>
              <div className="space-y-4 text-white/80">
                <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
                  <p className="font-bold text-orange-400 mb-2">RISK WARNING</p>
                  <p className="text-white/70">
                    Digital assets, including NFTs, involve significant risks. You should carefully consider 
                    the following risks before accepting any NFT gift.
                  </p>
                </div>

                <h3 className="text-lg font-semibold text-white mt-6">4.1 No Guaranteed Value</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>NFTs provided through this program carry NO guaranteed monetary value</li>
                  <li>NFTs may have zero resale value and may never be sellable</li>
                  <li>Any perceived value is entirely speculative and subject to market conditions</li>
                  <li>Past performance of NFT markets is not indicative of future results</li>
                </ul>

                <h3 className="text-lg font-semibold text-white mt-6">4.2 Market and Volatility Risks</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>The NFT market is highly volatile and speculative</li>
                  <li>NFT values can fluctuate dramatically in short periods</li>
                  <li>Market liquidity for NFTs may be limited or non-existent</li>
                  <li>There is no guarantee of any secondary market for these NFTs</li>
                </ul>

                <h3 className="text-lg font-semibold text-white mt-6">4.3 Technology Risks</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Blockchain technology is evolving and may have undiscovered vulnerabilities</li>
                  <li>Smart contract bugs could affect NFT functionality or ownership</li>
                  <li>Network congestion may delay or prevent transactions</li>
                  <li>Changes to blockchain protocols could impact NFT compatibility</li>
                </ul>

                <h3 className="text-lg font-semibold text-white mt-6">4.4 Security Risks</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>You are solely responsible for securing your digital wallet</li>
                  <li>Lost private keys or wallet access may result in permanent loss of NFTs</li>
                  <li>Phishing attacks and scams targeting NFT holders are common</li>
                  <li>NEON Energy cannot recover lost or stolen NFTs</li>
                </ul>

                <h3 className="text-lg font-semibold text-white mt-6">4.5 Regulatory Risks</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Regulatory treatment of NFTs may change</li>
                  <li>New laws or regulations could restrict NFT ownership or transfer</li>
                  <li>Tax treatment of NFTs varies by jurisdiction and may change</li>
                  <li>Some jurisdictions may prohibit NFT ownership entirely</li>
                </ul>
              </div>
            </section>

            {/* Section 5: Minting Timeline */}
            <section className="bg-black/40 border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[#c8ff00] mb-4">5. NFT Minting Timeline & Conditions</h2>
              <div className="space-y-4 text-white/80">
                <p>
                  NFT artwork is generated at the time of qualifying product purchase. However, actual minting 
                  of NFTs to the blockchain is subject to the following conditions:
                </p>
                
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-[#c8ff00]">90</p>
                    <p className="text-sm text-white/60">Day Pre-Launch Period</p>
                    <p className="text-xs text-white/40 mt-2">Must be completed</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-[#c8ff00]">100%</p>
                    <p className="text-sm text-white/60">Crowdfunding Goal</p>
                    <p className="text-xs text-white/40 mt-2">Must be achieved</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-[#c8ff00]">✓</p>
                    <p className="text-sm text-white/60">Regulatory Approval</p>
                    <p className="text-xs text-white/40 mt-2">If required</p>
                  </div>
                </div>

                <p className="mt-4">
                  If crowdfunding goals are not met or if regulatory requirements prevent minting, NEON Energy 
                  reserves the right to provide alternative promotional items or refund the product purchase 
                  price in accordance with our refund policy.
                </p>
              </div>
            </section>

            {/* Section 6: Jurisdiction */}
            <section className="bg-black/40 border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[#c8ff00] mb-4">6. Jurisdictional Limitations</h2>
              <div className="space-y-4 text-white/80">
                <p>
                  The NFT Gift Program may not be available in all jurisdictions. By accepting an NFT gift, 
                  you represent and warrant that:
                </p>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li>You are legally permitted to receive and hold NFTs in your jurisdiction</li>
                  <li>You are not a resident of any jurisdiction where NFT ownership is prohibited</li>
                  <li>You are at least 18 years of age or the age of majority in your jurisdiction</li>
                  <li>You will comply with all applicable local laws regarding digital assets</li>
                </ul>
                <p className="mt-4">
                  NEON Energy reserves the right to restrict or prohibit participation in the NFT Gift Program 
                  in any jurisdiction where such participation would violate applicable laws or regulations.
                </p>
              </div>
            </section>

            {/* Section 7: Tax Considerations */}
            <section className="bg-black/40 border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[#c8ff00] mb-4">7. Tax Considerations</h2>
              <div className="space-y-4 text-white/80">
                <p>
                  Receipt of an NFT gift may have tax implications depending on your jurisdiction. You are 
                  solely responsible for:
                </p>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li>Determining any tax obligations arising from receiving an NFT gift</li>
                  <li>Reporting NFT gifts to relevant tax authorities as required</li>
                  <li>Paying any applicable taxes on NFT gifts or subsequent dispositions</li>
                  <li>Consulting with a qualified tax professional regarding your specific situation</li>
                </ul>
                <p className="mt-4 text-white/60 text-sm">
                  NEON Energy does not provide tax advice. The information in this disclosure is for general 
                  informational purposes only and should not be construed as tax advice.
                </p>
              </div>
            </section>

            {/* Section 8: Contact */}
            <section className="bg-black/40 border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[#c8ff00] mb-4">8. Contact Information</h2>
              <div className="space-y-4 text-white/80">
                <p>
                  For questions about this NFT Gift Program Disclosure or our NFT program, please contact:
                </p>
                <div className="mt-4">
                  <p><strong>NEON Energy Corporation</strong></p>
                  <p>Legal Department</p>
                  <p>Email: legal@neonenergy.com</p>
                  <p>Address: Miami, FL, USA</p>
                </div>
              </div>
            </section>

            {/* Acknowledgment */}
            <section className="bg-[#c8ff00]/10 border border-[#c8ff00]/30 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[#c8ff00] mb-4">Acknowledgment</h2>
              <p className="text-white/80">
                By accepting an NFT gift from NEON Energy, you acknowledge that you have read, understood, 
                and agree to all terms and conditions outlined in this NFT Gift Program Disclosure, our 
                Terms & Conditions, and our Privacy Policy. You further acknowledge that you accept all 
                risks associated with receiving and holding NFTs as described herein.
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
