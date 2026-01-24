import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

// Simple file-based storage for page views (persisted to disk)
const VIEWS_FILE = path.join(process.cwd(), ".next", "page-views.json")

function getPageViews(): Record<string, number> {
  try {
    if (fs.existsSync(VIEWS_FILE)) {
      const data = fs.readFileSync(VIEWS_FILE, "utf-8")
      return JSON.parse(data)
    }
  } catch (error) {
    console.error("Error reading page views file:", error)
  }
  return {}
}

function savePageViews(views: Record<string, number>) {
  try {
    const dir = path.dirname(VIEWS_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(VIEWS_FILE, JSON.stringify(views, null, 2))
  } catch (error) {
    console.error("Error saving page views:", error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { page } = await req.json()

    if (!page) {
      return NextResponse.json(
        { error: "Page name is required" },
        { status: 400 }
      )
    }

    const views = getPageViews()
    views[page] = (views[page] || 0) + 1
    savePageViews(views)

    return NextResponse.json(
      {
        success: true,
        page,
        totalViews: views[page],
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error tracking page view:", error)
    return NextResponse.json(
      { error: "Failed to track page view" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const page = req.nextUrl.searchParams.get("page")

    if (!page) {
      return NextResponse.json(
        { error: "Page name is required" },
        { status: 400 }
      )
    }

    const views = getPageViews()
    const totalViews = views[page] || 0

    return NextResponse.json(
      { page, totalViews },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error fetching page views:", error)
    return NextResponse.json(
      { error: "Failed to fetch page views" },
      { status: 500 }
    )
  }
}


