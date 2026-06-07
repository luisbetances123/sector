'use server';

import { revalidatePath } from 'next/cache';

// Tipado estricto para asegurar la consistencia de los datos en tu CRM
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

export async function actualizarClienteAction(datos: ClienteData) {
  try {
    // 1. Aquí va tu lógica de conexión a la Base de Datos (Prisma, Supabase, Mongoose, etc.)
    // Ejemplo con un ORM ficticio: 
    // await db.cliente.update({ where: { id: datos.id }, data: datos });
    
    console.log("💾 Guardando cambios en la BD para el cliente:", datos.id, datos);

    // 2. Forzar a Next.js a refrescar la caché del Pipeline y el Directorio al instante
    revalidatePath('/dashboard/clients');
    revalidatePath('/dashboard/pipeline');

    return { success: true, message: 'Cliente actualizado correctamente.' };
  } catch (error) {
    console.error("Error al actualizar el cliente:", error);
    return { success: false, message: 'Error interno del servidor.' };
  }
}