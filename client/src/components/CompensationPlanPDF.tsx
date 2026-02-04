import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";

// CV Structure explanation
const cvStructure = {
  firstOrder: {
    title: "First Order CV (Commissionable Volume)",
    percentage: "50%",
    description: "New customer/distributor first orders earn 50% CV to encourage team building",
    example: "A $100 first order = 50 CV for commission calculations"
  },
  recurring: {
    title: "Recurring Order CV (Full Volume)",
    percentage: "100%",
    description: "All subsequent orders earn full 100% CV for maximum earnings",
    example: "A $100 recurring order = 100 CV for commission calculations"
  }
};

// Rank advancement requirements
const rankRequirements = [
  { rank: "Starter", pv: 0, tv: 0, lesserLeg: 0, color: "#9ca3af", bonus: "$0" },
  { rank: "Bronze", pv: 100, tv: 500, lesserLeg: 200, color: "#d97706", bonus: "$100" },
  { rank: "Silver", pv: 100, tv: 2000, lesserLeg: 800, color: "#94a3b8", bonus: "$250" },
  { rank: "Gold", pv: 100, tv: 5000, lesserLeg: 2000, color: "#eab308", bonus: "$500" },
  { rank: "Platinum", pv: 100, tv: 15000, lesserLeg: 6000, color: "#cbd5e1", bonus: "$1,000" },
  { rank: "Diamond", pv: 100, tv: 50000, lesserLeg: 20000, color: "#22d3ee", bonus: "$5,000" },
  { rank: "Crown Diamond", pv: 100, tv: 150000, lesserLeg: 60000, color: "#a855f7", bonus: "$25,000" },
  { rank: "Royal Diamond", pv: 100, tv: 500000, lesserLeg: 200000, color: "#c8ff00", bonus: "$100,000" },
];

// Binary bonus caps by rank
const binaryBonusCaps = [
  { rank: "Starter", weeklyMax: "$500", rate: "10%" },
  { rank: "Bronze", weeklyMax: "$1,000", rate: "10%" },
  { rank: "Silver", weeklyMax: "$2,500", rate: "10%" },
  { rank: "Gold", weeklyMax: "$2,500", rate: "10%" },
  { rank: "Platinum", weeklyMax: "$5,000", rate: "12%" },
  { rank: "Diamond", weeklyMax: "$10,000", rate: "15%" },
  { rank: "Crown Diamond", weeklyMax: "$25,000", rate: "15%" },
  { rank: "Royal Diamond", weeklyMax: "Uncapped", rate: "15%" },
];

// Unilevel commission rates
const unilevelRates = [
  { level: 1, rate: "20-30%", description: "Personal Sales (Retail Profit)" },
  { level: 2, rate: "10%", description: "Your personally enrolled team" },
  { level: 3, rate: "5%", description: "Your team's enrollments" },
  { level: 4, rate: "3%", description: "Building organizational depth" },
  { level: 5, rate: "3%", description: "Maximum unilevel depth" },
];

export function generateCompensationPlanHTML(): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NEON Energy Drink - Compensation Plan</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', sans-serif;
      background: linear-gradient(135deg, #0d0418 0%, #1a0a2e 50%, #0d0418 100%);
      color: #ffffff;
      min-height: 100vh;
    }
    
    .page {
      max-width: 850px;
      margin: 0 auto;
      padding: 40px;
      page-break-after: always;
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding: 30px;
      background: linear-gradient(135deg, rgba(200, 255, 0, 0.1) 0%, rgba(255, 0, 128, 0.1) 100%);
      border-radius: 20px;
      border: 2px solid rgba(200, 255, 0, 0.3);
    }
    
    .logo {
      font-size: 48px;
      font-weight: 900;
      background: linear-gradient(135deg, #c8ff00, #00ff00);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 10px;
    }
    
    .subtitle {
      font-size: 24px;
      color: #ff0080;
      font-weight: 700;
    }
    
    h1 {
      font-size: 36px;
      font-weight: 800;
      margin-bottom: 20px;
      color: #c8ff00;
    }
    
    h2 {
      font-size: 28px;
      font-weight: 700;
      margin: 30px 0 20px;
      color: #ff0080;
      border-bottom: 2px solid rgba(255, 0, 128, 0.3);
      padding-bottom: 10px;
    }
    
    h3 {
      font-size: 20px;
      font-weight: 600;
      margin: 20px 0 15px;
      color: #00ffff;
    }
    
    p {
      line-height: 1.8;
      margin-bottom: 15px;
      color: #e0e0e0;
    }
    
    .highlight-box {
      background: linear-gradient(135deg, rgba(200, 255, 0, 0.15) 0%, rgba(0, 255, 255, 0.1) 100%);
      border: 2px solid rgba(200, 255, 0, 0.4);
      border-radius: 15px;
      padding: 25px;
      margin: 25px 0;
    }
    
    .warning-box {
      background: linear-gradient(135deg, rgba(255, 0, 128, 0.15) 0%, rgba(255, 100, 100, 0.1) 100%);
      border: 2px solid rgba(255, 0, 128, 0.4);
      border-radius: 15px;
      padding: 25px;
      margin: 25px 0;
    }
    
    .cv-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin: 30px 0;
    }
    
    .cv-card {
      background: rgba(0, 0, 0, 0.4);
      border-radius: 15px;
      padding: 25px;
      border: 2px solid;
    }
    
    .cv-card.first-order {
      border-color: #ff0080;
    }
    
    .cv-card.recurring {
      border-color: #c8ff00;
    }
    
    .cv-percentage {
      font-size: 48px;
      font-weight: 900;
      margin-bottom: 10px;
    }
    
    .cv-card.first-order .cv-percentage {
      color: #ff0080;
    }
    
    .cv-card.recurring .cv-percentage {
      color: #c8ff00;
    }
    
    .cv-title {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 10px;
    }
    
    .cv-example {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 12px;
      margin-top: 15px;
      font-size: 14px;
      color: #a0a0a0;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 12px;
      overflow: hidden;
    }
    
    th {
      background: linear-gradient(135deg, rgba(200, 255, 0, 0.2) 0%, rgba(255, 0, 128, 0.2) 100%);
      padding: 15px;
      text-align: left;
      font-weight: 700;
      color: #c8ff00;
      border-bottom: 2px solid rgba(200, 255, 0, 0.3);
    }
    
    td {
      padding: 12px 15px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    tr:last-child td {
      border-bottom: none;
    }
    
    tr:hover {
      background: rgba(200, 255, 0, 0.05);
    }
    
    .rank-badge {
      display: inline-block;
      padding: 5px 12px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
    }
    
    .diagram-container {
      background: rgba(0, 0, 0, 0.4);
      border-radius: 20px;
      padding: 30px;
      margin: 30px 0;
      border: 2px solid rgba(200, 255, 0, 0.2);
    }
    
    .binary-tree {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }
    
    .tree-node {
      background: linear-gradient(135deg, #c8ff00, #00ff00);
      color: #000;
      padding: 15px 30px;
      border-radius: 10px;
      font-weight: 700;
      text-align: center;
    }
    
    .tree-branches {
      display: flex;
      gap: 100px;
      position: relative;
    }
    
    .tree-branches::before {
      content: '';
      position: absolute;
      top: -20px;
      left: 50%;
      width: 2px;
      height: 20px;
      background: #c8ff00;
    }
    
    .tree-branches::after {
      content: '';
      position: absolute;
      top: -20px;
      left: calc(50% - 50px);
      width: 100px;
      height: 2px;
      background: #c8ff00;
    }
    
    .branch-node {
      background: rgba(255, 0, 128, 0.3);
      border: 2px solid #ff0080;
      padding: 12px 25px;
      border-radius: 10px;
      text-align: center;
      position: relative;
    }
    
    .branch-node::before {
      content: '';
      position: absolute;
      top: -22px;
      left: 50%;
      width: 2px;
      height: 22px;
      background: #c8ff00;
    }
    
    .ways-to-earn {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 15px;
      margin: 30px 0;
    }
    
    .earn-card {
      background: rgba(0, 0, 0, 0.4);
      border-radius: 12px;
      padding: 20px 15px;
      text-align: center;
      border: 2px solid rgba(200, 255, 0, 0.3);
    }
    
    .earn-number {
      font-size: 32px;
      font-weight: 900;
      color: #c8ff00;
      margin-bottom: 10px;
    }
    
    .earn-title {
      font-size: 12px;
      font-weight: 600;
      color: #ffffff;
      text-transform: uppercase;
    }
    
    .footer {
      text-align: center;
      margin-top: 40px;
      padding: 30px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 15px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .disclaimer {
      font-size: 11px;
      color: #888;
      line-height: 1.6;
      margin-top: 20px;
    }
    
    @media print {
      body {
        background: white;
        color: black;
      }
      
      .page {
        page-break-after: always;
      }
      
      .header, .highlight-box, .warning-box, .cv-card, .diagram-container, table, .earn-card {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <!-- Page 1: Cover & Overview -->
  <div class="page">
    <div class="header">
      <div class="logo">NEON</div>
      <div class="subtitle">ENERGY DRINK</div>
      <h1 style="margin-top: 20px; color: #ffffff;">COMPENSATION PLAN</h1>
      <p style="color: #a0a0a0; font-size: 16px;">Build Your Empire • Earn While You Sleep • Live Your Dreams</p>
    </div>
    
    <div class="highlight-box">
      <h3 style="margin-top: 0;">🚀 5 Ways to Earn with NEON</h3>
      <div class="ways-to-earn">
        <div class="earn-card">
          <div class="earn-number">1</div>
          <div class="earn-title">Retail Profit</div>
        </div>
        <div class="earn-card">
          <div class="earn-number">2</div>
          <div class="earn-title">Fast Start Bonus</div>
        </div>
        <div class="earn-card">
          <div class="earn-number">3</div>
          <div class="earn-title">Binary Bonus</div>
        </div>
        <div class="earn-card">
          <div class="earn-number">4</div>
          <div class="earn-title">Unilevel Commissions</div>
        </div>
        <div class="earn-card">
          <div class="earn-number">5</div>
          <div class="earn-title">Rank Advancement</div>
        </div>
      </div>
    </div>
    
    <h2>💰 Total Payout: 40-45% of Company Revenue</h2>
    <p>NEON offers one of the most competitive compensation plans in the industry, paying out 40-45% of total company revenue back to our distributors. Our hybrid plan combines the best of binary and unilevel structures.</p>
    
    <div class="diagram-container">
      <h3 style="text-align: center; margin-bottom: 20px;">Binary Team Structure</h3>
      <div class="binary-tree">
        <div class="tree-node">YOU</div>
        <div class="tree-branches">
          <div class="branch-node">
            <strong>LEFT LEG</strong><br/>
            <span style="font-size: 12px;">Power Leg</span>
          </div>
          <div class="branch-node">
            <strong>RIGHT LEG</strong><br/>
            <span style="font-size: 12px;">Pay Leg</span>
          </div>
        </div>
      </div>
      <p style="text-align: center; margin-top: 20px; font-size: 14px; color: #a0a0a0;">
        Binary commissions are paid on the volume of your <strong style="color: #ff0080;">lesser leg</strong> (weaker side).<br/>
        Build both legs equally for maximum earnings!
      </p>
    </div>
  </div>
  
  <!-- Page 2: CV Structure -->
  <div class="page">
    <h1>📊 Understanding CV (Commissionable Volume)</h1>
    <p>CV (Commissionable Volume) is the value used to calculate your commissions. NEON uses a tiered CV structure to encourage team building while rewarding customer retention.</p>
    
    <div class="cv-section">
      <div class="cv-card first-order">
        <div class="cv-percentage">50%</div>
        <div class="cv-title">First Order CV</div>
        <p style="margin-bottom: 0;">New customer or distributor first orders earn <strong>50% CV</strong>. This encourages team building and customer acquisition.</p>
        <div class="cv-example">
          <strong>Example:</strong> A new customer places a $100 first order<br/>
          → CV Generated: <strong style="color: #ff0080;">50 CV</strong>
        </div>
      </div>
      <div class="cv-card recurring">
        <div class="cv-percentage">100%</div>
        <div class="cv-title">Recurring Order CV</div>
        <p style="margin-bottom: 0;">All subsequent orders from existing customers earn <strong>100% CV</strong>. This rewards customer retention and loyalty.</p>
        <div class="cv-example">
          <strong>Example:</strong> An existing customer places a $100 reorder<br/>
          → CV Generated: <strong style="color: #c8ff00;">100 CV</strong>
        </div>
      </div>
    </div>
    
    <div class="warning-box">
      <h3 style="margin-top: 0; color: #ff0080;">⚠️ Why the Difference?</h3>
      <p style="margin-bottom: 0;">The reduced CV on first orders prevents "front-loading" and encourages sustainable business building. Focus on acquiring customers who will reorder month after month for maximum long-term earnings!</p>
    </div>
    
    <h2>📈 CV Calculation Examples</h2>
    <table>
      <thead>
        <tr>
          <th>Order Type</th>
          <th>Order Amount</th>
          <th>CV Rate</th>
          <th>CV Generated</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>New Customer First Order</td>
          <td>$100</td>
          <td style="color: #ff0080;">50%</td>
          <td style="color: #ff0080;">50 CV</td>
        </tr>
        <tr>
          <td>New Distributor Starter Pack</td>
          <td>$299</td>
          <td style="color: #ff0080;">50%</td>
          <td style="color: #ff0080;">149.50 CV</td>
        </tr>
        <tr>
          <td>Customer Reorder</td>
          <td>$100</td>
          <td style="color: #c8ff00;">100%</td>
          <td style="color: #c8ff00;">100 CV</td>
        </tr>
        <tr>
          <td>Distributor Auto-Ship</td>
          <td>$150</td>
          <td style="color: #c8ff00;">100%</td>
          <td style="color: #c8ff00;">150 CV</td>
        </tr>
        <tr>
          <td>Preferred Customer Monthly</td>
          <td>$75</td>
          <td style="color: #c8ff00;">100%</td>
          <td style="color: #c8ff00;">75 CV</td>
        </tr>
      </tbody>
    </table>
    
    <div class="highlight-box">
      <h3 style="margin-top: 0;">💡 Pro Tip: Focus on Retention!</h3>
      <p style="margin-bottom: 0;">A customer who orders $100/month for 12 months generates <strong style="color: #c8ff00;">1,150 CV</strong> total (50 CV first order + 1,100 CV from 11 reorders). That's 23x more CV than a one-time buyer!</p>
    </div>
  </div>
  
  <!-- Page 3: Rank Advancement -->
  <div class="page">
    <h1>🏆 Rank Advancement & Bonuses</h1>
    <p>Advance through 8 ranks to unlock higher commission caps, better binary rates, and one-time rank advancement bonuses. Each rank requires maintaining Personal Volume (PV) and building Team Volume (TV).</p>
    
    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>PV Required</th>
          <th>TV Required</th>
          <th>Lesser Leg</th>
          <th>Rank Bonus</th>
        </tr>
      </thead>
      <tbody>
        ${rankRequirements.map(r => `
        <tr>
          <td><span class="rank-badge" style="background: ${r.color}20; color: ${r.color}; border: 1px solid ${r.color};">${r.rank}</span></td>
          <td>${r.pv > 0 ? r.pv + ' PV' : 'Join'}</td>
          <td>${r.tv > 0 ? r.tv.toLocaleString() + ' TV' : '-'}</td>
          <td>${r.lesserLeg > 0 ? r.lesserLeg.toLocaleString() : '-'}</td>
          <td style="color: #c8ff00; font-weight: 700;">${r.bonus}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
    
    <h2>💎 Binary Bonus Caps by Rank</h2>
    <p>Your rank determines your weekly binary bonus cap. Higher ranks unlock higher earning potential!</p>
    
    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Binary Rate</th>
          <th>Weekly Cap</th>
        </tr>
      </thead>
      <tbody>
        ${binaryBonusCaps.map(b => `
        <tr>
          <td>${b.rank}</td>
          <td style="color: #00ffff;">${b.rate}</td>
          <td style="color: #c8ff00; font-weight: 700;">${b.weeklyMax}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
    
    <div class="highlight-box">
      <h3 style="margin-top: 0;">🎯 Key Requirements</h3>
      <ul style="list-style: none; padding: 0;">
        <li style="margin-bottom: 10px;">✅ <strong>PV (Personal Volume):</strong> Your own purchases and retail sales</li>
        <li style="margin-bottom: 10px;">✅ <strong>TV (Team Volume):</strong> Total volume from your entire organization</li>
        <li style="margin-bottom: 10px;">✅ <strong>Lesser Leg:</strong> Volume from your weaker binary leg (balances team building)</li>
      </ul>
    </div>
  </div>
  
  <!-- Page 4: Unilevel & Fast Start -->
  <div class="page">
    <h1>📊 Unilevel Commissions</h1>
    <p>In addition to binary bonuses, earn unilevel commissions on 5 levels of your organization. These commissions are paid on the CV of all orders in your downline.</p>
    
    <table>
      <thead>
        <tr>
          <th>Level</th>
          <th>Commission Rate</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        ${unilevelRates.map(u => `
        <tr>
          <td style="font-weight: 700; color: #c8ff00;">Level ${u.level}</td>
          <td style="color: #00ffff; font-weight: 700;">${u.rate}</td>
          <td>${u.description}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
    
    <h2>⚡ Fast Start Bonus</h2>
    <div class="highlight-box">
      <p style="font-size: 18px; margin-bottom: 15px;">Earn <strong style="color: #c8ff00; font-size: 24px;">$50</strong> for every new distributor you personally enroll!</p>
      <p style="margin-bottom: 0;">Plus, earn an additional <strong style="color: #ff0080;">$500 FAST START BONUS</strong> when you enroll 3 distributors within your first 30 days!</p>
    </div>
    
    <h2>🎁 Customer Acquisition Bonus</h2>
    <p>Earn retail profit of <strong style="color: #c8ff00;">20-30%</strong> on every customer order. The more customers you acquire, the more you earn!</p>
    
    <table>
      <thead>
        <tr>
          <th>Customer Type</th>
          <th>Your Profit</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Retail Customer</td>
          <td style="color: #c8ff00; font-weight: 700;">30%</td>
          <td>Full retail price purchases</td>
        </tr>
        <tr>
          <td>Preferred Customer</td>
          <td style="color: #c8ff00; font-weight: 700;">20%</td>
          <td>Discounted pricing, auto-ship eligible</td>
        </tr>
      </tbody>
    </table>
    
    <div class="footer">
      <div class="logo" style="font-size: 32px;">NEON</div>
      <p style="color: #c8ff00; font-weight: 600;">ENERGY DRINK</p>
      <p style="margin-top: 15px;">Ready to build your empire?</p>
      <p style="color: #ff0080; font-weight: 700; font-size: 18px;">Join NEON Today!</p>
      <p style="color: #a0a0a0; margin-top: 10px;">www.neonenergy.com</p>
      
      <div class="disclaimer">
        *Income examples shown are not guarantees of earnings. Your success depends on your effort, skill, and market conditions. 
        Results may vary. NEON Energy Drink makes no guarantees regarding income or rank advancement. 
        Please review the full Income Disclosure Statement for complete details.
      </div>
    </div>
  </div>
</body>
</html>
`;
}

export function downloadCompensationPlanPDF() {
  const html = generateCompensationPlanHTML();
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  // Create a temporary link and trigger download
  const link = document.createElement('a');
  link.href = url;
  link.download = 'NEON-Compensation-Plan.html';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function openCompensationPlanInNewTab() {
  const html = generateCompensationPlanHTML();
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

export default function CompensationPlanDownloadButtons() {
  return (
    <div className="flex flex-wrap gap-4">
      <Button 
        onClick={openCompensationPlanInNewTab}
        className="bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold"
      >
        <FileText className="w-5 h-5 mr-2" />
        View Compensation Plan
      </Button>
      <Button 
        onClick={downloadCompensationPlanPDF}
        variant="outline"
        className="border-[#ff0080] text-[#ff0080] hover:bg-[#ff0080]/10 font-bold"
      >
        <Download className="w-5 h-5 mr-2" />
        Download PDF
      </Button>
    </div>
  );
}
