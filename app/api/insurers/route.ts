import { NextResponse } from "next/server";
import { insurers } from "@/lib/mock-data/insurers";

export async function GET() {
  return NextResponse.json({ data: insurers });
}
