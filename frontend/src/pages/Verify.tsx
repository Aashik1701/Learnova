import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Loader2, ExternalLink, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VerificationResult {
  verified: boolean;
  status: string;
  message?: string;
  cert_id?: string;
  on_chain_cid?: string;
  db_cid?: string;
  tx_hash?: string;
  issued_on?: string;
  proof_url?: string;
  verify_url?: string;
}

const Verify = () => {
  const [searchParams] = useSearchParams();
  const certId = searchParams.get("certId");
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!certId) {
      setVerification({
        verified: false,
        status: "invalid",
        message: "No certificate ID provided",
      });
      setLoading(false);
      return;
    }

    verifyCertificate(certId);
  }, [certId]);

  const verifyCertificate = async (id: string) => {
    try {
      setLoading(true);
      // Use backend API endpoint
      const backendUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${backendUrl}/api/verify?certId=${encodeURIComponent(id)}`);
      
      if (!response.ok) {
        throw new Error("Failed to verify certificate");
      }

      const data: VerificationResult = await response.json();
      setVerification(data);
    } catch (error) {
      console.error("Verification error:", error);
      setVerification({
        verified: false,
        status: "error",
        message: "Failed to verify certificate. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = () => {
    if (!verification) return null;

    if (verification.verified) {
      return (
        <Badge className="bg-green-500 hover:bg-green-600">
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Verified
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive">
          <XCircle className="mr-2 h-4 w-4" />
          Not Verified
        </Badge>
      );
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getPolygonScanUrl = (txHash: string) => {
    // Polygon Mumbai testnet
    return `https://mumbai.polygonscan.com/tx/${txHash}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Verifying certificate...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Certificate Verification</h1>
          <p className="text-muted-foreground">
            Verify blockchain-anchored learning certificates
          </p>
        </div>

        {verification && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Verification Result</CardTitle>
                {getStatusBadge()}
              </div>
              <CardDescription>
                Certificate ID: {verification.cert_id || certId || "N/A"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {verification.verified ? (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800 dark:text-green-200">
                    Certificate Verified
                  </AlertTitle>
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    This certificate has been successfully verified on the blockchain.
                    The certificate document matches the on-chain record.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Verification Failed</AlertTitle>
                  <AlertDescription>
                    {verification.message ||
                      "This certificate could not be verified. It may be invalid, revoked, or not found on the blockchain."}
                  </AlertDescription>
                </Alert>
              )}

              {verification.verified && (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Certificate ID
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-sm break-all">
                          {verification.cert_id || certId}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(verification.cert_id || certId || "")}
                          className="h-8 w-8"
                        >
                          {copied ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Issued On
                      </p>
                      <p className="text-sm">{formatDate(verification.issued_on)}</p>
                    </div>

                    {verification.tx_hash && (
                      <div className="space-y-2 md:col-span-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          Transaction Hash
                        </p>
                        <div className="flex items-center gap-2">
                          <a
                            href={getPolygonScanUrl(verification.tx_hash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-sm text-primary hover:underline break-all"
                          >
                            {verification.tx_hash}
                          </a>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(verification.tx_hash || "")}
                            className="h-8 w-8"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                            <a
                              href={getPolygonScanUrl(verification.tx_hash)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    )}

                    {verification.on_chain_cid && (
                      <div className="space-y-2 md:col-span-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          IPFS Document CID
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-sm break-all">
                            {verification.on_chain_cid}
                          </p>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(verification.on_chain_cid || "")}
                            className="h-8 w-8"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          {verification.proof_url && (
                            <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                              <a
                                href={verification.proof_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {verification.proof_url && (
                    <div className="pt-4 border-t">
                      <Button asChild className="w-full">
                        <a
                          href={verification.proof_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Certificate Document
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  )}
                </>
              )}

              {!verification.verified && verification.status === "not_found" && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-4">
                    The certificate ID you provided was not found in our system.
                    Please verify that you have the correct certificate ID.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>How Verification Works</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>The system checks the certificate record in the database</li>
              <li>It retrieves the IPFS CID stored on the blockchain</li>
              <li>The on-chain CID is compared with the database record</li>
              <li>If they match, the certificate is verified as authentic</li>
              <li>You can view the original certificate document via the IPFS link</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Verify;

