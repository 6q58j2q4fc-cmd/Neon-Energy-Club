import { MarketingAssetLibrary } from '@/components/MarketingAssetLibrary';
import { Link, Redirect } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function MarketingAssets() {
  const { data: user, isLoading } = trpc.auth.me.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  // For now, allow all authenticated users to access marketing assets
  // In production, you may want to restrict to distributors only
  const distributorName = user.name || 'Distributor';
  const distributorCode = 'DEMO123'; // TODO: Get from user profile
  const distributorEmail = user.email;
  const distributorPhone = '(555) 123-4567'; // TODO: Get from user profile
  const replicatedWebsiteUrl = `https://neonenergyclub.com/${distributorCode}`;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto py-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      <MarketingAssetLibrary
        distributorName={distributorName}
        distributorCode={distributorCode}
        distributorEmail={distributorEmail}
        distributorPhone={distributorPhone}
        replicatedWebsiteUrl={replicatedWebsiteUrl}
      />
    </div>
  );
}
