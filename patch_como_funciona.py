path = "app/page.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = '''        </section>

        {/* 01 — LOCALIZACION */}'''

new = '''        </section>

        {/* COMO FUNCIONA */}
        <section className="sec">
          <div className="sec-eyebrow">Cómo funciona</div>
          <h2 className="sec-title">De tu Excel a tu inventario en cuatro pasos.</h2>
          <div className="hiw-grid">
            <div className="hiw-step">
              <div className="hiw-num">01</div>
              <div className="hiw-step-title">Sube tu inventario</div>
              <p className="hiw-step-desc">Importa tus proyectos y unidades desde Excel, o regístralos directo en SECTOR. Sin migraciones complicadas.</p>
            </div>
            <div className="hiw-step">
              <div className="hiw-num">02</div>
              <div className="hiw-step-title">Invita a tus brokers</div>
              <p className="hiw-step-desc">Genera links únicos por broker. Cada uno ve solo el inventario que le corresponde, sin necesidad de crear cuentas.</p>
            </div>
            <div className="hiw-step">
              <div className="hiw-num">03</div>
              <div className="hiw-step-title">Controla reservas en tiempo real</div>
              <p className="hiw-step-desc">Cada reserva, venta y cambio de estado se registra automáticamente. Visibilidad total sin llamadas ni mensajes de WhatsApp.</p>
            </div>
            <div className="hiw-step">
              <div className="hiw-num">04</div>
              <div className="hiw-step-title">Reportes automáticos</div>
              <p className="hiw-step-desc">Velocidad de venta, absorción y desempeño por proyecto, listos para mostrar sin armar una hoja de cálculo.</p>
            </div>
          </div>
        </section>

        {/* 01 — LOCALIZACION */}'''

if old not in content:
    print("ERROR: no encontre el punto de insercion exacto.")
else:
    content = content.replace(old, new, 1)
    print("OK: seccion Como funciona insertada.")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
