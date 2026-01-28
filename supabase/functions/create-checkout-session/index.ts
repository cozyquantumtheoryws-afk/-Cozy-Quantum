
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.18.0?target=deno";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") ?? "";

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { bookId, userId } = await req.json();

    if (!bookId) {
       throw new Error("Missing bookId");
    }

    console.log(`Creating session for book: ${bookId}, user: ${userId}`);

    const origin = req.headers.get("origin") || "https://www.cozyquantum.com";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `The Waveform Handyman Vol. ${bookId}`,
              metadata: {
                  book_id: bookId.toString()
              }
            },
            unit_amount: 199, // $1.99
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/?payment_success=true&book_id=${bookId}`,
      cancel_url: `${origin}/`,
      metadata: {
        book_id: bookId.toString(),
        user_id: userId || "anonymous",
      },
    });

    console.log(`Session created: ${session.id}`);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error(`Checkout error: ${error.message}`);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
