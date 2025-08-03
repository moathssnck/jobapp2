import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { uploadFile, validateFileType, validateFileSize } from "@/lib/file-upload"
import { sendEmail, generateApplicationConfirmationEmail, generateHRNotificationEmail } from "@/lib/email"

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

    // Parse work experience, education, and skills
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

    // Check if email already exists
    const existingApplication = await sql`
      SELECT id FROM applications WHERE email = ${applicationData.email}
    `

    if (existingApplication.length > 0) {
      return NextResponse.json({ error: "يوجد طلب مسجل بهذا البريد الإلكتروني مسبقاً" }, { status: 400 })
    }

    // Insert application
    const [application] = await sql`
      INSERT INTO applications (
        first_name, last_name, email, phone, address, city, state, zip_code,
        nationality, date_of_birth, gender, marital_status, national_id,
        position, department, salary_expectation, available_start_date, employment_type,
        cover_letter, linkedin_url, portfolio_url, referral_source,
        work_authorization, background_check, drug_test
      ) VALUES (
        ${applicationData.firstName}, ${applicationData.lastName}, ${applicationData.email}, 
        ${applicationData.phone}, ${applicationData.address}, ${applicationData.city}, 
        ${applicationData.state}, ${applicationData.zipCode}, ${applicationData.nationality}, 
        ${applicationData.dateOfBirth || null}, ${applicationData.gender}, 
        ${applicationData.maritalStatus}, ${applicationData.nationalId}, ${applicationData.position}, 
        ${applicationData.department}, ${applicationData.salaryExpectation}, 
        ${applicationData.availableStartDate || null}, ${applicationData.employmentType}, 
        ${applicationData.coverLetter}, ${applicationData.linkedinUrl}, 
        ${applicationData.portfolioUrl}, ${applicationData.referralSource}, 
        ${applicationData.workAuthorization}, ${applicationData.backgroundCheck}, 
        ${applicationData.drugTest}
      ) RETURNING id
    `

    const applicationId = application.id

    // Insert work experience
    for (const exp of workExperience) {
      if (exp.company && exp.position) {
        await sql`
          INSERT INTO work_experience (
            application_id, company, position, start_date, end_date, is_current, description
          ) VALUES (
            ${applicationId}, ${exp.company}, ${exp.position}, 
            ${exp.startDate || null}, ${exp.endDate || null}, 
            ${exp.current || false}, ${exp.description}
          )
        `
      }
    }

    // Insert education
    for (const edu of education) {
      if (edu.institution && edu.degree) {
        await sql`
          INSERT INTO education (
            application_id, institution, degree, field, graduation_year, gpa
          ) VALUES (
            ${applicationId}, ${edu.institution}, ${edu.degree}, 
            ${edu.field}, ${edu.graduationYear}, ${edu.gpa}
          )
        `
      }
    }

    // Insert skills
    for (const skill of skills) {
      if (skill.trim()) {
        await sql`
          INSERT INTO skills (application_id, skill_name) 
          VALUES (${applicationId}, ${skill})
        `
      }
    }

    // Handle file uploads
    const fileTypes = ["resume", "coverLetter", "portfolio", "idPhoto", "nationalIdCopy"]
    const allowedExtensions = {
      resume: ["pdf", "doc", "docx"],
      coverLetter: ["pdf", "doc", "docx"],
      portfolio: ["pdf", "zip"],
      idPhoto: ["jpg", "jpeg", "png"],
      nationalIdCopy: ["jpg", "jpeg", "png", "pdf"],
    }

    for (const fileType of fileTypes) {
      const file = formData.get(fileType) as File
      if (file && file.size > 0) {
        // Validate file type
        if (!validateFileType(file, allowedExtensions[fileType as keyof typeof allowedExtensions])) {
          return NextResponse.json({ error: `نوع الملف غير مدعوم: ${fileType}` }, { status: 400 })
        }

        // Validate file size (10MB max)
        if (!validateFileSize(file, 10)) {
          return NextResponse.json({ error: `حجم الملف كبير جداً: ${fileType}` }, { status: 400 })
        }

        try {
          const fileUrl = await uploadFile(file, `applications/${applicationId}`)

          await sql`
            INSERT INTO application_files (
              application_id, file_type, file_name, file_path, file_size, mime_type
            ) VALUES (
              ${applicationId}, ${fileType}, ${file.name}, ${fileUrl}, 
              ${file.size}, ${file.type}
            )
          `
        } catch (error) {
          console.error(`Error uploading ${fileType}:`, error)
          // Continue with other files even if one fails
        }
      }
    }

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
    return NextResponse.json({ error: "حدث خطأ أثناء إرسال الطلب" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")
    const position = searchParams.get("position")

    const offset = (page - 1) * limit

    let whereClause = "WHERE 1=1"
    const params: any[] = []

    if (status) {
      whereClause += ` AND status = $${params.length + 1}`
      params.push(status)
    }

    if (position) {
      whereClause += ` AND position ILIKE $${params.length + 1}`
      params.push(`%${position}%`)
    }

    // Get total count
    const countResult = await sql`
      SELECT COUNT(*) as total FROM applications ${sql.unsafe(whereClause)}
    `
    const total = Number.parseInt(countResult[0].total)

    // Get applications
    const applications = await sql`
      SELECT 
        id, first_name, last_name, email, phone, position, department,
        nationality, status, created_at
      FROM applications 
      ${sql.unsafe(whereClause)}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    return NextResponse.json({
      applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء جلب الطلبات" }, { status: 500 })
  }
}
