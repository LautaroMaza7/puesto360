import { NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Removemos la configuración de Edge Runtime ya que Firestore no es compatible
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Store {
  nombre: string;
  direccion: string;
  lat: number;
  lng: number;
  radio: number;
}

interface StoreWithDistance extends Store {
  distance: number;
  isInRadius: boolean;
}

// Función para calcular la distancia entre dos puntos en kilómetros
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radio de la Tierra en kilómetros
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRad(value: number): number {
  return value * Math.PI / 180;
}

// Configuración de CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '');
    const lng = parseFloat(searchParams.get('lng') || '');

    console.log('Recibida solicitud con coordenadas:', { lat, lng });

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: 'Coordenadas inválidas' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Obtener el documento general de settings
    const settingsDoc = doc(db, "settings", "general");
    const settingsSnapshot = await getDoc(settingsDoc);
    
    if (!settingsSnapshot.exists()) {
      console.log('No se encontró el documento de configuración');
      return NextResponse.json(
        { error: 'No hay configuración de tiendas' },
        { status: 404, headers: corsHeaders }
      );
    }

    const data = settingsSnapshot.data();
    const locations = data.locations as Store[];

    if (!locations || locations.length === 0) {
      console.log('No se encontraron ubicaciones de tiendas');
      return NextResponse.json(
        { error: 'No hay tiendas registradas' },
        { status: 404, headers: corsHeaders }
      );
    }

    console.log('Tiendas encontradas:', locations.length);

    let nearestStore: StoreWithDistance | null = null;
    let shortestDistance = Infinity;

    for (const store of locations) {
      if (!store.lat || !store.lng || !store.radio) {
        console.warn('Tienda con datos incompletos:', store);
        continue;
      }

      const distance = calculateDistance(lat, lng, store.lat, store.lng);
      const isInRadius = distance <= (store.radio / 1000); // Convertir metros a kilómetros

      console.log('Calculando distancia para tienda:', {
        nombre: store.nombre,
        distance,
        isInRadius,
        radio: store.radio / 1000
      });

      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestStore = {
          ...store,
          distance,
          isInRadius
        };
      }
    }

    if (!nearestStore) {
      return NextResponse.json(
        { error: 'No se pudo determinar la tienda más cercana' },
        { status: 500, headers: corsHeaders }
      );
    }

    const responseData = {
      isInRadius: nearestStore.isInRadius,
      distance: Math.round(nearestStore.distance * 100) / 100, // Redondear a 2 decimales
      maxRadius: nearestStore.radio / 1000, // Convertir metros a kilómetros
      nearestStore: {
        nombre: nearestStore.nombre,
        direccion: nearestStore.direccion,
        lat: nearestStore.lat,
        lng: nearestStore.lng,
        radio: nearestStore.radio
      }
    };

    console.log('Enviando respuesta:', responseData);

    return NextResponse.json(responseData, {
      status: 200,
      headers: corsHeaders
    });

  } catch (error) {
    console.error('Error en la API:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500, headers: corsHeaders }
    );
  }
} 