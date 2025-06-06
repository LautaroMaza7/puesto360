import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import sgMail from '@sendgrid/mail';

// Configurar SendGrid con la API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

interface OrderDetails {
  orderId: string;
  customerName: string;
  customerEmail: string;
  products: {
    name: string;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  orderDate: Date;
}

export const sendOrderConfirmationEmail = async (orderDetails: OrderDetails) => {
  try {
    // Guardar el email en Firestore para respaldo y seguimiento
    const emailsCollection = collection(db, "emails");
    await addDoc(emailsCollection, {
      type: "order_confirmation",
      status: "pending",
      orderDetails,
      createdAt: new Date(),
    });

    // Generar el contenido del email
    const { subject, html } = generateOrderConfirmationEmail(orderDetails);

    // Enviar el email usando SendGrid
    const msg = {
      to: orderDetails.customerEmail,
      from: process.env.SENDGRID_FROM_EMAIL || 'your@email.com', // Reemplazar con tu email verificado en SendGrid
      subject,
      html,
    };

    await sgMail.send(msg);

    // Actualizar el estado del email en Firestore
    await addDoc(emailsCollection, {
      type: "order_confirmation",
      status: "sent",
      orderDetails,
      sentAt: new Date(),
    });

    return true;
  } catch (error) {
    console.error("Error al enviar el email de confirmación:", error);
    
    // Guardar el error en Firestore para seguimiento
    const emailsCollection = collection(db, "emails");
    await addDoc(emailsCollection, {
      type: "order_confirmation",
      status: "error",
      orderDetails,
      error: error instanceof Error ? error.message : "Unknown error",
      createdAt: new Date(),
    });

    throw error;
  }
};

export const generateOrderConfirmationEmail = (orderDetails: OrderDetails) => {
  const {
    orderId,
    customerName,
    products,
    subtotal,
    tax,
    shipping,
    total,
    shippingAddress,
    paymentMethod,
    orderDate,
  } = orderDetails;

  return {
    subject: `Confirmación de Pedido #${orderId}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmación de Pedido</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              padding: 20px 0;
              background-color: #f8f9fa;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .order-details {
              background-color: #fff;
              border: 1px solid #ddd;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 20px;
            }
            .product-list {
              margin: 20px 0;
            }
            .product-item {
              padding: 10px 0;
              border-bottom: 1px solid #eee;
            }
            .product-item:last-child {
              border-bottom: none;
            }
            .total {
              margin-top: 20px;
              text-align: right;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              padding: 20px;
              background-color: #f8f9fa;
              border-radius: 8px;
              font-size: 12px;
              color: #666;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #4F46E5;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
            }
            @media only screen and (max-width: 600px) {
              body {
                padding: 10px;
              }
              .header, .order-details, .footer {
                padding: 15px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>¡Gracias por tu compra, ${customerName}!</h1>
            <p>Tu pedido ha sido confirmado</p>
          </div>
          
          <div class="order-details">
            <h2>Detalles del Pedido #${orderId}</h2>
            <p>Fecha: ${orderDate.toLocaleDateString()}</p>
            
            <div class="product-list">
              ${products
                .map(
                  (product) => `
                <div class="product-item">
                  <p><strong>${product.name}</strong> x ${product.quantity}</p>
                  <p>$${(product.price * product.quantity).toFixed(2)}</p>
                </div>
              `
                )
                .join("")}
            </div>
            
            <div class="total">
              <p>Subtotal: $${subtotal.toFixed(2)}</p>
              <p>Impuestos: $${tax.toFixed(2)}</p>
              <p>Envío: $${shipping.toFixed(2)}</p>
              <p style="font-size: 1.2em;">Total: $${total.toFixed(2)}</p>
            </div>
            
            <h3>Dirección de Envío</h3>
            <p>
              ${shippingAddress.street}<br>
              ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}<br>
              ${shippingAddress.country}
            </p>
            
            <h3>Método de Pago</h3>
            <p>${paymentMethod}</p>

            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/orders/${orderId}" class="button">
                Ver detalles del pedido
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos.</p>
            <p>© ${new Date().getFullYear()} Tu Tienda. Todos los derechos reservados.</p>
            <p>
              <small>
                Este email fue enviado a ${orderDetails.customerEmail}.<br>
                Por favor no respondas a este email, es un envío automático.
              </small>
            </p>
          </div>
        </body>
      </html>
    `,
  };
}; 