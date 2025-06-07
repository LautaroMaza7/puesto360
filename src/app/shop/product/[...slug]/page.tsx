import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import ProductListSec from "@/components/common/ProductListSec";
import BreadcrumbProduct from "@/components/product-page/BreadcrumbProduct";
import Header from "@/components/product-page/Header";
import Tabs from "@/components/product-page/Tabs";
import { Product } from '@/types/product';
import { notFound } from "next/navigation";
import ProductSkeleton from '@/components/shop-page/product/ProductSkeleton';
import { Suspense } from 'react';

export default async function ProductPage({
  params,
}: {
  params: { slug: string[] };
}) {
  const [id, slug] = params.slug;

  const productsSnapshot = await getDocs(collection(db, "products"));
  const products: Product[] = productsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[];

  console.log('Productos cargados desde Firestore:', products.map(p => ({
    id: p.id,
    name: p.name,
    images: p.images,
    srcUrl: p.srcUrl
  })));

  const product = products.find((product) => product.id === id);

  if (!product) {
    return <div>Producto no encontrado</div>;
  }

  const relatedProducts = products
    .filter(p => 
      p.id !== product.id && 
      (p.category === product.category || p.subcategory === product.subcategory)
    )
    .slice(0, 4);

  return (
    <Suspense fallback={<ProductSkeleton />}>
      <main>
        <div className="max-w-frame mx-auto px-4 xl:px-0">
          <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
          <BreadcrumbProduct name={product.name ?? "product"} />
          <section className="mb-11">
            <Header data={product} />
          </section>
          <Tabs product={product} />
        </div>
        <div className="mb-[50px] sm:mb-20">
          <ProductListSec
            title="También te puede gustar"
            products={relatedProducts}
            viewAllLink="/shop"
          />
        </div>
      </main>
    </Suspense>
  );
}