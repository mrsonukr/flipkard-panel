import React from 'react';
import { Trash2, Star, Truck, Edit } from 'lucide-react';

interface Product {
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

interface ProductListProps {
  products: Product[];
  onProductDelete: (id: string) => void;
  onProductEdit: (product: Product) => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  onProductDelete,
  onProductEdit
}) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No products added yet. Create your first product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">
        Products ({products.length})
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="aspect-square bg-gray-100 relative">
              {product.images[0] && (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              )}
              <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                {product.discountPercentage}% OFF
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-800 line-clamp-2 flex-1">
                  {product.name}
                </h3>
                <div className="flex gap-1 ml-2">
                  <button
                    onClick={() => onProductEdit(product)}
                    className="text-blue-500 hover:text-blue-600 p-1"
                    title="Edit product"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onProductDelete(product.id)}
                    className="text-red-500 hover:text-red-600 p-1"
                    title="Delete product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
              
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm text-gray-600">
                    {product.averageRating} ({product.totalReviews.toLocaleString()})
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-800">
                    ₹{product.basePrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Truck className="w-4 h-4" />
                  {product.delivery} days
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {product.stockStatus}
                </span>
                <span className="text-xs text-gray-500 capitalize">
                  {product.category}
                </span>
              </div>

              {product.variants && product.variants.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <div className="flex flex-wrap gap-1">
                    {product.variants.map((variant, index) => (
                      <span
                        key={index}
                        className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
                      >
                        {variant.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};