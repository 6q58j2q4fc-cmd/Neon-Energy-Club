import { useEffect } from "react";

export default function PoliciesAndProcedures() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container max-w-4xl mx-auto">
        <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            NEON CORPORATION POLICIES AND PROCEDURES
          </h1>
          <p className="text-muted-foreground mb-8">
            <strong>Effective Date:</strong> February 5, 2026 | <strong>Version:</strong> 1.0
          </p>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">1. INTRODUCTION</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Policies and Procedures ("Policies") are incorporated into and form an integral part of the NEON Corporation Independent Distributor Agreement ("Agreement"). These Policies, as amended at the sole discretion of NEON Corporation ("NEON," "Company," "we," or "us"), govern the relationship between NEON and its Independent Distributors. Throughout these Policies, the term "you" or "Distributor" refers to the Independent Distributor.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                NEON reserves the right to amend these Policies at its sole discretion. Notification of amendments will be published in official Company materials, which may include but are not limited to: the Company website, Company emails, the Distributor back office, or in Company periodicals. Continued business activity as a Distributor constitutes acceptance of any and all amendments.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">2. DISTRIBUTOR CONDUCT</h2>
              
              <h3 className="text-xl font-semibold text-foreground mb-2">2.1 Professional Standards</h3>
              <p className="text-muted-foreground leading-relaxed">
                Distributors must conduct themselves with honesty, integrity, and professionalism in all business dealings. Distributors shall not engage in any deceptive, misleading, unethical, or illegal conduct.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">2.2 Compliance with Laws</h3>
              <p className="text-muted-foreground leading-relaxed">
                Distributors must comply with all applicable federal, state, and local laws and regulations in the conduct of their business, including but not limited to business licensing requirements, tax obligations, and consumer protection laws.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">2.3 Prohibited Activities</h3>
              <p className="text-muted-foreground leading-relaxed mb-2">Distributors shall not:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Make any income claims or representations about potential earnings except as specifically authorized by NEON in writing</li>
                <li>Make any unauthorized claims regarding NEON products, including health or medical claims</li>
                <li>Advertise or promote NEON products or the opportunity on any online or offline medium without prior written approval from NEON</li>
                <li>Use NEON's trademarks, trade names, or copyrighted materials without express written permission</li>
                <li>Engage in cross-recruiting or recruiting NEON Distributors into other network marketing opportunities</li>
                <li>Purchase products for the primary purpose of qualifying for commissions or bonuses ("inventory loading")</li>
                <li>Sell NEON products through online auction sites, retail establishments, or other unauthorized channels</li>
                <li>Represent themselves as employees or agents of NEON</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">3. ENROLLMENT AND SPONSORSHIP</h2>
              
              <h3 className="text-xl font-semibold text-foreground mb-2">3.1 Eligibility</h3>
              <p className="text-muted-foreground leading-relaxed mb-2">To become a NEON Distributor, an applicant must:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Be at least 18 years of age</li>
                <li>Reside in a country or territory where NEON is authorized business</li>
                <li>Complete and submit a Distributor Application</li>
                <li>Pay the applicable enrollment fee</li>
                <li>Agree to the terms of the Distributor Agreement and these Policies</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">3.2 One Distributorship Per Person</h3>
              <p className="text-muted-foreground leading-relaxed">
                Each individual may maintain only one Distributorship. Spouses may apply for a joint Distributorship or maintain separate Distributorships, but not both.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">3.3 Sponsorship</h3>
              <p className="text-muted-foreground leading-relaxed">
                Every Distributor must be sponsored by an existing Distributor. The sponsor is responsible for training and supporting their personally sponsored Distributors. Sponsors must not misrepresent the NEON opportunity or make unauthorized income claims.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">3.4 Sponsor Changes</h3>
              <p className="text-muted-foreground leading-relaxed">
                Sponsor changes are generally not permitted except in cases of death, divorce, or other extraordinary circumstances as determined by NEON in its sole discretion.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">4. COMMISSIONS AND BONUSES</h2>
              
              <h3 className="text-xl font-semibold text-foreground mb-2">4.1 Commission Qualification</h3>
              <p className="text-muted-foreground leading-relaxed">
                Distributors must be active and in good standing to qualify for commissions and bonuses. "Active" means the Distributor has purchased products for personal use or resale during the commission period.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">4.2 Commission Payments</h3>
              <p className="text-muted-foreground leading-relaxed">
                Commissions are calculated and paid monthly. NEON reserves the right to withhold commissions pending resolution of disputes, chargebacks, or compliance issues.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">4.3 Tax Reporting</h3>
              <p className="text-muted-foreground leading-relaxed">
                Distributors are responsible for all applicable taxes on their earnings. NEON will issue IRS Form 1099 to U.S. Distributors who earn $600 or more in a calendar year.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">4.4 Chargebacks</h3>
              <p className="text-muted-foreground leading-relaxed">
                If a customer returns a product or requests a refund, any commissions paid on that sale will be deducted from the Distributor's future commission payments.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">5. PRODUCT PURCHASES AND RETURNS</h2>
              
              <h3 className="text-xl font-semibold text-foreground mb-2">5.1 Personal Consumption</h3>
              <p className="text-muted-foreground leading-relaxed">
                Products purchased by Distributors should be for personal consumption or for resale to retail customers. Distributors shall not purchase products solely to qualify for commissions or bonuses.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">5.2 Retail Sales</h3>
              <p className="text-muted-foreground leading-relaxed">
                Distributors are encouraged to sell products to retail customers at the suggested retail price. Distributors may set their own retail prices but must comply with all applicable laws.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">5.3 Return Policy</h3>
              <p className="text-muted-foreground leading-relaxed">
                NEON offers a 30-day satisfaction guarantee. Customers may return unopened products within 30 days of purchase for a full refund. Distributors who return products will have any commissions earned on those products deducted from future earnings.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">5.4 Distributor Buyback</h3>
              <p className="text-muted-foreground leading-relaxed">
                Upon termination of a Distributorship, NEON will repurchase marketable, unopened products purchased within the prior 12 months at 90% of the original purchase price, less any commissions earned on those products.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">6. MARKETING AND ADVERTISING</h2>
              
              <h3 className="text-xl font-semibold text-foreground mb-2">6.1 Approved Materials</h3>
              <p className="text-muted-foreground leading-relaxed">
                Distributors may only use marketing materials that have been approved by NEON. Use of unapproved materials may result in disciplinary action.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">6.2 Online Marketing</h3>
              <p className="text-muted-foreground leading-relaxed">
                Distributors must obtain prior written approval before creating websites, social media pages, or other online properties that reference NEON, its products, or the business opportunity.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">6.3 Domain Names and URLs</h3>
              <p className="text-muted-foreground leading-relaxed">
                Distributors may not register domain names or URLs that include NEON's trademarks or trade names without express written permission.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">6.4 Income Claims</h3>
              <p className="text-muted-foreground leading-relaxed">
                Distributors may not make income claims or representations about potential earnings except as specifically authorized by NEON in writing. All income disclosures must comply with FTC guidelines.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">6.5 Product Claims</h3>
              <p className="text-muted-foreground leading-relaxed">
                Distributors may not make health, medical, or therapeutic claims about NEON products. All product claims must be substantiated and approved by NEON.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">7. REPLICATED WEBSITES</h2>
              
              <h3 className="text-xl font-semibold text-foreground mb-2">7.1 Provision of Websites</h3>
              <p className="text-muted-foreground leading-relaxed">
                NEON provides each Distributor with a replicated website for marketing purposes. The content of these websites is controlled by NEON and may not be modified by Distributors.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">7.2 Website Fees</h3>
              <p className="text-muted-foreground leading-relaxed">
                Distributors may be charged a monthly fee for the use of their replicated website. Failure to pay website fees may result in suspension of the website.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">7.3 Custom Domains</h3>
              <p className="text-muted-foreground leading-relaxed">
                Distributors may link a custom domain name to their replicated website, subject to NEON's approval and compliance with trademark policies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">8. TERMINATION AND RENEWAL</h2>
              
              <h3 className="text-xl font-semibold text-foreground mb-2">8.1 Term</h3>
              <p className="text-muted-foreground leading-relaxed">
                The Distributorship term is one year from the date of enrollment. Distributorships renew automatically upon payment of the annual renewal fee.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">8.2 Voluntary Termination</h3>
              <p className="text-muted-foreground leading-relaxed">
                A Distributor may terminate their Distributorship at any time by providing written notice to NEON.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">8.3 Involuntary Termination</h3>
              <p className="text-muted-foreground leading-relaxed">
                NEON may terminate a Distributorship for violation of the Distributor Agreement, these Policies, or applicable laws. Termination may result in forfeiture of commissions and bonuses.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">8.4 Effect of Termination</h3>
              <p className="text-muted-foreground leading-relaxed mb-2">Upon termination, the Distributor must:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Cease representing themselves as a NEON Distributor</li>
                <li>Cease using NEON trademarks, trade names, and copyrighted materials</li>
                <li>Return all NEON materials and samples</li>
                <li>Discontinue use of their replicated website</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">9. DISPUTE RESOLUTION</h2>
              
              <h3 className="text-xl font-semibold text-foreground mb-2">9.1 Mediation</h3>
              <p className="text-muted-foreground leading-relaxed">
                Any dispute arising out of or relating to the Distributor Agreement or these Policies shall first be submitted to non-binding mediation.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">9.2 Arbitration</h3>
              <p className="text-muted-foreground leading-relaxed">
                If mediation is unsuccessful, the dispute shall be resolved by binding arbitration in accordance with the rules of the American Arbitration Association.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">9.3 Class Action Waiver</h3>
              <p className="text-muted-foreground leading-relaxed">
                Distributors waive the right to participate in class action lawsuits against NEON.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">10. GENERAL PROVISIONS</h2>
              
              <h3 className="text-xl font-semibold text-foreground mb-2">10.1 Entire Agreement</h3>
              <p className="text-muted-foreground leading-relaxed">
                The Distributor Agreement and these Policies constitute the entire agreement between NEON and the Distributor.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">10.2 Severability</h3>
              <p className="text-muted-foreground leading-relaxed">
                If any provision of these Policies is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">10.3 Governing Law</h3>
              <p className="text-muted-foreground leading-relaxed">
                These Policies shall be governed by the laws of the State of Delaware, without regard to conflict of law principles.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">10.4 Amendments</h3>
              <p className="text-muted-foreground leading-relaxed">
                NEON reserves the right to amend these Policies at any time. Continued business activity as a Distributor constitutes acceptance of amendments.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">11. CONTACT INFORMATION</h2>
              <p className="text-muted-foreground leading-relaxed">
                For questions regarding these Policies, please contact:
              </p>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="font-semibold text-foreground">NEON Corporation</p>
                <p className="text-muted-foreground">Distributor Support</p>
                <p className="text-muted-foreground">Email: support@neoncorporation.com</p>
                <p className="text-muted-foreground">Phone: 1-800-NEON-ENERGY</p>
              </div>
            </section>

            <div className="mt-12 p-6 bg-primary/10 border border-primary rounded-lg">
              <p className="text-foreground font-semibold text-center">
                By enrolling as a NEON Distributor, you acknowledge that you have read, understood, and agree to comply with these Policies and Procedures.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
