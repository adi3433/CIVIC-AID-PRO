-- Secure Document Vault Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create secure_documents table
CREATE TABLE IF NOT EXISTS secure_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    document_id TEXT NOT NULL UNIQUE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    encrypted_data TEXT NOT NULL, -- Base64 encoded encrypted file
    iv TEXT NOT NULL, -- Initialization vector for decryption
    encryption_key TEXT NOT NULL, -- Encrypted key stored securely
    upload_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_accessed TIMESTAMPTZ,
    access_count INTEGER DEFAULT 0,
    verification_status TEXT CHECK (verification_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
    document_category TEXT CHECK (document_category IN ('identity', 'income', 'address', 'certificate', 'other')) DEFAULT 'other',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create document_access_logs table for security auditing
CREATE TABLE IF NOT EXISTS document_access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('upload', 'decrypt', 'delete')),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT,
    success BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_secure_documents_user_id ON secure_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_secure_documents_document_id ON secure_documents(document_id);
CREATE INDEX IF NOT EXISTS idx_secure_documents_upload_date ON secure_documents(upload_date DESC);
CREATE INDEX IF NOT EXISTS idx_document_access_logs_user_id ON document_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_document_access_logs_document_id ON document_access_logs(document_id);
CREATE INDEX IF NOT EXISTS idx_document_access_logs_timestamp ON document_access_logs(timestamp DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE secure_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_access_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for secure_documents
-- Users can only read their own documents
CREATE POLICY "Users can view own documents" ON secure_documents
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can only insert their own documents
CREATE POLICY "Users can upload own documents" ON secure_documents
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can only update their own documents (for access tracking)
CREATE POLICY "Users can update own documents" ON secure_documents
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can only delete their own documents
CREATE POLICY "Users can delete own documents" ON secure_documents
    FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for document_access_logs
-- Users can only view their own access logs
CREATE POLICY "Users can view own access logs" ON document_access_logs
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can only insert their own access logs
CREATE POLICY "Users can insert own access logs" ON document_access_logs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_secure_documents_updated_at
    BEFORE UPDATE ON secure_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create view for document statistics (optional, for reputation system)
CREATE OR REPLACE VIEW user_document_stats AS
SELECT 
    user_id,
    COUNT(*) as total_documents,
    COUNT(*) FILTER (WHERE verification_status = 'verified') as verified_documents,
    COUNT(*) FILTER (WHERE verification_status = 'pending') as pending_documents,
    COUNT(*) FILTER (WHERE verification_status = 'rejected') as rejected_documents,
    SUM(file_size) as total_storage_used,
    SUM(access_count) as total_accesses,
    MAX(upload_date) as last_upload_date
FROM secure_documents
GROUP BY user_id;

-- Grant permissions on the view
GRANT SELECT ON user_document_stats TO authenticated;

-- Create function to calculate reputation score
CREATE OR REPLACE FUNCTION calculate_user_reputation(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_reputation INTEGER := 0;
    v_verified_count INTEGER;
    v_total_count INTEGER;
BEGIN
    SELECT 
        COALESCE(verified_documents, 0),
        COALESCE(total_documents, 0)
    INTO v_verified_count, v_total_count
    FROM user_document_stats
    WHERE user_id = p_user_id;
    
    -- Simple reputation calculation: 20 points per verified doc + 5 points per doc
    v_reputation := (v_verified_count * 20) + (v_total_count * 5);
    
    -- Cap at 100
    IF v_reputation > 100 THEN
        v_reputation := 100;
    END IF;
    
    RETURN v_reputation;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON TABLE secure_documents IS 'Stores encrypted documents with client-side encryption';
COMMENT ON TABLE document_access_logs IS 'Audit log for all document access operations';
COMMENT ON COLUMN secure_documents.encrypted_data IS 'Base64 encoded AES-256-GCM encrypted file data';
COMMENT ON COLUMN secure_documents.encryption_key IS 'JWK format encryption key (consider additional server-side encryption in production)';
COMMENT ON COLUMN secure_documents.iv IS 'Base64 encoded initialization vector for AES-GCM';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Secure Document Vault schema created successfully!';
    RAISE NOTICE 'Please ensure:';
    RAISE NOTICE '1. Row Level Security is enabled';
    RAISE NOTICE '2. Users are authenticated before accessing documents';
    RAISE NOTICE '3. HTTPS is enforced in production';
    RAISE NOTICE '4. Regular security audits are performed on document_access_logs';
END $$;
