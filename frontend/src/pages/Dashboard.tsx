import { useQuery } from '@tanstack/react-query'
import { statsApi } from '@/services/api'
import { Users, Eye, CheckCircle, Search, TrendingUp, Clock } from 'lucide-react'

const Dashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => statsApi.getDashboard().then((res) => res.data),
  })

  const { data: activity } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: () => statsApi.getRecentActivity(5).then((res) => res.data),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.users?.total || 0,
      subtitle: `${stats?.users?.active || 0} active`,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Iris Templates',
      value: stats?.templates?.total || 0,
      subtitle: `${stats?.templates?.average_per_user || 0} avg/user`,
      icon: Eye,
      color: 'bg-purple-500',
    },
    {
      title: 'Verifications',
      value: stats?.verifications?.total || 0,
      subtitle: `${stats?.verifications?.success_rate || 0}% success`,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      title: 'Identifications',
      value: stats?.identifications?.total || 0,
      subtitle: `${stats?.identifications?.success_rate || 0}% success`,
      icon: Search,
      color: 'bg-orange-500',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 mt-1">Overview of your iris recognition system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.title} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{stat.subtitle}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold">Last 24 Hours</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Verifications</span>
              <span className="text-2xl font-bold text-primary-600">
                {stats?.verifications?.last_24h || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Identifications</span>
              <span className="text-2xl font-bold text-primary-600">
                {stats?.identifications?.last_24h || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold">Processing Time</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Verification (avg)</span>
              <span className="text-2xl font-bold text-green-600">
                {stats?.verifications?.avg_processing_time_ms || 0}ms
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Identification (avg)</span>
              <span className="text-2xl font-bold text-green-600">
                {stats?.identifications?.avg_processing_time_ms || 0}ms
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {activity?.verifications?.slice(0, 5).map((v: any) => (
            <div
              key={v.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <CheckCircle
                  className={`w-5 h-5 ${v.is_match ? 'text-green-500' : 'text-red-500'}`}
                />
                <div>
                  <p className="text-sm font-medium">
                    Verification - User #{v.user_id}
                  </p>
                  <p className="text-xs text-gray-500">
                    Score: {v.score.toFixed(2)}
                  </p>
                </div>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(v.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
