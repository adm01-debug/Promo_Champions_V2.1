export function DealsPipeline({ stages }: { stages: any[] }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {stages.map(stage => (
        <div key={stage.id} className="min-w-[300px] bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-2">{stage.name}</h3>
          <p className="text-sm text-gray-600 mb-4">{stage.count} deals</p>
          <div className="space-y-2">
            {stage.deals?.map((deal: any) => (
              <div key={deal.id} className="bg-white p-3 rounded shadow-sm">
                <p className="font-medium">{deal.title}</p>
                <p className="text-sm text-gray-600">{deal.value}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}