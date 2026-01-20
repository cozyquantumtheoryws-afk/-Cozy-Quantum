
import { supabase } from '../lib/supabaseClient';

export const paymentService = {
  async initiateCheckout(bookId: number, userId?: string) {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { bookId, userId, priceId: 'price_12345' }, // priceId would be dynamic in real app
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout Error:', error);
      alert('Failed to initiate checkout sequences. The quantum cash register is jammed.');
    }
  }
};
