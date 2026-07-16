# Zaprite API Donations Demo

This is a small demo site for showcasing Zaprite's API in a real donation flow. It lets a donor choose an amount, creates a Zaprite order on the server, redirects the donor to the hosted Zaprite checkout, and then displays the completed order after Zaprite redirects back to the app.

Use it as a starting point if you want to see how Zaprite can power payments, hosted checkouts, donation pages, fundraisers, memberships, or any other flow where your app creates an order and hands payment collection to Zaprite.

## Stack

- [Next.js](https://nextjs.org/) App Router with React Server/API routes
- [React](https://react.dev/) 19 and TypeScript
- [Tailwind CSS](https://tailwindcss.com/) 4
- [shadcn/ui](https://ui.shadcn.com/) style components built on [Radix UI](https://www.radix-ui.com/)
- [lucide-react](https://lucide.dev/) icons
- Zaprite API calls from `lib/zaprite.ts`

The API helper in this demo is intentionally small and easy to read. In a production app, you can use the official [`zaprite/api` JS SDK](https://www.npmjs.com/package/@zaprite/api/) for the same Zaprite order operations with typed helpers and less request boilerplate.

## What The Demo Shows

- Creating a Zaprite order from a server-side Next.js route
- Passing a custom `checkoutId`, `amount`, `currency`, `tags`, and `redirectUrl`
- Redirecting the donor to Zaprite's hosted checkout
- Reading an Order after payment using the returned `orderId`
- Listing recent Orders to display simple donation totals
- Keeping the Zaprite API key on the server, never in browser code

## Getting Started

Install dependencies:

```bash
npm install
```

Create `.env.local` with your Zaprite credentials:

```bash
ZAPRITE_API_KEY=your_zaprite_api_key
ZAPRITE_CHECKOUT_ID=your_custom_checkout_id
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Then run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to try the donation flow.

## Zaprite Setup

To test the full flow, you will need:

- A Zaprite API key with access to create and read Orders
- A Zaprite Checkout configured in your Zaprite account
- The Checkout's custom checkout ID, used as `ZAPRITE_CHECKOUT_ID`

When a donation is submitted, `app/api/orders/route.ts` calls `createOrder()` in `lib/zaprite.ts`. Zaprite returns a hosted `checkoutUrl`, and the app redirects the donor there. After payment, Zaprite redirects back to `/thank-you` with the order ID so the app can fetch and display the final order details.

## Trying The API

The fastest way to experiment is to edit `lib/zaprite.ts`:

- Change the `currency` or amount conversion rules
- Add your own `externalUniqId` format to connect Zaprite orders to records in your database
- Add or change `tags` so orders can be filtered later in Zaprite
- Toggle payment notifications with `disablePaymentNotifs`
- Swap the direct `fetch` calls for the `zaprite/api` SDK once you are ready to build on the official client

For a production app, keep API keys in server-only environment variables, validate amounts against server-side business rules, persist the created order ID in your database, and handle Zaprite webhooks if your app needs asynchronous payment status updates.

## Useful Files

- `app/page.tsx` - donation form and donor-facing UI
- `app/api/orders/route.ts` - creates Zaprite orders and lists totals
- `app/api/orders/[orderId]/route.ts` - fetches a single order
- `lib/zaprite.ts` - minimal Zaprite API helper
- `components/ui/` - reusable shadcn/ui primitives
