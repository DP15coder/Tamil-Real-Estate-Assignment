"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/common/card";
import { Input } from "@/components/common/input";
import { Button } from "@/components/common/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/common/table";
import { Search, RefreshCw } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { Transaction } from "@/types";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    claimant: "",
    executant: "",
    surveyNumber: "",
    documentNumber: "",
  });

  async function fetchTransactions() {
    setLoading(true);
    try {
      console.log("Current filters:", filters);
      
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          console.log(`  Adding param: ${key} = ${value}`);
          params.append(key, value);
        }
      });

      console.log("Fetching:", `/api/transactions?${params}`);
      const response = await fetch(`/api/transactions?${params}`);
      const data = await response.json();

      if (response.ok) {
        setTransactions(data.transactions);
        console.log("Received transactions:", data.transactions.length);
      }
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTransactions();
  }, []);

  function handleFilterChange(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function handleSearch() {
    fetchTransactions();
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleSearch();
    }
  }

  function handleReset() {
    setFilters({
      executant: "",
      claimant: "",
      surveyNumber: "",
      documentNumber: "",
    });
    fetchTransactions();
  }

  return (
    <div className="space-y-6">
      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter Transactions</CardTitle>
          <CardDescription>
            Filter transactions by buyer, seller, survey number, or document number
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Buyer Name</label>
              <Input
                placeholder="Search buyer name..."
                value={filters.claimant}
                onChange={(e) => handleFilterChange("claimant", e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Seller Name</label>
              <Input
                placeholder="Search seller name..."
                value={filters.executant}
                onChange={(e) => handleFilterChange("executant", e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Survey Number</label>
              <Input
                placeholder="Search survey number..."
                value={filters.surveyNumber}
                onChange={(e) => handleFilterChange("surveyNumber", e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Document Number</label>
              <Input
                placeholder="Search document number..."
                value={filters.documentNumber}
                onChange={(e) => handleFilterChange("documentNumber", e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSearch} className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search
            </Button>
            <Button variant="outline" onClick={handleReset} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Card */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions ({transactions.length})</CardTitle>
          <CardDescription>
            All extracted and translated transactions from uploaded PDFs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No transactions found. Upload a PDF to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Doc No </TableHead>
                    <TableHead>Survey No</TableHead>
                    <TableHead>Claimant (Buyer)</TableHead>
                    <TableHead>Executant (Seller)</TableHead>
                    <TableHead>Property Type</TableHead>
                    <TableHead>Plot </TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead>Market Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-xs">
                        {transaction.documentNumber || "N/A"}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {transaction.surveyNumber || "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px]">
                          <p className="font-medium truncate">
                            {transaction.claimant || "N/A"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px]">
                          <p className="font-medium truncate">
                            {transaction.executant || "N/A"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{transaction.transactionType || "N/A"}</TableCell>
                      <TableCell>{transaction.plotNumber || "N/A"}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {transaction.registrationDate || "N/A"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {transaction.propertyValue || "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

