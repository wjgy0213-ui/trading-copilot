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
    price: 39.99,
    priceId: process.env.STRIPE_PRO_PRICE_ID || '',
    yearlyPrice: 239.88,
    yearlyMonthly: 19.99,
    yearlyPriceId: process.env.STRIPE_YEARLY_PRO_PRICE_ID || 'price_YEARLY_PRO_PLACEHOLDER',
    features: ['AI策略定制', '高级回测', '参数优化器', '12+策略模板', '回测报告导出'],
  },
  elite: {
    name: 'Elite',
    price: 79.99,
    priceId: process.env.STRIPE_ELITE_PRICE_ID || '',
    yearlyPrice: 479.88,
    yearlyMonthly: 39.99,
    yearlyPriceId: process.env.STRIPE_YEARLY_ELITE_PRICE_ID || 'price_YEARLY_ELITE_PLACEHOLDER',
    features: ['Pro全部功能', '实盘自动化', '风控系统', 'Telegram通知', '优先支持'],
  },
} as const;

export type PlanId = keyof typeof PLANS;
export type BillingInterval = 'monthly' | 'yearly';

// Course products (one-time payment)
export const COURSE_PLANS = {
  basic: {
    name: '课程基础版',
    price: 49,
    priceId: process.env.STRIPE_COURSE_BASIC_PRICE_ID || '',
    eliteMonths: 1,
    features: ['全部课程终身访问', '策略模板库', '1个月Pro体验'],
  },
  bundle: {
    name: '课程+工具包',
    price: 99,
    priceId: process.env.STRIPE_COURSE_BUNDLE_PRICE_ID || '',
    eliteMonths: 3,
    features: ['全部课程终身访问', '策略模板库', '实战案例集', '3个月Elite体验'],
    popular: true,
  },
  vip: {
    name: '全家桶VIP',
    price: 149,
    priceId: process.env.STRIPE_COURSE_VIP_PRICE_ID || '',
    eliteMonths: 6,
    features: ['全部课程终身访问', '策略模板库', '实战案例集', '1v1策略复盘', '6个月Elite体验', '专属交流群'],
  },
} as const;

export type CoursePlanId = keyof typeof COURSE_PLANS;
