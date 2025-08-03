import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const applicationId = Number.parseInt(params.id)

    if (isNaN(applicationId)) {
      return NextResponse.json({ error: "معرف الطلب غير صحيح" }, { status: 400 })
    }

    // Get application details
    const [application] = await sql`
      SELECT * FROM applications WHERE id = ${applicationId}
    `

    if (!application) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 })
    }

    // Get work experience
    const workExperience = await sql`
      SELECT * FROM work_experience 
      WHERE application_id = ${applicationId}
      ORDER BY start_date DESC
    `

    // Get education
    const education = await sql`
      SELECT * FROM education 
      WHERE application_id = ${applicationId}
      ORDER BY graduation_year DESC
    `

    // Get skills
    const skills = await sql`
      SELECT skill_name FROM skills 
      WHERE application_id = ${applicationId}
      ORDER BY skill_name
    `

    // Get files
    const files = await sql`
      SELECT file_type, file_name, file_path, file_size, mime_type, created_at
      FROM application_files 
      WHERE application_id = ${applicationId}
      ORDER BY created_at
    `

    return NextResponse.json({
      application,
      workExperience,
      education,
      skills: skills.map((s) => s.skill_name),
      files,
    })
  } catch (error) {
    console.error("Error fetching application:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء جلب تفاصيل الطلب" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const applicationId = Number.parseInt(params.id)
    const { status } = await request.json()

    if (isNaN(applicationId)) {
      return NextResponse.json({ error: "معرف الطلب غير صحيح" }, { status: 400 })
    }

    const validStatuses = ["pending", "reviewing", "interview", "accepted", "rejected"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "حالة الطلب غير صحيحة" }, { status: 400 })
    }

    await sql`
      UPDATE applications 
      SET status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${applicationId}
    `

    return NextResponse.json({
      success: true,
      message: "تم تحديث حالة الطلب بنجاح",
    })
  } catch (error) {
    console.error("Error updating application:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء تحديث الطلب" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const applicationId = Number.parseInt(params.id)

    if (isNaN(applicationId)) {
      return NextResponse.json({ error: "معرف الطلب غير صحيح" }, { status: 400 })
    }

    await sql`DELETE FROM applications WHERE id = ${applicationId}`

    return NextResponse.json({
      success: true,
      message: "تم حذف الطلب بنجاح",
    })
  } catch (error) {
    console.error("Error deleting application:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء حذف الطلب" }, { status: 500 })
  }
}
