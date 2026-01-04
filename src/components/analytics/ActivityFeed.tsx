export function ActivityFeed({ activities }: { activities: any[] }) {
  return (
    <div className="space-y-4">
      {activities.map(activity => (
        <div key={activity.id} className="flex gap-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
          <div className="flex-1">
            <p className="text-sm">{activity.description}</p>
            <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}