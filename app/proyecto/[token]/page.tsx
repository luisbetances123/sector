import PortalBrokerClient from './PortalBrokerClient';

export const dynamic = 'force-dynamic';

export default function PortalBrokerPage({ params }: { params: { token: string } }) {
  return <PortalBrokerClient token={params.token} />;
}
