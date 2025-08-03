"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, FileText, Mail, UserCheck } from "lucide-react"

interface SubmissionSuccessProps {
  name: string
  onReset: () => void
}

export function SubmissionSuccess({ name, onReset }: SubmissionSuccessProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center" dir="rtl">
      <div className="max-w-2xl w-full">
        <div className="mb-8">
          <FileText className="w-16 h-16 mx-auto text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-700 mt-4">شركة الاتحاد المتكاملة للتوظيف</h1>
        </div>

        <Card className="shadow-xl animate-in fade-in-50 zoom-in-95">
          <CardHeader>
            <div className="mx-auto bg-green-100 rounded-full p-4 w-fit">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-800 pt-4">شكراً لك، {name || "مقدم الطلب"}!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pb-8 px-4 sm:px-8">
            <p className="text-lg text-gray-600">لقد استلمنا طلبك بنجاح. نحن نقدر اهتمامك بالانضمام إلى فريقنا.</p>

            <div className="text-right bg-gray-100 p-6 rounded-lg border">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">ماذا يحدث بعد ذلك؟</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-100 rounded-full mt-1">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700">تأكيد عبر البريد الإلكتروني</h4>
                    <p className="text-gray-600">
                      ستتلقى رسالة تأكيد على بريدك الإلكتروني قريباً تحتوي على نسخة من طلبك.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-100 rounded-full mt-1">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700">مراجعة الطلب</h4>
                    <p className="text-gray-600">
                      سيقوم فريق التوظيف لدينا بمراجعة طلبك بعناية. قد تستغرق هذه العملية بضعة أيام.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <p className="text-sm text-gray-500">
              رقم مرجع طلبك هو:{" "}
              <span className="font-mono bg-gray-200 py-0.5 px-1.5 rounded">APP-{Date.now().toString().slice(-6)}</span>
            </p>

            <Button size="lg" onClick={onReset} className="w-full md:w-auto">
              إرسال طلب آخر
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
