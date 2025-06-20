// lib/stripe.ts - ИСПРАВЛЕННАЯ ВЕРСИЯ
import { loadStripe } from '@stripe/stripe-js';

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

// ✅ Создаем промис с правильной обработкой ошибок
export const stripePromise = stripePublishableKey 
  ? loadStripe(stripePublishableKey)
      .then((stripe) => {
        if (stripe) {
          console.log('✅ Stripe.js загружен успешно');
        } else {
          console.error('❌ Stripe.js загружен, но инстанс не создан');
        }
        return stripe;
      })
      .catch((error) => {
        console.error('❌ Ошибка загрузки Stripe.js:', error);
        throw new Error(`Ошибка загрузки Stripe: ${error.message}`);
      })
  : Promise.reject(new Error('Stripe publishable key не настроен'));

export default stripePromise;
