import { GenealogyTreeTutorial } from '@/components/GenealogyTreeTutorial';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Zap } from 'lucide-react';
import { Link } from 'wouter';

export default function GenealogyTutorial() {
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
          
          <Link href="/join">
            <Button className="bg-[#c8ff00] text-black hover:bg-[#b8ef00]">
              Become a Distributor
            </Button>
          </Link>
        </div>
      </nav>

      {/* Main content */}
      <main className="py-8">
        <GenealogyTreeTutorial />
      </main>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#c8ff00]/10 to-transparent">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Build Your Empire?
          </h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of NEON distributors who are building generational wealth 
            through our revolutionary compensation plan.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/join">
              <Button size="lg" className="bg-[#c8ff00] text-black hover:bg-[#b8ef00]">
                <Zap className="w-5 h-5 mr-2" />
                Start Your Journey
              </Button>
            </Link>
            <Link href="/compensation">
              <Button size="lg" variant="outline">
                View Full Compensation Plan
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
