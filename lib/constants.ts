export type EventItem = {
  title: string;
  image: string;
  slug: string;
  location: string;
  date: string;
  time: string;
}

export const events: EventItem[] = [
  {
    title: "Next.js Conf 2026",
    image: "/images/event1.png",
    slug: "nextjs-conf-2026",
    location: "San Francisco, CA & Virtual",
    date: "October 24, 2026",
    time: "09:00 AM PST",
  },
  {
    title: "Google I/O 2026",
    image: "/images/event2.png",
    slug: "google-io-2026",
    location: "Mountain View, CA & Online",
    date: "May 20, 2026",
    time: "10:00 AM PDT",
  },
  {
    title: "ETHGlobal San Francisco Hackathon",
    image: "/images/event3.png",
    slug: "ethglobal-san-francisco-2026",
    location: "San Francisco, CA",
    date: "November 13, 2026",
    time: "05:00 PM PST",
  },
  {
    title: "AWS re:Invent 2026",
    image: "/images/event4.png",
    slug: "aws-reinvent-2026",
    location: "Las Vegas, NV",
    date: "December 01, 2026",
    time: "08:30 AM PST",
  },
  {
    title: "React Summit 2026",
    image: "/images/event5.png",
    slug: "react-summit-2026",
    location: "Amsterdam, Netherlands & Hybrid",
    date: "June 18, 2026",
    time: "09:30 AM CEST",
  },
  {
    title: "KubeCon + CloudNativeCon North America",
    image: "/images/event6.png",
    slug: "kubecon-cloudnativecon-na-2026",
    location: "Salt Lake City, UT & Virtual",
    date: "November 10, 2026",
    time: "09:00 AM MST",
  },
];

