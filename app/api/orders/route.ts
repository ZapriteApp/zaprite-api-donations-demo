import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/zaprite";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const amount = Number(body?.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    const baseUrl =
      process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    // Zaprite appends ?orderId= to the redirectUrl when redirecting the donor after payment.
    const redirectUrl = `${baseUrl}/thank-you`;

    const { checkoutUrl, orderId } = await createOrder(amount, redirectUrl);

    return NextResponse.json({
      checkoutUrl,
      orderId,
      redirectUrl,
    });
  } catch (e) {
    console.error("Create order error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const { listOrders } = await import("@/lib/zaprite");
  try {
    const orders = await listOrders();
    const totalDonations = orders.length;
    const totalAmount = orders.reduce((sum, o) => {
      const txSum = (o.transactions ?? []).reduce(
        (s, t) => s + (typeof t.amount === "number" ? t.amount : 0),
        0
      );
      return sum + txSum;
    }, 0);
    return NextResponse.json({
      totalDonations,
      totalAmount,
      orders,
    });
  } catch (e) {
    console.error("List orders error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to list orders" },
      { status: 500 }
    );
  }
}
