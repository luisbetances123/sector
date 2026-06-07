'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

// Inicialización del cliente Supabase del lado del servidor usando tus variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipado estricto original para asegurar la consistencia de los datos en tu CRM
export interface ClienteData {
  id: string;
  nombre: string;
  perfil: 'INVERSIONISTA' | 'COMPRADOR' | 'VENDEDOR';
  temperatura: 'CALIENTE' | 'TIBIO' | 'FRIO';
  objetivo: string;
  estructuraFinanciera: string;
  zonaInteres: string;
  confotur: boolean;
  email: string;
  telefono: string;
  presupuesto?: number;
}

// 1. OBTENER CLIENTES PARA EL DIRECTORIO REAL (CONECTADO A SUPABASE)
export async function getPremiumClients() {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((c: any) => {
      // Mapear el tipo de propiedad de tu array text[] o string
      const propertyType = Array.isArray(c.tipo_propiedad) && c.tipo_propiedad[0] 
        ? c.tipo_propiedad[0] 
        : (c.tipo_propiedad || 'Inmueble');

      return {
        id: c.id,
        name: c.nombre || 'Sin Nombre',
        email: c.email || 'sin-email@homvi.com',
        phone: c.telefono || 'Sin Teléfono',
        objetivo: propertyType ? `Interés: ${propertyType}` : 'Inversión Inmobiliaria',
        estructura: c.financiamiento || 'Fondos Propios',
        zonaInteres: Array.isArray(c.zonas_interes) && c.zonas_interes.length > 0 
          ? c.zonas_interes.join(', ') 
          : (c.zonas || 'RD'),
        incentivoFiscal: c.notas?.includes('CONFOTUR') ? 'CONFOTUR' : 'No Aplica',
        perfil: Array.isArray(c.tags) && c.tags.length > 0 ? c.tags[0].toUpperCase() : 'COMPRADOR',
        temperatura: c.etapa === 'PROSPECTOS' || c.etapa === 'SIN RESPONDER' ? 'TIBIO' : 'CALIENTE'
      };
    });
  } catch (err) {
    console.error('Error fetching clients in getPremiumClients:', err);
    return [];
  }
}

// 2. OBTENER NEGOCIACIONES CLASIFICADAS PARA EL KANBAN (CONECTADO A SUPABASE)
export async function getPipelineDeals() {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const stages = {
      prospectos: { title: '● PROSPECTOS', total: 0, deals: [] as any[] },
      calificados: { title: '● CALIFICADOS', total: 0, deals: [] as any[] },
      'en-propuesta': { title: '● EN PROPUESTA', total: 0, deals: [] as any[] },
      cierre: { title: '● CIERRE 🎉', total: 0, deals: [] as any[] },
    };

    data.forEach((c: any) => {
      const rawValue = parseInt(c.presupuesto_max) || 0;
      const formattedValue = rawValue > 0 
        ? `US$${rawValue.toLocaleString('en-US')}` 
        : 'Por Definir';

      let mainZone = 'RD';
      if (Array.isArray(c.zonas_interes) && c.zonas_interes[0]) mainZone = c.zonas_interes[0];
      else if (c.zonas) mainZone = c.zonas;

      const propertyType = Array.isArray(c.tipo_propiedad) && c.tipo_propiedad[0] 
        ? c.tipo_propiedad[0] 
        : (c.tipo_propiedad || 'Inmueble');

      const deal = {
        id: c.id,
        client: c.nombre || 'Cliente Anónimo',
        tag: mainZone.toUpperCase(),
        status: (c.etapa || 'PROSPECTO').toUpperCase(),
        statusType: getStatusType(c.etapa),
        property: `Interés: ${propertyType}`,
        type: `🏢 ${propertyType}`,
        value: formattedValue,
        time: c.created_at ? calcularTiempo(c.created_at) : 'Reciente',
      };

      const etapaClean = (c.etapa || '').toLowerCase();
      if (etapaClean.includes('cierre') || etapaClean.includes('contrato')) {
        stages.cierre.deals.push(deal);
        stages.cierre.total += rawValue;
      } else if (etapaClean.includes('propuesta') || etapaClean.includes('negociacion')) {
        stages['en-propuesta'].deals.push(deal);
        stages['en-propuesta'].total += rawValue;
      } else if (etapaClean.includes('calificado') || etapaClean.includes('buscando')) {
        stages.calificados.deals.push(deal);
        stages.calificados.total += rawValue;
      } else {
        stages.prospectos.deals.push(deal);
        stages.prospectos.total += rawValue;
      }
    });

    return [
      { id: 'prospectos', title: stages.prospectos.title, count: `${stages.prospectos.deals.length} casos`, totalValue: `US$${stages.prospectos.total.toLocaleString()}`, deals: stages.prospectos.deals },
      { id: 'calificados', title: stages.calificados.title, count: `${stages.calificados.deals.length} casos`, totalValue: `US$${stages.calificados.total.toLocaleString()}`, deals: stages.calificados.deals },
      { id: 'en-propuesta', title: stages['en-propuesta'].title, count: `${stages['en-propuesta'].deals.length} casos`, totalValue: `US$${stages['en-propuesta'].total.toLocaleString()}`, deals: stages['en-propuesta'].deals },
      { id: 'cierre', title: stages.cierre.title, count: `${stages.cierre.deals.length} casos`, totalValue: `US$${stages.cierre.total.toLocaleString()}`, deals: stages.cierre.deals },
    ];
  } catch (err) {
    console.error('Error fetching pipeline in getPipelineDeals:', err);
    return [];
  }
}

// 3. ACCIÓN ORIGINAL REPOTENCIADA PARA ACTUALIZAR REALMENTE EN SUPABASE
export async function actualizarClienteAction(datos: ClienteData) {
  try {
    console.log("💾 Guardando cambios en la BD real para el cliente:", datos.id);

    // Mapear el objeto de la interfaz a los nombres exactos de tus columnas de Supabase
    const { error } = await supabase
      .from('clientes')
      .update({
        nombre: datos.nombre,
        email: datos.email,
        telefono: datos.telefono,
        presupuesto_max: datos.presupuesto,
        // Agrega aquí más mapeos si tu formulario de edición los requiere en el futuro
      })
      .eq('id', datos.id);

    if (error) throw error;

    // Forzar a Next.js a refrescar la caché del Pipeline y el Directorio al instante
    revalidatePath('/dashboard/clients');
    revalidatePath('/dashboard/pipeline');

    return { success: true, message: 'Cliente actualizado correctamente en Supabase.' };
  } catch (error) {
    console.error("Error al actualizar el cliente en Supabase:", error);
    return { success: false, message: 'Error interno del servidor al impactar la BD.' };
  }
}

// Helpers internos estables para la UI
function getStatusType(etapa: string): string {
  const e = (etapa || '').toLowerCase();
  if (e.includes('sin responder')) return 'danger';
  if (e.includes('nuevo')) return 'info';
  if (e.includes('buscando') || e.includes('calificado')) return 'success';
  if (e.includes('propuesta')) return 'warning';
  return 'premium';
}

function calcularTiempo(dateString: string): string {
  const pasos = Date.parse(dateString);
  if (isNaN(pasos)) return 'Reciente';
  const hrs = Math.floor((Date.now() - pasos) / 3600000);
  if (hrs < 1) return 'Hace momentos';
  if (hrs < 24) return `Hace ${hrs}h`;
  return `Hace ${Math.floor(hrs / 24)}d`;
}