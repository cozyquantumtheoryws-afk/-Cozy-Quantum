
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.18.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

serve(async (req) => {
  const signature = req.headers.get("Stripe-Signature");
  const body = await req.text();
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  let event;

  try {
    if (!signature || !webhookSecret) return new Response("Webhook Error", { status: 400 });
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    );
  } catch (err) {
    console.error(`Webhook signature verification failed.`, err.message);
    return new Response(err.message, { status: 400 });
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const bookId = session.metadata?.book_id;
    const userId = session.metadata?.user_id;
    
    // Verify amount (Safety check)
    if (session.amount_total !== 199) {
        console.error("Fraud Alert: Amount mismatch");
        return new Response("Invalid Amount", { status: 400 });
    }

    if (bookId && userId) {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        const { error } = await supabase.from('series_purchases').insert({
            user_id: userId,
            book_id: parseInt(bookId),
            stripe_session_id: session.id,
            amount_total: session.amount_total,
            status: 'completed'
        });

        if (error) console.error("Database Insert Error:", error);
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});
