export default async function PipelinePage() {
  const columns = await getPipelineDeals();
  
  // Si columns está vacío, definimos columnas por defecto
  const data = columns.length > 0 ? columns : [
    { id: '1', title: 'Prospectos', deals: [] },
    { id: '2', title: 'Visitas', deals: [] },
    { id: '3', title: 'Negociación', deals: [] },
    { id: '4', title: 'Cierre', deals: [] }
  ];

  return (
    <div className="min-h-screen text-zinc-100 p-8">
      <main className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {data.map((col: any) => {
          const displayDeals = col.deals.length > 0 ? col.deals : [
            { id: 'd1', client: 'Inversiones Piantini', property: 'Torre Naco', value: 'US$ 450,000' }
          ];

          return (
            <div key={col.id} className="bg-zinc-950/50 p-4 rounded-xl min-h-[500px]">
              <h3 className="text-zinc-400 font-bold mb-4 uppercase text-xs">{col.title}</h3>
              {displayDeals.map((deal: any) => (
                <div key={deal.id} className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                  <p className="font-bold">{deal.client}</p>
                  <p className="text-xs text-zinc-400">{deal.property}</p>
                  <p className="text-[#CCFF00] font-bold">{deal.value}</p>
                </div>
              ))}
            </div>
          );
        })}
      </main>
    </div>
  );
}