import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface TerritoryData {
  name: string;
  state: string;
  area: number;
  population: number;
  density: number;
  demandFactor: number;
  licenseFee: number;
}

interface PricingBreakdown {
  baseValue: number;
  stateFees: number;
  densityAdjustment: number;
  demographicPremium: number;
  regionalAdjustment: number;
  municipalTaxImpact: number;
  volumeDiscount: number;
  total: number;
}

interface StateLicensing {
  state: string;
  baseFee: number;
  renewalFee: number;
  additionalFees: number;
}

interface MunicipalTax {
  city: string;
  rate: number;
  impactPerCase: number;
}

interface TerritoryPDFExportProps {
  territory: TerritoryData;
  pricing: PricingBreakdown;
  stateLicensing: StateLicensing;
  municipalTax?: MunicipalTax;
  densityMultiplier: number;
  demographicMultiplier: number;
  regionalMultiplier: number;
  volumeDiscountPercent: number;
  blueSkyMultiple: number;
}

export function TerritoryPDFExport({
  territory,
  pricing,
  stateLicensing,
  municipalTax,
  densityMultiplier,
  demographicMultiplier,
  regionalMultiplier,
  volumeDiscountPercent,
  blueSkyMultiple,
}: TerritoryPDFExportProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      // Create PDF content using HTML-to-canvas approach
      const pdfContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>NEON Territory Pricing Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #0a0a0a;
      color: #ffffff;
      padding: 40px;
      min-height: 100vh;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #39ff14;
    }
    .logo {
      font-size: 36px;
      font-weight: bold;
      color: #39ff14;
      text-shadow: 0 0 20px rgba(57, 255, 20, 0.5);
    }
    .date {
      color: #888;
      font-size: 14px;
    }
    .title {
      font-size: 28px;
      color: #39ff14;
      margin-bottom: 10px;
    }
    .subtitle {
      color: #888;
      font-size: 16px;
      margin-bottom: 30px;
    }
    .section {
      background: #1a1a1a;
      border: 1px solid #333;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
    }
    .section-title {
      font-size: 18px;
      color: #39ff14;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }
    .stat-card {
      background: #0d0d0d;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
    }
    .stat-label {
      font-size: 12px;
      color: #888;
      margin-bottom: 4px;
    }
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #39ff14;
    }
    .stat-unit {
      font-size: 12px;
      color: #666;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid #333;
    }
    th {
      color: #888;
      font-weight: normal;
      font-size: 12px;
      text-transform: uppercase;
    }
    td {
      font-size: 14px;
    }
    .amount-positive { color: #39ff14; }
    .amount-negative { color: #ff6b6b; }
    .total-row {
      background: #1a3a1a;
      font-weight: bold;
    }
    .total-row td { color: #39ff14; font-size: 18px; }
    .highlight-box {
      background: linear-gradient(135deg, #1a3a1a 0%, #0d1f0d 100%);
      border: 1px solid #39ff14;
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      margin-top: 24px;
    }
    .highlight-label {
      font-size: 14px;
      color: #888;
      margin-bottom: 8px;
    }
    .highlight-value {
      font-size: 48px;
      font-weight: bold;
      color: #39ff14;
      text-shadow: 0 0 30px rgba(57, 255, 20, 0.5);
    }
    .highlight-subtext {
      font-size: 12px;
      color: #666;
      margin-top: 8px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #333;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    .badge {
      display: inline-block;
      background: #39ff14;
      color: #000;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: bold;
      text-transform: uppercase;
    }
    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    .multiplier-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-top: 16px;
    }
    .multiplier-card {
      background: #0d0d0d;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 12px;
      text-align: center;
    }
    .multiplier-label {
      font-size: 10px;
      color: #888;
      margin-bottom: 4px;
    }
    .multiplier-value {
      font-size: 18px;
      font-weight: bold;
      color: #39ff14;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">⚡ NEON ENERGY</div>
    <div class="date">
      <div>Territory Pricing Report</div>
      <div>${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
    </div>
  </div>

  <h1 class="title">Territory Analysis: ${territory.name}, ${territory.state}</h1>
  <p class="subtitle">Forensic Audit Pricing Model - Based on 2025-2026 U.S. Energy Drink Licensing Fees</p>

  <div class="section">
    <div class="section-title">
      <span class="badge">Territory Overview</span>
    </div>
    <div class="grid">
      <div class="stat-card">
        <div class="stat-label">Location</div>
        <div class="stat-value" style="font-size: 16px;">${territory.name}</div>
        <div class="stat-unit">${territory.state}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Population</div>
        <div class="stat-value">${territory.population.toLocaleString()}</div>
        <div class="stat-unit">residents</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Area</div>
        <div class="stat-value">${territory.area.toFixed(1)}</div>
        <div class="stat-unit">sq mi</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Density</div>
        <div class="stat-value">${territory.density.toLocaleString()}</div>
        <div class="stat-unit">per sq mi</div>
      </div>
    </div>
    
    <div class="multiplier-grid">
      <div class="multiplier-card">
        <div class="multiplier-label">Density</div>
        <div class="multiplier-value">${densityMultiplier}x</div>
      </div>
      <div class="multiplier-card">
        <div class="multiplier-label">Demographic</div>
        <div class="multiplier-value">${demographicMultiplier}x</div>
      </div>
      <div class="multiplier-card">
        <div class="multiplier-label">Regional</div>
        <div class="multiplier-value">${regionalMultiplier}x</div>
      </div>
      <div class="multiplier-card">
        <div class="multiplier-label">Volume Discount</div>
        <div class="multiplier-value" style="color: #ff6b6b;">-${volumeDiscountPercent}%</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">
      <span class="badge">Price Breakdown</span>
    </div>
    <table>
      <thead>
        <tr>
          <th>Category</th>
          <th>Amount</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Base Territory Value</td>
          <td class="amount-positive">+$${pricing.baseValue.toLocaleString()}</td>
          <td>${territory.area.toFixed(1)} sq mi × $500.00/sq mi</td>
        </tr>
        <tr>
          <td>State Licensing Fees</td>
          <td class="amount-positive">+$${pricing.stateFees.toLocaleString()}</td>
          <td>${stateLicensing.state} base + renewal + additional fees</td>
        </tr>
        <tr>
          <td>Density Adjustment</td>
          <td class="amount-positive">+$${pricing.densityAdjustment.toLocaleString()}</td>
          <td>${territory.density >= 4000 ? 'Premium Urban' : territory.density >= 2000 ? 'Urban' : territory.density >= 500 ? 'Suburban' : 'Rural'} zone (${densityMultiplier}x multiplier)</td>
        </tr>
        <tr>
          <td>Demographic Premium</td>
          <td class="amount-positive">+$${pricing.demographicPremium.toLocaleString()}</td>
          <td>Income/age/fitness factors (${demographicMultiplier}x)</td>
        </tr>
        <tr>
          <td>Regional Adjustment</td>
          <td class="amount-positive">+$${pricing.regionalAdjustment.toLocaleString()}</td>
          <td>${territory.state} regional consumption pattern (${regionalMultiplier}x)</td>
        </tr>
        ${municipalTax ? `
        <tr>
          <td>Municipal SSB Tax Impact</td>
          <td class="amount-negative">-$${Math.abs(pricing.municipalTaxImpact).toLocaleString()}</td>
          <td>${municipalTax.city} sugar-sweetened beverage tax</td>
        </tr>
        ` : ''}
        <tr>
          <td>Volume Discount</td>
          <td class="amount-negative">-$${Math.abs(pricing.volumeDiscount).toLocaleString()}</td>
          <td>${territory.area >= 100 ? 'Large' : territory.area >= 50 ? 'Medium' : 'Small'} Territory (${volumeDiscountPercent}% discount)</td>
        </tr>
        <tr class="total-row">
          <td>TOTAL</td>
          <td>$${pricing.total.toLocaleString()}</td>
          <td>Final territory licensing price</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="two-col">
    <div class="section">
      <div class="section-title">
        <span class="badge">State Licensing (${stateLicensing.state})</span>
      </div>
      <table>
        <tr>
          <td>Base Fee</td>
          <td>$${stateLicensing.baseFee.toLocaleString()}</td>
        </tr>
        <tr>
          <td>Renewal Fee (annual)</td>
          <td>$${stateLicensing.renewalFee.toLocaleString()}</td>
        </tr>
        <tr>
          <td>Additional Fees</td>
          <td>$${stateLicensing.additionalFees.toLocaleString()}</td>
        </tr>
      </table>
    </div>

    ${municipalTax ? `
    <div class="section">
      <div class="section-title">
        <span class="badge">Municipal SSB Tax</span>
      </div>
      <table>
        <tr>
          <td>City</td>
          <td>${municipalTax.city}</td>
        </tr>
        <tr>
          <td>Rate</td>
          <td>$${municipalTax.rate.toFixed(2)}/oz</td>
        </tr>
        <tr>
          <td>Impact per 24ct Case</td>
          <td class="amount-negative">-$${Math.abs(municipalTax.impactPerCase).toFixed(2)}</td>
        </tr>
      </table>
    </div>
    ` : `
    <div class="section">
      <div class="section-title">
        <span class="badge">Blue Sky Valuation</span>
      </div>
      <table>
        <tr>
          <td>EBITDA Multiple</td>
          <td>${blueSkyMultiple}x</td>
        </tr>
        <tr>
          <td>Valuation Method</td>
          <td>Forensic Audit</td>
        </tr>
        <tr>
          <td>Market Basis</td>
          <td>2025-2026 Data</td>
        </tr>
      </table>
    </div>
    `}
  </div>

  <div class="highlight-box">
    <div class="highlight-label">Total Territory Investment</div>
    <div class="highlight-value">$${pricing.total.toLocaleString()}</div>
    <div class="highlight-subtext">$${(pricing.total / territory.area).toFixed(2)} per square mile • Minimum fee: $2,500</div>
  </div>

  <div class="footer">
    <p>This pricing report is generated using the NEON Forensic Audit Pricing Model</p>
    <p>Based on U.S. Energy Drink Licensing Fees and Territory Valuation Metrics 2025-2026</p>
    <p style="margin-top: 10px;">© ${new Date().getFullYear()} NEON Energy Drink. All rights reserved.</p>
  </div>
</body>
</html>
      `;

      // Create a blob and download
      const blob = new Blob([pdfContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Open in new window for printing to PDF
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 500);
        };
      }

      toast.success("PDF Ready - Use your browser's print dialog to save as PDF");
    } catch (error) {
      toast.error("Export Failed - Unable to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={generatePDF}
      disabled={isGenerating}
      className="bg-gradient-to-r from-[#39ff14] to-[#32cd32] hover:from-[#32cd32] hover:to-[#39ff14] text-black font-bold"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <FileDown className="w-4 h-4 mr-2" />
          Export PDF Report
        </>
      )}
    </Button>
  );
}
