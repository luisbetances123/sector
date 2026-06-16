import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ message: "Push disabled" }, { status: 200 });
}
