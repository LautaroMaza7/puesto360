import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, updateDoc, setDoc } from "firebase/firestore";

const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN!;

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const { type, data: notificationData } = data;
    if (!type || !notificationData?.id) {
      return NextResponse.json(
        { error: "Notificación inválida" },
        { status: 400 }
      );
    }

    if (type !== "payment") {
      return NextResponse.json(
        { message: "Tipo de notificación no manejado" },
        { status: 200 }
      );
    }

    const paymentId = notificationData.id;
    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Error al obtener datos del pago de Mercado Pago");
    }

    const paymentData = await response.json();

    const orderId = paymentData.metadata?.orderId;

    if (!orderId) {
      return NextResponse.json(
        { error: "ID de pedido no encontrado en metadata" },
        { status: 400 }
      );
    }

    let orderStatus = "pending";
    if (paymentData.status === "approved") {
      orderStatus = "success";
    } else if (paymentData.status === "rejected") {
      orderStatus = "failed";
    }

    // Actualizar el estado del pedido
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
      status: orderStatus,
      paymentId: paymentData.id,
      paymentStatus: paymentData.status,
      updatedAt: new Date(),
    });

    // Registrar la transacción
    const transactionRef = doc(db, "transactions", paymentData.id.toString());
    await setDoc(transactionRef, {
      orderId,
      status: orderStatus,
      paymentData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error en webhook Mercado Pago:", error);
    return NextResponse.json(
      { error: "Error procesando la notificación" },
      { status: 500 }
    );
  }
}
