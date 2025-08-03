interface EmailData {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailData) {
  // In a real application, you would use a service like Resend, SendGrid, or Nodemailer
  // For now, we'll just log the email
  console.log("Sending email:", { to, subject, html })

  // Simulate email sending
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true })
    }, 1000)
  })
}

export function generateApplicationConfirmationEmail(applicationData: any): string {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تأكيد استلام طلب التوظيف</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; }
            .content { padding: 20px 0; }
            .footer { background-color: #f8f9fa; padding: 15px; text-align: center; border-radius: 8px; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>تأكيد استلام طلب التوظيف</h1>
            </div>
            <div class="content">
                <p>عزيزي/عزيزتي ${applicationData.firstName} ${applicationData.lastName}،</p>
                
                <p>شكراً لك على تقديم طلب التوظيف للمنصب: <strong>${applicationData.position}</strong></p>
                
                <p>لقد تم استلام طلبك بنجاح وسيقوم فريقنا بمراجعته خلال الأيام القادمة.</p>
                
                <h3>تفاصيل الطلب:</h3>
                <ul>
                    <li><strong>المنصب:</strong> ${applicationData.position}</li>
                    <li><strong>القسم:</strong> ${applicationData.department || "غير محدد"}</li>
                    <li><strong>تاريخ التقديم:</strong> ${new Date().toLocaleDateString("ar-SA")}</li>
                </ul>
                
                <p>سنتواصل معك قريباً بخصوص الخطوات التالية في عملية التوظيف.</p>
                
                <p>مع أطيب التحيات،<br>فريق الموارد البشرية</p>
            </div>
            <div class="footer">
                <p>هذا بريد إلكتروني تلقائي، يرجى عدم الرد عليه.</p>
            </div>
        </div>
    </body>
    </html>
  `
}

export function generateHRNotificationEmail(applicationData: any): string {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>طلب توظيف جديد</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #e3f2fd; padding: 20px; text-align: center; border-radius: 8px; }
            .content { padding: 20px 0; }
            .info-box { background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>طلب توظيف جديد</h1>
            </div>
            <div class="content">
                <p>تم استلام طلب توظيف جديد:</p>
                
                <div class="info-box">
                    <h3>معلومات المتقدم:</h3>
                    <p><strong>الاسم:</strong> ${applicationData.firstName} ${applicationData.lastName}</p>
                    <p><strong>البريد الإلكتروني:</strong> ${applicationData.email}</p>
                    <p><strong>الهاتف:</strong> ${applicationData.phone}</p>
                    <p><strong>الجنسية:</strong> ${applicationData.nationality}</p>
                </div>
                
                <div class="info-box">
                    <h3>معلومات المنصب:</h3>
                    <p><strong>المنصب:</strong> ${applicationData.position}</p>
                    <p><strong>القسم:</strong> ${applicationData.department || "غير محدد"}</p>
                    <p><strong>نوع التوظيف:</strong> ${applicationData.employmentType || "غير محدد"}</p>
                    <p><strong>توقعات الراتب:</strong> ${applicationData.salaryExpectation || "غير محدد"}</p>
                </div>
                
                <p>يرجى مراجعة الطلب في نظام إدارة الطلبات.</p>
            </div>
        </div>
    </body>
    </html>
  `
}
