import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ExternalLink, Copy, Share2, Loader2, Download, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface CertificateSectionProps {
  certificate: {
    cert_id: string;
    verify_url?: string;
    proof_url?: string;
    tx_hash?: string;
    cid_doc?: string;
    gateway_url?: string;
    ipfs_url?: string;
  } | null;
  loading?: boolean;
  onRetry?: () => void;
}

export const CertificateSection = ({
  certificate,
  loading = false,
  onRetry,
}: CertificateSectionProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const getIPFSLink = () => {
    // Priority: gateway_url from backend, then construct from cid_doc
    if (certificate?.gateway_url) {
      return certificate.gateway_url;
    }
    if (certificate?.cid_doc) {
      // Check if it's already a full URL
      if (certificate.cid_doc.startsWith('http')) {
        return certificate.cid_doc;
      }
      // If it starts with ipfs://, convert to gateway URL
      if (certificate.cid_doc.startsWith('ipfs://')) {
        const cid = certificate.cid_doc.replace('ipfs://', '');
        return `https://ipfs.io/ipfs/${cid}`;
      }
      // If it's just a CID, use gateway
      if (!certificate.cid_doc.startsWith('local://')) {
        return `https://ipfs.io/ipfs/${certificate.cid_doc}`;
      }
    }
    return null;
  };

  const ipfsLink = getIPFSLink();

  const handleCopyIPFS = () => {
    if (ipfsLink) {
      navigator.clipboard.writeText(ipfsLink);
      toast({
        title: "IPFS link copied!",
        description: "Certificate IPFS link copied to clipboard",
      });
    }
  };

  const handleCopyCertId = () => {
    if (certificate?.cert_id) {
      navigator.clipboard.writeText(certificate.cert_id);
      toast({
        title: "Certificate ID copied!",
        description: "Certificate ID copied to clipboard",
      });
    }
  };

  if (loading) {
    return (
      <Card className="mt-8 border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            Generating Your Certificate
          </CardTitle>
          <CardDescription>
            Please wait while we generate your certificate and upload it to IPFS...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Creating certificate PDF
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Uploading to Pinata IPFS
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-muted" />
              Generating verification link
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!certificate) {
    return null;
  }

  return (
    <Card className="mt-8 border-2 border-green-500/20 bg-gradient-to-br from-green-50/50 to-primary/5 dark:from-green-950/20">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <Award className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                🎓 Certificate Generated!
              </CardTitle>
              <CardDescription className="mt-1">
                Your certificate has been created and uploaded to IPFS. Share the link below!
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Certificate ID */}
        <div className="bg-muted/50 p-4 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Certificate ID:</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs">
                {certificate.cert_id}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyCertId}
                className="h-8 w-8"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* IPFS Link Section - Most Important */}
        {ipfsLink && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-5 rounded-lg border-2 border-blue-200 dark:border-blue-800">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="font-semibold text-lg">IPFS Certificate Link</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your certificate is stored on IPFS. Anyone with this link can view your certificate:
              </p>
              <div className="flex items-center gap-2 bg-background p-3 rounded border">
                <code className="flex-1 text-sm break-all text-primary font-mono">
                  {ipfsLink}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyIPFS}
                  className="shrink-0"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => window.open(ipfsLink, '_blank')}
                  className="flex-1"
                  size="sm"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Certificate
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCopyIPFS}
                  className="flex-1"
                  size="sm"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Link
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Verification Link */}
        {certificate.verify_url && (
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <span className="text-sm font-medium">Verification Link:</span>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs break-all bg-background p-2 rounded">
                {certificate.verify_url}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(certificate.verify_url, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Transaction Hash (if available) */}
        {certificate.tx_hash && (
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <span className="text-sm font-medium">Blockchain Transaction:</span>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs break-all bg-background p-2 rounded">
                {certificate.tx_hash}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(`https://mumbai.polygonscan.com/tx/${certificate.tx_hash}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-4 border-t">
          <Button
            onClick={() => navigate(`/verify?certId=${certificate.cert_id}`)}
            className="w-full"
            size="lg"
          >
            <CheckCircle2 className="mr-2 h-5 w-5" />
            Verify Certificate
          </Button>
          {certificate.proof_url && (
            <Button
              onClick={() => window.open(certificate.proof_url, '_blank')}
              variant="outline"
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Proof Page
            </Button>
          )}
        </div>

        {/* Info Message */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t bg-muted/30 p-3 rounded">
          <p className="font-medium mb-1">✨ Your certificate is stored on IPFS</p>
          <p>Share the IPFS link above with anyone to let them view your certificate. The certificate is permanently stored and cannot be tampered with.</p>
        </div>
      </CardContent>
    </Card>
  );
};

