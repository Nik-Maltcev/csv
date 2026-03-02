import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const wpgCode = request.nextUrl.searchParams.get("code")
  const filename = request.nextUrl.searchParams.get("filename")

  if (!wpgCode || !/^\d+$/.test(wpgCode)) {
    return NextResponse.json({ error: "Invalid WPG code" }, { status: 400 })
  }

  const pdfUrl = `https://www.walterscheid.com/out/pictures/media/ersatzteillisten/${wpgCode}.pdf`

  try {
    const response = await fetch(pdfUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `PDF not found (status ${response.status})` },
        { status: response.status }
      )
    }

    const blob = await response.blob()
    const safeName = (filename || wpgCode).replace(/[/\\?%*:|"<>]/g, "_")
    const headers = new Headers()
    headers.set("Content-Type", "application/pdf")
    headers.set("Content-Disposition", `attachment; filename="${encodeURIComponent(safeName)}.pdf"`)
    headers.set("Content-Length", blob.size.toString())

    return new NextResponse(blob, { status: 200, headers })
  } catch {
    return NextResponse.json({ error: "Failed to fetch PDF" }, { status: 500 })
  }
}
