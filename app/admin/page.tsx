"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Users, FileText, TrendingUp, Clock, Search, Filter, Eye } from "lucide-react"

interface Application {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  position: string
  department: string
  nationality: string
  status: string
  created_at: string
}

interface Stats {
  total: number
  statusStats: Array<{ status: string; count: string }>
  positionStats: Array<{ position: string; count: string }>
  recentApplications: Application[]
}

export default function AdminDashboard() {
  const [applications, setApplications] = useState<Application[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [positionFilter, setPositionFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchStats()
    fetchApplications()
  }, [currentPage, statusFilter, positionFilter])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/applications/stats")
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
        page: currentPage.toString(),
        limit: "10",
      })

      if (statusFilter !== "all") params.append("status", statusFilter)
      if (positionFilter) params.append("position", positionFilter)

      const response = await fetch(`/api/applications?${params}`)
      const data = await response.json()
      setApplications(data.applications)
    } catch (error) {
      console.error("Error fetching applications:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateApplicationStatus = async (id: number, status: string) => {
    try {
      const response = await fetch(`/api/applications/${id}`, {
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
      app.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.position.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">لوحة تحكم طلبات التوظيف</h1>
          <p className="text-gray-600 mt-2">إدارة ومراجعة طلبات التوظيف</p>
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
                <div className="text-2xl font-bold">
                  {stats.statusStats.find((s) => s.status === "reviewing")?.count || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">مقابلات</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.statusStats.find((s) => s.status === "interview")?.count || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">مقبول</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.statusStats.find((s) => s.status === "accepted")?.count || 0}
                </div>
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
                  setCurrentPage(1)
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
            <CardDescription>قائمة بجميع طلبات التوظيف المقدمة</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">جاري التحميل...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
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
                          {app.first_name} {app.last_name}
                        </td>
                        <td className="py-3 px-4">{app.email}</td>
                        <td className="py-3 px-4">{app.position}</td>
                        <td className="py-3 px-4">{app.nationality}</td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(app.status)}>{getStatusText(app.status)}</Badge>
                        </td>
                        <td className="py-3 px-4">{new Date(app.created_at).toLocaleDateString("ar-SA")}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
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
      </div>
    </div>
  )
}
