import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, readdir, unlink, stat } from "fs/promises";
import { join } from "path";
import { get_current_user } from "@/lib/auth";
import { extract_transactions_from_pdf } from "@/lib/pdf/extractor";
import { translate_extracted_transactions } from "@/lib/translation/batch-translator";
import { db } from "@/lib/db/client";
import { transactions } from "@/lib/db/schema";
import { TRANSACTION_DB_COLUMN_MAP, ExtractedTransaction } from "@/types";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");
const MAX_FILES_TO_KEEP = 5;

async function _cleanup_old_files(): Promise<void> {
  try {
    const files = await readdir(UPLOAD_DIR);
    
    if (files.length <= MAX_FILES_TO_KEEP) {
      return;
    }

    const fileStats = await Promise.all(
      files.map(async (filename) => {
        const filepath = join(UPLOAD_DIR, filename);
        const stats = await stat(filepath);
        return { filename, filepath, mtime: stats.mtime.getTime() };
      })
    );

    fileStats.sort((a, b) => b.mtime - a.mtime);
    const filesToDelete = fileStats.slice(MAX_FILES_TO_KEEP);
    
    await Promise.all(
      filesToDelete.map(async (file) => {
        await unlink(file.filepath);
      })
    );
  } catch (error) {
    console.error("Error cleaning up old files:", error);
  }
}

/**
 """
 Handles PDF file upload, parsing, translation, and storage.
 """
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await get_current_user();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Get form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }
    
    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }
    
    // Read file buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Save file
    await mkdir(UPLOAD_DIR, { recursive: true });
    const filename = `${Date.now()}-${file.name}`;
    const filepath = join(UPLOAD_DIR, filename);
    await writeFile(filepath, buffer);
    
    // 1) Extract (Tamil, raw)
    const parsedTransactions = await extract_transactions_from_pdf(buffer);
    
    if (parsedTransactions.length === 0) {
      return NextResponse.json(
        { error: "No transactions found in PDF" },
        { status: 400 }
      );
    }
    
    // 2) Basic validation filter: require documentNumber
    const validTransactions = parsedTransactions.filter(t => t.documentNumber && t.documentNumber.trim() !== "");
    
    if (validTransactions.length === 0) {
      return NextResponse.json(
        { error: "No valid transactions found in PDF" },
        { status: 400 }
      );
    }
    
    // 3) Translate batch to English (returns same shape)
    const translated = await translate_extracted_transactions(validTransactions);

    // 4) Insert transactions - Drizzle expects camelCase keys
    const savedTransactions: any[] = [];
    for (const tx of translated) {
      // Drizzle expects camelCase keys matching the schema property names
      const rowData = {
        surveyNumber: tx.surveyNumber,
        documentNumber: tx.documentNumber,
        documentYear: tx.documentYear,
        registrationDate: tx.registrationDate,
        executionDate: tx.executionDate,
        transactionType: tx.transactionType,
        executant: tx.executant,
        claimant: tx.claimant,
        plotNumber: tx.plotNumber,
        propertyDescription: tx.propertyDescription,
        propertyValue: tx.propertyValue,
        pdfSource: filename,
      };
      
      const [saved] = await db.insert(transactions).values(rowData).returning();
      savedTransactions.push(saved);
    }
    
    await _cleanup_old_files();
    
    return NextResponse.json({
      success: true,
      message: `Successfully processed ${savedTransactions.length} transaction(s)`,
      count: savedTransactions.length,
      transactions: savedTransactions,
    });
  } catch (error) {
    console.error("Upload error:", error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "An error occurred during upload" },
      { status: 500 }
    );
  }
}

