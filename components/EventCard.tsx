'use client';

import Image from 'next/image';
import Link from 'next/link';
import posthog from 'posthog-js';
import { posthogLog } from '@/lib/posthog-logger';
import React from 'react'

interface Props {
    title: string;
    image: string;
    slug: string;
    location: string;
    date: string;
    time: string;
}

const EventCard = ({ title, image, slug, location, date, time }: Props) => {
  return (
    <Link
      href={`/events/${slug}`}
      id="event-card"
      onClick={() => {
        posthog.capture('event_details_selected', { event_slug: slug });
        posthogLog.eventDetailsSelected(slug);
      }}
    >
        <Image src={image} alt={title} width={410} height={300} className="poster" />

        <div className="flex flex-row gap-2">
          <Image src="/icons/pin.svg" alt="location" width={14} height={14} />
          <p>{location}</p>
        </div>

        <p className="title">{title}</p>

        <div className="datetime">
          <div>
            <Image src="/icons/calendar.svg" alt="date" width={14} height={14} />
            <p>{date}</p>
          </div>
          <div>
            <Image src="/icons/clock.svg" alt="time" width={14} height={14} />
            <p>{time}</p>
          </div>
        </div>
    </Link>
  )
}

export default EventCard