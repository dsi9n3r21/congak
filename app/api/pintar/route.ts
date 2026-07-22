import { NextRequest, NextResponse } from "next/server";
import type { PintarChatRequest, PintarChatResponse } from "@/lib/pintar/types";

// The browser calls THIS route, not Pintar's engine directly. The shared
// secret (PINTAR_API_KEY) only ever lives server-side — it's never sent to
// or readable by the client. Set both env vars in Vercel (Production +
// Preview), not in any committed file:
//   PINTAR_ENGINE_URL=https://basrim.com.my/pintar-engine/chat
//   PINTAR_API_KEY=<the shared secret Lynda's husband gave us>

const PINTAR_ENGINE_URL = process.env.PINTAR_ENGINE_URL ?? "https://basrim.com.my/pintar-engine/chat";
const PINTAR_API_KEY = process.env.PINTAR_API_KEY;

export async function POST(request: NextRequest) {
  if (!PINTAR_API_KEY) {
    return NextResponse.json({ error: "Pintar is not configured yet." }, { status: 503 });
  }

  let body: PintarChatRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const engineRes = await fetch(PINTAR_ENGINE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-pintar-key": PINTAR_API_KEY,
      },
      body: JSON.stringify(body),
      // This route is itself already server-side, so no CORS issue here —
      // CORS only applies to the browser calling us, and our own /api
      // routes are same-origin by definition.
    });

    if (!engineRes.ok) {
      return NextResponse.json({ error: "Pintar could not respond right now." }, { status: 502 });
    }

    const data: PintarChatResponse = await engineRes.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Pintar could not respond right now." }, { status: 502 });
  }
}
