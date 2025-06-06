"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, X } from "lucide-react";
import { ImageUploader } from "@/components/admin/ImageUploader";

type Discount = Product["discount"];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { productId } = params as { productId: string };
  const { toast } = useToast();

  const [product, setProduct] = useState<Partial<Product>>({ promos: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        try {
          const docRef = doc(db, "products", productId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const productData = {
              id: docSnap.id,
              ...docSnap.data(),
            } as Product;
            setProduct(productData);
          } else {
            toast({
              title: "Error",
              description: "Producto no encontrado.",
              variant: "destructive",
            });
            router.push("/admin/products");
          }
        } catch (error) {
          console.error("Error fetching product:", error);
          toast({
            title: "Error",
            description: "No se pudo cargar el producto.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [productId, router, toast]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "number" && !name.startsWith("discount.")) {
      setProduct((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else if (name.startsWith("discount.")) {
      const field = name.split(".")[1] as keyof Discount;
      const numericValue = parseFloat(value) || 0;

      setProduct((prev) => ({
        ...prev,
        discount: {
          amount:
            name === "discount.amount"
              ? numericValue
              : prev?.discount?.amount || 0,
          percentage:
            name === "discount.percentage"
              ? numericValue
              : prev?.discount?.percentage || 0,
        },
      }));
    } else {
      setProduct((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    setProduct((prev) => ({ ...prev, active: checked }));
  };

  const handlePromoChange = (
    idx: number,
    field: "cantidad" | "descuento",
    value: number
  ) => {
    setProduct((prev) => {
      const promos = prev.promos ? [...prev.promos] : [];
      const precioUnitario = Number(prev.price) || 0;
      const cantidad =
        field === "cantidad" ? value : promos[idx]?.cantidad || 1;
      const descuento =
        field === "descuento" ? value : promos[idx]?.descuento || 0;
      const precioFinal = Math.round(
        precioUnitario * cantidad * (1 - descuento / 100)
      );
      promos[idx] = { cantidad, descuento, precioFinal };
      return { ...prev, promos };
    });
  };

  const agregarPromo = () => {
    setProduct((prev) => {
      const promos = prev.promos ? [...prev.promos] : [];
      promos.push({
        cantidad: 1,
        descuento: 0,
        precioFinal: Number(prev.price) || 0,
      });
      return { ...prev, promos };
    });
  };

  const eliminarPromo = (idx: number) => {
    setProduct((prev) => {
      const promos = prev.promos ? [...prev.promos] : [];
      promos.splice(idx, 1);
      return { ...prev, promos };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Validación de campos requeridos
    const requiredFields = {
      name: "Nombre",
      category: "Categoría",
      price: "Precio",
      stock: "Stock",
      description: "Descripción",
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([field]) => !product[field as keyof Product])
      .map(([_, label]) => label);

    if (missingFields.length > 0) {
      toast({
        title: "Error",
        description: `Por favor completa los siguientes campos: ${missingFields.join(
          ", "
        )}`,
        variant: "destructive",
      });
      setSaving(false);
      return;
    }

    // Validación de imágenes
    if (!product.images || product.images.length === 0) {
      toast({
        title: "Error",
        description: "El producto debe tener al menos una imagen",
        variant: "destructive",
      });
      setSaving(false);
      return;
    }

    try {
      const productRef = doc(db, "products", productId);
      const { id, ...productDataToSave } = product;

      await updateDoc(productRef, {
        ...productDataToSave,
        promos: product.promos || [],
        updatedAt: new Date().toISOString(),
      });

      toast({
        title: "Producto actualizado",
        description: "Los cambios se han guardado correctamente.",
      });
      router.push("/admin/products");
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleImagesChange = (urls: string[]) => {
    if (urls.length > 0) {
      setProduct((prev) => ({
        ...prev,
        images: Array.from(new Set([...urls])),
        srcUrl: prev.srcUrl || urls[0],
      }));
    }
  };

  const handleMainImageChange = (urls: string[]) => {
    if (urls.length > 0) {
      setProduct((prev) => ({
        ...prev,
        srcUrl: urls[0],
        images: Array.from(new Set([urls[0], ...(prev.images || [])])),
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const formatearPrecio = (valor: number) => {
    return new Intl.NumberFormat("es-AR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(valor);
  };

  if (!product?.id) {
    return null;
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold tracking-tight">Editar Producto</h2>

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-4">
          <Label htmlFor="name">Nombre</Label>
          <Input
            type="text"
            name="name"
            id="name"
            value={product.name || ""}
            onChange={handleChange}
            required
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="category">Categoría</Label>
          <Input
            type="text"
            name="category"
            id="category"
            value={product.category || ""}
            onChange={handleChange}
            required
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="subcategory">Subcategoría</Label>
          <Input
            type="text"
            name="subcategory"
            id="subcategory"
            value={product.subcategory || ""}
            onChange={handleChange}
          />
        </div>

        <div className="sm:col-span-6">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            name="description"
            rows={3}
            value={product.description || ""}
            onChange={handleChange}
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="price">Precio</Label>
          <Input
            type="number"
            name="price"
            id="price"
            value={product.price || 0}
            onChange={handleChange}
            required
            step="0.01"
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="discountPercentage">Descuento (%)</Label>
          <Input
            type="number"
            name="discount.percentage"
            id="discountPercentage"
            value={product.discount?.percentage || 0}
            onChange={handleChange}
            min="0"
            max="100"
            step="0.01"
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="stock">Stock</Label>
          <Input
            type="number"
            name="stock"
            id="stock"
            value={product.stock || 0}
            onChange={handleChange}
            required
            min="0"
          />
        </div>

        <div className="sm:col-span-6 flex items-center space-x-2">
          <Switch
            id="active"
            checked={product.active || false}
            onCheckedChange={handleSwitchChange}
          />
          <Label htmlFor="active">Producto Activo</Label>
        </div>

        {/* Imagen principal */}
        <div className="sm:col-span-6 mb-8 flex flex-col items-center">
          <Label className="mb-4 text-lg font-semibold">Imagen principal</Label>
          <div className="w-full max-w-xs">
            <ImageUploader
              onImagesChange={handleMainImageChange}
              maxImages={1}
              maxSizeMB={2}
              initialImages={product.srcUrl ? [product.srcUrl] : []}
              disabled={saving}
            />
            {product.srcUrl && (
              <div className="mt-4 relative">
                <img
                  src={product.srcUrl}
                  alt="Imagen principal"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() =>
                    setProduct((prev) => ({ ...prev, srcUrl: "" }))
                  }
                  className="absolute top-2 right-2 bg-white/80 hover:bg-red-500 hover:text-white text-red-500 rounded-full p-1 shadow transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Galería de imágenes */}
        <div className="sm:col-span-6">
          <Label className="block mb-2 text-lg font-semibold">
            Galería de imágenes
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
            {(product.images || [])
              .filter((img) => img !== product.srcUrl)
              .map((img, idx) => (
                <div key={idx} className="relative aspect-square">
                  <img
                    src={img}
                    alt={`Imagen ${idx + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const newImages = (product.images || []).filter(
                          (i) => i !== img
                        );
                        setProduct((prev) => ({
                          ...prev,
                          images: newImages,
                          srcUrl:
                            img === product.srcUrl
                              ? newImages[0] || ""
                              : prev.srcUrl,
                        }));
                      }}
                      className="bg-white/80 hover:bg-red-500 hover:text-white text-red-500 rounded-full p-1.5"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setProduct((prev) => ({ ...prev, srcUrl: img }))
                      }
                      className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                    >
                      Principal
                    </button>
                  </div>
                </div>
              ))}
          </div>
          <ImageUploader
            onImagesChange={handleImagesChange}
            maxImages={5}
            maxSizeMB={2}
            initialImages={(product.images || []).filter(
              (img) => img !== product.srcUrl
            )}
            disabled={saving}
          />
        </div>

        {/* featuredBrand */}
        <div className="sm:col-span-2 flex items-center space-x-2">
          <Switch
            id="featuredBrand"
            checked={product.featuredBrand || false}
            onCheckedChange={(checked) =>
              setProduct((prev) => ({ ...prev, featuredBrand: checked }))
            }
          />
          <Label htmlFor="featuredBrand">Marca Destacada</Label>
        </div>

        {/* freeShipping */}
        <div className="sm:col-span-2 flex items-center space-x-2">
          <Switch
            id="freeShipping"
            checked={product.freeShipping || false}
            onCheckedChange={(checked) =>
              setProduct((prev) => ({ ...prev, freeShipping: checked }))
            }
          />
          <Label htmlFor="freeShipping">Envío Gratis</Label>
        </div>

        {/* newArrival */}
        <div className="sm:col-span-2 flex items-center space-x-2">
          <Switch
            id="newArrival"
            checked={product.newArrival || false}
            onCheckedChange={(checked) =>
              setProduct((prev) => ({ ...prev, newArrival: checked }))
            }
          />
          <Label htmlFor="newArrival">Nuevo</Label>
        </div>

        {/* specialOffer */}
        <div className="sm:col-span-2 flex items-center space-x-2">
          <Switch
            id="specialOffer"
            checked={product.specialOffer || false}
            onCheckedChange={(checked) =>
              setProduct((prev) => ({ ...prev, specialOffer: checked }))
            }
          />
          <Label htmlFor="specialOffer">Oferta Especial</Label>
        </div>

        {/* rating */}
        <div className="sm:col-span-2">
          <Label htmlFor="rating">Rating</Label>
          <Input
            type="number"
            name="rating"
            id="rating"
            value={product.rating || 0}
            onChange={handleChange}
            min="0"
            max="5"
            step="0.1"
          />
        </div>

        {/* sales */}
        <div className="sm:col-span-2">
          <Label htmlFor="sales">Ventas</Label>
          <Input
            type="number"
            name="sales"
            id="sales"
            value={product.sales || 0}
            onChange={handleChange}
            min="0"
          />
        </div>
      </div>

      {/* Bloque de promociones, fuera del grid */}
      <div className="bg-gray-50 rounded-lg p-4 mt-8">
        <Label className="block mb-2 text-lg font-semibold">Promociones</Label>
        {(product.promos?.length ?? 0) === 0 && (
          <div className="text-sm text-muted-foreground mb-2">
            No hay promociones agregadas.
          </div>
        )}
        <div className="grid gap-4">
          {(product.promos || []).map((promo, idx) => {
            const precioUnitario = product.price || 0;
            const precioNormal = precioUnitario * promo.cantidad;
            const precioConDescuento =
              precioNormal - (precioNormal * promo.descuento) / 100;
            const gananciaTotal =
              precioConDescuento - precioUnitario * promo.cantidad;

            return (
              <div
                key={idx}
                className="flex items-end gap-3 bg-white rounded-md p-3 shadow-sm border"
              >
                <div>
                  <Label className="text-xs">Cantidad</Label>
                  <Input
                    type="number"
                    min={2}
                    max={100}
                    value={promo.cantidad}
                    onChange={(e) =>
                      handlePromoChange(idx, "cantidad", Number(e.target.value))
                    }
                    placeholder="Cantidad"
                    className="w-24"
                  />
                </div>
                <div>
                  <Label className="text-xs">% Desc.</Label>
                  <Input
                    type="number"
                    min={0.01}
                    max={100}
                    step={0.01}
                    value={promo.descuento}
                    onChange={(e) =>
                      handlePromoChange(
                        idx,
                        "descuento",
                        Number(e.target.value)
                      )
                    }
                    placeholder="% Desc."
                    className="w-24"
                  />
                </div>
                <div>
                  <Label className="text-xs">Precio Normal</Label>
                  <Input
                    type="text"
                    value={formatearPrecio(precioNormal)}
                    readOnly
                    className="w-32 bg-gray-100"
                    placeholder="Precio normal"
                  />
                </div>
                <div>
                  <Label className="text-xs">Precio con Descuento</Label>
                  <Input
                    type="text"
                    value={formatearPrecio(precioConDescuento)}
                    readOnly
                    className="w-32 bg-gray-100"
                    placeholder="Precio con descuento"
                  />
                </div>
                <div>
                  <Label className="text-xs">Descuento Total</Label>
                  <Input
                    type="text"
                    value={formatearPrecio(gananciaTotal)}
                    readOnly
                    className="w-32 bg-gray-100"
                    placeholder="Ganancia total"
                  />
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => eliminarPromo(idx)}
                  title="Eliminar"
                >
                  <svg
                    className="w-4 h-4 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </Button>
              </div>
            );
          })}
        </div>
        {(product.promos?.length ?? 0) < 4 && (
          <Button type="button" onClick={agregarPromo} className="mt-4">
            Agregar Promo
          </Button>
        )}
      </div>

      {/* Campos de solo lectura: createdAt y updatedAt */}
      <div className="flex flex-col gap-2 mt-4 text-xs text-muted-foreground">
        {product.createdAt && (
          <div>
            <span className="font-semibold">Creado:</span>{" "}
            {typeof product.createdAt === "string"
              ? new Date(product.createdAt).toLocaleString("es-AR")
              : ""}
          </div>
        )}
        {product.updatedAt && (
          <div>
            <span className="font-semibold">Actualizado:</span>{" "}
            {typeof product.updatedAt === "string"
              ? new Date(product.updatedAt).toLocaleString("es-AR")
              : ""}
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="pt-5 flex justify-end gap-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/products")}
          disabled={saving}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Guardar Cambios
        </Button>
      </div>
    </form>
  );
}
