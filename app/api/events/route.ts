import { Event } from "@/database";
import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const formData = await req.formData();

    let event: Record<string, any>;

    try {
      event = Object.fromEntries(formData.entries());
    } catch {
      return NextResponse.json(
        { message: "Invalid form data format" },
        { status: 400 }
      );
    }

    const file = formData.get("image");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { message: "Image file is required" },
        { status: 400 }
      );
    }

    // Parse array fields if they were sent as JSON strings or comma-separated strings
    if (typeof event.agenda === "string") {
      try {
        event.agenda = JSON.parse(event.agenda);
      } catch {
        event.agenda = event.agenda.split(",").map((item: string) => item.trim()).filter(Boolean);
      }
    }

    if (typeof event.tags === "string") {
      try {
        event.tags = JSON.parse(event.tags);
      } catch {
        event.tags = event.tags.split(",").map((tag: string) => tag.trim()).filter(Boolean);
      }
    }

    let tags = JSON.parse(formData.get('tags') as string);
    let agenda = JSON.parse(formData.get('agenda') as string);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: "image", folder: "DevEvent" },
          (error, results) => {
            if (error) return reject(error);
            resolve(results);
          }
        )
        .end(buffer);
    });

    event.image = (uploadResult as { secure_url: string }).secure_url;

    const createdEvent = await Event.create({
      ...event,
      tags: tags,
      agenda: agenda
    });

    return NextResponse.json(
      { message: "Event created successfully", event: createdEvent },
      { status: 201 }
    );
  } catch (e: any) {
    console.error("API Error:", e);
    const errorMessage =
      e instanceof Error
        ? e.message
        : typeof e === "object" && e !== null && e.message
        ? e.message
        : typeof e === "string"
        ? e
        : "Unknown Error";

    return NextResponse.json(
      { message: "Event Creation Failed", error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(){
    try{
        await connectDB();

        const events = await Event.find().sort({ createdAt: -1 })

        return NextResponse.json({ message: 'Events fetched successfully', events }, { status: 200 })
    }
    catch(e){
        return NextResponse.json({ message: 'Event fetching failed', error: e }, { status: 500 })
    }
}


