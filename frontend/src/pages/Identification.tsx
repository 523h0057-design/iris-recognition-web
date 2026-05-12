import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { identificationApi } from '@/services/api'
import { Upload, Search, Clock, Award } from 'lucide-react'
import toast from 'react-hot-toast'

const Identification = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [maxResults, setMaxResults] = useState(5)

  const identifyMutation = useMutation({
    mutationFn: (formData: FormData) => identificationApi.identify(formData),
    onSuccess: (response) => {
      setResult(response.data)
      if (response.data.is_identified) {
        toast.success(`Found ${response.data.matches.length} match(es)!`)
      } else {
        toast.error('No matches found in database')
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Identification failed')
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

    if (!selectedFile) {
      toast.error('Please upload an image')
      return
    }

    const formData = new FormData()
    formData.append('image', selectedFile)
    formData.append('max_results', maxResults.toString())

    identifyMutation.mutate(formData)
  }

  const handleReset = () => {
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
        <h2 className="text-3xl font-bold text-gray-900">Iris Identification</h2>
        <p className="text-gray-600 mt-1">
          Identify iris against all enrolled users (1:N matching)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Identification Form */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Identification Form</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Maximum Results</label>
              <input
                type="number"
                min="1"
                max="20"
                className="input"
                value={maxResults}
                onChange={(e) => setMaxResults(parseInt(e.target.value))}
              />
              <p className="text-xs text-gray-500 mt-1">
                Number of top matches to return (1-20)
              </p>
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
                disabled={identifyMutation.isPending}
                className="btn btn-primary flex-1 flex items-center justify-center space-x-2"
              >
                <Search className="w-4 h-4" />
                <span>{identifyMutation.isPending ? 'Searching...' : 'Identify'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Preview */}
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
      </div>

      {/* Results */}
      {result && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Identification Results</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center space-x-1">
                <Search className="w-4 h-4" />
                <span>Searched: {result.total_searched} templates</span>
              </span>
              <span className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{result.processing_time_ms}ms</span>
              </span>
            </div>
          </div>

          {result.is_identified ? (
            <div className="space-y-3">
              {result.matches.map((match: any) => (
                <div
                  key={match.user_id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-primary-100 text-primary-700 rounded-full font-bold">
                      #{match.rank}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{match.full_name}</p>
                      <p className="text-sm text-gray-600">User ID: {match.user_id}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary-600">
                        {match.matching_score.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">Score</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getConfidenceColor(
                        match.confidence
                      )}`}
                    >
                      {match.confidence}
                    </span>
                    {match.rank === 1 && (
                      <Award className="w-6 h-6 text-yellow-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl font-semibold text-gray-700">No Matches Found</p>
              <p className="text-gray-500 mt-2">
                The iris template does not match any enrolled users
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Identification
