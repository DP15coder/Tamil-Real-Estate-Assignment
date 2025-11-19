import { NextRequest, NextResponse } from "next/server";
import { and, like, gte, lte, or } from "drizzle-orm";
import { get_current_user } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { transactions } from "@/lib/db/schema";
import { transactionFilterSchema } from "@/lib/validation/schemas";

/**
 """
 Retrieves all transactions with optional filtering.
 """
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await get_current_user();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const filters: Record<string, string> = {};
    
    searchParams.forEach((value, key) => {
      if (value) filters[key] = value;
    });
    
    // Validate filters
    const validatedFilters = transactionFilterSchema.parse(filters);
    
    // Build query conditions
    const conditions = [];
    
    if (validatedFilters.claimant) {
      conditions.push(
        like(transactions.claimant, `%${validatedFilters.claimant}%`)
      );
    }
    
    if (validatedFilters.executant) {
      conditions.push(
        like(transactions.executant, `%${validatedFilters.executant}%`)
      );
    }
    
    if (validatedFilters.surveyNumber) {
      conditions.push(
        like(transactions.surveyNumber, `%${validatedFilters.surveyNumber}%`)
      );
    }
    
    if (validatedFilters.documentNumber) {
      conditions.push(
        like(transactions.documentNumber, `%${validatedFilters.documentNumber}%`)
      );
    }
    
    if (validatedFilters.houseNumber) {
      conditions.push(
        like(transactions.plotNumber, `%${validatedFilters.houseNumber}%`)
      );
    }
    
    if (validatedFilters.startDate) {
      conditions.push(
        gte(transactions.registrationDate, validatedFilters.startDate)
      );
    }
    
    if (validatedFilters.endDate) {
      conditions.push(
        lte(transactions.registrationDate, validatedFilters.endDate)
      );
    }
    
    // Execute query
    const query = db.select().from(transactions);
    
    let results;
    if (conditions.length > 0) {
      results = await query.where(and(...conditions));
    } else {
      results = await query;
    }
    
    return NextResponse.json({
      success: true,
      count: results.length,
      transactions: results,
    });
  } catch (error) {
    console.error("Transactions fetch error:", error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}

