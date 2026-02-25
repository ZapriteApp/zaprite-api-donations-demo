import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getOrder } from "@/lib/zaprite";

type Props = {
  searchParams: Promise<{ orderId?: string; order_id?: string }>;
};

export default async function ThankYouPage({ searchParams }: Props) {
  const params = await searchParams;
  const orderId = params.orderId ?? params.order_id ?? null;

  let order: Awaited<ReturnType<typeof getOrder>> = null;
  if (orderId) {
    try {
      order = await getOrder(orderId);
    } catch {
      order = null;
    }
  }

  const transaction = order?.transactions?.[0];
  const amount =
    typeof transaction?.amount === "number"
      ? transaction.amount
      : null;
  const methodRaw = transaction?.method ?? transaction?.paymentMethod ?? "Payment";
  const method = typeof methodRaw === "string" ? methodRaw : String(methodRaw ?? "Payment");
  const createdAt = transaction?.createdAt ?? order?.createdAt ?? null;
  const dateTime = createdAt
    ? new Date(createdAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-md px-4 py-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Thank you</CardTitle>
            <CardDescription>
              Your generosity supports our church community and outreach.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {order && (amount != null || dateTime || method) ? (
              <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Transaction details
                </p>
                {dateTime && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Date & time:</span>{" "}
                    {dateTime}
                  </p>
                )}
                {amount != null && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Amount:</span>{" "}
                    ${(Number(amount) / 100).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    {transaction?.currency ?? "USD"}
                  </p>
                )}
                <p className="text-sm">
                  <span className="text-muted-foreground">Method:</span>{" "}
                  {method}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Your donation has been received. If you have any questions,
                please contact us.
              </p>
            )}
            <Link
              href="/"
              className={cn(buttonVariants({ variant: "outline" }), "w-full")}
            >
              Back to donations
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
