import { NextRequest, NextResponse } from "next/server";
import { getOrder } from "@/lib/zaprite";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }
  try {
    const order = await getOrder(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (e) {
    console.error("Get order error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to get order" },
      { status: 500 }
    );
  }
}
