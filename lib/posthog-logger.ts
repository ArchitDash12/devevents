"use client";

import posthog from "posthog-js";

export const posthogLog = {
  eventDirectoryExplored() {
    posthog.logger.info("event directory exploration requested", {
      interaction: "hero_cta",
    });
  },
  eventDetailsSelected(eventSlug: string) {
    posthog.logger.info("event details selected", {
      event_slug: eventSlug,
    });
  },
};
