import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';

export default function SiteLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
