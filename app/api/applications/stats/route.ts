import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    // Get total applications
    const [totalResult] = await sql`
      SELECT COUNT(*) as total FROM applications
    `

    // Get applications by status
    const statusStats = await sql`
      SELECT status, COUNT(*) as count 
      FROM applications 
      GROUP BY status
      ORDER BY count DESC
    `

    // Get applications by position
    const positionStats = await sql`
      SELECT position, COUNT(*) as count 
      FROM applications 
      GROUP BY position
      ORDER BY count DESC
      LIMIT 10
    `

    // Get applications by month (last 12 months)
    const monthlyStats = await sql`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as count
      FROM applications 
      WHERE created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `

    // Get recent applications
    const recentApplications = await sql`
      SELECT 
        id, first_name, last_name, position, status, created_at
      FROM applications 
      ORDER BY created_at DESC
      LIMIT 5
    `

    return NextResponse.json({
      total: Number.parseInt(totalResult.total),
      statusStats,
      positionStats,
      monthlyStats,
      recentApplications,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء جلب الإحصائيات" }, { status: 500 })
  }
}
