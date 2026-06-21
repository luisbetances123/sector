path = "app/dashboard/constructoras/[id]/proyectos/[proyectoId]/unidades/page.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1) Agregar estado nuevo para guardar la velocidad por piso
old_state = "const [editandoId, setEditandoId] = useState<string | null>(null);"
new_state = """const [editandoId, setEditandoId] = useState<string | null>(null);
  const [velocidadPorPiso, setVelocidadPorPiso] = useState<Record<number, number>>({});"""

if old_state not in content:
    print("ERROR 1: no encontre la linea de editandoId.")
else:
    content = content.replace(old_state, new_state, 1)
    print("OK 1: estado velocidadPorPiso agregado.")

# 2) Cargar y calcular la velocidad dentro de cargarDatos (despues de cargar unidades)
old_carga = "    setUnidades(u || []);"
new_carga = """    setUnidades(u || []);

    const { data: hist } = await supabase
      .from('unidad_historial')
      .select('unidad_id, created_at, estado_nuevo')
      .in('estado_nuevo', ['vendido', 'reservado']);

    if (hist && u) {
      const diasPorPiso: Record<number, number[]> = {};
      hist.forEach((h) => {
        const unidad = u.find((x) => x.id === h.unidad_id);
        if (!unidad || unidad.piso === null) return;
        const dias = (Date.now() - new Date(h.created_at).getTime()) / (1000 * 60 * 60 * 24);
        if (!diasPorPiso[unidad.piso]) diasPorPiso[unidad.piso] = [];
        diasPorPiso[unidad.piso].push(dias);
      });
      const promedios: Record<number, number> = {};
      Object.entries(diasPorPiso).forEach(([piso, dias]) => {
        promedios[Number(piso)] = dias.reduce((a, b) => a + b, 0) / dias.length;
      });
      setVelocidadPorPiso(promedios);
    }"""

if old_carga not in content:
    print("ERROR 2: no encontre la linea de setUnidades(u || []).")
else:
    content = content.replace(old_carga, new_carga, 1)
    print("OK 2: calculo de velocidad por piso agregado a cargarDatos.")

# 3) Insertar la visualizacion del heatmap, justo antes del Formulario
old_formulario = "      {/* Formulario */}"
new_formulario = """      {/* Heatmap de velocidad de venta */}
      {Object.keys(velocidadPorPiso).length > 0 && (
        <div className="mb-8">
          <div className="text-[11px] text-white uppercase tracking-wider font-mono mb-3">
            Velocidad de venta por piso
          </div>
          <div className="space-y-2">
            {Object.entries(velocidadPorPiso)
              .sort((a, b) => Number(a[0]) - Number(b[0]))
              .map(([piso, dias]) => {
                const maxDias = Math.max(...Object.values(velocidadPorPiso));
                const intensidad = maxDias > 0 ? dias / maxDias : 0;
                const r = Math.round(255 * intensidad);
                const g = Math.round(255 * (1 - intensidad));
                return (
                  <div key={piso} className="flex items-center gap-3">
                    <span className="text-xs font-mono text-white w-16">Piso {piso}</span>
                    <div className="flex-1 h-6 bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800">
                      <div
                        className="h-full rounded-lg transition-all"
                        style={{
                          width: `${Math.max(8, 100 - intensidad * 70)}%`,
                          backgroundColor: `rgb(${r}, ${g}, 60)`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-mono text-zinc-400 w-24 text-right">
                      {dias.toFixed(0)}d promedio
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Formulario */}"""

if old_formulario not in content:
    print("ERROR 3: no encontre el comentario de Formulario.")
else:
    content = content.replace(old_formulario, new_formulario, 1)
    print("OK 3: visualizacion del heatmap insertada.")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
