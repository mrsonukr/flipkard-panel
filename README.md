# Product Management Tool with Real-time Scraping

A powerful product management tool that can automatically scrape product data from e-commerce websites and populate your product catalog.

## Features

- 🛍️ **Auto-fill from URLs**: Paste any Flipkart product URL and automatically fill the form
- 📱 **Multi-category Support**: Mobile, Clothing, Shoes, and Others
- 🖼️ **Image Management**: Automatic high-resolution image extraction
- 💾 **Data Export/Import**: JSON format for easy data management
- 🔄 **Real-time Scraping**: Live data extraction from product pages
- 📊 **Smart Data Processing**: Automatic brand detection and price calculation

## Quick Start

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
npm run setup:backend
```

### 2. Start the Application

```bash
# Start both frontend and backend together
npm run dev:full
```

Or start them separately:

```bash
# Terminal 1: Start backend
npm run backend

# Terminal 2: Start frontend  
npm run dev
```

### 3. Access the Application

- **Frontend**: http://localhost:5175
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## How to Use

1. **Select a Category**: Choose from Mobile, Clothing, Shoes, or Others
2. **Add Product**: Click the "Add Product" button
3. **Auto-fill Option**: 
   - Paste a Flipkart product URL in the auto-fill section
   - Click "Auto-fill" to automatically populate the form
   - Review and adjust the data if needed
4. **Manual Entry**: Fill in the form manually if preferred
5. **Save**: Click "Save Product" to add to your catalog
6. **Export**: Export your data in JSON format

## Supported Websites

Currently supports:
- ✅ **Flipkart**: Full product data extraction including images, prices, ratings

## API Endpoints

### POST `/api/scrape-product`
Scrapes product data from a given URL.

**Request:**
```json
{
  "url": "https://www.flipkart.com/product-url"
}
```

**Response:**
```json
{
  "name": "Product Name",
  "brand": "Brand Name", 
  "mrp": 25000,
  "salePrice": 20000,
  "images": ["image1.jpg", "image2.jpg"],
  "averageRating": 4.5,
  "totalReviews": 1250
}
```

## Technical Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** for development

### Backend
- **Express.js** for API server
- **Cheerio** for HTML parsing
- **Axios** for HTTP requests
- **Rate limiting** for protection

## Rate Limits

- **General API**: 100 requests per 15 minutes per IP
- **Scraping**: 10 requests per minute per IP

## Development

### Project Structure
```
├── src/                 # Frontend React app
├── server/             # Backend Express server
├── components/         # React components
├── utils/             # Utility functions
└── README.md          # This file
```

### Adding New Scrapers

To add support for new websites:

1. Add scraping logic in `server/server.js`
2. Update URL validation
3. Test with sample URLs
4. Update documentation

## Troubleshooting

### Backend Connection Issues
- Ensure backend is running on port 3001
- Check firewall settings
- Verify CORS configuration

### Scraping Issues
- Some websites may block requests
- Rate limiting may apply
- Try different user agents

### Common Errors
- **"Unable to connect to scraping service"**: Backend not running
- **"Too many requests"**: Hit rate limit, wait before retrying
- **"Access denied"**: Website blocking requests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use in your projects!