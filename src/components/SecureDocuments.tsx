/**
 * Secure Documents Component
 * Upload-only interface for encrypted document storage
 */

import { useState, useRef, useEffect } from "react";
import {
  Upload,
  Shield,
  Loader2,
  AlertCircle,
  Lock,
  CheckCircle2,
  FileText,
  Trash2,
  Eye,
  X,
  File,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  uploadSecureDocument,
  listUserDocuments,
  deleteSecureDocument,
  decryptSecureDocument,
  SecureDocument,
} from "@/lib/documentService";

interface SecureDocumentsProps {
  userId: string;
}

export default function SecureDocuments({ userId }: SecureDocumentsProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [viewing, setViewing] = useState<string | null>(null);
  const [documents, setDocuments] = useState<SecureDocument[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<{
    url: string;
    name: string;
    type: string;
  } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{
    fileName: string;
    status: 'encrypting' | 'uploading' | 'success' | 'error';
    message?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchDocuments();
    }
  }, [userId]);

  const fetchDocuments = async () => {
    try {
      console.log("Fetching documents for user:", userId);
      const result = await listUserDocuments(userId);
      console.log("Fetch result:", result);
      if (result.success && result.documents) {
        console.log("Setting documents:", result.documents.length);
        setDocuments(result.documents);
      } else {
        console.log("No documents found or fetch failed");
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Only PNG, JPG, and PDF files are allowed",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Maximum file size is 10MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress({
      fileName: file.name,
      status: 'encrypting',
    });

    try {
      // Simulate encryption phase
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUploadProgress({
        fileName: file.name,
        status: 'uploading',
      });

      const result = await uploadSecureDocument(file, userId);

      if (result.success) {
        // Refresh document list immediately after success
        await fetchDocuments();
        
        setUploadProgress({
          fileName: file.name,
          status: 'success',
          message: 'Document encrypted and uploaded successfully!',
        });

        // Show success for 1.5 seconds
        await new Promise(resolve => setTimeout(resolve, 1500));
      } else {
        setUploadProgress({
          fileName: file.name,
          status: 'error',
          message: result.error || 'Failed to upload document',
        });
        
        // Show error for 3 seconds
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        toast({
          title: "Upload Failed",
          description: result.error || "Failed to upload document",
          variant: "destructive",
        });
      }
    } catch (error) {
      setUploadProgress({
        fileName: file.name,
        status: 'error',
        message: 'An unexpected error occurred',
      });
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "Upload Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async (documentId: string, documentIdForDelete: string) => {
    if (!confirm("Are you sure you want to permanently delete this document?")) {
      return;
    }

    setDeleting(documentId);
    try {
      const result = await deleteSecureDocument(documentId, documentIdForDelete, userId);

      if (result.success) {
        setDocuments(documents.filter((doc) => doc.id !== documentId));
        toast({
          title: "Document Deleted",
          description: "Document has been permanently removed",
        });
      } else {
        toast({
          title: "Delete Failed",
          description: result.error || "Failed to delete document",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleView = async (documentId: string, fileName: string) => {
    setViewing(documentId);
    try {
      const result = await decryptSecureDocument(documentId, userId);

      if (result.success && result.data) {
        const url = URL.createObjectURL(result.data);
        setPreviewDocument({
          url,
          name: result.fileName || fileName,
          type: result.fileType || "application/octet-stream",
        });
      } else {
        toast({
          title: "View Failed",
          description: result.error || "Failed to load document",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "View Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setViewing(null);
    }
  };

  const closePreview = () => {
    if (previewDocument?.url) {
      URL.revokeObjectURL(previewDocument.url);
    }
    setPreviewDocument(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card variant="elevated" className="relative">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">Secure Documents</h3>
          <p className="text-xs text-muted-foreground">
            Upload encrypted documents securely
          </p>
        </div>
        {
          <Badge 
            variant="outline" 
            className="bg-primary/5 cursor-pointer hover:bg-primary/10 transition-all hover:scale-105"
            onClick={() => setIsModalOpen(true)}
          >
            <File className="w-3 h-3 mr-1" />
            files-{documents.length}
          </Badge>
        }
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.pdf"
        onChange={handleFileSelect}
        className="hidden"
      />

      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-full"
        size="sm"
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            Upload Secure Document
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground mt-3 text-center">
        {documents.length === 0 ? "Upload your first secure document" : "All documents are encrypted with AES-256"}
      </p>

      {/* Documents List Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-background rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col animate-in zoom-in slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Your Documents</h2>
                  <p className="text-sm text-muted-foreground">
                    {documents.length} {documents.length === 1 ? "file" : "files"} uploaded
                  </p>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {documents.map((doc, index) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-all duration-200 animate-in slide-in-from-left"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate mb-1">
                      {doc.file_name}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        {formatSize(doc.file_size)}
                      </span>
                      <span>•</span>
                      <span>{formatDate(doc.upload_date)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={viewing === doc.document_id}
                      onClick={() => handleView(doc.document_id, doc.file_name)}
                      className="hover:bg-primary/10 hover:text-primary transition-colors border-primary/20"
                      title="View Document"
                    >
                      {viewing === doc.document_id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-1" />
                          <span className="text-xs">Loading...</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-1" />
                          <span className="text-xs">View</span>
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={deleting === doc.id}
                      onClick={() => handleDelete(doc.id || '', doc.document_id)}
                      className="hover:bg-destructive/10 hover:text-destructive transition-colors border-destructive/20"
                      title="Delete Document"
                    >
                      {deleting === doc.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-1" />
                          <span className="text-xs">Deleting...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-1" />
                          <span className="text-xs">Delete</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDocument && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={closePreview}
        >
          <div 
            className="bg-background rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col animate-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                <p className="font-semibold text-foreground truncate">
                  {previewDocument.name}
                </p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={closePreview}
                className="rounded-full hover:bg-muted flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-auto p-4 bg-muted/20">
              {previewDocument.type.startsWith('image/') ? (
                <img
                  src={previewDocument.url}
                  alt={previewDocument.name}
                  className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
                />
              ) : previewDocument.type === 'application/pdf' ? (
                <iframe
                  src={previewDocument.url}
                  className="w-full h-full min-h-[600px] rounded-lg"
                  title={previewDocument.name}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <FileText className="w-16 h-16 text-muted-foreground mb-4" />
                  <p className="text-foreground font-medium mb-2">
                    Preview not available
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    This file type cannot be previewed in the browser
                  </p>
                  <a
                    href={previewDocument.url}
                    download={previewDocument.name}
                    className="text-primary hover:underline"
                  >
                    Download to view
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Progress Modal */}
      {uploadProgress && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-2xl shadow-2xl p-8 max-w-md w-full animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col items-center text-center">
              {uploadProgress.status === 'encrypting' && (
                <>
                  <div className="relative w-20 h-20 mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                    <Lock className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Encrypting Document
                  </h3>
                  <p className="text-sm text-muted-foreground mb-1">
                    {uploadProgress.fileName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Applying AES-256 encryption...
                  </p>
                </>
              )}

              {uploadProgress.status === 'uploading' && (
                <>
                  <div className="relative w-20 h-20 mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                    <Upload className="absolute inset-0 m-auto w-8 h-8 text-primary animate-bounce" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Uploading Securely
                  </h3>
                  <p className="text-sm text-muted-foreground mb-1">
                    {uploadProgress.fileName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Transmitting encrypted data...
                  </p>
                </>
              )}

              {uploadProgress.status === 'success' && (
                <>
                  <div className="w-20 h-20 mb-6 rounded-full bg-green-500/10 flex items-center justify-center animate-in zoom-in duration-500">
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-green-600 mb-2">
                    Upload Successful!
                  </h3>
                  <p className="text-sm text-muted-foreground mb-1">
                    {uploadProgress.fileName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Document encrypted and uploaded securely
                  </p>
                </>
              )}

              {uploadProgress.status === 'error' && (
                <>
                  <div className="w-20 h-20 mb-6 rounded-full bg-destructive/10 flex items-center justify-center animate-in zoom-in duration-500">
                    <AlertCircle className="w-12 h-12 text-destructive" />
                  </div>
                  <h3 className="text-xl font-bold text-destructive mb-2">
                    Upload Failed
                  </h3>
                  <p className="text-sm text-muted-foreground mb-1">
                    {uploadProgress.fileName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {uploadProgress.message}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setUploadProgress(null)}
                    className="mt-4"
                  >
                    Close
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
