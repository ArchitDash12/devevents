import { Schema, model, models, Document, Model } from "mongoose";

/**
 * Interface representing the Event document structure.
 */
export interface IEvent {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export type EventDocument = Document & IEvent;

/**
 * Generates a URL-friendly slug from a text string.
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove non-alphanumeric chars (except spaces and hyphens)
    .replace(/\s+/g, "-") // Replace spaces with a single hyphen
    .replace(/-+/g, "-") // Collapse consecutive hyphens
    .replace(/^-+|-+$/g, ""); // Trim leading and trailing hyphens
}

/**
 * Validates and normalizes any valid date string into standard ISO format.
 */
function normalizeDate(dateStr: string): string {
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) {
    throw new Error(`Invalid date format for event: "${dateStr}". Must be a valid date.`);
  }
  return parsed.toISOString();
}

/**
 * Validates and normalizes time input to a consistent format (e.g. "09:00 AM", "14:30", "09:00 AM PST").
 */
function normalizeTime(timeStr: string): string {
  const trimmed = timeStr.trim();
  if (!trimmed) {
    throw new Error("Time field cannot be empty.");
  }

  // Matches 12-hour or 24-hour time with optional seconds, meridiem, and timezone
  const timeRegex = /^(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*(AM|PM|am|pm))?(?:\s+([A-Za-z0-9+-]+))?$/i;
  const match = trimmed.match(timeRegex);

  if (!match) {
    throw new Error(
      `Invalid time format: "${timeStr}". Expected formats like "09:00 AM", "14:30", or "09:00 AM PST".`
    );
  }

  const [, hourStr, minStr, secStr, meridiem, timezone] = match;
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minStr, 10);

  if (minute < 0 || minute > 59) {
    throw new Error(`Invalid minute value in time: "${timeStr}".`);
  }

  if (secStr) {
    const sec = parseInt(secStr, 10);
    if (sec < 0 || sec > 59) {
      throw new Error(`Invalid second value in time: "${timeStr}".`);
    }
  }

  if (meridiem) {
    // 12-hour format: hour must be between 1 and 12
    if (hour < 1 || hour > 12) {
      throw new Error(`Invalid hour value for 12-hour time format: "${timeStr}". Hour must be between 1 and 12.`);
    }
    const formattedHour = hour.toString().padStart(2, "0");
    const upperMeridiem = meridiem.toUpperCase();
    const secPart = secStr ? `:${secStr.padStart(2, "0")}` : "";
    const tzPart = timezone ? ` ${timezone.toUpperCase()}` : "";
    return `${formattedHour}:${minStr.padStart(2, "0")}${secPart} ${upperMeridiem}${tzPart}`;
  } else {
    // 24-hour format: hour must be between 0 and 23
    if (hour < 0 || hour > 23) {
      throw new Error(`Invalid hour value for 24-hour time format: "${timeStr}". Hour must be between 0 and 23.`);
    }
    const formattedHour = hour.toString().padStart(2, "0");
    const secPart = secStr ? `:${secStr.padStart(2, "0")}` : "";
    const tzPart = timezone ? ` ${timezone.toUpperCase()}` : "";
    return `${formattedHour}:${minStr.padStart(2, "0")}${secPart}${tzPart}`;
  }
}

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    overview: {
      type: String,
      required: [true, "Overview is required"],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Image is required"],
      trim: true,
    },
    venue: {
      type: String,
      required: [true, "Venue is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    date: {
      type: String,
      required: [true, "Date is required"],
      trim: true,
    },
    time: {
      type: String,
      required: [true, "Time is required"],
      trim: true,
    },
    mode: {
      type: String,
      required: [true, "Mode is required"],
      trim: true,
    },
    audience: {
      type: String,
      required: [true, "Audience is required"],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, "Agenda is required"],
      validate: {
        validator: (items: string[]) =>
          Array.isArray(items) &&
          items.length > 0 &&
          items.every((item) => typeof item === "string" && item.trim().length > 0),
        message: "Agenda must contain at least one non-empty string item",
      },
    },
    organizer: {
      type: String,
      required: [true, "Organizer is required"],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, "Tags are required"],
      validate: {
        validator: (items: string[]) =>
          Array.isArray(items) &&
          items.length > 0 &&
          items.every((item) => typeof item === "string" && item.trim().length > 0),
        message: "Tags must contain at least one non-empty string item",
      },
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Pre-save middleware:
 * 1. Validates that all required fields are present and non-empty.
 * 2. Generates/regenerates a URL-friendly slug if title is modified.
 * 3. Validates and normalizes date to ISO format.
 * 4. Ensures time is formatted consistently.
 */
EventSchema.pre("save", async function (this: EventDocument) {
  // Validate that required string fields are non-empty
  const requiredStringFields: Array<keyof IEvent> = [
    "title",
    "description",
    "overview",
    "image",
    "venue",
    "location",
    "date",
    "time",
    "mode",
    "audience",
    "organizer",
  ];

  for (const field of requiredStringFields) {
    const val = this[field];
    if (typeof val !== "string" || val.trim().length === 0) {
      throw new Error(`Field '${String(field)}' is required and cannot be empty.`);
    }
  }

  // Validate that required array fields are non-empty
  if (
    !Array.isArray(this.agenda) ||
    this.agenda.length === 0 ||
    this.agenda.some((item) => typeof item !== "string" || item.trim().length === 0)
  ) {
    throw new Error("Field 'agenda' is required and must contain at least one non-empty string item.");
  }

  if (
    !Array.isArray(this.tags) ||
    this.tags.length === 0 ||
    this.tags.some((item) => typeof item !== "string" || item.trim().length === 0)
  ) {
    throw new Error("Field 'tags' is required and must contain at least one non-empty string item.");
  }

  // Auto-generate URL-friendly slug only if title changed or slug is not yet set
  if (this.isModified("title") || !this.slug) {
    this.slug = generateSlug(this.title);
  }

  // Validate and normalize date to ISO format
  if (this.isModified("date")) {
    this.date = normalizeDate(this.date);
  }

  // Validate and normalize time to consistent format
  if (this.isModified("time")) {
    this.time = normalizeTime(this.time);
  }
});

// Prevent model recompilation during Next.js Hot Module Replacement (HMR)
const Event: Model<IEvent> =
  (models.Event as Model<IEvent>) || model<IEvent>("Event", EventSchema);

export { Event };
export default Event;

