"use client"

import React from "react"
import type { ReactElement } from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  User,
  Briefcase,
  GraduationCap,
  Upload,
  CheckCircle,
  X,
  Plus,
  FileText,
  Link2,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
} from "lucide-react"
import { SubmissionSuccess } from "./sucess"
import { ImageUpload } from "./image-upload"

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

interface ApplicationFiles {
  resume: File | null
  coverLetterFile: File | null
  idPhoto: File | null
  nationalIdCopy: File | null
}

const steps = [
  { id: 1, name: "المعلومات الشخصية", icon: User },
  { id: 2, name: "الخبرة والتعليم", icon: Briefcase },
  { id: 3, name: "المهارات والوثائق", icon: FileText },
  { id: 4, name: "معلومات إضافية وقانونية", icon: ShieldCheck },
]

const initialFormData = {
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
}

const initialFiles: ApplicationFiles = {
  resume: null,
  coverLetterFile: null,
  idPhoto: null,
  nationalIdCopy: null,
}

export function ArabicJobApplicationForm(): ReactElement {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState(initialFormData)
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([])
  const [education, setEducation] = useState<Education[]>([])
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState("")
  const [files, setFiles] = useState<ApplicationFiles>(initialFiles)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const addWorkExperience = () =>
    setWorkExperience((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        company: "",
        position: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
      },
    ])

  const updateWorkExperience = (id: string, field: string, value: string | boolean) =>
    setWorkExperience((prev) => prev.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)))

  const removeWorkExperience = (id: string) => setWorkExperience((prev) => prev.filter((exp) => exp.id !== id))

  const addEducation = () =>
    setEducation((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        institution: "",
        degree: "",
        field: "",
        graduationYear: "",
        gpa: "",
      },
    ])

  const updateEducation = (id: string, field: string, value: string) =>
    setEducation((prev) => prev.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)))

  const removeEducation = (id: string) => setEducation((prev) => prev.filter((edu) => edu.id !== id))

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills((prev) => [...prev, newSkill.trim()])
      setNewSkill("")
    }
  }

  const removeSkill = (skill: string) => setSkills((prev) => prev.filter((s) => s !== skill))

  const handleFileChange = (type: keyof ApplicationFiles, file: File | null) =>
    setFiles((prev) => ({ ...prev, [type]: file }))

  const validateStep = () => {
    const newErrors: { [key: string]: string } = {}
    if (currentStep === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = "الاسم الأول مطلوب"
      if (!formData.lastName.trim()) newErrors.lastName = "اسم العائلة مطلوب"
      if (!formData.email.trim()) newErrors.email = "البريد الإلكتروني مطلوب"
      if (!formData.phone.trim()) newErrors.phone = "رقم الهاتف مطلوب"
      if (!formData.nationalId.trim()) newErrors.nationalId = "رقم الهوية الوطنية مطلوب"
      if (!formData.nationality.trim()) newErrors.nationality = "الجنسية مطلوبة"
    }
    if (currentStep === 3) {
      if (!formData.position.trim()) newErrors.position = "المنصب المطلوب مطلوب"
    }
    if (currentStep === 4) {
      if (!formData.workAuthorization) newErrors.workAuthorization = "حالة تصريح العمل مطلوبة"
      if (!files.idPhoto) newErrors.idPhoto = "صورة شخصية مطلوبة"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep()) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleReset = () => {
    setCurrentStep(1)
    setFormData(initialFormData)
    setWorkExperience([])
    setEducation([])
    setSkills([])
    setFiles(initialFiles)
    setErrors({})
    setSubmitted(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep()) return // Final validation
    setIsSubmitting(true)
    try {
      // Create FormData for file upload
      const submitFormData = new FormData()
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          submitFormData.append(key, value.toString())
        }
      })
      // Add arrays as JSON strings
      submitFormData.append("workExperience", JSON.stringify(workExperience))
      submitFormData.append("education", JSON.stringify(education))
      submitFormData.append("skills", JSON.stringify(skills))
      // Add files
      if (files.resume) {
        submitFormData.append("resume", files.resume)
      }
      if (files.coverLetterFile) {
        submitFormData.append("coverLetter", files.coverLetterFile)
      }
      if (files.idPhoto) {
        submitFormData.append("idPhoto", files.idPhoto)
      }
      if (files.nationalIdCopy) {
        submitFormData.append("nationalIdCopy", files.nationalIdCopy)
      }
      // Submit to API
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
      setErrors({
        submit: error instanceof Error ? error.message : "حدث خطأ أثناء إرسال الطلب",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return <SubmissionSuccess name={formData.firstName} onReset={handleReset} />
  }
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-100 tracking-tight">طلب توظيف</h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-200">
            يرجى ملء جميع الأقسام لإكمال طلب التوظيف الخاص بك
          </p>
        </div>
        <Card className="overflow-hidden shadow-xl">
          <div className="px-8 py-6 bg-gray-50 border-b">
            <div className="flex items-start justify-between">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center text-center md:flex-row md:text-right">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        currentStep >= step.id ? "bg-green-600 text-white" : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {currentStep > step.id ? <CheckCircle className="w-6 h-6" /> : <step.icon className="w-5 h-5" />}
                    </div>
                    <div className="hidden md:ml-4">
                      <div
                        className={`text-sm font-medium ${currentStep >= step.id ? "text-blue-600" : "text-gray-500"}`}
                      >
                        خطوة {step.id}
                      </div>
                      <div className="text-lg font-semibold text-gray-800">{step.name}</div>
                    </div>
                  </div>
                  {index < steps.length - 1 && <div className="flex-1 h-0.5 bg-gray-200 mt-5 mx-2 md:mx-4" />}
                </React.Fragment>
              ))}
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            <CardContent className="p-8 space-y-8">
              {errors.submit && <p className="text-red-600 text-center p-3 bg-red-50 rounded-md">{errors.submit}</p>}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                          <SelectItem value="saudi">سعودي</SelectItem>
                          <SelectItem value="omani">عماني</SelectItem>
                          <SelectItem value="kuwaiti">كويتي</SelectItem>
                          <SelectItem value="bahraini">بحريني</SelectItem>
                          <SelectItem value="qatari">قطري</SelectItem>
                          <SelectItem value="emirati">إماراتي</SelectItem>
                          <SelectItem value="egyptian">مصري</SelectItem>
                          <SelectItem value="jordanian">أردني</SelectItem>
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
                </div>
              )}
              {currentStep === 2 && (
                <div className="space-y-8 animate-in fade-in-50">
                  {/* الخبرات العملية */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-gray-700 flex items-center gap-3">
                        <Briefcase className="w-6 h-6 text-blue-500" /> الخبرات العملية
                      </h3>
                      <Button type="button" onClick={addWorkExperience} variant="outline">
                        <Plus className="w-4 h-4 ml-2" /> إضافة خبرة
                      </Button>
                    </div>
                    {workExperience.map((exp, index) => (
                      <div key={exp.id} className="border rounded-lg p-4 space-y-4 bg-gray-50/50 relative">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-800">الخبرة {index + 1}</h4>
                          <Button
                            type="button"
                            onClick={() => removeWorkExperience(exp.id)}
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 left-2 w-8 h-8"
                          >
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
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
                          <div className="flex items-center space-x-2 space-x-reverse">
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
                      <p className="text-center py-4 text-gray-500">لم يتم إضافة خبرات عملية بعد.</p>
                    )}
                  </div>
                  {/* التعليم */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-gray-700 flex items-center gap-3">
                        <GraduationCap className="w-6 h-6 text-blue-500" /> التعليم
                      </h3>
                      <Button type="button" onClick={addEducation} variant="outline">
                        <Plus className="w-4 h-4 ml-2" /> إضافة تعليم
                      </Button>
                    </div>
                    {education.map((edu, index) => (
                      <div key={edu.id} className="border rounded-lg p-4 space-y-4 bg-gray-50/50 relative">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-800">التعليم {index + 1}</h4>
                          <Button
                            type="button"
                            onClick={() => removeEducation(edu.id)}
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 left-2 w-8 h-8"
                          >
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
                      <p className="text-center py-4 text-gray-500">لم يتم إضافة تعليم بعد.</p>
                    )}
                  </div>
                </div>
              )}
              {currentStep === 3 && (
                <div className="space-y-8 animate-in fade-in-50">
                  {/* معلومات إضافية */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-gray-700 flex items-center gap-3">
                        <Link2 className="w-6 h-6 text-blue-500" /> معلومات إضافية
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="position">المنصب المطلوب *</Label>
                        <Input
                          id="position"
                          value={formData.position}
                          onChange={(e) => handleInputChange("position", e.target.value)}
                          className={errors.position ? "border-red-500" : ""}
                          placeholder="مثال: مطور ويب"
                        />
                        {errors.position && <p className="text-red-500 text-sm mt-1">{errors.position}</p>}
                      </div>
                      <div>
                        <Label htmlFor="department">القسم</Label>
                        <Input
                          id="department"
                          value={formData.department}
                          onChange={(e) => handleInputChange("department", e.target.value)}
                          placeholder="مثال: تقنية المعلومات"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <Label htmlFor="salaryExpectation">توقعات الراتب</Label>
                        <Input
                          id="salaryExpectation"
                          value={formData.salaryExpectation}
                          onChange={(e) => handleInputChange("salaryExpectation", e.target.value)}
                          placeholder="مثال: 8000 ريال"
                        />
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
                    </div>
                    <div>
                      <Label htmlFor="coverLetter">خطاب التغطية</Label>
                      <Textarea
                        id="coverLetter"
                        value={formData.coverLetter}
                        onChange={(e) => handleInputChange("coverLetter", e.target.value)}
                        placeholder="اكتب خطاب التغطية الخاص بك هنا..."
                        rows={4}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="linkedinUrl">رابط LinkedIn</Label>
                        <Input
                          id="linkedinUrl"
                          value={formData.linkedinUrl}
                          onChange={(e) => handleInputChange("linkedinUrl", e.target.value)}
                          placeholder="https://linkedin.com/in/yourprofile"
                        />
                      </div>
                      <div>
                        <Label htmlFor="portfolioUrl">رابط المعرض (Portfolio)</Label>
                        <Input
                          id="portfolioUrl"
                          value={formData.portfolioUrl}
                          onChange={(e) => handleInputChange("portfolioUrl", e.target.value)}
                          placeholder="https://yourportfolio.com"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="referralSource">كيف سمعت عن هذه الوظيفة؟</Label>
                      <Select
                        value={formData.referralSource}
                        onValueChange={(value) => handleInputChange("referralSource", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المصدر" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="website">موقع الشركة</SelectItem>
                          <SelectItem value="linkedin">LinkedIn</SelectItem>
                          <SelectItem value="job-board">مواقع التوظيف</SelectItem>
                          <SelectItem value="referral">إحالة من موظف</SelectItem>
                          <SelectItem value="social-media">وسائل التواصل الاجتماعي</SelectItem>
                          <SelectItem value="other">أخرى</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {/* المهارات */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-700">المهارات</h3>
                    <div className="flex gap-2">
                      <Input
                        placeholder="أدخل مهارة واضغط Enter"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                      />
                      <Button type="button" onClick={addSkill}>
                        إضافة
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2 min-h-[2.5rem]">
                      {skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-base py-1 px-3 flex items-center gap-2">
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="rounded-full hover:bg-gray-300 p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {/* رفع الملفات */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-700 flex items-center gap-3">
                      <Upload className="w-6 h-6 text-blue-500" /> الوثائق
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="resume">السيرة الذاتية (PDF, DOCX)</Label>
                        <Input
                          id="resume"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileChange("resume", e.target.files?.[0] || null)}
                          className="mt-1"
                        />
                        {files.resume && <p className="text-sm text-green-600 mt-1">✓ {files.resume.name}</p>}
                      </div>
                      <div>
                        <Label htmlFor="coverLetterFile">خطاب التغطية (اختياري)</Label>
                        <Input
                          id="coverLetterFile"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileChange("coverLetterFile", e.target.files?.[0] || null)}
                          className="mt-1"
                        />
                        {files.coverLetterFile && (
                          <p className="text-sm text-green-600 mt-1">✓ {files.coverLetterFile.name}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {currentStep === 4 && (
                <div className="space-y-8 animate-in fade-in-50">
                  {/* الصورة الشخصية ونسخة الهوية */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-700">الصورة الشخصية والوثائق</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <ImageUpload
                        label="الصورة الشخصية"
                        required
                        onImageUploaded={(file, url) => {
                          handleFileChange("idPhoto", file)
                          handleInputChange("idPhotoUrl", url)
                        }}
                        onImageRemoved={() => {
                          handleFileChange("idPhoto", null)
                          handleInputChange("idPhotoUrl", "")
                        }}
                        maxSize={5}
                        error={errors.idPhoto}
                      />
                      <ImageUpload
                        label="نسخة من الهوية الوطنية"
                        required
                        onImageUploaded={(file, url) => {
                          handleFileChange("nationalIdCopy", file)
                          handleInputChange("nationalIdCopyUrl", url)
                        }}
                        onImageRemoved={() => {
                          handleFileChange("nationalIdCopy", null)
                          handleInputChange("nationalIdCopyUrl", "")
                        }}
                        maxSize={5}
                      />
                    </div>
                  </div>
                  {/* المعلومات القانونية */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-700 flex items-center gap-3">
                      <ShieldCheck className="w-6 h-6 text-blue-500" /> المعلومات القانونية
                    </h3>
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
                      {errors.workAuthorization && (
                        <p className="text-red-500 text-sm mt-1">{errors.workAuthorization}</p>
                      )}
                    </div>
                    <div className="space-y-3 pt-2">
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
                  </div>
                </div>
              )}
            </CardContent>
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between p-8 bg-gray-50 border-t gap-4">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  size="lg"
                  className="w-full sm:w-auto bg-transparent"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  السابق
                </Button>
              )}
              {!(currentStep > 1) && <div />}
              {/* This is to maintain justify-between */}
              {currentStep < steps.length && (
                <Button type="button" onClick={nextStep} size="lg" className="w-full sm:w-auto bg-green-600">
                  التالي
                  <ArrowLeft className="w-4 h-4 ml-2" />
                </Button>
              )}
              {currentStep === steps.length && (
                <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
                  {isSubmitting ? "جاري الإرسال..." : "إرسال الطلب"}
                </Button>
              )}
            </div>
          </form>
        </Card>
        <p className="text-sm text-gray-100 text-center mt-6">
          بإرسال هذا الطلب، فإنك توافق على الشروط والأحكام وسياسة الخصوصية الخاصة بنا.
        </p>
      </div>
    </div>
  )
}
