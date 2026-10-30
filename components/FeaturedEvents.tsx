import EventCard from "@/components/EventCard";
import { IEvent } from "@/database";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const FeaturedEvents = async () => {
  if (!BASE_URL) {
    console.error("NEXT_PUBLIC_BASE_URL is not configured.");
    return <p>Unable to load events. Server configuration error.</p>;
  }

  const response = await fetch(`${BASE_URL}/api/events`);

  if (!response.ok) {
    console.error(`Failed to fetch events: ${response.status} ${response.statusText}`);
    return <p>Failed to load events. Please try again later.</p>;
  }

  const { events } = await response.json();

  if (!events || events.length === 0) {
    return <p>No events found.</p>;
  }

  return (
    <ul className="events list-none">
      {events.map((event: IEvent) => (
        <li key={event.title} className="list-none">
          <EventCard {...event} />
        </li>
      ))}
    </ul>
  );
};

export default FeaturedEvents;

