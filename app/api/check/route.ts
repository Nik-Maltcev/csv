import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const wpgCode = request.nextUrl.searchParams.get("code")

  if (!wpgCode || !/^\d+$/.test(wpgCode)) {
    return NextResponse.json({ error: "Invalid WPG code" }, { status: 400 })
  }

  const pdfUrl = `https://www.walterscheid.com/out/pictures/media/ersatzteillisten/${wpgCode}.pdf`

  try {
    const response = await fetch(pdfUrl, {
      method: "HEAD",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })

    return NextResponse.json({
      code: wpgCode,
      available: response.ok,
      status: response.status,
    })
  } catch {
    return NextResponse.json({
      code: wpgCode,
      available: false,
      status: 0,
    })
  }
}
