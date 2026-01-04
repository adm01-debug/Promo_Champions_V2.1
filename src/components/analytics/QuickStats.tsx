export function QuickStats({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="text-center"><p className="text-2xl font-bold">{stats.deals}</p><p className="text-sm text-gray-600">Deals</p></div>
      <div className="text-center"><p className="text-2xl font-bold">{stats.revenue}</p><p className="text-sm text-gray-600">Revenue</p></div>
      <div className="text-center"><p className="text-2xl font-bold">{stats.clients}</p><p className="text-sm text-gray-600">Clients</p></div>
      <div className="text-center"><p className="text-2xl font-bold">{stats.activities}</p><p className="text-sm text-gray-600">Activities</p></div>
    </div>
  );
}