import { Admin } from '@/components/Admin';
import { Container } from '@/components/Container';
export const metadata = { title: 'Administration', robots: { index: false, follow: false } };
export default function Page() { return <Container className="py-16"><Admin /></Container>; }
