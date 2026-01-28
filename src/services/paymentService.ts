
import { supabase } from '../lib/supabaseClient';

export const paymentService = {
  async initiateCheckout(bookId: number, userId: string, priceId?: string) {
    try {
      console.log(`Initiating checkout for Book ${bookId}...`);
      
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { bookId, userId, priceId }
      });

      if (error) throw error;
      
      if (data?.error) {
          throw new Error(data.error);
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No URL returned from checkout session");
      }
    } catch (error: any) {
      console.error('Checkout Error:', error);
      // Try to get the actual message from the server response if available
      const msg = error.message || error.toString();
      alert(`Checkout Failed: ${msg}`);
    }
  }
};
