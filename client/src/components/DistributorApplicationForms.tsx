import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, FileText, Users, Building2, ClipboardList, UserPlus } from "lucide-react";

// Generate Distributor Application Form HTML
export function generateDistributorApplicationHTML(): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NEON Energy Drink - Distributor Application</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', sans-serif;
      background: #ffffff;
      color: #1a1a1a;
      line-height: 1.6;
    }
    
    .page {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #c8ff00;
    }
    
    .logo {
      font-size: 42px;
      font-weight: 900;
      color: #0d0418;
      letter-spacing: -2px;
    }
    
    .logo span {
      color: #c8ff00;
      text-shadow: 1px 1px 0 #0d0418;
    }
    
    .subtitle {
      font-size: 14px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 3px;
      margin-top: 5px;
    }
    
    h1 {
      font-size: 28px;
      font-weight: 800;
      color: #0d0418;
      margin: 30px 0 10px;
    }
    
    h2 {
      font-size: 18px;
      font-weight: 700;
      color: #ff0080;
      margin: 25px 0 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #f0f0f0;
    }
    
    .form-intro {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-left: 4px solid #c8ff00;
      padding: 20px;
      margin: 20px 0;
      border-radius: 0 8px 8px 0;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    label {
      display: block;
      font-weight: 600;
      margin-bottom: 5px;
      color: #333;
    }
    
    .input-line {
      border: none;
      border-bottom: 2px solid #ddd;
      padding: 10px 5px;
      width: 100%;
      font-size: 14px;
      background: transparent;
    }
    
    .input-line:focus {
      outline: none;
      border-bottom-color: #c8ff00;
    }
    
    .row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    
    .row-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 15px;
    }
    
    .checkbox-group {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      margin: 10px 0;
    }
    
    .checkbox-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .checkbox-item input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: #c8ff00;
    }
    
    .signature-box {
      border: 2px dashed #ddd;
      padding: 30px;
      margin: 20px 0;
      text-align: center;
      border-radius: 8px;
    }
    
    .signature-line {
      border-top: 2px solid #333;
      margin-top: 60px;
      padding-top: 10px;
    }
    
    .agreement-box {
      background: #fff8e6;
      border: 2px solid #ffc107;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
      font-size: 13px;
    }
    
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #f0f0f0;
      color: #666;
      font-size: 12px;
    }
    
    .highlight {
      background: #c8ff00;
      padding: 2px 6px;
      border-radius: 3px;
      font-weight: 600;
    }
    
    @media print {
      .page { padding: 20px; }
      .input-line { border-bottom: 1px solid #999; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="logo">NEO<span>N</span></div>
      <div class="subtitle">Energy Drink</div>
      <h1>Independent Distributor Application</h1>
    </div>
    
    <div class="form-intro">
      <strong>Welcome to the NEON Family!</strong><br>
      Complete this application to become an Independent Distributor. Please print clearly and provide accurate information.
    </div>
    
    <h2>📋 Personal Information</h2>
    <div class="row">
      <div class="form-group">
        <label>Legal First Name</label>
        <input type="text" class="input-line" placeholder="">
      </div>
      <div class="form-group">
        <label>Legal Last Name</label>
        <input type="text" class="input-line" placeholder="">
      </div>
    </div>
    
    <div class="row">
      <div class="form-group">
        <label>Date of Birth</label>
        <input type="text" class="input-line" placeholder="MM/DD/YYYY">
      </div>
      <div class="form-group">
        <label>Social Security Number (Last 4)</label>
        <input type="text" class="input-line" placeholder="XXX-XX-____">
      </div>
    </div>
    
    <div class="form-group">
      <label>Email Address</label>
      <input type="email" class="input-line" placeholder="">
    </div>
    
    <div class="row">
      <div class="form-group">
        <label>Phone Number</label>
        <input type="tel" class="input-line" placeholder="(___) ___-____">
      </div>
      <div class="form-group">
        <label>Alternate Phone</label>
        <input type="tel" class="input-line" placeholder="(___) ___-____">
      </div>
    </div>
    
    <h2>🏠 Address Information</h2>
    <div class="form-group">
      <label>Street Address</label>
      <input type="text" class="input-line" placeholder="">
    </div>
    
    <div class="form-group">
      <label>Apartment/Suite/Unit (if applicable)</label>
      <input type="text" class="input-line" placeholder="">
    </div>
    
    <div class="row-3">
      <div class="form-group">
        <label>City</label>
        <input type="text" class="input-line" placeholder="">
      </div>
      <div class="form-group">
        <label>State</label>
        <input type="text" class="input-line" placeholder="">
      </div>
      <div class="form-group">
        <label>ZIP Code</label>
        <input type="text" class="input-line" placeholder="">
      </div>
    </div>
    
    <h2>👤 Sponsor Information</h2>
    <div class="row">
      <div class="form-group">
        <label>Sponsor Name</label>
        <input type="text" class="input-line" placeholder="">
      </div>
      <div class="form-group">
        <label>Sponsor ID Number</label>
        <input type="text" class="input-line" placeholder="">
      </div>
    </div>
    
    <h2>📦 Starter Pack Selection</h2>
    <div class="checkbox-group">
      <div class="checkbox-item">
        <input type="checkbox" id="starter">
        <label for="starter">Starter Pack - $99</label>
      </div>
      <div class="checkbox-item">
        <input type="checkbox" id="builder">
        <label for="builder">Builder Pack - $299</label>
      </div>
      <div class="checkbox-item">
        <input type="checkbox" id="pro">
        <label for="pro">Pro Pack - $599</label>
      </div>
      <div class="checkbox-item">
        <input type="checkbox" id="elite">
        <label for="elite">Elite Pack - $999</label>
      </div>
    </div>
    
    <h2>💳 Payment Information</h2>
    <div class="form-group">
      <label>Cardholder Name</label>
      <input type="text" class="input-line" placeholder="">
    </div>
    
    <div class="row">
      <div class="form-group">
        <label>Card Number</label>
        <input type="text" class="input-line" placeholder="____ ____ ____ ____">
      </div>
      <div class="form-group">
        <label>Expiration Date</label>
        <input type="text" class="input-line" placeholder="MM/YY">
      </div>
    </div>
    
    <div class="row">
      <div class="form-group">
        <label>CVV</label>
        <input type="text" class="input-line" placeholder="___">
      </div>
      <div class="form-group">
        <label>Billing ZIP Code</label>
        <input type="text" class="input-line" placeholder="">
      </div>
    </div>
    
    <h2>🏦 Commission Payment Method</h2>
    <div class="checkbox-group">
      <div class="checkbox-item">
        <input type="checkbox" id="direct">
        <label for="direct">Direct Deposit (ACH)</label>
      </div>
      <div class="checkbox-item">
        <input type="checkbox" id="check">
        <label for="check">Paper Check</label>
      </div>
    </div>
    
    <div class="row">
      <div class="form-group">
        <label>Bank Name</label>
        <input type="text" class="input-line" placeholder="">
      </div>
      <div class="form-group">
        <label>Account Type</label>
        <input type="text" class="input-line" placeholder="Checking / Savings">
      </div>
    </div>
    
    <div class="row">
      <div class="form-group">
        <label>Routing Number</label>
        <input type="text" class="input-line" placeholder="">
      </div>
      <div class="form-group">
        <label>Account Number</label>
        <input type="text" class="input-line" placeholder="">
      </div>
    </div>
    
    <div class="agreement-box">
      <strong>⚠️ Agreement & Acknowledgment</strong><br><br>
      By signing below, I acknowledge that I have read and agree to the NEON Energy Drink Independent Distributor Agreement, Policies & Procedures, and Compensation Plan. I understand that:
      <ul style="margin: 10px 0 0 20px;">
        <li>I am an independent contractor, not an employee of NEON Energy Drink</li>
        <li>Income is not guaranteed and depends on my own efforts</li>
        <li>I will comply with all applicable laws and company policies</li>
        <li>I may cancel within 30 days for a full refund of my starter pack</li>
      </ul>
    </div>
    
    <div class="signature-box">
      <div class="signature-line">
        <strong>Applicant Signature</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>Date</strong>
      </div>
    </div>
    
    <div class="footer">
      <strong>NEON Energy Drink</strong><br>
      Independent Distributor Application Form v1.0<br>
      For questions, contact: support@neonenergy.com | 1-800-NEON-ENERGY
    </div>
  </div>
</body>
</html>
`;
}

// Generate Customer Referral Form HTML
export function generateCustomerReferralHTML(): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NEON Energy Drink - Customer Referral Form</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', sans-serif;
      background: #ffffff;
      color: #1a1a1a;
      line-height: 1.6;
    }
    
    .page {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #ff0080;
    }
    
    .logo {
      font-size: 36px;
      font-weight: 900;
      color: #0d0418;
    }
    
    .logo span { color: #c8ff00; }
    
    h1 {
      font-size: 24px;
      font-weight: 800;
      color: #ff0080;
      margin: 20px 0 10px;
    }
    
    h2 {
      font-size: 16px;
      font-weight: 700;
      color: #0d0418;
      margin: 20px 0 10px;
      padding-bottom: 5px;
      border-bottom: 2px solid #f0f0f0;
    }
    
    .intro-box {
      background: linear-gradient(135deg, #fff0f5 0%, #ffe6f0 100%);
      border-left: 4px solid #ff0080;
      padding: 15px;
      margin: 15px 0;
      border-radius: 0 8px 8px 0;
    }
    
    .referral-card {
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      padding: 20px;
      margin: 15px 0;
      background: #fafafa;
    }
    
    .form-group {
      margin-bottom: 15px;
    }
    
    label {
      display: block;
      font-weight: 600;
      margin-bottom: 5px;
      font-size: 14px;
    }
    
    .input-line {
      border: none;
      border-bottom: 2px solid #ddd;
      padding: 8px 5px;
      width: 100%;
      font-size: 14px;
      background: transparent;
    }
    
    .row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }
    
    .reward-box {
      background: linear-gradient(135deg, #c8ff00 0%, #a8d600 100%);
      color: #0d0418;
      padding: 20px;
      border-radius: 10px;
      text-align: center;
      margin: 20px 0;
    }
    
    .reward-box h3 {
      font-size: 20px;
      margin-bottom: 10px;
    }
    
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 15px;
      border-top: 2px solid #f0f0f0;
      color: #666;
      font-size: 11px;
    }
    
    @media print {
      .page { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="logo">NEO<span>N</span></div>
      <h1>Customer Referral Form</h1>
      <p style="color: #666;">Share NEON with friends & earn rewards!</p>
    </div>
    
    <div class="intro-box">
      <strong>🎁 Refer 3 Friends, Get FREE Product!</strong><br>
      For every 3 friends you refer who make a purchase, you'll receive a FREE 6-pack of NEON Energy Drink!
    </div>
    
    <h2>Your Information (Referring Customer)</h2>
    <div class="row">
      <div class="form-group">
        <label>Your Name</label>
        <input type="text" class="input-line">
      </div>
      <div class="form-group">
        <label>Your Email</label>
        <input type="email" class="input-line">
      </div>
    </div>
    <div class="form-group">
      <label>Your Distributor/Customer ID (if applicable)</label>
      <input type="text" class="input-line">
    </div>
    
    <h2>Referral #1</h2>
    <div class="referral-card">
      <div class="row">
        <div class="form-group">
          <label>Friend's Name</label>
          <input type="text" class="input-line">
        </div>
        <div class="form-group">
          <label>Phone Number</label>
          <input type="tel" class="input-line">
        </div>
      </div>
      <div class="form-group">
        <label>Email Address</label>
        <input type="email" class="input-line">
      </div>
    </div>
    
    <h2>Referral #2</h2>
    <div class="referral-card">
      <div class="row">
        <div class="form-group">
          <label>Friend's Name</label>
          <input type="text" class="input-line">
        </div>
        <div class="form-group">
          <label>Phone Number</label>
          <input type="tel" class="input-line">
        </div>
      </div>
      <div class="form-group">
        <label>Email Address</label>
        <input type="email" class="input-line">
      </div>
    </div>
    
    <h2>Referral #3</h2>
    <div class="referral-card">
      <div class="row">
        <div class="form-group">
          <label>Friend's Name</label>
          <input type="text" class="input-line">
        </div>
        <div class="form-group">
          <label>Phone Number</label>
          <input type="tel" class="input-line">
        </div>
      </div>
      <div class="form-group">
        <label>Email Address</label>
        <input type="email" class="input-line">
      </div>
    </div>
    
    <div class="reward-box">
      <h3>🎉 Your Reward</h3>
      <p>When all 3 referrals make a purchase, you'll receive:</p>
      <p style="font-size: 24px; font-weight: 800; margin-top: 10px;">FREE 6-Pack of NEON!</p>
    </div>
    
    <div class="footer">
      <strong>NEON Energy Drink</strong> | Customer Referral Program<br>
      Submit this form to your distributor or email to referrals@neonenergy.com
    </div>
  </div>
</body>
</html>
`;
}

// Generate Team Building Worksheet HTML
export function generateTeamBuildingWorksheetHTML(): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NEON Energy Drink - Team Building Worksheet</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', sans-serif;
      background: #ffffff;
      color: #1a1a1a;
      line-height: 1.6;
    }
    
    .page {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #00ffff;
    }
    
    .logo {
      font-size: 36px;
      font-weight: 900;
      color: #0d0418;
    }
    
    .logo span { color: #c8ff00; }
    
    h1 {
      font-size: 24px;
      font-weight: 800;
      color: #0d0418;
      margin: 20px 0 10px;
    }
    
    h2 {
      font-size: 16px;
      font-weight: 700;
      color: #00a0a0;
      margin: 25px 0 15px;
      padding-bottom: 5px;
      border-bottom: 2px solid #e0f7f7;
    }
    
    .intro-box {
      background: linear-gradient(135deg, #e0f7f7 0%, #d0f0f0 100%);
      border-left: 4px solid #00ffff;
      padding: 15px;
      margin: 15px 0;
      border-radius: 0 8px 8px 0;
    }
    
    .prospect-table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    
    .prospect-table th {
      background: #0d0418;
      color: #c8ff00;
      padding: 12px;
      text-align: left;
      font-size: 12px;
    }
    
    .prospect-table td {
      border: 1px solid #ddd;
      padding: 10px;
      font-size: 12px;
    }
    
    .prospect-table tr:nth-child(even) {
      background: #f9f9f9;
    }
    
    .goal-box {
      background: #fff8e6;
      border: 2px solid #ffc107;
      padding: 20px;
      border-radius: 10px;
      margin: 20px 0;
    }
    
    .goal-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 10px 0;
      padding: 10px;
      background: white;
      border-radius: 5px;
    }
    
    .binary-diagram {
      text-align: center;
      padding: 30px;
      background: #f5f5f5;
      border-radius: 10px;
      margin: 20px 0;
    }
    
    .you-box {
      display: inline-block;
      background: #c8ff00;
      color: #0d0418;
      padding: 15px 30px;
      border-radius: 10px;
      font-weight: 800;
      margin-bottom: 20px;
    }
    
    .legs {
      display: flex;
      justify-content: center;
      gap: 100px;
    }
    
    .leg-box {
      border: 2px dashed #999;
      padding: 15px 25px;
      border-radius: 10px;
      min-width: 150px;
    }
    
    .leg-box.left { border-color: #ff0080; }
    .leg-box.right { border-color: #00ffff; }
    
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 15px;
      border-top: 2px solid #f0f0f0;
      color: #666;
      font-size: 11px;
    }
    
    @media print {
      .page { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="logo">NEO<span>N</span></div>
      <h1>Team Building Worksheet</h1>
      <p style="color: #666;">Plan your path to success!</p>
    </div>
    
    <div class="intro-box">
      <strong>📋 Your 30-Day Action Plan</strong><br>
      Use this worksheet to track prospects, set goals, and build your NEON business systematically.
    </div>
    
    <h2>🎯 My 30-Day Goals</h2>
    <div class="goal-box">
      <div class="goal-row">
        <span><strong>New Customers:</strong></span>
        <span>_______ customers</span>
      </div>
      <div class="goal-row">
        <span><strong>New Distributors:</strong></span>
        <span>_______ distributors</span>
      </div>
      <div class="goal-row">
        <span><strong>Personal Volume (PV):</strong></span>
        <span>_______ PV</span>
      </div>
      <div class="goal-row">
        <span><strong>Target Rank:</strong></span>
        <span>_______</span>
      </div>
    </div>
    
    <h2>📊 My Binary Team Plan</h2>
    <div class="binary-diagram">
      <div class="you-box">YOU</div>
      <div class="legs">
        <div class="leg-box left">
          <strong style="color: #ff0080;">LEFT LEG</strong><br>
          <small>Power Leg</small><br><br>
          Name: _______________<br>
          Name: _______________<br>
          Name: _______________
        </div>
        <div class="leg-box right">
          <strong style="color: #00a0a0;">RIGHT LEG</strong><br>
          <small>Pay Leg</small><br><br>
          Name: _______________<br>
          Name: _______________<br>
          Name: _______________
        </div>
      </div>
    </div>
    
    <h2>📝 Prospect List (Top 25)</h2>
    <table class="prospect-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Name</th>
          <th>Phone</th>
          <th>Interest Level (1-10)</th>
          <th>Follow-Up Date</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${Array.from({length: 15}, (_, i) => `
        <tr>
          <td>${i + 1}</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        `).join('')}
      </tbody>
    </table>
    
    <h2>📅 Weekly Activity Tracker</h2>
    <table class="prospect-table">
      <thead>
        <tr>
          <th>Activity</th>
          <th>Mon</th>
          <th>Tue</th>
          <th>Wed</th>
          <th>Thu</th>
          <th>Fri</th>
          <th>Sat</th>
          <th>Sun</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Calls Made</td>
          <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
        </tr>
        <tr>
          <td>Presentations</td>
          <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
        </tr>
        <tr>
          <td>Follow-Ups</td>
          <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
        </tr>
        <tr>
          <td>New Sign-Ups</td>
          <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
        </tr>
      </tbody>
    </table>
    
    <div class="footer">
      <strong>NEON Energy Drink</strong> | Team Building Worksheet v1.0<br>
      Success is built one conversation at a time!
    </div>
  </div>
</body>
</html>
`;
}

// Download functions
export function downloadDistributorApplication() {
  const html = generateDistributorApplicationHTML();
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'NEON-Distributor-Application.html';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadCustomerReferralForm() {
  const html = generateCustomerReferralHTML();
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'NEON-Customer-Referral-Form.html';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadTeamBuildingWorksheet() {
  const html = generateTeamBuildingWorksheetHTML();
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'NEON-Team-Building-Worksheet.html';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Main component for distributor portal
export default function DistributorApplicationForms() {
  return (
    <div className="space-y-4">
      <Card className="bg-black/40 border-[#c8ff00]/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#c8ff00]">
            <FileText className="w-5 h-5" />
            Downloadable Forms & Resources
          </CardTitle>
          <CardDescription className="text-gray-400">
            Download printable forms to grow your NEON business
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Distributor Application */}
          <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#c8ff00]/20">
                <UserPlus className="w-5 h-5 text-[#c8ff00]" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Distributor Application</h4>
                <p className="text-sm text-gray-400">New distributor enrollment form</p>
              </div>
            </div>
            <Button 
              onClick={downloadDistributorApplication}
              size="sm"
              className="bg-[#c8ff00] text-black hover:bg-[#a8d600]"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
          
          {/* Customer Referral Form */}
          <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#ff0080]/20">
                <Users className="w-5 h-5 text-[#ff0080]" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Customer Referral Form</h4>
                <p className="text-sm text-gray-400">Refer 3 friends, get FREE product</p>
              </div>
            </div>
            <Button 
              onClick={downloadCustomerReferralForm}
              size="sm"
              variant="outline"
              className="border-[#ff0080] text-[#ff0080] hover:bg-[#ff0080]/10"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
          
          {/* Team Building Worksheet */}
          <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#00ffff]/20">
                <ClipboardList className="w-5 h-5 text-[#00ffff]" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Team Building Worksheet</h4>
                <p className="text-sm text-gray-400">30-day action plan & prospect tracker</p>
              </div>
            </div>
            <Button 
              onClick={downloadTeamBuildingWorksheet}
              size="sm"
              variant="outline"
              className="border-[#00ffff] text-[#00ffff] hover:bg-[#00ffff]/10"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
