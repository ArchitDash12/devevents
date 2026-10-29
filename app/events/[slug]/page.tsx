import { Suspense } from 'react';
import EventDetails from '@/components/EventDetails';

const EventDetailsPage = ({ params }: { params: Promise<{ slug: string }> }) => {
  return (
    <Suspense fallback={<p>Loading event details...</p>}>
      <EventDetails params={params} />
    </Suspense>
  );
}

export default EventDetailsPage
