-- Create certificates table for blockchain-anchored certificates
CREATE TABLE public.certificates (
  cert_id VARCHAR(255) PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID NOT NULL,
  cid_doc VARCHAR(255) NOT NULL,
  cid_proof VARCHAR(255),
  tx_hash VARCHAR(255),
  issuer_addr VARCHAR(255) NOT NULL,
  issued_on TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  revoked BOOLEAN DEFAULT false NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' NOT NULL,
  meta JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_certificates_user_id ON public.certificates(user_id);
CREATE INDEX idx_certificates_course_id ON public.certificates(course_id);
CREATE INDEX idx_certificates_tx_hash ON public.certificates(tx_hash);

-- Enable RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Policies for certificates
CREATE POLICY "Users can view their own certificates"
  ON public.certificates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Public can verify certificates"
  ON public.certificates FOR SELECT
  USING (true); -- Allow public verification read access

CREATE POLICY "System can insert certificates"
  ON public.certificates FOR INSERT
  WITH CHECK (true); -- Backend service will have service role key

CREATE POLICY "System can update certificates"
  ON public.certificates FOR UPDATE
  USING (true); -- Backend service will have service role key

-- Create trigger for updating timestamps
CREATE TRIGGER update_certificates_updated_at
  BEFORE UPDATE ON public.certificates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

