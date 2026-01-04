export function MetricCard({ title, value, change, icon }: any) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
          {change && <p className={`text-sm mt-1 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change > 0 ? '↑' : '↓'} {Math.abs(change)}%
          </p>}
        </div>
        {icon}
      </div>
    </div>
  );
}