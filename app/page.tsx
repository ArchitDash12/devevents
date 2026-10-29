import { Suspense } from "react";
import ExploreBtn from "@/components/ExploreBtn";
import FeaturedEvents from "@/components/FeaturedEvents";
import { cacheLife } from "next/cache";

const page = async () => {
  'use cache';
  cacheLife('hours')
  return (
    <section>
      <h1 className="text-center">The Hub for Every Dev <br /> Event You Can&apos;t Miss</h1>
      <p className="text-center mt-5">Hackathons, Meetups, and Conferences, All in One Place</p>

      <ExploreBtn />

      <div className="mt-20 space-y-7">
        <h3>Featured Events</h3>

        <Suspense fallback={<p>Loading events...</p>}>
          <FeaturedEvents />
        </Suspense>
      </div>
    </section>
  )
}

export default page