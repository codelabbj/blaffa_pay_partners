import React from "react"

type StatCardProps = {
  title: string
  value: string | number
  icon: React.ElementType
  trend?: { value: number; isPositive: boolean }
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend }) => (
  <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-white/30 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 p-8 flex flex-col space-y-4">
    <div className="flex items-center space-x-3">
      <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg">
        <Icon className="h-6 w-6 text-white" />
      </div>
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</span>
    </div>
    <div className="text-3xl font-bold text-gray-900 dark:text-white">{value}</div>
    {trend && (
      <div className={`text-sm font-medium flex items-center space-x-1 ${trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
        <span>{trend.isPositive ? "▲" : "▼"}</span>
        <span>{trend.value}%</span>
      </div>
    )}
  </div>
)