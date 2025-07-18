interface ScrapedProductData {
  name: string;
  brand: string;
  mrp: number;
  salePrice: number;
  images: string[];
  averageRating: number;
  totalReviews: number;
}

// Real implementation using backend API
export const scrapeProductData = async (url: string): Promise<ScrapedProductData | null> => {
  try {
    // Validate URL
    if (!url.includes('flipkart.com')) {
      throw new Error('Please provide a valid Flipkart product URL');
    }

    console.log('Scraping product data from:', url);
    
    const response = await fetch('http://localhost:3001/api/scrape-product', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const scrapedData: ScrapedProductData = await response.json();
    
    console.log('Successfully scraped product data:', scrapedData);
    
    return scrapedData;
    
  } catch (error) {
    console.error('Error scraping product data:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to scraping service. Make sure the backend server is running on port 3001.');
    }
    
    throw error;
  }
};