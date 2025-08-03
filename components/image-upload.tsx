"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, Upload, X, Loader2 } from "lucide-react"
interface ImageUploadProps {
  label: string
  required?: boolean
  onImageUploaded: (url: string) => void
  onImageRemoved: () => void
  currentImage?: string
  accept?: string
  maxSize?: number // in MB
  className?: string
}

export default function ImageUpload({
  label,
  required = false,
  onImageUploaded,
  onImageRemoved,
  currentImage,
  accept = "image/*",
  maxSize = 10,
  className = "",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const [error, setError] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    setError("")

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`حجم الملف كبير جداً. الحد الأقصى ${maxSize} ميجابايت`)
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to ImgBB
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("image", file)

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "فشل في رفع الصورة")
      }

      onImageUploaded(result.data.url)
    } catch (error) {
      console.error("Upload error:", error)
      setError(error instanceof Error ? error.message : "فشل في رفع الصورة")
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    setError("")
    onImageRemoved()
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Label className="text-base font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
        <CardContent className="p-6">
          {preview ? (
            <div className="relative">
              <img
                src={preview || "/placeholder.svg"}
                alt={label}
                className="w-full max-w-xs mx-auto rounded-lg object-cover"
                style={{ maxHeight: "200px" }}
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 rounded-full w-8 h-8 p-0"
                onClick={handleRemove}
                disabled={uploading}
              >
                <X className="w-4 h-4" />
              </Button>
              {uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
            </div>
          ) : (
            <div
              className="text-center py-8 cursor-pointer"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="w-12 h-12 text-gray-400 animate-spin mb-4" />
                  <p className="text-gray-600">جاري رفع الصورة...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Camera className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">انقر لاختيار صورة أو اسحبها هنا</p>
                  <p className="text-sm text-gray-500">الحد الأقصى: {maxSize} ميجابايت</p>
                </div>
              )}
            </div>
          )}

          <Input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />

          {!preview && !uploading && (
            <div className="mt-4 flex justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                اختيار صورة
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}
