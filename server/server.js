const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5175', 'http://localhost:3000', 'http://127.0.0.1:5175'],
  credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Scraping rate limit (more restrictive)
const scrapeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 scraping requests per minute
  message: 'Too many scraping requests, please wait before trying again.'
});

// Headers to mimic a browser request
const getHeaders = () => ({
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'DNT': '1',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Cache-Control': 'max-age=0',
  'Referer': 'https://www.flipkart.com/'
});

// Extract brand from product name
const extractBrand = (productName) => {
  if (!productName) return 'Unknown';
  
  const commonBrands = [
    'Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Realme', 'Oppo', 'Vivo', 'Google', 'Motorola',
    'Nokia', 'Huawei', 'Honor', 'POCO', 'Redmi', 'Nothing', 'Asus', 'Sony', 'LG',
    'Nike', 'Adidas', 'Puma', 'Reebok', 'New Balance', 'Converse', 'Vans',
    'Zara', 'H&M', 'Uniqlo', 'Forever 21', 'Gap', 'Levi\'s', 'Calvin Klein',
    'Canon', 'Nikon', 'Sony', 'Panasonic', 'Fujifilm', 'Olympus',
    'Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'MSI', 'MacBook', 'iMac', 'boAt',
    'JBL', 'Bose', 'Sennheiser', 'Skullcandy', 'Marshall'
  ];

  const upperName = productName.toUpperCase();
  
  for (const brand of commonBrands) {
    if (upperName.includes(brand.toUpperCase())) {
      return brand;
    }
  }
  
  // If no brand found, try to extract first word
  const firstWord = productName.split(' ')[0];
  return firstWord || 'Unknown';
};

// Parse price string to number
const parsePrice = (priceString) => {
  if (!priceString || priceString === 'Not found') return 0;
  
  // Remove currency symbols and commas, extract numbers
  const cleanPrice = priceString.replace(/[₹,\s]/g, '');
  const priceMatch = cleanPrice.match(/\d+/);
  
  return priceMatch ? parseInt(priceMatch[0]) : 0;
};

// Parse rating to number
const parseRating = (ratingString) => {
  if (!ratingString || ratingString === 'Not found') return 4.0;
  
  const ratingMatch = ratingString.match(/(\d+\.?\d*)/);
  return ratingMatch ? parseFloat(ratingMatch[1]) : 4.0;
};

// Parse reviews count to number
const parseReviewsCount = (reviewsString) => {
  if (!reviewsString || reviewsString === 'Not found') return 1000;
  
  const cleanReviews = reviewsString.replace(/,/g, '');
  const reviewsMatch = cleanReviews.match(/\d+/);
  
  return reviewsMatch ? parseInt(reviewsMatch[0]) : 1000;
};

// Sleep function for delays
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Main scraping function
const scrapeFlipkartProduct = async (url, resolution = "832/832") => {
  try {
    console.log(`Starting to scrape: ${url}`);
    
    // Add delay to avoid rate limiting
    await sleep(2000);
    
    const response = await axios.get(url, {
      headers: getHeaders(),
      timeout: 30000,
      maxRedirects: 5
    });
    
    const $ = cheerio.load(response.data);
    
    // Find product name from <span class="VU-ZEz">
    let productName = null;
    const nameSpan = $('span.VU-ZEz').first();
    if (nameSpan.length) {
      productName = nameSpan.text().trim();
    }
    
    // Alternative selectors for product name
    if (!productName) {
      const altNameSelectors = [
        'h1[class*="x2Jnf"]',
        'span[class*="B_NuCI"]',
        'h1.yhB1nd',
        '.B_NuCI'
      ];
      
      for (const selector of altNameSelectors) {
        const element = $(selector).first();
        if (element.length && element.text().trim()) {
          productName = element.text().trim();
          break;
        }
      }
    }
    
    // Find price from <div class="yRaY8j A6+E6v">
    let price = null;
    const priceDiv = $('div.yRaY8j.A6\\+E6v').first();
    if (priceDiv.length) {
      price = priceDiv.text().trim();
    }
    
    // Alternative price selectors
    if (!price) {
      const altPriceSelectors = [
        '._30jeq3._16Jk6d',
        '._1_WHN1',
        '.CEmiEU .srp-price',
        '._3I9_wc._27UcVY'
      ];
      
      for (const selector of altPriceSelectors) {
        const element = $(selector).first();
        if (element.length && element.text().trim()) {
          price = element.text().trim();
          break;
        }
      }
    }
    
    // Find rating and reviews
    let rating = null;
    let ratingsCount = null;
    let reviewsCount = null;
    
    const ratingDiv = $('div._5OesEi.HDvrBb').first();
    if (ratingDiv.length) {
      const ratingSpan = ratingDiv.find('div.XQDdHH').first();
      if (ratingSpan.length) {
        rating = ratingSpan.text().trim().split('img')[0];
      }
      
      const reviewsSpan = ratingDiv.find('span.Wphh3N').first();
      if (reviewsSpan.length) {
        const reviewsText = reviewsSpan.text().trim();
        const match = reviewsText.match(/([\d,]+)\s+Ratings\s*&?\s*([\d,]+)\s+Reviews/);
        if (match) {
          ratingsCount = match[1];
          reviewsCount = match[2];
        }
      }
    }
    
    // Alternative rating selectors
    if (!rating) {
      const altRatingSelectors = [
        '._3LWZlK',
        '.hGSR34',
        '._2_R_DZ span'
      ];
      
      for (const selector of altRatingSelectors) {
        const element = $(selector).first();
        if (element.length && element.text().trim()) {
          rating = element.text().trim();
          break;
        }
      }
    }
    
    // Find images from gallery
    let imageUrls = [];
    const galleryDiv = $('div.\\+P14Qy').first();
    
    if (galleryDiv.length) {
      const imageTags = galleryDiv.find('img._0DkuPH');
      
      imageTags.each((i, img) => {
        const src = $(img).attr('src');
        if (src) {
          // Remove query parameters
          const cleanUrl = src.replace(/\?.*$/, '');
          // Replace resolution
          const highResUrl = cleanUrl.replace(/image\/128\/128\//, `image/${resolution}/`);
          imageUrls.push(highResUrl);
        }
      });
    }
    
    // Alternative image selectors
    if (imageUrls.length === 0) {
      const altImageSelectors = [
        '._2r_T1I img',
        '._396cs4 img',
        '.q6DClP img',
        '._1AtVbE img'
      ];
      
      for (const selector of altImageSelectors) {
        const images = $(selector);
        if (images.length) {
          images.each((i, img) => {
            const src = $(img).attr('src') || $(img).attr('data-src');
            if (src && !src.includes('placeholder')) {
              const cleanUrl = src.replace(/\?.*$/, '');
              const highResUrl = cleanUrl.replace(/image\/\d+\/\d+\//, `image/${resolution}/`);
              imageUrls.push(highResUrl);
            }
          });
          break;
        }
      }
    }
    
    // Remove duplicates
    imageUrls = [...new Set(imageUrls)];
    
    console.log('Scraping completed successfully');
    
    return {
      product_name: productName || "Not found",
      price: price || "Not found",
      rating: rating || "Not found",
      ratings_count: ratingsCount || "Not found",
      reviews_count: reviewsCount || "Not found",
      images: imageUrls
    };
    
  } catch (error) {
    console.error('Scraping error:', error.message);
    throw error;
  }
};

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Product scraper backend is running' });
});

app.post('/api/scrape-product', scrapeLimiter, async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    // Validate URL
    if (!url.includes('flipkart.com')) {
      return res.status(400).json({ error: 'Only Flipkart URLs are supported' });
    }
    
    console.log(`Received scraping request for: ${url}`);
    
    // Scrape the product
    const scrapedData = await scrapeFlipkartProduct(url);
    
    // Parse and transform the data
    const transformedData = {
      name: scrapedData.product_name,
      brand: extractBrand(scrapedData.product_name),
      mrp: parsePrice(scrapedData.price),
      salePrice: Math.round(parsePrice(scrapedData.price) * 0.85), // Assume 15% discount
      images: scrapedData.images.filter(img => img && img.trim() !== ''),
      averageRating: parseRating(scrapedData.rating),
      totalReviews: parseReviewsCount(scrapedData.reviews_count)
    };
    
    console.log('Sending transformed data:', transformedData);
    
    res.json(transformedData);
    
  } catch (error) {
    console.error('API Error:', error);
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      res.status(503).json({ error: 'Unable to connect to the website. Please try again later.' });
    } else if (error.response && error.response.status === 429) {
      res.status(429).json({ error: 'Too many requests. Please wait before trying again.' });
    } else if (error.response && error.response.status === 403) {
      res.status(403).json({ error: 'Access denied. The website may be blocking requests.' });
    } else {
      res.status(500).json({ error: 'Failed to scrape product data. Please try again.' });
    }
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Product scraper backend running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔍 Scrape endpoint: http://localhost:${PORT}/api/scrape-product`);
});