import { useEffect } from "react";

export default function TermsAndConditions() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container max-w-4xl mx-auto">
        <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            NEON CORPORATION TERMS AND CONDITIONS
          </h1>
          <p className="text-muted-foreground mb-8">
            <strong>Effective Date:</strong> February 5, 2026 | <strong>Version:</strong> 1.0
          </p>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">1. ACCEPTANCE OF TERMS</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms and Conditions ("Terms") govern your access to and use of the NEON Corporation website, products, services, and Independent Distributor program (collectively, the "Services"). By accessing or using the Services, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Services.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                NEON Corporation ("NEON," "Company," "we," "us," or "our") reserves the right to modify these Terms at any time. We will notify you of material changes by posting the updated Terms on our website. Your continued use of the Services after such changes constitutes your acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">2. ELIGIBILITY</h2>
              <p className="text-muted-foreground leading-relaxed">
                You must be at least 18 years of age to use the Services or become an Independent Distributor. By using the Services, you represent and warrant that you meet this age requirement and have the legal capacity to enter into these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">3. INDEPENDENT DISTRIBUTOR AGREEMENT</h2>
              
              <h3 className="text-xl font-semibold text-foreground mb-2">3.1 Relationship</h3>
              <p className="text-muted-foreground leading-relaxed">
                Independent Distributors are independent contractors, not employees, agents, partners, or joint venturers of NEON. Distributors have no authority to bind NEON or make representations on behalf of NEON except as expressly authorized in writing.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">3.2 No Guaranteed Income</h3>
              <p className="text-muted-foreground leading-relaxed">
                NEON makes no guarantee of income or earnings. Success as a Distributor requires significant time, effort, and skill. Most Distributors earn little or no income. Past performance is not indicative of future results.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">3.3 Business Expenses</h3>
              <p className="text-muted-foreground leading-relaxed">
                Distributors are responsible for all expenses incurred in operating their business, including but not limited to product purchases, marketing materials, travel, and telecommunications.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">3.4 Compliance</h3>
              <p className="text-muted-foreground leading-relaxed">
                Distributors must comply with all applicable laws and regulations, including business licensing requirements, tax obligations, and consumer protection laws. Distributors are solely responsible for determining and fulfilling their tax obligations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">4. PRODUCTS AND SERVICES</h2>
              
              <h3 className="text-xl font-semibold text-foreground mb-2">4.1 Product Descriptions</h3>
              <p className="text-muted-foreground leading-relaxed">
                NEON attempts to provide accurate product descriptions and pricing. However, we do not warrant that product descriptions, pricing, or other content on our website is accurate, complete, reliable, current, or error-free.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">4.2 Product Availability</h3>
              <p className="text-muted-foreground leading-relaxed">
                All products are subject to availability. NEON reserves the right to discontinue any product at any time without notice.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">4.3 Pricing</h3>
              <p className="text-muted-foreground leading-relaxed">
                Prices are subject to change without notice. NEON reserves the right to correct pricing errors on our website or in orders.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">4.4 Product Claims</h3>
              <p className="text-muted-foreground leading-relaxed">
                NEON products are dietary supplements and are not intended to diagnose, treat, cure, or prevent any disease. Statements regarding products have not been evaluated by the Food and Drug Administration.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">5. ORDERS AND PAYMENTS</h2>
              
              <h3 className="text-xl font-semibold text-foreground mb-2">5.1 Order Acceptance</h3>
              <p className="text-muted-foreground leading-relaxed">
                All orders are subject to acceptance by NEON. We reserve the right to refuse or cancel any order for any reason, including but not limited to product availability, errors in pricing or product information, or suspected fraud.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">5.2 Payment Methods</h3>
              <p className="text-muted-foreground leading-relaxed">
                We accept major credit cards, debit cards, and other payment methods as indicated on our website. By providing payment information, you represent and warrant that you are authorized to use the payment method.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">5.3 Auto-Ship Program</h3>
              <p className="text-muted-foreground leading-relaxed">
                Distributors and customers may enroll in an auto-ship program for automatic recurring shipments. You authorize NEON to charge your payment method on a recurring basis. You may cancel auto-ship at any time through your account settings or by contacting customer service.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">5.4 Taxes</h3>
              <p className="text-muted-foreground leading-relaxed">
                Prices do not include applicable sales taxes. You are responsible for all applicable taxes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">6. SHIPPING AND DELIVERY</h2>
              
              <h3 className="text-xl font-semibold text-foreground mb-2">6.1 Shipping</h3>
              <p className="text-muted-foreground leading-relaxed">
                NEON ships products to addresses within the United States and select international locations. Shipping costs and delivery times vary based on destination and shipping method.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">6.2 Risk of Loss</h3>
              <p className="text-muted-foreground leading-relaxed">
                Risk of loss and title for products pass to you upon delivery to the carrier.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">6.3 Delivery Issues</h3>
              <p className="text-muted-foreground leading-relaxed">
                NEON is not responsible for delays or failures in delivery caused by carriers or circumstances beyond our control.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">7. RETURNS AND REFUNDS</h2>
              
              <h3 className="text-xl font-semibold text-foreground mb-2">7.1 Customer Satisfaction Guarantee</h3>
              <p className="text-muted-foreground leading-relaxed">
                We offer a 30-day satisfaction guarantee. Customers may return unopened products within 30 days of purchase for a full refund of the purchase price, less shipping costs.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">7.2 Return Process</h3>
              <p className="text-muted-foreground leading-relaxed">
                To initiate a return, contact customer service for a Return Merchandise Authorization (RMA) number. Products must be returned in their original packaging with the RMA number clearly marked.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">7.3 Refund Processing</h3>
              <p className="text-muted-foreground leading-relaxed">
                Refunds will be processed within 10 business days of receipt of the returned product. Refunds will be issued to the original payment method.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">7.4 Distributor Buyback</h3>
              <p className="text-muted-foreground leading-relaxed">
                Upon termination of a Distributorship, NEON will repurchase marketable, unopened products purchased within the prior 12 months at 90% of the original purchase price, less any commissions earned on those products.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">8. INTELLECTUAL PROPERTY</h2>
              
              <h3 className="text-xl font-semibold text-foreground mb-2">8.1 Ownership</h3>
              <p className="text-muted-foreground leading-relaxed">
                All content on the NEON website, including but not limited to text, graphics, logos, images, and software, is the property of NEON or its licensors and is protected by copyright, trademark, and other intellectual property laws.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">8.2 Limited License</h3>
              <p className="text-muted-foreground leading-relaxed">
                NEON grants you a limited, non-exclusive, non-transferable license to access and use the Services for personal or business purposes in accordance with these Terms. You may not reproduce, distribute, modify, create derivative works of, publicly display, or exploit any content without express written permission from NEON.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">8.3 Trademarks</h3>
              <p className="text-muted-foreground leading-relaxed">
                "NEON," the NEON logo, and other NEON marks are trademarks of NEON Corporation. You may not use these trademarks without prior written permission from NEON.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">9. USER ACCOUNTS</h2>
              
              <h3 className="text-xl font-semibold text-foreground mb-2">9.1 Account Creation</h3>
              <p className="text-muted-foreground leading-relaxed">
                To access certain features of the Services, you must create an account. You agree to provide accurate, current, and complete information and to update your information as necessary.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">9.2 Account Security</h3>
              <p className="text-muted-foreground leading-relaxed">
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify NEON immediately of any unauthorized use of your account.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">9.3 Account Termination</h3>
              <p className="text-muted-foreground leading-relaxed">
                NEON reserves the right to suspend or terminate your account at any time for violation of these Terms or for any other reason at our sole discretion.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">10. PRIVACY</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your use of the Services is subject to our Privacy Policy, which is incorporated into these Terms by reference. Please review our Privacy Policy to understand our practices regarding the collection, use, and disclosure of your personal information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">11. PROHIBITED CONDUCT</h2>
              <p className="text-muted-foreground leading-relaxed mb-2">You agree not to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Use the Services for any illegal purpose or in violation of any applicable laws</li>
                <li>Impersonate any person or entity or falsely state or misrepresent your affiliation with any person or entity</li>
                <li>Interfere with or disrupt the Services or servers or networks connected to the Services</li>
                <li>Attempt to gain unauthorized access to any portion of the Services or any other systems or networks</li>
                <li>Use any automated means to access the Services or collect information from the Services</li>
                <li>Transmit any viruses, worms, or other malicious code</li>
                <li>Engage in any conduct that restricts or inhibits any other person from using or enjoying the Services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">12. DISCLAIMERS</h2>
              
              <h3 className="text-xl font-semibold text-foreground mb-2">12.1 No Warranties</h3>
              <p className="text-muted-foreground leading-relaxed uppercase">
                THE SERVICES AND ALL PRODUCTS ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">12.2 No Guarantee of Results</h3>
              <p className="text-muted-foreground leading-relaxed uppercase">
                NEON DOES NOT WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS. NEON DOES NOT GUARANTEE ANY SPECIFIC RESULTS FROM USE OF THE SERVICES OR PRODUCTS.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">13. LIMITATION OF LIABILITY</h2>
              <p className="text-muted-foreground leading-relaxed uppercase mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, NEON SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 uppercase">
                <li>YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICES</li>
                <li>ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICES</li>
                <li>ANY CONTENT OBTAINED FROM THE SERVICES</li>
                <li>UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed uppercase mt-4">
                IN NO EVENT SHALL NEON'S TOTAL LIABILITY TO YOU FOR ALL DAMAGES, LOSSES, OR CAUSES OF ACTION EXCEED THE AMOUNT YOU HAVE PAID TO NEON IN THE TWELVE (12) MONTHS PRIOR TO THE EVENT GIVING RISE TO LIABILITY, OR ONE HUNDRED DOLLARS ($100), WHICHEVER IS GREATER.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">14. INDEMNIFICATION</h2>
              <p className="text-muted-foreground leading-relaxed">
                You agree to indemnify, defend, and hold harmless NEON and its officers, directors, employees, agents, and affiliates from and against any and all claims, liabilities, damages, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising from:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-2">
                <li>Your use of the Services</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any rights of another party</li>
                <li>Your conduct in connection with the Services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">15. DISPUTE RESOLUTION</h2>
              
              <h3 className="text-xl font-semibold text-foreground mb-2">15.1 Governing Law</h3>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law principles.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">15.2 Arbitration Agreement</h3>
              <p className="text-muted-foreground leading-relaxed">
                Any dispute, claim, or controversy arising out of or relating to these Terms or the Services shall be resolved by binding arbitration administered by the American Arbitration Association ("AAA") in accordance with its Commercial Arbitration Rules. The arbitration shall take place in Wilmington, Delaware, unless otherwise agreed by the parties.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">15.3 Class Action Waiver</h3>
              <p className="text-muted-foreground leading-relaxed uppercase">
                YOU AGREE THAT ANY ARBITRATION OR PROCEEDING SHALL BE LIMITED TO THE DISPUTE BETWEEN YOU AND NEON INDIVIDUALLY. YOU WAIVE ANY RIGHT TO PARTICIPATE IN A CLASS ACTION LAWSUIT OR CLASS-WIDE ARBITRATION.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">15.4 Exceptions</h3>
              <p className="text-muted-foreground leading-relaxed">
                Notwithstanding the above, either party may seek injunctive or other equitable relief in any court of competent jurisdiction to prevent the actual or threatened infringement, misappropriation, or violation of intellectual property rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">16. GENERAL PROVISIONS</h2>
              
              <h3 className="text-xl font-semibold text-foreground mb-2">16.1 Entire Agreement</h3>
              <p className="text-muted-foreground leading-relaxed">
                These Terms, together with the Privacy Policy and any other policies incorporated by reference, constitute the entire agreement between you and NEON regarding the Services.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">16.2 Severability</h3>
              <p className="text-muted-foreground leading-relaxed">
                If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">16.3 Waiver</h3>
              <p className="text-muted-foreground leading-relaxed">
                No waiver of any term of these Terms shall be deemed a further or continuing waiver of such term or any other term.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">16.4 Assignment</h3>
              <p className="text-muted-foreground leading-relaxed">
                You may not assign or transfer these Terms or your rights hereunder without NEON's prior written consent. NEON may assign these Terms without restriction.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">16.5 Force Majeure</h3>
              <p className="text-muted-foreground leading-relaxed">
                NEON shall not be liable for any failure or delay in performance due to causes beyond its reasonable control, including but not limited to acts of God, war, terrorism, riots, embargoes, acts of civil or military authorities, fire, floods, accidents, pandemics, strikes, or shortages of transportation, facilities, fuel, energy, labor, or materials.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">17. CONTACT INFORMATION</h2>
              <p className="text-muted-foreground leading-relaxed">
                For questions regarding these Terms, please contact:
              </p>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="font-semibold text-foreground">NEON Corporation</p>
                <p className="text-muted-foreground">Customer Service</p>
                <p className="text-muted-foreground">Email: support@neoncorporation.com</p>
                <p className="text-muted-foreground">Phone: 1-800-NEON-ENERGY</p>
                <p className="text-muted-foreground">Address: 123 Energy Drive, Wilmington, DE 19801</p>
              </div>
            </section>

            <div className="mt-12 p-6 bg-primary/10 border border-primary rounded-lg">
              <p className="text-foreground font-semibold text-center">
                Last Updated: February 5, 2026
              </p>
              <p className="text-foreground text-center mt-2">
                By using the Services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
