"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Users, FileText, TrendingUp, Clock, Search, Filter, Eye, ExternalLink, X } from "lucide-react"

interface Application {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  position: string
  department?: string
  nationality: string
  status: string
  createdAt: { seconds: number }
  files?: {
    idPhoto?: string
    nationalIdCopy?: string
    resume?: string
    coverLetter?: string
    portfolio?: string
  }
}

interface Stats {
  total: number
  statusStats: Record<string, number>
  positionStats: Record<string, number>
  recentApplications: Application[]
}

export default function AdminFirestoreDashboard() {
  const [applications, setApplications] = useState<Application[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [positionFilter, setPositionFilter] = useState("")
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)

  useEffect(() => {
    fetchStats()
    fetchApplications()
  }, [statusFilter, positionFilter])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/applications-firestore?stats=true")
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        limit: "20",
      })

      if (statusFilter !== "all") params.append("status", statusFilter)
      if (positionFilter) params.append("position", positionFilter)

      const response = await fetch(`/api/applications-firestore?${params}`)
      const data = await response.json()
      setApplications(data.applications || [])
    } catch (error) {
      console.error("Error fetching applications:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateApplicationStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/applications-firestore/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        fetchApplications()
        fetchStats()
      }
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  const viewApplicationDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/applications-firestore/${id}`)
      const data = await response.json()
      setSelectedApplication(data.application)
    } catch (error) {
      console.error("Error fetching application details:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "reviewing":
        return "bg-blue-100 text-blue-800"
      case "interview":
        return "bg-purple-100 text-purple-800"
      case "accepted":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "قيد الانتظار"
      case "reviewing":
        return "قيد المراجعة"
      case "interview":
        return "مقابلة"
      case "accepted":
        return "مقبول"
      case "rejected":
        return "مرفوض"
      default:
        return status
    }
  }

  const filteredApplications = applications.filter(
    (app) =>
      app.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.position.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">لوحة تحكم طلبات التوظيف - Firestore</h1>
          <p className="text-gray-600 mt-2">إدارة ومراجعة طلبات التوظيف مع رفع الصور على ImgBB</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">قيد المراجعة</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.statusStats.reviewing || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">مقابلات</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.statusStats.interview || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">مقبول</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.statusStats.accepted || 0}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              البحث والتصفية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="البحث بالاسم أو البريد أو المنصب..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="تصفية بالحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="reviewing">قيد المراجعة</SelectItem>
                  <SelectItem value="interview">مقابلة</SelectItem>
                  <SelectItem value="accepted">مقبول</SelectItem>
                  <SelectItem value="rejected">مرفوض</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="تصفية بالمنصب..."
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
              />

              <Button
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                  setPositionFilter("")
                }}
                variant="outline"
              >
                مسح التصفية
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>طلبات التوظيف</CardTitle>
            <CardDescription>قائمة بجميع طلبات التوظيف المقدمة مع الصور المرفوعة</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">جاري التحميل...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4">الصورة</th>
                      <th className="text-right py-3 px-4">الاسم</th>
                      <th className="text-right py-3 px-4">البريد الإلكتروني</th>
                      <th className="text-right py-3 px-4">المنصب</th>
                      <th className="text-right py-3 px-4">الجنسية</th>
                      <th className="text-right py-3 px-4">الحالة</th>
                      <th className="text-right py-3 px-4">تاريخ التقديم</th>
                      <th className="text-right py-3 px-4">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.map((app) => (
                      <tr key={app.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          {app.files?.idPhoto ? (
                            <img
                              src={app.files.idPhoto || "/placeholder.svg"}
                              alt="صورة شخصية"
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <Users className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {app.firstName} {app.lastName}
                        </td>
                        <td className="py-3 px-4">{app.email}</td>
                        <td className="py-3 px-4">{app.position}</td>
                        <td className="py-3 px-4">{app.nationality}</td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(app.status)}>{getStatusText(app.status)}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          {new Date(app.createdAt.seconds * 1000).toLocaleDateString("ar-SA")}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => viewApplicationDetails(app.id)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Select
                              value={app.status}
                              onValueChange={(status) => updateApplicationStatus(app.id, status)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">قيد الانتظار</SelectItem>
                                <SelectItem value="reviewing">قيد المراجعة</SelectItem>
                                <SelectItem value="interview">مقابلة</SelectItem>
                                <SelectItem value="accepted">مقبول</SelectItem>
                                <SelectItem value="rejected">مرفوض</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredApplications.length === 0 && (
                  <div className="text-center py-8 text-gray-500">لا توجد طلبات توظيف مطابقة للبحث</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Application Details Modal */}
        {selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>تفاصيل الطلب</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedApplication(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Personal Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">المعلومات الشخصية</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <strong>الاسم:</strong> {selectedApplication.firstName} {selectedApplication.lastName}
                    </div>
                    <div>
                      <strong>البريد الإلكتروني:</strong> {selectedApplication.email}
                    </div>
                    <div>
                      <strong>الهاتف:</strong> {selectedApplication.phone}
                    </div>
                    <div>
                      <strong>الجنسية:</strong> {selectedApplication.nationality}
                    </div>
                  </div>
                </div>

                {/* Images */}
                {selectedApplication.files && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">الصور والوثائق</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedApplication.files.idPhoto && (
                        <div>
                          <p className="font-medium mb-2">الصورة الشخصية</p>
                          <img
                            src={selectedApplication.files.idPhoto || "/placeholder.svg"}
                            alt="صورة شخصية"
                            className="w-full max-w-xs rounded-lg border"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 bg-transparent"
                            onClick={() => window.open(selectedApplication.files?.idPhoto, "_blank")}
                          >
                            <ExternalLink className="w-4 h-4 ml-2" />
                            عرض بالحجم الكامل
                          </Button>
                        </div>
                      )}
                      {selectedApplication.files.nationalIdCopy && (
                        <div>
                          <p className="font-medium mb-2">نسخة الهوية الوطنية</p>
                          <img
                            src={selectedApplication.files.nationalIdCopy || "/placeholder.svg"}
                            alt="نسخة الهوية"
                            className="w-full max-w-xs rounded-lg border"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 bg-transparent"
                            onClick={() => window.open(selectedApplication.files?.nationalIdCopy, "_blank")}
                          >
                            <ExternalLink className="w-4 h-4 ml-2" />
                            عرض بالحجم الكامل
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
