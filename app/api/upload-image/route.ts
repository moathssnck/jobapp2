import { uploadToImgBB, validateImageFile } from "@/lib/imgbb-upload"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("image") as File
    const expiration = formData.get("expiration") as string

    if (!file) {
      return NextResponse.json({ error: "لم يتم تحديد صورة" }, { status: 400 })
    }

    // Validate image file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Get ImgBB API key from environment
    const apiKey = process.env.IMGBB_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "مفتاح API غير متوفر" }, { status: 500 })
    }

    // Upload to ImgBB
    const result = await uploadToImgBB(file, apiKey, expiration ? Number.parseInt(expiration) : undefined)

    return NextResponse.json({
      success: true,
      data: {
        id: result.data.id,
        url: result.data.url,
        display_url: result.data.display_url,
        thumb_url: result.data.thumb.url,
        medium_url: result.data.medium.url,
        delete_url: result.data.delete_url,
        size: result.data.size,
        width: result.data.width,
        height: result.data.height,
        filename: result.data.image.filename,
        expiration: result.data.expiration,
      },
    })
  } catch (error) {
    console.error("Image upload error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "فشل في رفع الصورة" }, { status: 500 })
  }
}
