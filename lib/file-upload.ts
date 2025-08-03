import { put } from "@vercel/blob"

export async function uploadFile(file: File, folder: string): Promise<string> {
  try {
    const filename = `${folder}/${Date.now()}-${file.name}`
    const blob = await put(filename, file, {
      access: "public",
    })
    return blob.url
  } catch (error) {
    console.error("File upload error:", error)
    throw new Error("Failed to upload file")
  }
}

export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || ""
}

export function validateFileType(file: File, allowedTypes: string[]): boolean {
  const extension = getFileExtension(file.name)
  return allowedTypes.includes(extension)
}

export function validateFileSize(file: File, maxSizeInMB: number): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024
  return file.size <= maxSizeInBytes
}
