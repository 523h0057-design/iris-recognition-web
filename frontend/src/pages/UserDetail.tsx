import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { userApi } from '@/services/api'
import { ArrowLeft, Eye, Calendar, Mail, Phone, User } from 'lucide-react'

const UserDetail = () => {
  const { id } = useParams()

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => userApi.getById(Number(id)).then((res) => res.data),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-600">User not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/users" className="text-primary-600 hover:text-primary-700">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{user.full_name}</h2>
          <p className="text-gray-600 mt-1">User Details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info */}
        <div className="lg:col-span-1">
          <div className="card space-y-4">
            <h3 className="text-lg font-semibold">Information</h3>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-700">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">User ID</p>
                  <p className="font-medium">{user.id}</p>
                </div>
              </div>

              {user.email && (
                <div className="flex items-center space-x-3 text-gray-700">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
              )}

              {user.phone && (
                <div className="flex items-center space-x-3 text-gray-700">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="font-medium">{user.phone}</p>
                  </div>
                </div>
              )}

              {user.national_id && (
                <div className="flex items-center space-x-3 text-gray-700">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">National ID</p>
                    <p className="font-medium">{user.national_id}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3 text-gray-700">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="font-medium">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    user.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Iris Templates */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Iris Templates</h3>
              <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                {user.iris_templates?.length || 0} templates
              </span>
            </div>

            {user.iris_templates && user.iris_templates.length > 0 ? (
              <div className="space-y-3">
                {user.iris_templates.map((template: any) => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <Eye className="w-8 h-8 text-primary-600" />
                      <div>
                        <p className="font-medium">Template #{template.id}</p>
                        <p className="text-sm text-gray-600 capitalize">
                          {template.eye_position} eye
                        </p>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      {template.quality_score && (
                        <div>
                          <span className="text-sm text-gray-600">Quality: </span>
                          <span className="font-medium">
                            {template.quality_score}/100
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="text-sm text-gray-600">Size: </span>
                        <span className="font-medium">
                          {template.template_size} bytes
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(template.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No iris templates enrolled yet</p>
                <Link
                  to="/enrollment"
                  className="btn btn-primary mt-4 inline-block"
                >
                  Enroll Iris
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDetail
