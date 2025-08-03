import { type NextRequest, NextResponse } from "next/server"
import { sendEmail, generateApplicationConfirmationEmail, generateHRNotificationEmail } from "@/lib/email"
import { uploadToImgBB, validateImageFile } from "@/lib/imgbb-upload"
import { createApplication, getApplicationStats, getApplications } from "@/lib/firestore-applictions"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Extract form data
    const applicationData = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      zipCode: formData.get("zipCode") as string,
      nationality: formData.get("nationality") as string,
      dateOfBirth: formData.get("dateOfBirth") as string,
      gender: formData.get("gender") as string,
      maritalStatus: formData.get("maritalStatus") as string,
      nationalId: formData.get("nationalId") as string,
      position: formData.get("position") as string,
      department: formData.get("department") as string,
      salaryExpectation: formData.get("salaryExpectation") as string,
      availableStartDate: formData.get("availableStartDate") as string,
      employmentType: formData.get("employmentType") as string,
      coverLetter: formData.get("coverLetter") as string,
      linkedinUrl: formData.get("linkedinUrl") as string,
      portfolioUrl: formData.get("portfolioUrl") as string,
      referralSource: formData.get("referralSource") as string,
      workAuthorization: formData.get("workAuthorization") as string,
      backgroundCheck: formData.get("backgroundCheck") === "true",
      drugTest: formData.get("drugTest") === "true",
    }

    // Parse arrays
    const workExperience = JSON.parse((formData.get("workExperience") as string) || "[]")
    const education = JSON.parse((formData.get("education") as string) || "[]")
    const skills = JSON.parse((formData.get("skills") as string) || "[]")

    // Validate required fields
    if (
      !applicationData.firstName ||
      !applicationData.lastName ||
      !applicationData.email ||
      !applicationData.phone ||
      !applicationData.position ||
      !applicationData.nationality ||
      !applicationData.nationalId ||
      !applicationData.workAuthorization
    ) {
      return NextResponse.json({ error: "الحقول المطلوبة مفقودة" }, { status: 400 })
    }

    // Get ImgBB API key
    const imgbbApiKey = process.env.IMGBB_API_KEY
    if (!imgbbApiKey) {
      return NextResponse.json({ error: "خدمة رفع الصور غير متوفرة" }, { status: 500 })
    }

    // Handle file uploads
    const files: Record<string, string> = {}
    const fileTypes = ["resume", "coverLetter", "portfolio", "idPhoto", "nationalIdCopy"]

    for (const fileType of fileTypes) {
      const file = formData.get(fileType) as File
      if (file && file.size > 0) {
        try {
          if (fileType === "idPhoto" || fileType === "nationalIdCopy") {
            // Validate image files
            const validation = validateImageFile(file)
            if (!validation.valid) {
              return NextResponse.json({ error: `${fileType}: ${validation.error}` }, { status: 400 })
            }

            // Upload image to ImgBB
            const result = await uploadToImgBB(file, imgbbApiKey, 0) // No expiration for application files
            files[fileType] = result.data.url
          } else {
            // For non-image files, you might want to use a different service
            // For now, we'll skip non-image files or you can integrate another service
            console.log(`Skipping non-image file: ${fileType}`)
          }
        } catch (error) {
          console.error(`Error uploading ${fileType}:`, error)
          return NextResponse.json(
            {
              error: `فشل في رفع الملف: ${fileType}`,
            },
            { status: 500 },
          )
        }
      }
    }

    // Create application in Firestore
    const applicationId = await createApplication({
      ...applicationData,
      workExperience,
      education,
      skills,
      files,
    })

    // Send confirmation email to applicant
    try {
      await sendEmail({
        to: applicationData.email,
        subject: "تأكيد استلام طلب التوظيف",
        html: generateApplicationConfirmationEmail(applicationData),
      })
    } catch (error) {
      console.error("Error sending confirmation email:", error)
    }

    // Send notification email to HR
    try {
      const hrEmail = process.env.HR_EMAIL || "hr@company.com"
      await sendEmail({
        to: hrEmail,
        subject: "طلب توظيف جديد",
        html: generateHRNotificationEmail(applicationData),
      })
    } catch (error) {
      console.error("Error sending HR notification:", error)
    }

    return NextResponse.json({
      success: true,
      message: "تم إرسال طلب التوظيف بنجاح",
      applicationId,
    })
  } catch (error) {
    console.error("Application submission error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "حدث خطأ أثناء إرسال الطلب",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") as any
    const position = searchParams.get("position")
    const limitParam = searchParams.get("limit")
    const statsOnly = searchParams.get("stats") === "true"

    if (statsOnly) {
      const stats = await getApplicationStats()
      return NextResponse.json(stats)
    }

    const options = {
      status,
      position: position || undefined,
      limit: limitParam ? Number.parseInt(limitParam) : 10,
    }

    const result = await getApplications(options)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json(
      {
        error: "حدث خطأ أثناء جلب الطلبات",
      },
      { status: 500 },
    )
  }
}