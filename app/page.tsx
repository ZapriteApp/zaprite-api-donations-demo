"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const PRESETS = [1, 5, 10, 25, 50, 100];

export default function DonationsPage() {
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [totals, setTotals] = useState<{
    totalDonations: number;
    totalAmount: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data && typeof data.totalDonations === "number")
          setTotals({
            totalDonations: data.totalDonations,
            totalAmount: data.totalAmount ?? 0,
          });
      })
      .catch(() => {});
  }, []);

  const selectedAmount =
    amount !== null ? amount : (customAmount ? parseFloat(customAmount) : null);
  const isValid =
    selectedAmount !== null &&
    !Number.isNaN(selectedAmount) &&
    selectedAmount > 0;

  async function handleDonate() {
    if (!isValid || selectedAmount == null) return;
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: selectedAmount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create order");
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      throw new Error("No checkout URL");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">
              St. Michael&apos;s Community Church
            </CardTitle>
            <CardDescription className="text-base">
              Our church family supports local families in need, community meals,
              and youth programs. Your gift helps us keep the doors open and the
              coffee on. Every dollar goes directly to our outreach and
              ministries—thank you for being part of this community.
            </CardDescription>
          </CardHeader>
        </Card>

        {(totals !== null && (totals.totalDonations > 0 || totals.totalAmount > 0)) && (
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total impact</CardTitle>
              <CardDescription>
                So far our community has given:
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-6">
              <div>
                <p className="text-2xl font-semibold tabular-nums text-primary">
                  {totals.totalDonations}
                </p>
                <p className="text-sm text-muted-foreground">
                  Total donations
                </p>
              </div>
              <div>
                <p className="text-2xl font-semibold tabular-nums text-primary">
                  ${(totals.totalAmount / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-muted-foreground">Total amount</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Choose an amount</CardTitle>
            <CardDescription>
              Select a preset or enter a custom amount (USD).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-3">
              {PRESETS.map((value) => (
                <Button
                  key={value}
                  variant={amount === value ? "default" : "outline"}
                  size="lg"
                  className="h-12"
                  onClick={() => {
                    setAmount(value);
                    setCustomAmount("");
                  }}
                >
                  ${value}
                </Button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-3 flex flex-col gap-2">
                <label
                  htmlFor="custom-amount"
                  className="text-sm font-medium text-muted-foreground"
                >
                  Custom amount
                </label>
                <Input
                  id="custom-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Enter amount (e.g. 15.00)"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setAmount(null);
                  }}
                />
              </div>
            </div>
            <Button
              size="lg"
              className="w-full"
              disabled={!isValid || loading}
              onClick={handleDonate}
            >
              {loading ? "Redirecting…" : `Donate $${selectedAmount != null ? selectedAmount.toFixed(2) : "—"}`}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
