interface WhatsAppMessageProps {
  phone: string;
  clientName: string;
  propertyName?: string;
  propertyPrice?: string;
}

export function generateWhatsAppLink({ phone, clientName, propertyName, propertyPrice }: WhatsAppMessageProps): string {
  // Limpiamos el teléfono de espacios, guiones o símbolos
  const cleanPhone = phone.replace(/\D/g, "");

  // Mensaje personalizado para el sector inmobiliario
  let message = `Hola ${clientName}, un gusto saludarte. `;
  
  if (propertyName) {
    message += `Te escribo de Homvi porque tenemos novedades sobre la propiedad *${propertyName}*`;
    if (propertyPrice) {
      message += ` (${propertyPrice})`;
    }
    message += `. ¿Te vendría bien una breve llamada hoy?`;
  } else {
    message += `Te escribo de Homvi para darle seguimiento a tu solicitud. ¿Cómo vas de tiempo hoy?`;
  }

  // Codificamos el texto para que sea válido en una URL de WhatsApp
  const encodedMessage = encodeURIComponent(message);

  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}