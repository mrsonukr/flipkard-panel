interface ImportedProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  mrp: number;
  salePrice: number;
  images: string[];
  averageRating: number;
  totalReviews: number;
  stockStatus: string;
  variants: Array<{ type: string; name: string }> | null;
  delivery: number;
}

interface AppProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  basePrice: number;
  discountPercentage: number;
  images: string[];
  averageRating: number;
  totalReviews: number;
  stockStatus: string;
  variants: Array<{ type: string; name: string }> | null;
  delivery: number;
}

export const transformImportedData = (importedProducts: ImportedProduct[]): AppProduct[] => {
  return importedProducts.map(product => {
    // Calculate discount percentage from MRP and sale price
    const discountPercentage = Math.round(((product.mrp - product.salePrice) / product.mrp) * 100);
    
    return {
      id: product.id,
      name: product.name,
      brand: product.brand.trim(), // Remove any extra spaces
      category: product.category,
      basePrice: product.salePrice, // Use sale price as base price
      discountPercentage: discountPercentage,
      images: product.images, // Keep original image URLs
      averageRating: product.averageRating,
      totalReviews: product.totalReviews,
      stockStatus: product.stockStatus,
      variants: product.variants,
      delivery: product.delivery,
      originalMrp: product.mrp // Store original MRP for export
    };
  });
};