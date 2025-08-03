"use client"

import { Label } from "@/components/ui/label"

import type React from "react"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { UploadCloud, X } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  label: string
  required?: boolean
  onImageUploaded: (file: File, url: string) => void
  onImageRemoved: () => void
  maxSize?: number // in MB
  error?: string
}

export function ImageUpload({
  label,
  required,
  onImageUploaded,
  onImageRemoved,
  maxSize = 5,
  error,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      setUploadError(null)
      if (fileRejections.length > 0) {
        setUploadError(fileRejections[0].errors[0].message)
        return
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreview(reader.result as string)
          onImageUploaded(file, reader.result as string)
        }
        reader.readAsDataURL(file)
      }
    },
    [onImageUploaded],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".png", ".jpg", ".gif"] },
    maxSize: maxSize * 1024 * 1024, // Convert MB to bytes
  })

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPreview(null)
    setUploadError(null)
    onImageRemoved()
  }

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div
        {...getRootProps()}
        className={`relative w-full h-48 border-2 border-dashed rounded-lg flex items-center justify-center text-center cursor-pointer transition-colors
          ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"}
          ${error || uploadError ? "border-red-500" : ""}
          ${preview ? "p-0 border-solid" : "p-4"}`}
      >
        <input {...getInputProps()} />
        {preview ? (
          <>
            <Image
              src={preview || "/placeholder.svg"}
              alt="Preview"
              layout="fill"
              objectFit="contain"
              className="rounded-lg"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 left-2 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100"
            >
              <X className="w-4 h-4 text-gray-700" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <UploadCloud className="w-10 h-10" />
            <p className="font-semibold">اسحب وأفلت الصورة هنا، أو انقر للاختيار</p>
            <p className="text-xs">PNG, JPG, GIF up to {maxSize}MB</p>
          </div>
        )}
      </div>
      {(error || uploadError) && <p className="text-red-500 text-sm mt-1">{error || uploadError}</p>}
    </div>
  )
}
