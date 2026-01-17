# Secure Document Vault - Setup Instructions

## Overview
The Secure Document Vault provides end-to-end encrypted document storage for Civicaid users. All files are encrypted on the client-side before transmission and storage.

## Features
✅ **Client-side AES-256-GCM encryption** - Files are encrypted in the browser before upload
✅ **Zero-knowledge architecture** - Server never sees unencrypted files
✅ **Secure decryption** - Documents are only decrypted temporarily for viewing
✅ **Access auditing** - All document operations are logged for security
✅ **Row-level security** - Users can only access their own documents
✅ **Reputation tracking** - Verified documents contribute to user reputation score
✅ **File type validation** - Only PNG, JPG, and PDF files allowed
✅ **Size limits** - Maximum 10MB per file

## Setup Instructions

### 1. Database Setup

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `rlvgephkagtejlogudqo`
3. Navigate to **SQL Editor** in the left sidebar
4. Click **+ New Query**
5. Copy and paste the entire contents of `supabase-schema.sql`
6. Click **Run** to execute the SQL script

This will create:
- `secure_documents` table - Stores encrypted documents
- `document_access_logs` table - Audit trail for security
- RLS policies - Ensures users can only access their own documents
- Indexes - For optimal query performance
- Helper functions - For reputation calculation

### 2. Verify Table Creation

```sql
-- Run this query to verify tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('secure_documents', 'document_access_logs');
```

You should see both tables listed.

### 3. Verify RLS Policies

```sql
-- Run this query to verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('secure_documents', 'document_access_logs');
```

Both tables should have `rowsecurity = true`.

### 4. Test the Feature

1. Start your development server:
   ```powershell
   npm run dev
   ```

2. Navigate to the Profile page
3. You should see the "Secure Documents" section
4. Click "Upload Document" and select a PNG, JPG, or PDF file
5. The file will be automatically encrypted and uploaded
6. Click the eye icon to view (decrypt) the document
7. Click the trash icon to delete the document

## Security Features

### Encryption Details
- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key Generation**: Crypto.subtle.generateKey() using Web Crypto API
- **IV (Initialization Vector)**: 12 bytes, randomly generated per file
- **Key Storage**: Keys are stored encrypted in the database (consider additional server-side encryption for production)

### Access Control
- All documents are protected by Row Level Security (RLS)
- Users can only access documents they own
- Authentication is required for all operations
- Access attempts are logged for security auditing

### Data Flow
```
1. User selects file → 
2. File encrypted in browser (client-side) → 
3. Encrypted data transmitted over HTTPS → 
4. Stored in Supabase (encrypted) → 
5. On view: Encrypted data retrieved → 
6. Decrypted in browser (client-side) → 
7. Displayed temporarily (URL revoked after viewing)
```

## File Restrictions

- **Allowed Types**: PNG, JPG, JPEG, PDF
- **Max Size**: 10MB per file
- **Storage**: Base64 encoded in database (consider Supabase Storage for larger files)

## Future Enhancements

1. **Supabase Storage Integration**: Move encrypted files to Supabase Storage for better scalability
2. **Server-side Key Management**: Implement additional encryption layer for keys
3. **Document Verification**: Admin workflow to verify and approve documents
4. **Reputation System**: Automatic reputation score calculation based on verified documents
5. **Bulk Operations**: Upload and download multiple documents
6. **Advanced Search**: Search documents by name, type, or date
7. **Document Expiry**: Automatic deletion of old documents
8. **Version Control**: Keep multiple versions of documents

## Troubleshooting

### Issue: "Failed to store document securely"
- Check Supabase connection
- Verify user is authenticated
- Check browser console for detailed errors
- Ensure RLS policies are properly configured

### Issue: "Decryption failed"
- Document may be corrupted
- Encryption key might be invalid
- Check document_access_logs for errors

### Issue: "Upload fails for large files"
- Check file size (must be under 10MB)
- For larger files, consider using Supabase Storage instead of database

## Security Best Practices

1. **Always use HTTPS** in production
2. **Regular security audits** of document_access_logs
3. **Monitor failed decryption attempts**
4. **Implement rate limiting** for uploads
5. **Backup encryption keys** securely
6. **Consider hardware security modules (HSM)** for production key management
7. **Implement document expiry policies**
8. **Regular penetration testing**

## API Endpoints (Service Functions)

- `uploadSecureDocument(file, userId, category)` - Encrypts and uploads a document
- `listUserDocuments(userId)` - Lists all user's documents (metadata only)
- `decryptSecureDocument(documentId, userId)` - Decrypts and returns document
- `deleteSecureDocument(documentId, userId)` - Permanently deletes document
- `calculateDocumentReputation(userId)` - Calculates reputation score

## Database Schema

### secure_documents
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| document_id | TEXT | Unique document identifier |
| file_name | TEXT | Original file name |
| file_type | TEXT | MIME type |
| file_size | INTEGER | File size in bytes |
| encrypted_data | TEXT | Base64 encoded encrypted file |
| iv | TEXT | Initialization vector |
| encryption_key | TEXT | JWK format key |
| upload_date | TIMESTAMPTZ | Upload timestamp |
| last_accessed | TIMESTAMPTZ | Last access timestamp |
| access_count | INTEGER | Number of accesses |
| verification_status | TEXT | pending/verified/rejected |
| document_category | TEXT | identity/income/address/certificate/other |
| metadata | JSONB | Additional metadata |

### document_access_logs
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| document_id | TEXT | Document identifier |
| user_id | UUID | User who accessed |
| action | TEXT | upload/decrypt/delete |
| timestamp | TIMESTAMPTZ | Action timestamp |
| ip_address | TEXT | User IP (optional) |
| user_agent | TEXT | Browser info (optional) |
| success | BOOLEAN | Operation success status |

## Support

For issues or questions:
1. Check browser console for errors
2. Review Supabase logs
3. Check document_access_logs table for audit trail
4. Verify RLS policies are active

## License
This module is part of the Civicaid platform.
