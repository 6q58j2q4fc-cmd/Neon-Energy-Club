import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <SEO 
        title="Terms & Conditions | NEON Energy Drink"
        description="Read the terms and conditions governing your use of NEON Energy Drink's website and services."
      />
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-black text-white mb-8">Terms & Conditions</h1>
          <p className="text-white/60 mb-8">Last Updated: January 19, 2026</p>
          
          <div className="prose prose-invert max-w-none space-y-8">
            <section className="bg-black/40 border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[#c8ff00] mb-4">1. Acceptance of Terms</h2>
              <p className="text-white/80 leading-relaxed">
                By accessing or using the NEON Energy Drink website, mobile applications, or any services provided by Neon Corporation ("Company," "we," "us," or "our"), you agree to be bound by these Terms & Conditions. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section className="bg-black/40 border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[#c8ff00] mb-4">2. Pre-Order Terms</h2>
              <div className="space-y-4 text-white/80">
                <p>By placing a pre-order, you acknowledge and agree that:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Pre-orders are non-refundable except as required by applicable law</li>
                  <li>Estimated delivery dates are subject to change</li>
                  <li>Product specifications may vary slightly from promotional materials</li>
                  <li>Payment is processed at the time of pre-order</li>
                  <li>You will receive email updates regarding your order status</li>
                </ul>
              </div>
            </section>

            <section className="bg-black/40 border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[#c8ff00] mb-4">3. NFT Terms</h2>
              <div className="space-y-4 text-white/80">
                <p>NEON Genesis NFTs are digital collectibles minted on the Polygon blockchain. By participating in our NFT program:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>You receive a limited license to display the NFT artwork for personal, non-commercial use</li>
                  <li>NFTs are provided "as is" without warranties of any kind</li>
                  <li>Estimated values are speculative and not guaranteed</li>
                  <li>We are not responsible for blockchain network fees or delays</li>
                  <li>NFT ownership is determined by blockchain records, not our internal systems</li>
                  <li>You are responsible for maintaining security of your wallet</li>
                  <li>Lost wallet access may result in permanent loss of NFTs</li>
                </ul>
              </div>
            </section>

            <section className="bg-black/40 border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[#c8ff00] mb-4">4. Distributor Agreement</h2>
              <div className="space-y-4 text-white/80">
                <p>Individuals applying to become NEON distributors must:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Be at least 18 years of age</li>
                  <li>Provide accurate personal and business information</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Adhere to our Policies & Procedures document</li>
                  <li>Not make unauthorized claims about products or income potential</li>
                  <li>Maintain ethical business practices</li>
                </ul>
                <p className="mt-4">
                  Territory assignments are subject to approval and may be revoked for violations of these terms or our Policies & Procedures.
                </p>
              </div>
            </section>

            <section className="bg-black/40 border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[#c8ff00] mb-4">5. Crowdfunding Terms</h2>
              <div className="space-y-4 text-white/80">
                <p>Contributions to our crowdfunding campaign are subject to the following:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Contributions are considered investments in the company's growth</li>
                  <li>Rewards and perks are delivered upon reaching funding milestones</li>
                  <li>Refunds are available only if minimum funding goals are not met</li>
                  <li>Delivery timelines for rewards are estimates and may vary</li>
                </ul>
              </div>
            </section>

            <section className="bg-black/40 border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[#c8ff00] mb-4">6. Intellectual Property</h2>
              <p className="text-white/80 leading-relaxed">
                All content on this website, including but not limited to text, graphics, logos, images, audio clips, video clips, data compilations, and software, is the property of Neon Corporation or its content suppliers and is protected by international copyright laws. The NEON name, logo, and all related names, logos, product and service names, designs, and slogans are trademarks of Neon Corporation.
              </p>
            </section>

            <section className="bg-black/40 border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[#c8ff00] mb-4">7. User Conduct</h2>
              <p className="text-white/80 mb-4">You agree not to:</p>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>Use our services for any unlawful purpose</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt our services</li>
                <li>Transmit malware, viruses, or harmful code</li>
                <li>Impersonate any person or entity</li>
                <li>Engage in fraudulent activities</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </section>

            <section className="bg-black/40 border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[#c8ff00] mb-4">8. Disclaimer of Warranties</h2>
              <p className="text-white/80 leading-relaxed">
                OUR SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT OUR SERVICES WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.
              </p>
            </section>

            <section className="bg-black/40 border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[#c8ff00] mb-4">9. Limitation of Liability</h2>
              <p className="text-white/80 leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, NEON CORPORATION SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF OR INABILITY TO USE OUR SERVICES.
              </p>
            </section>

            <section className="bg-black/40 border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[#c8ff00] mb-4">10. Indemnification</h2>
              <p className="text-white/80 leading-relaxed">
                You agree to indemnify, defend, and hold harmless Neon Corporation and its officers, directors, employees, agents, and affiliates from any claims, damages, losses, liabilities, costs, and expenses arising from your use of our services or violation of these terms.
              </p>
            </section>

            <section className="bg-black/40 border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[#c8ff00] mb-4">11. Governing Law</h2>
              <p className="text-white/80 leading-relaxed">
                These Terms & Conditions shall be governed by and construed in accordance with the laws of the State of Florida, United States, without regard to its conflict of law provisions. Any disputes arising from these terms shall be resolved in the courts of Miami-Dade County, Florida.
              </p>
            </section>

            <section className="bg-black/40 border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[#c8ff00] mb-4">12. Changes to Terms</h2>
              <p className="text-white/80 leading-relaxed">
                We reserve the right to modify these Terms & Conditions at any time. Changes will be effective immediately upon posting to this page. Your continued use of our services after changes constitutes acceptance of the modified terms. We encourage you to review these terms periodically.
              </p>
            </section>

            <section className="bg-black/40 border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[#c8ff00] mb-4">13. Contact Information</h2>
              <p className="text-white/80 leading-relaxed">
                For questions about these Terms & Conditions, please contact us at:
              </p>
              <div className="mt-4 text-white/80">
                <p><strong>Neon Corporation</strong></p>
                <p>Email: legal@neonenergy.com</p>
                <p>Address: Miami, FL, USA</p>
              </div>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
