export interface ImgBBResponse {
    data: {
      id: string
      title: string
      url_viewer: string
      url: string
      display_url: string
      width: number
      height: number
      size: number
      time: number
      expiration: number
      image: {
        filename: string
        name: string
        mime: string
        extension: string
        url: string
      }
      thumb: {
        filename: string
        name: string
        mime: string
        extension: string
        url: string
      }
      medium: {
        filename: string
        name: string
        mime: string
        extension: string
        url: string
      }
      delete_url: string
    }
    success: boolean
    status: number
  }
  
  export async function uploadToImgBB(file: File, apiKey: string, expiration?: number): Promise<ImgBBResponse> {
    const formData = new FormData()
    formData.append("image", file)
  
    const url = `https://api.imgbb.com/1/upload?key=${apiKey}${expiration ? `&expiration=${expiration}` : ""}`
  
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    })
  
    if (!response.ok) {
      throw new Error(`ImgBB upload failed: ${response.statusText}`)
    }
  
    const result: ImgBBResponse = await response.json()
  
    if (!result.success) {
      throw new Error("ImgBB upload failed")
    }
  
    return result
  }
  
  export function validateImageFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: "نوع الملف غير مدعوم. يرجى استخدام JPG, PNG, GIF, أو WebP" }
    }
  
    // Check file size (32MB max for ImgBB)
    const maxSize = 32 * 1024 * 1024 // 32MB
    if (file.size > maxSize) {
      return { valid: false, error: "حجم الملف كبير جداً. الحد الأقصى 32 ميجابايت" }
    }
  
    return { valid: true }
  }
  
  export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
  
      img.onload = () => {
        URL.revokeObjectURL(url)
        resolve({ width: img.width, height: img.height })
      }
  
      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error("فشل في قراءة أبعاد الصورة"))
      }
  
      img.src = url
    })
  }
  