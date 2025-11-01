import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ExternalLink, Download, Share2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface CertificateCompletionProps {
  open: boolean;
  onClose: () => void;
  certificate: {
    cert_id: string;
    verify_url?: string;
    proof_url?: string;
    tx_hash?: string;
    cid_doc?: string;
  } | null;
  loading?: boolean;
}

export const CertificateCompletion = ({
  open,
  onClose,
  certificate,
  loading = false,
}: CertificateCompletionProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleViewCertificate = () => {
    if (certificate?.verify_url) {
      window.open(certificate.verify_url, '_blank');
    } else if (certificate?.cert_id) {
      navigate(`/verify?certId=${certificate.cert_id}`);
    }
    onClose();
  };

  const handleShare = () => {
    if (certificate?.verify_url) {
      navigator.clipboard.writeText(certificate.verify_url);
      toast({
        title: "Link copied!",
        description: "Certificate verification link copied to clipboard",
      });
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Issuing Your Certificate</DialogTitle>
            <DialogDescription>
              Please wait while we generate and anchor your certificate on the blockchain...
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!certificate) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <DialogTitle className="text-2xl">🎓 Certificate Issued!</DialogTitle>
              <DialogDescription className="mt-1">
                Your certificate has been generated and anchored on the blockchain
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Certificate ID:</span>
              <Badge variant="outline" className="font-mono text-xs">
                {certificate.cert_id}
              </Badge>
            </div>
            {certificate.tx_hash && (
              <div className="text-xs text-muted-foreground">
                Transaction: <code className="bg-background px-1 rounded">{certificate.tx_hash.slice(0, 10)}...{certificate.tx_hash.slice(-8)}</code>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={handleViewCertificate} className="w-full" size="lg">
              <ExternalLink className="mr-2 h-4 w-4" />
              View & Verify Certificate
            </Button>
            
            {certificate.verify_url && (
              <Button onClick={handleShare} variant="outline" className="w-full">
                <Share2 className="mr-2 h-4 w-4" />
                Copy Verification Link
              </Button>
            )}

            {certificate.proof_url && (
              <Button
                onClick={() => window.open(certificate.proof_url, '_blank')}
                variant="outline"
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                View Proof Page
              </Button>
            )}
          </div>

          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            Your certificate is stored on IPFS and verified on the blockchain.
            Share the verification link to prove your achievement!
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

