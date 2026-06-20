path = "app/api/cron/liberar-reservas/route.ts"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

replacements = [
    (".select('id, numero, estado, fecha_reserva')",
     ".select('id, numero, estado, reservado_hasta')"),
    ("if (!unidad.fecha_reserva) continue",
     "if (!unidad.reservado_hasta) continue"),
    ("const fechaReserva = new Date(unidad.fecha_reserva)",
     "const fechaReserva = new Date(unidad.reservado_hasta)"),
    (".update({ estado: 'libre', fecha_reserva: null })",
     ".update({ estado: 'libre', reservado_hasta: null, reservado_por: null })"),
]

all_ok = True
for old, new in replacements:
    if old not in content:
        print(f"ERROR: no encontre -> {old}")
        all_ok = False
    else:
        content = content.replace(old, new, 1)

if all_ok:
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("OK: todas las referencias actualizadas de fecha_reserva a reservado_hasta")
else:
    print("No se guardaron cambios por los errores anteriores.")
