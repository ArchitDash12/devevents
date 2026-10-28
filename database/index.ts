import Event, { type IEvent, type EventDocument } from "./event.model";
import Booking, { type IBooking, type BookingDocument } from "./booking.model";

export { Event, Booking };
export type { IEvent, EventDocument, IBooking, BookingDocument };

const models = { Event, Booking };
export default models;

