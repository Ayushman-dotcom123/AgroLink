'use client'
import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiUpload, FiCamera, FiX, FiImage } from 'react-icons/fi'

export default function ImageUploadCard({ onImageSelect, label = 'Upload Image', accept = 'image/*' }) {
  const [preview, setPreview] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const fileRef = useRef(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target.result)
      onImageSelect(file, e.target.result)
    }
    reader.readAsDataURL(file)
  }

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }, [])

  const startCamera = async () => {
    setShowCamera(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch {
      alert('Camera access denied or not available.')
      setShowCamera(false)
    }
  }

  const capturePhoto = () => {
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0)
    canvas.toBlob((blob) => {
      const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' })
      handleFile(file)
      stopCamera()
    }, 'image/jpeg', 0.9)
  }

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    setShowCamera(false)
  }

  const clearImage = () => { setPreview(null); onImageSelect(null, null) }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {showCamera ? (
          <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="relative rounded-2xl overflow-hidden bg-black aspect-video">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
              <button onClick={capturePhoto}
                className="w-14 h-14 rounded-full bg-white border-4 border-[#4CAF50] flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                <FiCamera className="text-[#1565C0] text-xl" />
              </button>
              <button onClick={stopCamera}
                className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
                <FiX className="text-white" />
              </button>
            </div>
          </motion.div>
        ) : preview ? (
          <motion.div key="preview" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-2xl overflow-hidden border-2 border-[#81C784]/50 shadow-sm">
            <img src={preview} alt="Preview" className="w-full max-h-72 object-cover" />
            <button onClick={clearImage}
              className="absolute top-3 right-3 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-md transition-colors">
              <FiX className="text-white text-sm" />
            </button>
            <div className="absolute bottom-3 left-3 bg-[#1565C0]/80 text-[#C8E6C9] text-xs px-2.5 py-1 rounded-full">
              ✓ Image ready
            </div>
          </motion.div>
        ) : (
          <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
              dragging ? 'border-[#4CAF50] bg-[#81C784]/15' : 'border-[#81C784]/50 hover:border-[#4CAF50] hover:bg-[#F0F7FF]'
            }`}>
            <FiImage className="text-5xl text-[#81C784] mx-auto mb-3" />
            <p className="text-[#1565C0] font-semibold mb-1">{label}</p>
            <p className="text-[#455A64] text-sm">Drag & drop or click to browse</p>
            <p className="text-[#90A4AE] text-xs mt-1">JPG, PNG, WEBP up to 10MB</p>
          </motion.div>
        )}
      </AnimatePresence>

      {!showCamera && !preview && (
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => fileRef.current?.click()}
            className="flex items-center justify-center gap-2 border-2 border-[#81C784]/40 hover:border-[#4CAF50] bg-white text-[#1565C0] font-medium py-2.5 rounded-xl transition-all text-sm">
            <FiUpload className="text-[#4CAF50]" /> Upload Photo
          </button>
          <button onClick={startCamera}
            className="flex items-center justify-center gap-2 border-2 border-[#81C784]/40 hover:border-[#4CAF50] bg-white text-[#1565C0] font-medium py-2.5 rounded-xl transition-all text-sm">
            <FiCamera className="text-[#4CAF50]" /> Use Camera
          </button>
        </div>
      )}

      <input ref={fileRef} type="file" accept={accept} className="hidden" onChange={e => handleFile(e.target.files[0])} />
    </div>
  )
}
