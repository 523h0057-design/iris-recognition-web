import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { userApi, enrollmentApi } from '@/services/api'
import { Upload, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const Enrollment = () => {
  const [selectedUser, setSelectedUser] = useState('')
  const [eyePosition, setEyePosition] = useState('left')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => userApi.getAll().then((res) => res.data),
  })

  const enrollMutation = useMutation({
    mutationFn: (formData: FormData) => enrollmentApi.enroll(formData),
    onSuccess: (response) => {
      setResult(response.data)
      if (response.data.success) {
        toast.success('Iris template enrolled successfully!')
      } else {
        toast.error(response.data.message)
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Enrollment failed')
      setResult(null)
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setResult(null)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedUser || !selectedFile) {
      toast.error('Please select a user and upload an image')
      return
    }

    const formData = new FormData()
    formData.append('user_id', selectedUser)
    formData.append('eye_position', eyePosition)
    formData.append('image', selectedFile)

    enrollMutation.mutate(formData)
  }

  const handleReset = () => {
    setSelectedUser('')
    setEyePosition('left')
    setSelectedFile(null)
    setPreviewUrl(null)
    setResult(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Iris Enrollment</h2>
        <p className="text-gray-600 mt-1">Register new iris templates for users</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment Form */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Enrollment Form</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Select User *</label>
              <select
                required
                className="input"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">Choose a user...</option>
                {users?.map((user: any) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name} (ID: {user.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Eye Position *</label>
              <div className="flex space-x-4">
                {['left', 'right', 'both'].map((pos) => (
                  <label key={pos} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="eye_position"
                      value={pos}
                      checked={eyePosition === pos}
                      onChange={(e) => setEyePosition(e.target.value)}
                      className="text-primary-600"
                    />
                    <span className="capitalize">{pos}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Iris Image *</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG up to 10MB
                  </p>
                </label>
              </div>
              {selectedFile && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-secondary flex-1"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={enrollMutation.isPending}
                className="btn btn-primary flex-1"
              >
                {enrollMutation.isPending ? 'Processing...' : 'Enroll'}
              </button>
            </div>
          </form>
        </div>

        {/* Preview & Result */}
        <div className="space-y-6">
          {/* Image Preview */}
          {previewUrl && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Image Preview</h3>
              <img
                src={previewUrl}
                alt="Iris preview"
                className="w-full rounded-lg"
              />
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Enrollment Result</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  {result.success ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                  <span
                    className={`font-medium ${
                      result.success ? 'text-green-700' : 'text-red-700'
                    }`}
                  >
                    {result.message}
                  </span>
                </div>

                {result.success && (
                  <>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Template ID:</span>
                        <span className="font-medium">{result.template_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quality Score:</span>
                        <span className="font-medium">
                          {result.quality_score}/100
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Template Size:</span>
                        <span className="font-medium">
                          {result.template_size} bytes
                        </span>
                      </div>
                    </div>

                    {/* Quality Indicator */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Quality</span>
                        <span>{result.quality_score}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            result.quality_score >= 80
                              ? 'bg-green-500'
                              : result.quality_score >= 60
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${result.quality_score}%` }}
                        ></div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Enrollment
