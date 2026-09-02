import { NextResponse } from "next/server";
import { leadSchema } from "@/features/quote/quote.schema";
import { persistLead } from "@/lib/leads";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { message: "Invalid lead", code: "VALIDATION_ERROR" } },
      { status: 400 },
    );
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: "Invalid lead", code: "VALIDATION_ERROR" } },
      { status: 400 },
    );
  }

  try {
    const { id } = await persistLead(parsed.data);
    return NextResponse.json({ data: { id } }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: { message: "Unexpected error", code: "INTERNAL_ERROR" } },
      { status: 500 },
    );
  }
}
