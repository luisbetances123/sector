path = "app/page.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

cambios_ok = 0
cambios_error = 0

# --- MODULO B: insertar justo antes del kanban ---
old_b = '<div className="kanban">'
new_b = '''<div className="mod-intro">
              <p className="mod-sub">El motor financiero y el flujo de tus contratos. Desde el primer depósito de separación hasta el cierre definitivo, con visibilidad total de tu caja.</p>
              <div className="mod-points">
                <div className="mod-point"><span className="mod-point-title">Pipeline de Ventas Transparente</span><p>Visualiza en qué etapa está cada negocio (Separación, Contrato, Financiamiento, Entrega). Identifica cuellos de botella antes de que afecten el flujo.</p></div>
                <div className="mod-point"><span className="mod-point-title">Gestión de Clientes y Perfiles</span><p>Historial centralizado de cada comprador. Documentos, contratos firmados, estados de cuenta y comunicaciones en un solo expediente digital protegido.</p></div>
                <div className="mod-point"><span className="mod-point-title">Control de Finanzas</span><p>Rastrea pagos, abonos a iniciales y cubicaciones. El sistema te alerta automáticamente si una reserva venció sin recibir el depósito para liberar la unidad de inmediato.</p></div>
              </div>
            </div>
            <div className="kanban">'''

if old_b in content:
    content = content.replace(old_b, new_b, 1)
    cambios_ok += 1
    print("OK B: contenido del Modulo B insertado.")
else:
    cambios_error += 1
    print("ERROR B: no encontre el ancla de kanban.")

# --- MODULO C: insertar justo antes del log-list ---
old_c = '<div className="log-list">'
new_c = '''<div className="mod-intro">
              <p className="mod-sub">Tu fuerza de ventas externa, bajo tu control. Conecta con las agencias inmobiliarias del país y gestiona la comunicación sin depender de chats infinitos.</p>
              <div className="mod-points">
                <div className="mod-point"><span className="mod-point-title">Portal de Brokers</span><p>Dale a las agencias externas acceso a enlaces interactivos de disponibilidad. Ven lo que está libre en tiempo real para vender más rápido, pero jamás modifican tus datos.</p></div>
                <div className="mod-point"><span className="mod-point-title">Inbox Centralizado</span><p>Consolida los mensajes de prospectos y brokers en un solo lugar. Responde dudas, confirma disponibilidad y recibe comprobantes de pago sin perder el rastro en WhatsApp.</p></div>
                <div className="mod-point"><span className="mod-point-title">Control de Usuarios y Mi Empresa</span><p>Administra los permisos de tu equipo interno y las agencias aliadas. Define quién puede ver reportes financieros, quién aprueba descuentos y quién solo consulta el inventario.</p></div>
              </div>
            </div>
            <div className="log-list">'''

if old_c in content:
    content = content.replace(old_c, new_c, 1)
    cambios_ok += 1
    print("OK C: contenido del Modulo C insertado.")
else:
    cambios_error += 1
    print("ERROR C: no encontre el ancla de log-list.")

# --- SECCION DE CIERRE: justo antes del FAQ ---
old_cierre = '{/* 03 — FAQ */}'
new_cierre = '''{/* REPORTES AUTOMATICOS */}
        <section className="sec">
          <div className="sec-eyebrow">Inteligencia de negocio</div>
          <h2 className="sec-title">Reportes automáticos para la toma de decisiones</h2>
          <p className="sec-desc">Deja de armar tablas dinámicas los domingos por la noche. SECTOR genera analíticas en tiempo real sobre la velocidad de venta de tus proyectos, el desempeño de tus brokers y la salud financiera de tu constructora, listas para presentar a tus socios o al banco.</p>
        </section>

        {/* 03 — FAQ */}'''

if old_cierre in content:
    content = content.replace(old_cierre, new_cierre, 1)
    cambios_ok += 1
    print("OK CIERRE: seccion de reportes insertada antes del FAQ.")
else:
    cambios_error += 1
    print("ERROR CIERRE: no encontre el comentario del FAQ.")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print(f"Resumen total: {cambios_ok} ok, {cambios_error} error.")
