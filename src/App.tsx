import React, { useState, useEffect, useRef } from 'react';
import { Download, Package, Plus, Upload, Database } from 'lucide-react';
import { CategorySelector } from './components/CategorySelector';
import { ProductForm } from './components/ProductForm';
import { ProductList } from './components/ProductList';
import { transformImportedData } from './utils/dataTransformer';

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
  originalMrp?: number; // Store original MRP for imported products
}

const STORAGE_KEY = 'product-management-data';

function App() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data from localStorage on component mount
  useEffect(() => {
    console.log('Loading data from localStorage...');
    const savedData = localStorage.getItem(STORAGE_KEY);
    console.log('Saved data:', savedData);
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        console.log('Parsed data:', parsedData);
        
        if (parsedData.products && Array.isArray(parsedData.products)) {
          setProducts(parsedData.products);
          console.log('Products loaded:', parsedData.products.length);
        }
        if (parsedData.selectedCategory) {
          setSelectedCategory(parsedData.selectedCategory);
          console.log('Category loaded:', parsedData.selectedCategory);
        }
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save data to localStorage whenever products change (but not on initial load)
  useEffect(() => {
    if (isLoaded) {
      const dataToSave = {
        products,
        selectedCategory
      };
      console.log('Saving to localStorage:', dataToSave);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    }
  }, [products, selectedCategory, isLoaded]);

  const handleProductSave = (product: Product) => {
    if (editingProduct) {
      // Update existing product
      setProducts(prev => {
        const updated = prev.map(p => p.id === product.id ? product : p);
        console.log('Updated products:', updated);
        return updated;
      });
      setEditingProduct(null);
    } else {
      // Add new product
      setProducts(prev => {
        const newProducts = [...prev, product];
        console.log('Added new product, total:', newProducts.length);
        return newProducts;
      });
    }
    setShowForm(false);
  };

  const handleProductDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(prev => {
        const filtered = prev.filter(p => p.id !== id);
        console.log('Deleted product, remaining:', filtered.length);
        return filtered;
      });
    }
  };

  const handleProductEdit = (product: Product) => {
    setEditingProduct(product);
    setSelectedCategory(product.category);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleExport = () => {
    const filteredProducts = products.filter(p => p.category === selectedCategory);
    // Transform products to export format
    const exportProducts = filteredProducts.map(product => ({
      id: product.id,
      name: product.name,
      brand: product.brand,
      category: product.category,
      mrp: product.originalMrp || Math.round(product.basePrice * (100 + product.discountPercentage) / 100),
      salePrice: product.basePrice,
      images: product.images,
      averageRating: product.averageRating,
      totalReviews: product.totalReviews,
      stockStatus: product.stockStatus,
      variants: product.variants,
      delivery: product.delivery
    }));
    const data = { products: exportProducts };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedCategory}-products.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportAll = () => {
    // Transform products to export format
    const exportProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      brand: product.brand,
      category: product.category,
      mrp: product.originalMrp || Math.round(product.basePrice * (100 + product.discountPercentage) / 100),
      salePrice: product.basePrice,
      images: product.images,
      averageRating: product.averageRating,
      totalReviews: product.totalReviews,
      stockStatus: product.stockStatus,
      variants: product.variants,
      delivery: product.delivery
    }));
    const data = { products: exportProducts };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'all-products.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target?.result as string);
          if (jsonData.products && Array.isArray(jsonData.products)) {
            // Transform imported data to match our schema
            const transformedProducts = transformImportedData(jsonData.products);
            
            // Merge transformed products with existing ones, avoiding duplicates by ID
            setProducts(prev => {
              const existingIds = new Set(prev.map(p => p.id));
              const newProducts = transformedProducts.filter((p: Product) => !existingIds.has(p.id));
              const merged = [...prev, ...newProducts];
              console.log('Imported and transformed products, total now:', merged.length);
              return merged;
            });
            alert(`Successfully imported and transformed ${jsonData.products.length} products!`);
          } else {
            alert('Invalid JSON format. Please ensure the file contains a "products" array.');
          }
        } catch (error) {
          alert('Error reading JSON file. Please check the file format.');
        }
      };
      reader.readAsText(file);
    } else {
      alert('Please select a valid JSON file.');
    }
    // Reset file input
    event.target.value = '';
  };

  const handleCategorySelect = (category: string) => {
    console.log('Category selected:', category);
    setSelectedCategory(category);
    setShowForm(false);
    setEditingProduct(null);
  };

  // Get category counts for display
  const getCategoryCounts = () => {
    const counts = {
      mobile: products.filter(p => p.category === 'mobile').length,
      cloth: products.filter(p => p.category === 'cloth').length,
      shoes: products.filter(p => p.category === 'shoes').length,
      others: products.filter(p => p.category === 'others').length,
    };
    return counts;
  };

  const categoryCounts = getCategoryCounts();

  // Debug: Show current state
  console.log('Current state - Products:', products.length, 'Category:', selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
              <Package className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Product Management Tool
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Create and manage your product catalog with ease. Select a category, fill in the details, and export your data in JSON format.
          </p>
          
          {/* Global Export All Button */}
          {products.length > 0 && (
            <div className="mt-6">
              <button
                onClick={handleExportAll}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg mx-auto"
              >
                <Database className="w-5 h-5" />
                Export All Categories ({products.length} products)
              </button>
              
              {/* Category breakdown */}
              <div className="mt-4 flex justify-center gap-4 text-sm text-gray-600">
                <span>Mobile: {categoryCounts.mobile}</span>
                <span>•</span>
                <span>Clothing: {categoryCounts.cloth}</span>
                <span>•</span>
                <span>Shoes: {categoryCounts.shoes}</span>
                <span>•</span>
                <span>Others: {categoryCounts.others}</span>
              </div>
            </div>
          )}
        </div>

        <div className="max-w-6xl mx-auto">
          <CategorySelector
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
          />

          {selectedCategory && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 capitalize">
                  {selectedCategory} Products ({products.filter(p => p.category === selectedCategory).length})
                </h2>
                <div className="flex gap-3">
                  <button
                    onClick={handleImport}
                    className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Import JSON
                  </button>
                  {products.filter(p => p.category === selectedCategory).length > 0 && (
                    <button
                      onClick={handleExport}
                      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Export {selectedCategory}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowForm(!showForm);
                      if (editingProduct) {
                        setEditingProduct(null);
                      }
                    }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {editingProduct ? 'Cancel Edit' : 'Add Product'}
                  </button>
                </div>
              </div>

              {showForm && (
                <div className="mb-8">
                  <ProductForm
                    category={selectedCategory}
                    onProductSave={handleProductSave}
                    existingProducts={products}
                    editingProduct={editingProduct}
                    onCancelEdit={handleCancelEdit}
                  />
                </div>
              )}

              <ProductList
                products={products.filter(p => p.category === selectedCategory)}
                onProductDelete={handleProductDelete}
                onProductEdit={handleProductEdit}
              />
            </div>
          )}

          {!selectedCategory && (
            <div className="text-center py-12">
              <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Get Started
                </h3>
                <p className="text-gray-600">
                  Select a category above to begin adding products to your catalog.
                </p>
                {products.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">
                      Total products in storage: {products.length}
                    </p>
                    <div className="mt-2 text-xs text-blue-500 space-y-1">
                      <div>📱 Mobile: {categoryCounts.mobile}</div>
                      <div>👕 Clothing: {categoryCounts.cloth}</div>
                      <div>👟 Shoes: {categoryCounts.shoes}</div>
                      <div>📦 Others: {categoryCounts.others}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden file input for JSON import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}

export default App;