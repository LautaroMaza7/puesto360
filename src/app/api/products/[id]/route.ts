import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    const productRef = doc(db, 'products', productId);
    const productDoc = await getDoc(productRef);

    if (!productDoc.exists()) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = {
      id: productDoc.id,
      ...productDoc.data()
    };

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
} 