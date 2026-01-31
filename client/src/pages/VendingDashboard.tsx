import { VendingIotDashboard } from '@/components/VendingIotDashboard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Zap } from 'lucide-react';
import { Link } from 'wouter';

export default function VendingDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-lg border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <Link href="/" className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-[#c8ff00]" />
            <span className="font-bold text-white">NEON</span>
          </Link>
          
          <Link href="/vending-opportunity">
            <Button className="bg-[#c8ff00] text-black hover:bg-[#b8ef00]">
              Own a Machine
            </Button>
          </Link>
        </div>
      </nav>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <VendingIotDashboard />
      </main>
    </div>
  );
}
