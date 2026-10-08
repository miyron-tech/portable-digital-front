import type { Viewport } from 'next';
import './vantage.css';

export const viewport: Viewport = {
  themeColor: '#000000',
  colorScheme: 'dark',
};

export default function LandingLayout({ children }: LayoutProps<'/'>) {
  return children;
}
