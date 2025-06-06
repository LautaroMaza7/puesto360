import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

// Configurar Mercado Pago con tu token de acceso
const mp = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || "APP_USR-7637273252463645-072012-9442d2efd386ae22521455b3c05aedaf-179005719",
});

// Obtener la URL base del entorno
const getBaseUrl = () => {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  return "http://localhost:3000";
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, orderId, payer } = body;

    // Validar datos requeridos
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No hay productos en el carrito" },
        { status: 400 }
      );
    }

    if (!orderId) {
      return NextResponse.json(
        { error: "ID de pedido no proporcionado" },
        { status: 400 }
      );
    }

    const baseUrl = getBaseUrl();

    // Crear los items para Mercado Pago
    const preferenceItems = items.map((item: any) => ({
      title: item.title,
      unit_price: Number(item.unit_price),
      quantity: Number(item.quantity),
      currency_id: process.env.MERCADOPAGO_CURRENCY || "ARS",
    }));

    // Crear la preferencia de pago
    const preference = await new Preference(mp).create({
      body: {
        items: preferenceItems,
        payer: {
          email: payer.email,
          name: payer.name,
        },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success`,
          failure: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/failure`,
          pending: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/pending`,
        },
        notification_url: `${baseUrl}/api/mercadopago/webhook`,
        metadata: {
          orderId: orderId,
          customerEmail: payer.email,
        },
        statement_descriptor: process.env.MERCADOPAGO_STATEMENT_DESCRIPTOR || "TU TIENDA",
        external_reference: orderId,
      },
    });

    // Verificar que la respuesta contenga un ID y init_point
    if (!preference || !preference.id || !preference.init_point) {
      console.error("Error: Respuesta de Mercado Pago incompleta", preference);
      return NextResponse.json(
        { error: "Error al crear la preferencia de pago" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      id: preference.id,
      init_point: preference.init_point 
    });
  } catch (error) {
    console.error("Error creando preferencia de pago:", error);
    
    // Devolver un mensaje de error más detallado en desarrollo
    const errorMessage = process.env.NODE_ENV === "development" 
      ? `Error al crear la preferencia de pago: ${error instanceof Error ? error.message : String(error)}`
      : "Error al crear la preferencia de pago";
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
