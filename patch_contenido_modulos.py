path = "app/page.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

cambios_ok = 0
cambios_error = 0

# --- MODULO A: insertar justo antes del primer floor-row ---
old_a = '<div className="floor-row">'
new_a = '''<div className="mod-intro">
              <p className="mod-sub">Tu inventario maestro y la inteligencia detrás de cada metro cuadrado. Centraliza el estado real de tus torres y proyectos para eliminar los errores humanos de raíz.</p>
              <div className="mod-points">
                <div className="mod-point"><span className="mod-point-title">Gestión del Mercado y Precios</span><p>Monitorea el valor por metro cuadrado, ajusta listas de precios según la demanda del sector y calibra tus unidades frente al ritmo de absorción de la zona.</p></div>
                <div className="mod-point"><span className="mod-point-title">Calculadora Integrada</span><p>Cotiza unidades al instante. Calcula planes de pago personalizados, iniciales, cuotas durante la construcción y montos de separación frente al cliente sin salir del sistema.</p></div>
                <div className="mod-point"><span className="mod-point-title">Calendario Operativo y Recordatorios</span><p>Monitorea las fechas de entrega de obras, hitos de construcción y tareas clave del equipo para que ningún proyecto se desfase.</p></div>
              </div>
            </div>
            <div className="floor-row">'''

if old_a in content:
    content = content.replace(old_a, new_a, 1)
    cambios_ok += 1
    print("OK A: contenido del Modulo A insertado.")
else:
    cambios_error += 1
    print("ERROR A: no encontre el ancla de floor-row.")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print(f"Resumen parcial: {cambios_ok} ok, {cambios_error} error.")
