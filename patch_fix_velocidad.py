path = "app/dashboard/constructoras/[id]/proyectos/[proyectoId]/unidades/page.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = "    if (u) setUnidades(u);"
new = """    if (u) setUnidades(u);

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

if old not in content:
    print("ERROR: no encontre la linea exacta de setUnidades(u).")
else:
    content = content.replace(old, new, 1)
    print("OK: calculo de velocidad por piso agregado.")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
