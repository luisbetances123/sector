import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  const titulo = searchParams.get('titulo') || 'Propiedad'
  const precio = searchParams.get('precio') || '0'
  const sector = searchParams.get('sector') || ''
  const recamaras = searchParams.get('recamaras') || '0'
  const banos = searchParams.get('banos') || '0'
  const area = searchParams.get('area') || '0'
  const notas = searchParams.get('notas') || ''
  const imagen = searchParams.get('imagen') || ''

  const precioFormateado = Number(precio) ? 'US$ ' + Number(precio).toLocaleString('en-US') : precio

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; background: #fff; color: #111; }
  .page { width: 794px; min-height: 1123px; padding: 48px; }
  .header { border-bottom: 3px solid #CCFF00; padding-bottom: 24px; margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-end; }
  .logo { font-size: 28px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; }
  .logo span { color: #CCFF00; }
  .sector-tag { font-size: 10px; font-family: monospace; background: #f0f0f0; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; }
  .titulo { font-size: 32px; font-weight: 900; letter-spacing: -1px; line-height: 1.1; margin-bottom: 8px; }
  .precio { font-size: 28px; font-weight: 900; color: #111; margin-bottom: 32px; }
  .imagen { width: 100%; height: 320px; object-fit: cover; border-radius: 12px; margin-bottom: 32px; background: #f0f0f0; }
  .specs { display: flex; gap: 0; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; margin-bottom: 32px; }
  .spec { flex: 1; padding: 20px; text-align: center; border-right: 1px solid #e0e0e0; }
  .spec:last-child { border-right: none; }
  .spec-value { font-size: 28px; font-weight: 900; font-family: monospace; }
  .spec-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-top: 4px; }
  .section-title { font-size: 10px; font-family: monospace; text-transform: uppercase; letter-spacing: 2px; color: #888; margin-bottom: 12px; }
  .notas { background: #f9f9f9; border-radius: 12px; padding: 20px; font-size: 13px; line-height: 1.6; color: #444; }
  .footer { margin-top: 48px; border-top: 1px solid #e0e0e0; padding-top: 20px; display: flex; justify-content: space-between; align-items: center; }
  .footer-text { font-size: 10px; color: #aaa; font-family: monospace; text-transform: uppercase; letter-spacing: 1px; }
  .footer-dot { width: 8px; height: 8px; background: #CCFF00; border-radius: 50%; display: inline-block; margin-right: 6px; }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="logo">SEC<span>TOR</span></div>
    <div class="sector-tag">${sector}</div>
  </div>
  <div class="titulo">${titulo}</div>
  <div class="precio">${precioFormateado}</div>
  ${imagen ? `<img class="imagen" src="${imagen}" alt="${titulo}" />` : '<div class="imagen"></div>'}
  <div class="specs">
    <div class="spec">
      <div class="spec-value">${recamaras}</div>
      <div class="spec-label">Recamaras</div>
    </div>
    <div class="spec">
      <div class="spec-value">${banos}</div>
      <div class="spec-label">Banos</div>
    </div>
    <div class="spec">
      <div class="spec-value">${area}</div>
      <div class="spec-label">m2</div>
    </div>
  </div>
  ${notas ? `<div class="section-title">Descripcion y Detalles</div><div class="notas">${notas}</div>` : ''}
  <div class="footer">
    <div class="footer-text"><span class="footer-dot"></span>sector.do — CRM Inmobiliario para Realtors en RD</div>
    <div class="footer-text">Ficha generada por SECTOR</div>
  </div>
</div>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    }
  })
}
