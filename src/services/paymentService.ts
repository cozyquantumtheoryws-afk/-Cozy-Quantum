
import { supabase } from '../lib/supabaseClient';

export const paymentService = {
  async initiateCheckout(bookId: number, userId: string) {
    try {
      console.log(`Initiating checkout for Book ${bookId}...`);
      
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { bookId, userId }
      });

      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No URL returned from checkout session");
      }
    } catch (error) {
      console.error('Checkout Error:', error);
      alert('Failed to initiate checkout sequences. The quantum cash register is jammed.');
    }
  }
};
