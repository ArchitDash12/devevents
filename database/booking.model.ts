import { Schema, model, models, Document, Model, Types } from "mongoose";
import Event from "./event.model";

/**
 * Interface representing the Booking document structure.
 */
export interface IBooking {
  eventId: Types.ObjectId;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type BookingDocument = Document & IBooking;

const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required"],
      index: true, // Index on eventId to optimize query performance when filtering bookings by event
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      validate: {
        validator: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
        message: "Please provide a valid email address",
      },
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Pre-save middleware:
 * 1. Validates that email is non-empty and properly formatted.
 * 2. Verifies that the referenced event exists in the database.
 */
BookingSchema.pre("save", async function (this: BookingDocument) {
  // Validate that required fields are present
  if (!this.eventId) {
    throw new Error("Field 'eventId' is required.");
  }

  if (!this.email || typeof this.email !== "string" || this.email.trim().length === 0) {
    throw new Error("Field 'email' is required and cannot be empty.");
  }

  // Validate and normalize email format
  if (this.isModified("email")) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = this.email.trim().toLowerCase();
    if (!emailRegex.test(trimmedEmail)) {
      throw new Error(`Invalid email format: "${this.email}".`);
    }
    this.email = trimmedEmail;
  }

  // Verify that referenced eventId corresponds to an existing event
  if (this.isModified("eventId")) {
    if (!Types.ObjectId.isValid(this.eventId)) {
      throw new Error(`Invalid eventId: "${this.eventId}". Must be a valid ObjectId.`);
    }

    const eventExists = await Event.findById(this.eventId);
    if (!eventExists) {
      throw new Error(`Referenced event with ID "${this.eventId}" does not exist.`);
    }
  }
});

// Prevent model recompilation during Next.js Hot Module Replacement (HMR)
const Booking: Model<IBooking> =
  (models.Booking as Model<IBooking>) || model<IBooking>("Booking", BookingSchema);

export { Booking };
export default Booking;

