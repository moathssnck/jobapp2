import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  type DocumentSnapshot,
} from "firebase/firestore"
import { db } from "./firestore"
  
  export interface ApplicationData {
    // Personal Information
    firstName: string
    lastName: string
    email: string
    phone: string
    address?: string
    city?: string
    state?: string
    zipCode?: string
    nationality: string
    dateOfBirth?: string
    gender?: string
    maritalStatus?: string
    nationalId: string
  
    // Position Information
    position: string
    department?: string
    salaryExpectation?: string
    availableStartDate?: string
    employmentType?: string
  
    // Additional Information
    coverLetter?: string
    linkedinUrl?: string
    portfolioUrl?: string
    referralSource?: string
  
    // Legal Information
    workAuthorization: string
    backgroundCheck: boolean
    drugTest: boolean
  
    // Arrays
    workExperience: WorkExperience[]
    education: Education[]
    skills: string[]
  
    // File URLs
    files: {
      resume?: string
      coverLetter?: string
      portfolio?: string
      idPhoto?: string
      nationalIdCopy?: string
    }
  
    // Metadata
    status: "pending" | "reviewing" | "interview" | "accepted" | "rejected"
    createdAt: Timestamp
    updatedAt: Timestamp
  }
  
  export interface WorkExperience {
    company: string
    position: string
    startDate?: string
    endDate?: string
    current: boolean
    description?: string
  }
  
  export interface Education {
    institution: string
    degree: string
    field?: string
    graduationYear?: string
    gpa?: string
  }
  
  export async function createApplication(
    data: Omit<ApplicationData, "createdAt" | "updatedAt" | "status">,
  ): Promise<string> {
    try {
      // Check if email already exists
      const existingQuery = query(collection(db, "applications"), where("email", "==", data.email))
      const existingDocs = await getDocs(existingQuery)
  
      if (!existingDocs.empty) {
        throw new Error("يوجد طلب مسجل بهذا البريد الإلكتروني مسبقاً")
      }
  
      const applicationData: ApplicationData = {
        ...data,
        status: "pending",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }
  
      const docRef = await addDoc(collection(db, "applications"), applicationData)
      return docRef.id
    } catch (error) {
      console.error("Error creating application:", error)
      throw error
    }
  }
  
  export async function getApplication(id: string): Promise<ApplicationData | null> {
    try {
      const docRef = doc(db, "applications", id)
      const docSnap = await getDoc(docRef)
  
      if (docSnap.exists()) {
        return { ...docSnap.data() } as ApplicationData
      }
  
      return null
    } catch (error) {
      console.error("Error getting application:", error)
      throw error
    }
  }
  
  export async function updateApplicationStatus(id: string, status: ApplicationData["status"]): Promise<void> {
    try {
      const docRef = doc(db, "applications", id)
      await updateDoc(docRef, {
        status,
        updatedAt: Timestamp.now(),
      })
    } catch (error) {
      console.error("Error updating application status:", error)
      throw error
    }
  }
  
  export async function deleteApplication(id: string): Promise<void> {
    try {
      const docRef = doc(db, "applications", id)
      await deleteDoc(docRef)
    } catch (error) {
      console.error("Error deleting application:", error)
      throw error
    }
  }
  
  export interface ApplicationsQueryOptions {
    status?: ApplicationData["status"]
    position?: string
    limit?: number
    lastDoc?: DocumentSnapshot
  }
  
  export async function getApplications(options: ApplicationsQueryOptions = {}) {
    try {
      let q = query(collection(db, "applications"), orderBy("createdAt", "desc"))
  
      if (options.status) {
        q = query(q, where("status", "==", options.status))
      }
  
      if (options.position) {
        q = query(q, where("position", ">=", options.position), where("position", "<=", options.position + "\uf8ff"))
      }
  
      if (options.limit) {
        q = query(q, limit(options.limit))
      }
  
      if (options.lastDoc) {
        q = query(q, startAfter(options.lastDoc))
      }
  
      const querySnapshot = await getDocs(q)
      const applications: (ApplicationData & { id: string })[] = []
  
      querySnapshot.forEach((doc) => {
        applications.push({
          id: doc.id,
          ...(doc.data() as ApplicationData),
        })
      })
  
      return {
        applications,
        lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
        hasMore: querySnapshot.docs.length === (options.limit || 10),
      }
    } catch (error) {
      console.error("Error getting applications:", error)
      throw error
    }
  }
  
  export async function getApplicationStats() {
    try {
      const applicationsRef = collection(db, "applications")
      const allDocs = await getDocs(applicationsRef)
  
      const stats = {
        total: allDocs.size,
        statusStats: {} as Record<string, number>,
        positionStats: {} as Record<string, number>,
        recentApplications: [] as (ApplicationData & { id: string })[],
      }
  
      allDocs.forEach((doc) => {
        const data = doc.data() as ApplicationData
  
        // Count by status
        stats.statusStats[data.status] = (stats.statusStats[data.status] || 0) + 1
  
        // Count by position
        stats.positionStats[data.position] = (stats.positionStats[data.position] || 0) + 1
      })
  
      // Get recent applications
      const recentQuery = query(applicationsRef, orderBy("createdAt", "desc"), limit(5))
      const recentDocs = await getDocs(recentQuery)
  
      recentDocs.forEach((doc) => {
        stats.recentApplications.push({
          id: doc.id,
          ...(doc.data() as ApplicationData),
        })
      })
  
      return stats
    } catch (error) {
      console.error("Error getting application stats:", error)
      throw error
    }
  }
  