import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <SEO 
        title="Privacy Policy | NEON Energy Drink"
        description="Learn how NEON Energy Drink collects, uses, and protects your personal information."
      />
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-black text-white mb-8">Privacy Policy</h1>
          <p className="text-white/60 mb-8">Last Updated: January 19, 2026</p>
          
          <div className="prose prose-invert max-w-none space-y-8">
            <section className="bg-black/40 border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[#c8ff00] mb-4">1. Introduction</h2>
              <p className="text-white/80 leading-relaxed">
                Neon Corporation ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our services, or interact with our products, including our NFT offerings and distributor network.
              </p>
            </section>

            <section className="bg-black/40 border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[#c8ff00] mb-4">2. Information We Collect</h2>
              <div className="space-y-4 text-white/80">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Personal Information</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Name, email address, phone number</li>
                    <li>Billing and shipping addresses</li>
                    <li>Payment information (processed securely through third-party providers)</li>
                    <li>Cryptocurrency wallet addresses for NFT transactions</li>
                    <li>Government-issued identification for distributor applications</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Automatically Collected Information</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>IP address and device information</li>
                    <li>Browser type and operating system</li>
                    <li>Pages visited and time spent on site</li>
                    <li>Referring website addresses</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-black/40 border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[#c8ff00] mb-4">3. How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>Process and fulfill orders, including pre-orders and NFT minting</li>
                <li>Manage distributor accounts and territory assignments</li>
                <li>Send promotional communications (with your consent)</li>
                <li>Improve our website, products, and services</li>
                <li>Detect and prevent fraud or unauthorized activities</li>
                <li>Comply with legal obligations</li>
                <li>Facilitate blockchain transactions and NFT ownership verification</li>
              </ul>
            </section>

            <section className="bg-black/40 border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[#c8ff00] mb-4">4. Information Sharing</h2>
              <p className="text-white/80 mb-4">We may share your information with:</p>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li><strong>Service Providers:</strong> Payment processors, shipping companies, cloud hosting providers</li>
                <li><strong>Blockchain Networks:</strong> For NFT minting and verification on public blockchains</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
              </ul>
              <p className="text-white/80 mt-4">
                We do not sell your personal information to third parties for marketing purposes.
              </p>
            </section>

            <section className="bg-black/40 border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[#c8ff00] mb-4">5. NFT Gift Program Data Handling</h2>
              <div className="space-y-4 text-white/80">
                <div className="bg-[#c8ff00]/10 border border-[#c8ff00]/30 rounded-lg p-4 mb-4">
                  <p className="text-[#c8ff00] font-semibold mb-2">NFT Gift Program Notice</p>
                  <p className="text-white/70 text-sm">
                    NFTs are provided as complimentary gifts with qualifying product purchases. For complete legal 
                    disclosures regarding our NFT Gift Program, please review our <a href="/nft-disclosure" className="text-[#c8ff00] hover:underline">NFT Gift Program Disclosure</a>.
                  </p>
                </div>

                <h3 className="text-lg font-semibold text-white">5.1 NFT-Related Data Collection</h3>
                <p>In connection with our NFT Gift Program, we collect and process:</p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Order information to generate unique NFT artwork</li>
                  <li>Digital wallet addresses for NFT delivery (when provided)</li>
                  <li>NFT generation metadata (order number, timestamp, artwork parameters)</li>
                  <li>Blockchain transaction records upon minting</li>
                </ul>

                <h3 className="text-lg font-semibold text-white mt-4">5.2 Blockchain Data Immutability</h3>
                <p>
                  When NFTs are minted to the blockchain (after the 90-day pre-launch period and achievement of 
                  crowdfunding goals), certain information becomes permanently recorded on the public blockchain:
                </p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Your wallet address</li>
                  <li>NFT ownership and transfer history</li>
                  <li>Transaction timestamps and metadata</li>
                </ul>
                <p className="mt-2 text-white/60 text-sm">
                  <strong>Important:</strong> Blockchain data is public and immutable. We cannot delete, modify, or 
                  remove information once recorded on the blockchain. Please consider this before providing a wallet 
                  address for NFT delivery.
                </p>

                <h3 className="text-lg font-semibold text-white mt-4">5.3 NFT Data Retention</h3>
                <p>
                  We retain NFT-related data (artwork, generation parameters, order associations) indefinitely to 
                  support NFT verification and ownership records. Off-chain data may be deleted upon request, but 
                  blockchain records cannot be modified.
                </p>
              </div>
            </section>

            <section className="bg-black/40 border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[#c8ff00] mb-4">6. Data Security</h2>
              <p className="text-white/80 leading-relaxed">
                We implement industry-standard security measures to protect your information, including SSL encryption, secure servers, and regular security audits. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section className="bg-black/40 border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[#c8ff00] mb-4">7. Your Rights</h2>
              <p className="text-white/80 mb-4">Depending on your location, you may have the right to:</p>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your personal information</li>
                <li>Opt-out of marketing communications</li>
                <li>Data portability</li>
                <li>Withdraw consent where processing is based on consent</li>
              </ul>
            </section>

            <section className="bg-black/40 border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[#c8ff00] mb-4">8. Cookies</h2>
              <p className="text-white/80 leading-relaxed">
                We use cookies and similar technologies to enhance your experience, analyze site traffic, and personalize content. You can control cookie preferences through your browser settings. Note that disabling cookies may affect site functionality.
              </p>
            </section>

            <section className="bg-black/40 border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[#c8ff00] mb-4">9. Children's Privacy</h2>
              <p className="text-white/80 leading-relaxed">
                Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a minor, please contact us immediately.
              </p>
            </section>

            <section className="bg-black/40 border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[#c8ff00] mb-4">10. Contact Us</h2>
              <p className="text-white/80 leading-relaxed">
                If you have questions about this Privacy Policy or wish to exercise your rights, please contact us at:
              </p>
              <div className="mt-4 text-white/80">
                <p><strong>Neon Corporation</strong></p>
                <p>Email: privacy@neonenergy.com</p>
                <p>Address: Miami, FL, USA</p>
              </div>
            </section>

            <section className="bg-black/40 border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[#c8ff00] mb-4">11. Changes to This Policy</h2>
              <p className="text-white/80 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last Updated" date. Your continued use of our services after changes constitutes acceptance of the updated policy.
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
