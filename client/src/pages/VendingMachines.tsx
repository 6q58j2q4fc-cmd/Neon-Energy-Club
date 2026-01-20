import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Zap, 
  DollarSign, 
  MapPin, 
  TrendingUp, 
  Clock, 
  Shield,
  CheckCircle,
  Calculator,
  Building2,
  Users,
  Sparkles,
  ArrowRight,
  Phone,
  Mail
} from "lucide-react";
import { SEO } from "@/components/SEO";
import HamburgerHeader from "@/components/HamburgerHeader";
import Footer from "@/components/Footer";

export default function VendingMachines() {
  const [dailySales, setDailySales] = useState(20);
  const [pricePerCan, setPricePerCan] = useState(3.5);
  const [costPerCan, setCostPerCan] = useState(1.5);
  const [machineInvestment, setMachineInvestment] = useState(4500);
  
  // Calculate ROI
  const dailyProfit = dailySales * (pricePerCan - costPerCan);
  const monthlyProfit = dailyProfit * 30;
  const yearlyProfit = monthlyProfit * 12;
  const paybackMonths = Math.ceil(machineInvestment / monthlyProfit);

  const locations = [
    { name: "Gyms & Fitness Centers", sales: "25-40 cans/day", profit: "$750-$1,200/mo" },
    { name: "Office Buildings", sales: "15-30 cans/day", profit: "$450-$900/mo" },
    { name: "Universities & Colleges", sales: "30-50 cans/day", profit: "$900-$1,500/mo" },
    { name: "Gas Stations", sales: "20-35 cans/day", profit: "$600-$1,050/mo" },
    { name: "Shopping Malls", sales: "25-45 cans/day", profit: "$750-$1,350/mo" },
    { name: "Hospitals & Medical Centers", sales: "15-25 cans/day", profit: "$450-$750/mo" },
  ];

  const features = [
    { icon: Sparkles, title: "Smart Touchscreen", desc: "55\" HD interactive display with product info and promotions" },
    { icon: Shield, title: "Cashless Payments", desc: "Apple Pay, Google Pay, credit cards, and mobile payments" },
    { icon: TrendingUp, title: "Real-Time Analytics", desc: "Track sales, inventory, and performance from your phone" },
    { icon: Clock, title: "24/7 Operation", desc: "Generates income while you sleep" },
  ];

  return (
    <>
      <SEO 
        title="NEON Vending Machines | Micro-Franchise Opportunity"
        description="Start your own NEON Energy vending machine business. Earn $600+ monthly profit per machine with our turnkey micro-franchise opportunity."
      />
      
      <div className="min-h-screen bg-gradient-to-b from-[#0a1a1a] via-[#0d2818] to-[#0a1a1a]">
        <HamburgerHeader variant="default" />

        {/* Hero Section */}
        <section className="pt-32 pb-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#c8ff00]/5 via-transparent to-transparent" />
          
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-block px-4 py-2 bg-[#c8ff00]/20 border border-[#c8ff00]/50 rounded-full mb-6">
                  <span className="text-[#c8ff00] font-semibold">💰 Micro-Franchise Opportunity</span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-black mb-6">
                  <span className="text-white">OWN A</span>
                  <br />
                  <span className="neon-text-glow">NEON</span>
                  <br />
                  <span className="text-white">VENDING MACHINE</span>
                </h1>
                
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  Start your own passive income business with our state-of-the-art smart vending machines. 
                  Earn <span className="text-[#c8ff00] font-bold">$600+ per month</span> profit per machine 
                  and recoup your investment in as little as <span className="text-[#c8ff00] font-bold">6-24 months</span>.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Button size="lg" className="bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold text-lg px-8">
                    <Link href="/franchise" className="flex items-center gap-2">
                      Apply Now <ArrowRight className="w-5 h-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="border-[#c8ff00] text-[#c8ff00] hover:bg-[#c8ff00]/10 font-bold text-lg px-8">
                    <Phone className="w-5 h-5 mr-2" /> Schedule Call
                  </Button>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <img 
                  src="/vending-machine-1.webp" 
                  alt="NEON Energy Vending Machine"
                  className="w-full max-w-lg mx-auto rounded-2xl shadow-2xl shadow-[#c8ff00]/20"
                />
                <div className="absolute -bottom-4 -right-4 bg-[#c8ff00] text-black px-6 py-3 rounded-xl font-bold text-lg">
                  Starting at $4,500
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-black/50">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { value: "$600+", label: "Monthly Profit", icon: DollarSign },
                { value: "6-24", label: "Months to ROI", icon: TrendingUp },
                { value: "24/7", label: "Passive Income", icon: Clock },
                { value: "100%", label: "Your Business", icon: Shield },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-6 bg-gradient-to-b from-[#c8ff00]/10 to-transparent rounded-2xl border border-[#c8ff00]/20"
                >
                  <stat.icon className="w-10 h-10 text-[#c8ff00] mx-auto mb-4" />
                  <div className="text-4xl font-black text-[#c8ff00] mb-2">{stat.value}</div>
                  <div className="text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Machine Gallery */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                SMART <span className="neon-text-glow">VENDING</span> TECHNOLOGY
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Our machines feature cutting-edge technology designed to maximize sales and minimize maintenance
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="rounded-2xl overflow-hidden border border-[#c8ff00]/30"
              >
                <img src="/vending-machine-1.webp" alt="NEON Vending Machine Street" className="w-full h-80 object-cover" />
                <div className="p-6 bg-black/80">
                  <h3 className="text-xl font-bold text-white mb-2">Street Corner Model</h3>
                  <p className="text-gray-400">Perfect for high-traffic urban locations</p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl overflow-hidden border border-[#c8ff00]/30"
              >
                <img src="/vending-machine-2.webp" alt="NEON Vending Machine Gym" className="w-full h-80 object-cover" />
                <div className="p-6 bg-black/80">
                  <h3 className="text-xl font-bold text-white mb-2">Fitness Center Model</h3>
                  <p className="text-gray-400">Optimized for gyms and wellness centers</p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl overflow-hidden border border-[#c8ff00]/30 md:col-span-2 lg:col-span-1"
              >
                <img src="/vending-machine-street.webp" alt="NEON Vending Machine Vice City" className="w-full h-80 object-cover" />
                <div className="p-6 bg-black/80">
                  <h3 className="text-xl font-bold text-white mb-2">Premium Display Model</h3>
                  <p className="text-gray-400">Eye-catching design for maximum visibility</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-black/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                MACHINE <span className="neon-text-glow">FEATURES</span>
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 bg-gradient-to-b from-[#c8ff00]/10 to-transparent rounded-2xl border border-[#c8ff00]/20 text-center"
                >
                  <feature.icon className="w-12 h-12 text-[#c8ff00] mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ROI Calculator */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                <Calculator className="w-12 h-12 inline-block text-[#c8ff00] mr-4" />
                ROI <span className="neon-text-glow">CALCULATOR</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                See how quickly you can recoup your investment and start profiting
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <Card className="bg-[#0a0a0a] border-[#c8ff00]/30">
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Inputs */}
                    <div className="space-y-6">
                      <div>
                        <Label className="text-gray-300 mb-2 block">Daily Sales (cans)</Label>
                        <div className="flex items-center gap-4">
                          <Slider
                            value={[dailySales]}
                            onValueChange={(v) => setDailySales(v[0])}
                            min={5}
                            max={50}
                            step={1}
                            className="flex-1"
                          />
                          <span className="text-2xl font-bold text-[#c8ff00] w-16 text-right">{dailySales}</span>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-gray-300 mb-2 block">Price per Can ($)</Label>
                        <div className="flex items-center gap-4">
                          <Slider
                            value={[pricePerCan * 10]}
                            onValueChange={(v) => setPricePerCan(v[0] / 10)}
                            min={25}
                            max={50}
                            step={5}
                            className="flex-1"
                          />
                          <span className="text-2xl font-bold text-[#c8ff00] w-20 text-right">${pricePerCan.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-gray-300 mb-2 block">Cost per Can ($)</Label>
                        <div className="flex items-center gap-4">
                          <Slider
                            value={[costPerCan * 10]}
                            onValueChange={(v) => setCostPerCan(v[0] / 10)}
                            min={10}
                            max={25}
                            step={5}
                            className="flex-1"
                          />
                          <span className="text-2xl font-bold text-white w-20 text-right">${costPerCan.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-gray-300 mb-2 block">Machine Investment ($)</Label>
                        <div className="flex items-center gap-4">
                          <Slider
                            value={[machineInvestment / 100]}
                            onValueChange={(v) => setMachineInvestment(v[0] * 100)}
                            min={35}
                            max={80}
                            step={5}
                            className="flex-1"
                          />
                          <span className="text-2xl font-bold text-white w-24 text-right">${machineInvestment.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Results */}
                    <div className="bg-gradient-to-b from-[#c8ff00]/20 to-[#c8ff00]/5 rounded-2xl p-6 border border-[#c8ff00]/30">
                      <h3 className="text-2xl font-bold text-white mb-6 text-center">Your Projected Earnings</h3>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-black/50 rounded-xl">
                          <span className="text-gray-300">Daily Profit</span>
                          <span className="text-2xl font-black text-[#c8ff00]">${dailyProfit.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center p-4 bg-black/50 rounded-xl">
                          <span className="text-gray-300">Monthly Profit</span>
                          <span className="text-3xl font-black text-[#c8ff00]">${monthlyProfit.toFixed(0)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center p-4 bg-black/50 rounded-xl">
                          <span className="text-gray-300">Yearly Profit</span>
                          <span className="text-2xl font-black text-[#c8ff00]">${yearlyProfit.toLocaleString()}</span>
                        </div>
                        
                        <div className="flex justify-between items-center p-4 bg-[#c8ff00] rounded-xl">
                          <span className="text-black font-semibold">Payback Period</span>
                          <span className="text-3xl font-black text-black">{paybackMonths} months</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Location Recommendations */}
        <section className="py-20 bg-black/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                <MapPin className="w-12 h-12 inline-block text-[#c8ff00] mr-4" />
                BEST <span className="neon-text-glow">LOCATIONS</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                We help you find the perfect high-traffic locations for maximum profitability
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {locations.map((location, index) => (
                <motion.div
                  key={location.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 bg-gradient-to-b from-[#c8ff00]/10 to-transparent rounded-2xl border border-[#c8ff00]/20"
                >
                  <Building2 className="w-10 h-10 text-[#c8ff00] mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">{location.name}</h3>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Avg Sales: <span className="text-white">{location.sales}</span></span>
                  </div>
                  <div className="mt-2">
                    <span className="text-[#c8ff00] font-bold text-lg">{location.profit}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                WHAT'S <span className="neon-text-glow">INCLUDED</span>
              </h2>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  "Brand new NEON smart vending machine",
                  "55\" HD touchscreen display",
                  "Cashless payment system installed",
                  "Initial inventory (100 cans)",
                  "Location scouting assistance",
                  "Installation and setup",
                  "Training and support",
                  "Real-time sales dashboard access",
                  "Marketing materials",
                  "Ongoing technical support",
                  "Exclusive territory rights",
                  "Wholesale pricing on inventory",
                ].map((item, index) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 p-4 bg-[#c8ff00]/10 rounded-xl border border-[#c8ff00]/20"
                  >
                    <CheckCircle className="w-6 h-6 text-[#c8ff00] flex-shrink-0" />
                    <span className="text-white">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-b from-[#c8ff00]/20 to-transparent">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              START YOUR <span className="neon-text-glow">VENDING BUSINESS</span> TODAY
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join hundreds of entrepreneurs earning passive income with NEON vending machines. 
              Limited territories available in your area.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold text-xl px-12 py-6">
                <Link href="/franchise" className="flex items-center gap-2">
                  Apply for a Machine <ArrowRight className="w-6 h-6" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-[#c8ff00] text-[#c8ff00] hover:bg-[#c8ff00]/10 font-bold text-xl px-12 py-6">
                <Mail className="w-6 h-6 mr-2" /> Contact Sales
              </Button>
            </div>
            
            <p className="text-gray-500 mt-8">
              Questions? Call us at <span className="text-[#c8ff00]">(888) NEON-BIZ</span> or email <span className="text-[#c8ff00]">vending@neonenergy.com</span>
            </p>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
