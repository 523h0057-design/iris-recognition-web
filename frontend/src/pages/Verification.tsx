import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { userApi, verificationApi } from '@/services/api'
import { Upload, CheckCircle, XCircle, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

const Verification = () => {
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => userApi.getAll().then((res) => res.data),
  })

  const verifyMutation = useMutation({
    mutationFn: (formData: FormData) => verificationApi.verify(formData),
    onSuccess: (response) => {
      const score = response.data?.matching_score
      const hd = typeof score === 'number' ? 1 - score / 100 : null
      const isMatchByHd = hd !== null && hd <= 0.32

      setResult({
        ...response.data,
        hd,
        is_match: isMatchByHd,
      })
      console.log('Verification HD:', {
        userId: selectedUser,
        matchingScore: score,
        hammingDistance: hd,
        threshold: response.data?.threshold,
        isMatch: isMatchByHd,
      })
      if (isMatchByHd) {
        toast.success('Verification successful - Match found!')
      } else {
        toast.error('Verification failed - No match')
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Verification failed')
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
    formData.append('image', selectedFile)

    verifyMutation.mutate(formData)
  }

  const handleReset = () => {
    setSelectedUser('')
    setSelectedFile(null)
    setPreviewUrl(null)
    setResult(null)
  }

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'text-green-700 bg-green-100'
      case 'medium':
        return 'text-yellow-700 bg-yellow-100'
      case 'low':
        return 'text-orange-700 bg-orange-100'
      default:
        return 'text-red-700 bg-red-100'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Iris Verification</h2>
        <p className="text-gray-600 mt-1">Verify iris against a specific user (1:1 matching)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verification Form */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Verification Form</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Select User to Verify *</label>
              <select
                required
                className="input"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">Choose a user...</option>
                {users?.map((user: any) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name} (Templates: {user.template_count})
                  </option>
                ))}
              </select>
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
                disabled={verifyMutation.isPending}
                className="btn btn-primary flex-1"
              >
                {verifyMutation.isPending ? 'Verifying...' : 'Verify'}
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
              <h3 className="text-lg font-semibold mb-4">Verification Result</h3>
              <div className="space-y-4">
                {/* Match Status */}
                <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg">
                  {result.is_match ? (
                    <div className="text-center">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-2" />
                      <p className="text-xl font-bold text-green-700">Match Found!</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <XCircle className="w-16 h-16 text-red-500 mx-auto mb-2" />
                      <p className="text-xl font-bold text-red-700">No Match</p>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Matching Score:</span>
                    <span className="text-2xl font-bold text-primary-600">
                      {result.matching_score.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">HD:</span>
                    <span className="font-medium">
                      {typeof result.hd === 'number' ? result.hd.toFixed(3) : 'N/A'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Confidence:</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getConfidenceColor(
                        result.confidence
                      )}`}
                    >
                      {result.confidence.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>Processing Time:</span>
                    </span>
                    <span className="font-medium">{result.processing_time_ms}ms</span>
                  </div>
                </div>

                {/* Score Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Score</span>
                    <span>{result.matching_score.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 relative">
                    <div
                      className={`h-3 rounded-full ${
                        result.is_match ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{
                        width: `${Math.min((result.matching_score / 100) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0</span>
                    <span>100</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Verification
