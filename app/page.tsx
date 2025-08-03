"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { User, Briefcase, GraduationCap, Upload, CheckCircle, X, Plus, Camera } from "lucide-react"
import ImageUpload from "@/components/image-upload"

interface WorkExperience {
  id: string
  company: string
  position: string
  startDate: string
  endDate: string
  current: boolean
  description: string
}

interface Education {
  id: string
  institution: string
  degree: string
  field: string
  graduationYear: string
  gpa?: string
}

export default function ArabicJobApplicationForm() {
  const [formData, setFormData] = useState({
    // المعلومات الشخصية
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    nationality: "",
    dateOfBirth: "",
    gender: "",
    maritalStatus: "",
    nationalId: "",

    // معلومات المنصب
    position: "",
    department: "",
    salaryExpectation: "",
    availableStartDate: "",
    employmentType: "",

    // معلومات إضافية
    coverLetter: "",
    linkedinUrl: "",
    portfolioUrl: "",
    referralSource: "",

    // المعلومات القانونية
    workAuthorization: "",
    backgroundCheck: false,
    drugTest: false,
    idPhotoUrl: "",
    nationalIdCopyUrl: "",
  })

  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([])
  const [education, setEducation] = useState<Education[]>([])
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState("")
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    resume: null,
    coverLetter: null,
    portfolio: null,
    idPhoto: null,
    nationalIdCopy: null,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const addWorkExperience = () => {
    const newExp: WorkExperience = {
      id: Date.now().toString(),
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    }
    setWorkExperience((prev) => [...prev, newExp])
  }

  const updateWorkExperience = (id: string, field: string, value: string | boolean) => {
    setWorkExperience((prev) => prev.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)))
  }

  const removeWorkExperience = (id: string) => {
    setWorkExperience((prev) => prev.filter((exp) => exp.id !== id))
  }

  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      institution: "",
      degree: "",
      field: "",
      graduationYear: "",
      gpa: "",
    }
    setEducation((prev) => [...prev, newEdu])
  }

  const updateEducation = (id: string, field: string, value: string) => {
    setEducation((prev) => prev.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)))
  }

  const removeEducation = (id: string) => {
    setEducation((prev) => prev.filter((edu) => edu.id !== id))
  }

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills((prev) => [...prev, newSkill.trim()])
      setNewSkill("")
    }
  }

  const removeSkill = (skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill))
  }

  const handleFileChange = (type: string, file: File | null) => {
    setFiles((prev) => ({ ...prev, [type]: file }))
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.firstName.trim()) newErrors.firstName = "الاسم الأول مطلوب"
    if (!formData.lastName.trim()) newErrors.lastName = "اسم العائلة مطلوب"
    if (!formData.email.trim()) newErrors.email = "البريد الإلكتروني مطلوب"
    if (!formData.phone.trim()) newErrors.phone = "رقم الهاتف مطلوب"
    if (!formData.position.trim()) newErrors.position = "المنصب مطلوب"
    if (!formData.nationality.trim()) newErrors.nationality = "الجنسية مطلوبة"
    if (!formData.nationalId.trim()) newErrors.nationalId = "رقم الهوية الوطنية مطلوب"
    if (!formData.workAuthorization) newErrors.workAuthorization = "حالة تصريح العمل مطلوبة"
    if (!files.idPhoto) newErrors.idPhoto = "صورة شخصية مطلوبة"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const submitFormData = new FormData()

      // Add form data
      Object.entries(formData).forEach(([key, value]) => {
        submitFormData.append(key, value.toString())
      })

      // Add arrays as JSON strings
      submitFormData.append("workExperience", JSON.stringify(workExperience))
      submitFormData.append("education", JSON.stringify(education))
      submitFormData.append("skills", JSON.stringify(skills))

      // Add files
      Object.entries(files).forEach(([key, file]) => {
        if (file) {
          submitFormData.append(key, file)
        }
      })

      const response = await fetch("/api/applications-firestore", {
        method: "POST",
        body: submitFormData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "حدث خطأ أثناء إرسال الطلب")
      }

      setSubmitted(true)
    } catch (error) {
      console.error("Submission error:", error)
      setErrors({ submit: error instanceof Error ? error.message : "حدث خطأ أثناء إرسال الطلب" })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-700 mb-2">تم إرسال الطلب بنجاح!</h2>
            <p className="text-gray-600 mb-4">
              شكراً لاهتمامك بالانضمام إلى فريقنا. سنقوم بمراجعة طلبك والرد عليك قريباً.
            </p>
            <p className="text-sm text-gray-500 mb-4">تم إرسال رسالة تأكيد إلى بريدك الإلكتروني.</p>
            <Button
              onClick={() => {
                setSubmitted(false)
                setFormData({
                  firstName: "",
                  lastName: "",
                  email: "",
                  phone: "",
                  address: "",
                  city: "",
                  state: "",
                  zipCode: "",
                  nationality: "",
                  dateOfBirth: "",
                  gender: "",
                  maritalStatus: "",
                  nationalId: "",
                  position: "",
                  department: "",
                  salaryExpectation: "",
                  availableStartDate: "",
                  employmentType: "",
                  coverLetter: "",
                  linkedinUrl: "",
                  portfolioUrl: "",
                  referralSource: "",
                  workAuthorization: "",
                  backgroundCheck: false,
                  drugTest: false,
                  idPhotoUrl: "",
                  nationalIdCopyUrl: "",
                })
                setWorkExperience([])
                setEducation([])
                setSkills([])
                setFiles({ resume: null, coverLetter: null, portfolio: null, idPhoto: null, nationalIdCopy: null })
                setErrors({})
              }}
            >
              إرسال طلب آخر
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-50 py-8 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">شركة الاتحاد المتكاملة للتوظيف</CardTitle>
            <CardTitle className="text-2xl ">طلب توظيف</CardTitle>
            <CardDescription>يرجى ملء جميع الأقسام لإكمال طلب التوظيف الخاص بك</CardDescription>
          </CardHeader>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Display submission error */}
          {errors.submit && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-red-600 text-center">{errors.submit}</p>
              </CardContent>
            </Card>
          )}

          {/* الصورة الشخصية ونسخة الهوية */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                الصورة الشخصية والوثائق
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* الصورة الشخصية */}
                <ImageUpload
                  label="الصورة الشخصية"
                  required
                  onImageUploaded={(url) => {
                    setFiles((prev) => ({ ...prev, idPhoto: new File([], "uploaded") }))
                    // Store the URL separately for form submission
                    setFormData((prev) => ({ ...prev, idPhotoUrl: url }))
                  }}
                  onImageRemoved={() => {
                    setFiles((prev) => ({ ...prev, idPhoto: null }))
                    setFormData((prev) => ({ ...prev, idPhotoUrl: "" }))
                  }}
                  maxSize={10}
                />

                {/* نسخة الهوية الوطنية */}
                <ImageUpload
                  label="نسخة من الهوية الوطنية"
                  onImageUploaded={(url) => {
                    setFiles((prev) => ({ ...prev, nationalIdCopy: new File([], "uploaded") }))
                    setFormData((prev) => ({ ...prev, nationalIdCopyUrl: url }))
                  }}
                  onImageRemoved={() => {
                    setFiles((prev) => ({ ...prev, nationalIdCopy: null }))
                    setFormData((prev) => ({ ...prev, nationalIdCopyUrl: "" }))
                  }}
                  maxSize={10}
                />
              </div>
            </CardContent>
          </Card>

          {/* المعلومات الشخصية */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                المعلومات الشخصية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">الاسم الأول *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className={errors.firstName ? "border-red-500" : ""}
                    placeholder="أدخل الاسم الأول"
                  />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <Label htmlFor="lastName">اسم العائلة *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className={errors.lastName ? "border-red-500" : ""}
                    placeholder="أدخل اسم العائلة"
                  />
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">البريد الإلكتروني *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={errors.email ? "border-red-500" : ""}
                    placeholder="example@email.com"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                <div>
                  <Label htmlFor="phone">رقم الهاتف *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className={errors.phone ? "border-red-500" : ""}
                    placeholder="+966 50 123 4567"
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nationalId">رقم الهوية الوطنية *</Label>
                  <Input
                    id="nationalId"
                    value={formData.nationalId}
                    onChange={(e) => handleInputChange("nationalId", e.target.value)}
                    className={errors.nationalId ? "border-red-500" : ""}
                    placeholder="1234567890"
                  />
                  {errors.nationalId && <p className="text-red-500 text-sm mt-1">{errors.nationalId}</p>}
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">تاريخ الميلاد</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="nationality">الجنسية *</Label>
                  <Select
                    value={formData.nationality}
                    onValueChange={(value) => handleInputChange("nationality", value)}
                  >
                    <SelectTrigger className={errors.nationality ? "border-red-500" : ""}>
                      <SelectValue placeholder="اختر الجنسية" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="omani">عماني</SelectItem>
                      <SelectItem value="saudi">سعودي</SelectItem>
                      <SelectItem value="egyptian">مصري</SelectItem>
                      <SelectItem value="jordanian">أردني</SelectItem>
                      <SelectItem value="lebanese">لبناني</SelectItem>
                      <SelectItem value="syrian">سوري</SelectItem>
                      <SelectItem value="palestinian">فلسطيني</SelectItem>
                      <SelectItem value="other">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.nationality && <p className="text-red-500 text-sm mt-1">{errors.nationality}</p>}
                </div>
                <div>
                  <Label htmlFor="gender">الجنس</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الجنس" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">ذكر</SelectItem>
                      <SelectItem value="female">أنثى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="maritalStatus">الحالة الاجتماعية</Label>
                  <Select
                    value={formData.maritalStatus}
                    onValueChange={(value) => handleInputChange("maritalStatus", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">أعزب</SelectItem>
                      <SelectItem value="married">متزوج</SelectItem>
                      <SelectItem value="divorced">مطلق</SelectItem>
                      <SelectItem value="widowed">أرمل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="address">العنوان</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="أدخل العنوان الكامل"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">المدينة</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="مسقط"
                  />
                </div>
                <div>
                  <Label htmlFor="state">المنطقة</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    placeholder="منطقة مسقط"
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">الرمز البريدي</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange("zipCode", e.target.value)}
                    placeholder="12345"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* معلومات المنصب */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                معلومات المنصب
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="position">المنصب المتقدم له *</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => handleInputChange("position", e.target.value)}
                    className={errors.position ? "border-red-500" : ""}
                    placeholder="مطور برمجيات"
                  />
                  {errors.position && <p className="text-red-500 text-sm mt-1">{errors.position}</p>}
                </div>
                <div>
                  <Label htmlFor="department">القسم</Label>
                  <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر القسم" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engineering">الهندسة</SelectItem>
                      <SelectItem value="marketing">التسويق</SelectItem>
                      <SelectItem value="sales">المبيعات</SelectItem>
                      <SelectItem value="hr">الموارد البشرية</SelectItem>
                      <SelectItem value="finance">المالية</SelectItem>
                      <SelectItem value="operations">العمليات</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employmentType">نوع التوظيف</Label>
                  <Select
                    value={formData.employmentType}
                    onValueChange={(value) => handleInputChange("employmentType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع التوظيف" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">دوام كامل</SelectItem>
                      <SelectItem value="part-time">دوام جزئي</SelectItem>
                      <SelectItem value="contract">عقد</SelectItem>
                      <SelectItem value="internship">تدريب</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="availableStartDate">تاريخ البدء المتاح</Label>
                  <Input
                    id="availableStartDate"
                    type="date"
                    value={formData.availableStartDate}
                    onChange={(e) => handleInputChange("availableStartDate", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="salaryExpectation">توقعات الراتب</Label>
                <Input
                  id="salaryExpectation"
                  placeholder="مثال: 15,000 - 20,000 ريال"
                  value={formData.salaryExpectation}
                  onChange={(e) => handleInputChange("salaryExpectation", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* الخبرات العملية */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  الخبرات العملية
                </CardTitle>
                <Button type="button" onClick={addWorkExperience} variant="outline" size="sm">
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة خبرة
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {workExperience.map((exp, index) => (
                <div key={exp.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">الخبرة {index + 1}</h4>
                    <Button type="button" onClick={() => removeWorkExperience(exp.id)} variant="ghost" size="sm">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>الشركة</Label>
                      <Input
                        value={exp.company}
                        onChange={(e) => updateWorkExperience(exp.id, "company", e.target.value)}
                        placeholder="اسم الشركة"
                      />
                    </div>
                    <div>
                      <Label>المنصب</Label>
                      <Input
                        value={exp.position}
                        onChange={(e) => updateWorkExperience(exp.id, "position", e.target.value)}
                        placeholder="المسمى الوظيفي"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>تاريخ البدء</Label>
                      <Input
                        type="date"
                        value={exp.startDate}
                        onChange={(e) => updateWorkExperience(exp.id, "startDate", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>تاريخ الانتهاء</Label>
                      <Input
                        type="date"
                        value={exp.endDate}
                        onChange={(e) => updateWorkExperience(exp.id, "endDate", e.target.value)}
                        disabled={exp.current}
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <Checkbox
                        id={`current-${exp.id}`}
                        checked={exp.current}
                        onCheckedChange={(checked) => updateWorkExperience(exp.id, "current", checked as boolean)}
                      />
                      <Label htmlFor={`current-${exp.id}`}>العمل الحالي</Label>
                    </div>
                  </div>

                  <div>
                    <Label>وصف العمل</Label>
                    <Textarea
                      value={exp.description}
                      onChange={(e) => updateWorkExperience(exp.id, "description", e.target.value)}
                      placeholder="اوصف مسؤولياتك وإنجازاتك..."
                    />
                  </div>
                </div>
              ))}

              {workExperience.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>لم يتم إضافة خبرات عملية بعد. انقر على "إضافة خبرة" للبدء.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* التعليم */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  التعليم
                </CardTitle>
                <Button type="button" onClick={addEducation} variant="outline" size="sm">
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة تعليم
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {education.map((edu, index) => (
                <div key={edu.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">التعليم {index + 1}</h4>
                    <Button type="button" onClick={() => removeEducation(edu.id)} variant="ghost" size="sm">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>المؤسسة التعليمية</Label>
                      <Input
                        value={edu.institution}
                        onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
                        placeholder="اسم الجامعة أو المعهد"
                      />
                    </div>
                    <div>
                      <Label>الدرجة العلمية</Label>
                      <Input
                        value={edu.degree}
                        onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                        placeholder="مثال: بكالوريوس"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>التخصص</Label>
                      <Input
                        value={edu.field}
                        onChange={(e) => updateEducation(edu.id, "field", e.target.value)}
                        placeholder="مثال: علوم الحاسوب"
                      />
                    </div>
                    <div>
                      <Label>سنة التخرج</Label>
                      <Input
                        value={edu.graduationYear}
                        onChange={(e) => updateEducation(edu.id, "graduationYear", e.target.value)}
                        placeholder="مثال: 2023"
                      />
                    </div>
                    <div>
                      <Label>المعدل التراكمي (اختياري)</Label>
                      <Input
                        value={edu.gpa}
                        onChange={(e) => updateEducation(edu.id, "gpa", e.target.value)}
                        placeholder="مثال: 3.8"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {education.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>لم يتم إضافة تعليم بعد. انقر على "إضافة تعليم" للبدء.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* المهارات */}
          <Card>
            <CardHeader>
              <CardTitle>المهارات</CardTitle>
              <CardDescription>أضف المهارات ذات الصلة بهذا المنصب</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="أدخل مهارة"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                />
                <Button type="button" onClick={addSkill}>
                  إضافة
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => removeSkill(skill)} />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* رفع الملفات */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                الوثائق
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="resume">السيرة الذاتية</Label>
                  <Input
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileChange("resume", e.target.files?.[0] || null)}
                  />
                  {files.resume && <p className="text-sm text-green-600 mt-1">✓ {files.resume.name}</p>}
                </div>
                <div>
                  <Label htmlFor="coverLetterFile">خطاب التغطية</Label>
                  <Input
                    id="coverLetterFile"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileChange("coverLetter", e.target.files?.[0] || null)}
                  />
                  {files.coverLetter && <p className="text-sm text-green-600 mt-1">✓ {files.coverLetter.name}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* معلومات إضافية */}
          <Card>
            <CardHeader>
              <CardTitle>معلومات إضافية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="coverLetter">خطاب التغطية</Label>
                <Textarea
                  id="coverLetter"
                  value={formData.coverLetter}
                  onChange={(e) => handleInputChange("coverLetter", e.target.value)}
                  placeholder="أخبرنا لماذا أنت مهتم بهذا المنصب..."
                  rows={6}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="linkedinUrl">ملف LinkedIn الشخصي</Label>
                  <Input
                    id="linkedinUrl"
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => handleInputChange("linkedinUrl", e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
                <div>
                  <Label htmlFor="portfolioUrl">موقع الأعمال</Label>
                  <Input
                    id="portfolioUrl"
                    type="url"
                    value={formData.portfolioUrl}
                    onChange={(e) => handleInputChange("portfolioUrl", e.target.value)}
                    placeholder="https://yourportfolio.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="referralSource">كيف سمعت عن هذا المنصب؟</Label>
                <Select
                  value={formData.referralSource}
                  onValueChange={(value) => handleInputChange("referralSource", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المصدر" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="job-board">موقع وظائف</SelectItem>
                    <SelectItem value="company-website">موقع الشركة</SelectItem>
                    <SelectItem value="referral">إحالة من موظف</SelectItem>
                    <SelectItem value="social-media">وسائل التواصل الاجتماعي</SelectItem>
                    <SelectItem value="recruiter">مستقطب</SelectItem>
                    <SelectItem value="other">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* المعلومات القانونية */}
          <Card>
            <CardHeader>
              <CardTitle>المعلومات القانونية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="workAuthorization">حالة تصريح العمل *</Label>
                <Select
                  value={formData.workAuthorization}
                  onValueChange={(value) => handleInputChange("workAuthorization", value)}
                >
                  <SelectTrigger className={errors.workAuthorization ? "border-red-500" : ""}>
                    <SelectValue placeholder="اختر حالة التصريح" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="citizen">مواطن</SelectItem>
                    <SelectItem value="resident">مقيم</SelectItem>
                    <SelectItem value="work-visa">تأشيرة عمل</SelectItem>
                    <SelectItem value="need-sponsorship">بحاجة لكفالة</SelectItem>
                  </SelectContent>
                </Select>
                {errors.workAuthorization && <p className="text-red-500 text-sm mt-1">{errors.workAuthorization}</p>}
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="backgroundCheck"
                    checked={formData.backgroundCheck}
                    onCheckedChange={(checked) => handleInputChange("backgroundCheck", checked as boolean)}
                  />
                  <Label htmlFor="backgroundCheck">أوافق على فحص الخلفية إذا تم قبولي للوظيفة</Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="drugTest"
                    checked={formData.drugTest}
                    onCheckedChange={(checked) => handleInputChange("drugTest", checked as boolean)}
                  />
                  <Label htmlFor="drugTest">أوافق على فحص المخدرات إذا كان مطلوباً لهذا المنصب</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* زر الإرسال */}
          <Card>
            <CardContent className="pt-6">
              <Button type="submit" className="w-full  bg-linear-65 from-purple-500 to-pink-500" size="lg" disabled={isSubmitting}>
                {isSubmitting ? "جاري إرسال الطلب..." : "إرسال طلب التوظيف"}
              </Button>

              <p className="text-sm text-gray-500 text-center mt-4">
                بإرسال هذا الطلب، فإنك توافق على الشروط والأحكام وسياسة الخصوصية الخاصة بنا.
              </p>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
