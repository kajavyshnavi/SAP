import React, { useState, useEffect } from 'react'
import { getAnalytics } from '../api'
import { TrendingUp, TrendingDown, BarChart3, Package } from 'lucide-react'

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await getAnalytics()
      setAnalytics(response) // ✅ fixed: was response.data
      setError(null)
    } catch (err) {
      setError('Failed to load analytics')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-300">
        {error}
      </div>
    )
  }

  const stats = [
    {
      label: 'Total Reviews',
      value: analytics?.total_reviews || 0,
      icon: BarChart3,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Positive',
      value: analytics?.sentiment_distribution?.positive || 0,
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
    },
    {
      label: 'Negative',
      value: analytics?.sentiment_distribution?.negative || 0,
      icon: TrendingDown,
      color: 'from-red-500 to-pink-500',
    },
    {
      label: 'Neutral',
      value: analytics?.sentiment_distribution?.neutral || 0,
      icon: Package,
      color: 'from-amber-500 to-orange-500',
    },
  ]

  const sentimentScore = analytics?.average_sentiment_score || 0
  const scoreColor =
    sentimentScore > 0.3
      ? 'text-green-400'
      : sentimentScore < -0.3
      ? 'text-red-400'
      : 'text-yellow-400'

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-2">{stat.label}</p>
                  <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-lg opacity-20`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Sentiment Score + Confidence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-6 text-slate-200">Average Sentiment Score</h3>
          <div className="flex items-center justify-center">
            <div className={`text-6xl font-bold ${scoreColor}`}>
              {sentimentScore.toFixed(2)}
            </div>
          </div>
          <p className="text-center text-slate-400 mt-4 text-sm">
            {sentimentScore > 0.3
              ? 'Overall positive sentiment trend'
              : sentimentScore < -0.3
              ? 'Overall negative sentiment trend'
              : 'Balanced sentiment distribution'}
          </p>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-6 text-slate-200">Average Confidence Scores</h3>
          <div className="space-y-4">
            {[
              { label: 'Positive', value: analytics?.average_confidence?.positive || 0, color: 'bg-green-500' },
              { label: 'Negative', value: analytics?.average_confidence?.negative || 0, color: 'bg-red-500' },
              { label: 'Neutral',  value: analytics?.average_confidence?.neutral  || 0, color: 'bg-yellow-500' },
            ].map((conf, index) => (
              <div key={index}>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-300 text-sm">{conf.label}</span>
                  <span className="text-slate-400 text-sm font-semibold">
                    {(conf.value * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                  <div
                    className={`${conf.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${conf.value * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products */}
      {analytics?.top_products && analytics.top_products.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-6 text-slate-200">Top Reviewed Products</h3>
          <div className="space-y-3">
            {analytics.top_products.map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
              >
                <span className="text-slate-300">{product[0]}</span>
                <span className="text-blue-400 font-semibold">{product[1]} reviews</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}