"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/common/card";
import { Button } from "@/components/common/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/common/table";
import { Upload, FileText, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface Transaction {
  id: number;
  documentNumber: string | null;
  surveyNumber: string | null;
  claimant: string | null;
  executant: string | null;
  registrationDate: string | null;
  propertyValue: string | null;
  plotNumber: string | null;
}

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    count?: number;
  } | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setTransactions([]);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
        setResult(null);
        setTransactions([]);
      }
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  async function handleUpload() {
    if (!file) return;

    setUploading(true);
    setResult(null);
    setTransactions([]);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setResult({
          success: false,
          message: data.error || "Upload failed",
        });
        return;
      }

      setResult({
        success: true,
        message: data.message,
        count: data.count,
      });

      // Show the uploaded transactions
      if (data.transactions && data.transactions.length > 0) {
        setTransactions(data.transactions.slice(0, 5)); // Show first 5
      }

      // Reset file after successful upload
      setFile(null);
    } catch (err) {
      setResult({
        success: false,
        message: "An error occurred during upload",
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Card - Made Compact */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Upload Tamil Transaction PDF</CardTitle>
          <CardDescription>
            Upload PDF to extract, translate, and store transaction data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drop Zone - Compact */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
          >
            {file ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-8 h-8 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFile(null)}
                  disabled={uploading}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-10 h-10 mx-auto text-gray-400" />
                <div>
                  <p className="font-medium">Drop PDF here or</p>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    disabled={uploading}
                  />
                  <Button variant="link" size="sm" asChild className="p-0 h-auto">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      Browse Files
                    </label>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Upload Button */}
          {file && (
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Upload & Process"
              )}
            </Button>
          )}

          {/* Result Message */}
          {result && (
            <div
              className={`p-3 rounded-lg flex items-start space-x-3 ${
                result.success
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <p
                  className={`font-medium ${
                    result.success ? "text-green-900" : "text-red-900"
                  }`}
                >
                  {result.success ? "Success!" : "Error"}
                </p>
                <p
                  className={`text-sm ${
                    result.success ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {result.message}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processing Loader */}
      {uploading && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <div className="text-center">
                <p className="text-lg font-medium">Processing your PDF...</p>
                <p className="text-sm text-gray-500">Extracting and translating transactions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transactions Preview */}
      {!uploading && transactions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Uploaded Transactions</CardTitle>
                <CardDescription>
                  Showing {transactions.length} of {result?.count || 0} transactions
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard/transactions")}
              >
                View All →
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Doc </TableHead>
                    <TableHead>Survey </TableHead>
                    <TableHead>Claimant (Buyer)</TableHead>
                    <TableHead>Executant (Seller)</TableHead>
                    <TableHead>Plot No </TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead>Market Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-mono text-xs">
                        {tx.documentNumber || "N/A"}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {tx.surveyNumber || "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[180px] truncate">
                          {tx.claimant || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[180px] truncate">
                          {tx.executant || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {tx.plotNumber || "N/A"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {tx.registrationDate || "N/A"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {tx.propertyValue || "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {result && result.count && result.count > 5 && (
              <div className="mt-4 text-center">
                <Button
                  variant="link"
                  onClick={() => router.push("/dashboard/transactions")}
                >
                  View all {result.count} transactions →
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

