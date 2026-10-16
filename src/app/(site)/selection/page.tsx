import { Container } from '@/components/Container';
import { SelectionCheckout } from '@/components/SelectionCheckout';
export const metadata = { title: 'Selected services', robots: { index: false, follow: false } };
export default function Page() { return <Container className="selection-page"><SelectionCheckout /></Container>; }
