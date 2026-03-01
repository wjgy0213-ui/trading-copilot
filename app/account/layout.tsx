import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '账户管理 — 订阅与设置',
  description: '管理你的订阅状态、账户信息和偏好设置。',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
