import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
}

export const PLANS = {
  pro: {
    name: 'Pro',
    price: 29,
    priceId: process.env.STRIPE_PRO_PRICE_ID || '',
    features: ['AI策略定制', '高级回测', '参数优化器', '8大策略模板', '回测报告导出'],
  },
  elite: {
    name: 'Elite',
    price: 49,
    priceId: process.env.STRIPE_ELITE_PRICE_ID || '',
    features: ['Pro全部功能', '实盘自动化', '风控系统', 'Telegram通知', '优先支持'],
  },
} as const;

export type PlanId = keyof typeof PLANS;
