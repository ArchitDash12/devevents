import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Event } from "@/database";

/**
 * Route context interface matching Next.js App Router dynamic route parameters.
 */
interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * GET /api/events/[slug]
 * Fetches event details by its unique slug.
 *
 * @param _req - Incoming NextRequest object
 * @param context - Route context containing async dynamic route parameters
 * @returns JSON response with event details or error status
 */
export async function GET(
  _req: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { slug } = await context.params;

    // Validate that slug parameter is present and not blank
    if (!slug || typeof slug !== "string" || slug.trim().length === 0) {
      return NextResponse.json(
        { message: "A valid event slug is required" },
        { status: 400 }
      );
    }

    const sanitizedSlug = decodeURIComponent(slug).trim().toLowerCase();

    // Ensure database connection is established
    await connectDB();

    // Query event by unique slug (lean returns plain object for performance)
    const event = await Event.findOne({ slug: sanitizedSlug }).lean();

    // Return 404 if event is not found
    if (!event) {
      return NextResponse.json(
        { message: `Event with slug '${sanitizedSlug}' not found` },
        { status: 404 }
      );
    }

    // Return 200 with the retrieved event details
    return NextResponse.json(
      {
        message: "Event fetched successfully",
        event,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("API Error - GET /api/events/[slug]:", error);

    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";

    return NextResponse.json(
      {
        message: "Failed to fetch event",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

