import { useRef, useState } from 'react'
import { uploadToCloudinary } from '../lib/cloudinary'

const MAX_BYTES = 10 * 1024 * 1024 // 10MB

export default function ImageUploadButton({ onUploaded, label = 'Upload', style, errorStyle }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file again later
    if (!file) return

    if (file.size > MAX_BYTES) {
      setError('Image is larger than 10MB.')
      return
    }

    setUploading(true)
    setError('')
    try {
      const url = await uploadToCloudinary(file)
      onUploaded(url)
    } catch (err) {
      setError(err.message)
    }
    setUploading(false)
  }

  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', gap: '4px' }}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        style={{ ...style, opacity: uploading ? 0.65 : 1, cursor: uploading ? 'not-allowed' : 'pointer' }}
      >
        {uploading ? 'Uploading…' : label}
      </button>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
      {error && <span style={errorStyle || { fontSize: '11px', color: '#dc2626' }}>{error}</span>}
    </span>
  )
}
