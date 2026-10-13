import { Account } from '@/components/Account';
import { Container } from '@/components/Container';
export const metadata = { title: 'My account', robots: { index: false } };
export default function Page() { return <Container className="py-16"><Account /></Container>; }
