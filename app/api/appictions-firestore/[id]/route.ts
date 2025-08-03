import { deleteApplication, getApplication, updateApplicationStatus } from "@/lib/firestore-applictions"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const application = await getApplication(params.id)

    if (!application) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 })
    }

    return NextResponse.json({ application })
  } catch (error) {
    console.error("Error fetching application:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء جلب تفاصيل الطلب" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { status } = await request.json()

    const validStatuses = ["pending", "reviewing", "interview", "accepted", "rejected"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "حالة الطلب غير صحيحة" }, { status: 400 })
    }

    await updateApplicationStatus(params.id, status)

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
    await deleteApplication(params.id)

    return NextResponse.json({
      success: true,
      message: "تم حذف الطلب بنجاح",
    })
  } catch (error) {
    console.error("Error deleting application:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء حذف الطلب" }, { status: 500 })
  }
}
