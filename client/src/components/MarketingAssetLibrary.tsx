import { useState } from 'react';
import { Download, Copy, Check, Image as ImageIcon, Mail, Video } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import {
  ALL_MARKETING_ASSETS,
  SOCIAL_MEDIA_ASSETS,
  EMAIL_TEMPLATES,
  VIDEO_SCRIPTS,
} from '../../../shared/marketingAssetsData';
import type { MarketingAsset, AssetCustomization } from '../../../shared/marketingAssets';

interface MarketingAssetLibraryProps {
  distributorName: string;
  distributorCode: string;
  distributorEmail?: string;
  distributorPhone?: string;
  replicatedWebsiteUrl: string;
}

export function MarketingAssetLibrary({
  distributorName,
  distributorCode,
  distributorEmail,
  distributorPhone,
  replicatedWebsiteUrl,
}: MarketingAssetLibraryProps) {
  const [selectedAsset, setSelectedAsset] = useState<MarketingAsset | null>(null);
  const [customization, setCustomization] = useState<AssetCustomization>({
    assetId: '',
    distributorName,
    distributorCode,
    distributorEmail,
    distributorPhone,
    replicatedWebsiteUrl,
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const applyMergeFields = (text: string): string => {
    return text
      .replace(/\{\{DISTRIBUTOR_NAME\}\}/g, customization.distributorName)
      .replace(/\{\{DISTRIBUTOR_CODE\}\}/g, customization.distributorCode)
      .replace(/\{\{REPLICATED_WEBSITE\}\}/g, customization.replicatedWebsiteUrl)
      .replace(/\{\{DISTRIBUTOR_PHONE\}\}/g, customization.distributorPhone || '(555) 123-4567')
      .replace(/\{\{DISTRIBUTOR_EMAIL\}\}/g, customization.distributorEmail || 'you@example.com');
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(applyMergeFields(text));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadImage = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${filename}-${distributorCode}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderSocialMediaAssets = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {SOCIAL_MEDIA_ASSETS.map((asset) => {
        if (asset.category !== 'social') return null;
        return (
          <Card key={asset.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-square bg-muted relative overflow-hidden">
              <img
                src={asset.imageUrl}
                alt={asset.title}
                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setSelectedAsset(asset)}
              />
            </div>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <CardTitle className="text-lg">{asset.title}</CardTitle>
                  <CardDescription className="mt-1">{asset.description}</CardDescription>
                </div>
                <Badge variant="secondary" className="capitalize">
                  {asset.platform}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => handleDownloadImage(asset.imageUrl, asset.id)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSelectedAsset(asset)}>
                  <ImageIcon className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{asset.dimensions}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderEmailTemplates = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {EMAIL_TEMPLATES.map((asset) => {
        if (asset.category !== 'email') return null;
        return (
          <Card key={asset.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <CardTitle className="text-lg">{asset.title}</CardTitle>
                  <CardDescription className="mt-1">{asset.description}</CardDescription>
                </div>
                <Mail className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Subject Line</Label>
                <p className="font-medium mt-1">{applyMergeFields(asset.subject)}</p>
              </div>
              {asset.previewText && (
                <div>
                  <Label className="text-xs text-muted-foreground">Preview Text</Label>
                  <p className="text-sm mt-1">{applyMergeFields(asset.previewText)}</p>
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => handleCopy(asset.bodyText, `${asset.id}-text`)}
                >
                  {copiedId === `${asset.id}-text` ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Text
                    </>
                  )}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSelectedAsset(asset)}>
                  View Full
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderVideoScripts = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {VIDEO_SCRIPTS.map((asset) => {
        if (asset.category !== 'video') return null;
        return (
          <Card key={asset.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <CardTitle className="text-lg">{asset.title}</CardTitle>
                  <CardDescription className="mt-1">{asset.description}</CardDescription>
                </div>
                <Video className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Duration:</span>
                <Badge variant="secondary">{asset.duration}</Badge>
              </div>
              {asset.platform && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Platform:</span>
                  <Badge variant="outline" className="capitalize">
                    {asset.platform}
                  </Badge>
                </div>
              )}
              <div>
                <Label className="text-xs text-muted-foreground">Opening Hooks ({asset.hooks.length})</Label>
                <p className="text-sm mt-1 italic">"{asset.hooks[0]}"</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => handleCopy(asset.script, `${asset.id}-script`)}
                >
                  {copiedId === `${asset.id}-script` ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Script
                    </>
                  )}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSelectedAsset(asset)}>
                  View Full
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderAssetPreview = () => {
    if (!selectedAsset) return null;

    return (
      <Dialog open={!!selectedAsset} onOpenChange={() => setSelectedAsset(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedAsset.title}</DialogTitle>
            <DialogDescription>{selectedAsset.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {selectedAsset.category === 'social' && (
              <div className="space-y-4">
                <img
                  src={selectedAsset.imageUrl}
                  alt={selectedAsset.title}
                  className="w-full rounded-lg border"
                />
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => handleDownloadImage(selectedAsset.imageUrl, selectedAsset.id)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Image
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>
                    <strong>Platform:</strong> {selectedAsset.platform}
                  </p>
                  <p>
                    <strong>Dimensions:</strong> {selectedAsset.dimensions}
                  </p>
                </div>
              </div>
            )}

            {selectedAsset.category === 'email' && (
              <div className="space-y-4">
                <div>
                  <Label>Subject Line</Label>
                  <Input value={applyMergeFields(selectedAsset.subject)} readOnly className="mt-2" />
                </div>
                {selectedAsset.previewText && (
                  <div>
                    <Label>Preview Text</Label>
                    <Input
                      value={applyMergeFields(selectedAsset.previewText)}
                      readOnly
                      className="mt-2"
                    />
                  </div>
                )}
                <div>
                  <Label>Email Body (Plain Text)</Label>
                  <Textarea
                    value={applyMergeFields(selectedAsset.bodyText)}
                    readOnly
                    className="mt-2 min-h-[300px] font-mono text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => handleCopy(selectedAsset.bodyText, `${selectedAsset.id}-full`)}
                  >
                    {copiedId === `${selectedAsset.id}-full` ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Text Version
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleCopy(selectedAsset.bodyHtml, `${selectedAsset.id}-html`)}
                  >
                    {copiedId === `${selectedAsset.id}-html` ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy HTML Version
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {selectedAsset.category === 'video' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label>Duration</Label>
                    <p className="mt-1">{selectedAsset.duration}</p>
                  </div>
                  {selectedAsset.platform && (
                    <div>
                      <Label>Platform</Label>
                      <p className="mt-1 capitalize">{selectedAsset.platform}</p>
                    </div>
                  )}
                </div>

                <div>
                  <Label>Opening Hooks (Choose One)</Label>
                  <div className="mt-2 space-y-2">
                    {selectedAsset.hooks.map((hook, index) => (
                      <div key={index} className="p-3 bg-muted rounded-lg">
                        <p className="text-sm italic">"{applyMergeFields(hook)}"</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Full Script</Label>
                  <Textarea
                    value={applyMergeFields(selectedAsset.script)}
                    readOnly
                    className="mt-2 min-h-[400px] font-mono text-sm"
                  />
                </div>

                <div>
                  <Label>Call to Action</Label>
                  <Input
                    value={applyMergeFields(selectedAsset.callToAction)}
                    readOnly
                    className="mt-2"
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={() => handleCopy(selectedAsset.script, `${selectedAsset.id}-script-full`)}
                >
                  {copiedId === `${selectedAsset.id}-script-full` ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Full Script
                    </>
                  )}
                </Button>
              </div>
            )}

            <div className="pt-4 border-t">
              <Label className="text-xs text-muted-foreground">
                All merge fields have been automatically filled with your distributor information.
              </Label>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Marketing Asset Library</h1>
        <p className="text-muted-foreground mt-2">
          Professional marketing materials customized with your distributor information. Download,
          copy, and share to grow your business.
        </p>
      </div>

      <Tabs defaultValue="social" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="social" className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Social Media
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            Video Scripts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="social" className="mt-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Social Media Graphics</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {SOCIAL_MEDIA_ASSETS.length} professional graphics for Instagram, Facebook, Twitter,
              LinkedIn, and TikTok
            </p>
          </div>
          {renderSocialMediaAssets()}
        </TabsContent>

        <TabsContent value="email" className="mt-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Email Templates</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {EMAIL_TEMPLATES.length} ready-to-send email templates with your contact information
            </p>
          </div>
          {renderEmailTemplates()}
        </TabsContent>

        <TabsContent value="video" className="mt-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Video Scripts</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {VIDEO_SCRIPTS.length} professional video scripts for social media and presentations
            </p>
          </div>
          {renderVideoScripts()}
        </TabsContent>
      </Tabs>

      {renderAssetPreview()}
    </div>
  );
}
