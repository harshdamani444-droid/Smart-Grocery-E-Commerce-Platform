import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from './models/Product.js';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
try {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
      process.env[k] = envConfig[k];
    }
  }
} catch (err) {
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
}

const baseItems = [
  // 1. Fruits & Vegetables
  {
    name: 'Apples',
    category: 'Fruits & Vegetables',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400',
    brands: ['Fresh Red', 'Organic Fuji', 'Premium Shimla', 'Royal Gala', 'Kashmiri', 'Granny Smith Green'],
    variations: [{ unit: '500g', price: 90 }, { unit: '1kg', price: 170 }, { unit: '2kg', price: 320 }]
  },
  {
    name: 'Bananas',
    category: 'Fruits & Vegetables',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400',
    brands: ['Robusta', 'Organic Elakki', 'Premium Yelakki', 'Cavendish'],
    variations: [{ unit: '6 units', price: 35 }, { unit: '1 dozen', price: 65 }]
  },
  {
    name: 'Oranges',
    category: 'Fruits & Vegetables',
    image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=400',
    brands: ['Nagpur Sweet', 'Imported Valencia', 'Organic Clementine'],
    variations: [{ unit: '500g', price: 60 }, { unit: '1kg', price: 110 }]
  },
  {
    name: 'Tomatoes',
    category: 'Fruits & Vegetables',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400',
    brands: ['Local Hybrid', 'Organic Country', 'Plum Fresh'],
    variations: [{ unit: '500g', price: 25 }, { unit: '1kg', price: 45 }, { unit: '2kg', price: 80 }]
  },
  {
    name: 'Potatoes',
    category: 'Fruits & Vegetables',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400',
    brands: ['Jyoti Premium', 'Organic Baby', 'Indore Special'],
    variations: [{ unit: '1kg', price: 35 }, { unit: '2kg', price: 65 }]
  },
  {
    name: 'Onions',
    category: 'Fruits & Vegetables',
    image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=400',
    brands: ['Nasik Red', 'Organic White', 'Premium Garlic-Style'],
    variations: [{ unit: '1kg', price: 40 }, { unit: '2kg', price: 75 }]
  },
  // 2. Dairy & Eggs
  {
    name: 'Milk',
    category: 'Dairy & Eggs',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400',
    brands: ['Amul Taaza Toned', 'Amul Gold Full Cream', 'Mother Dairy Premium', 'Nandini GoodLife'],
    variations: [{ unit: '500ml', price: 33 }, { unit: '1L', price: 64 }]
  },
  {
    name: 'Cheese',
    category: 'Dairy & Eggs',
    image: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=400',
    brands: ['Amul Processed Cheese', 'Amul Cheddar Block', 'Britannia Mozzarella'],
    variations: [{ unit: '150g', price: 95 }, { unit: '200g', price: 125 }]
  },
  {
    name: 'Butter',
    category: 'Dairy & Eggs',
    image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400',
    brands: ['Amul Salted', 'Amul Garlic & Herbs', 'Mother Dairy Unsalted'],
    variations: [{ unit: '100g', price: 56 }, { unit: '500g', price: 260 }]
  },
  {
    name: 'Yogurt & Curd',
    category: 'Dairy & Eggs',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
    brands: ['Amul Masti Dahi', 'Nestle a+ Actiplus', 'Epigamia Strawberry Curd', 'Epigamia Blueberry Greek'],
    variations: [{ unit: '200g', price: 35 }, { unit: '400g', price: 65 }]
  },
  // 3. Bakery
  {
    name: 'Bread',
    category: 'Bakery',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
    brands: ['English Oven Brown', 'Modern Whole Wheat', 'Wibs Sandwich White', 'Britannia Multigrain'],
    variations: [{ unit: '400g', price: 45 }, { unit: '800g', price: 80 }]
  },
  {
    name: 'Cookies',
    category: 'Bakery',
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400',
    brands: ['Good Day Cashew', 'Hide & Seek Chocolate Chip', 'Unibic Butter Cookies', 'Moms Magic Butter'],
    variations: [{ unit: '75g', price: 20 }, { unit: '150g', price: 40 }]
  },
  {
    name: 'Muffins & Cakes',
    category: 'Bakery',
    image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400',
    brands: ['Elite Plum Cake', 'Winkies Vanilla Muffin', 'Britannia Gobbles Cake'],
    variations: [{ unit: '120g', price: 60 }]
  },
  // 4. Packaged Food
  {
    name: 'Noodles',
    category: 'Packaged Food',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
    brands: ['Maggi 2-Minute Masala', 'Yippee Magic Masala', 'Chings Hakka Veg', 'Nissin Gekikara Spicy'],
    variations: [{ unit: '70g', price: 14 }, { unit: '280g', price: 54 }]
  },
  {
    name: 'Atta & Wheat Flour',
    category: 'Packaged Food',
    image: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=400',
    brands: ['Aashirvaad Shudh Chakki', 'Pillsbury Chakki Fresh', 'Fortune Chakki Fresh'],
    variations: [{ unit: '1kg', price: 60 }, { unit: '5kg', price: 260 }]
  },
  {
    name: 'Basmati Rice',
    category: 'Packaged Food',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
    brands: ['India Gate Super', 'Daawat Rozana Gold', 'Kohinoor Charminar'],
    variations: [{ unit: '1kg', price: 120 }, { unit: '5kg', price: 560 }]
  },
  // 5. Household Care
  {
    name: 'Dishwashing Liquid',
    category: 'Household Care',
    image: 'https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=400',
    brands: ['Vim Gel Lemon', 'Pril Lime Concentrated', 'Exo Dishwash Gel'],
    variations: [{ unit: '250ml', price: 55 }, { unit: '500ml', price: 105 }]
  },
  {
    name: 'Laundry Detergent',
    category: 'Household Care',
    image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400',
    brands: ['Surf Excel Easy Wash', 'Ariel Complete Powder', 'Tide Double Power'],
    variations: [{ unit: '500g', price: 75 }, { unit: '1kg', price: 140 }]
  },
  {
    name: 'Floor Cleaner',
    category: 'Household Care',
    image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400',
    brands: ['Lizol Citrus Fresh', 'Dettol Lavender Clean', 'CleanMate Floral Power'],
    variations: [{ unit: '500ml', price: 100 }, { unit: '975ml', price: 190 }]
  },
  // 6. Beverages
  {
    name: 'Green Tea',
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400',
    brands: ['Lipton Honey Lemon', 'Tetley Ginger & Mint', 'Organic India Tulsi'],
    variations: [{ unit: '25 bags', price: 145 }, { unit: '100 bags', price: 490 }]
  },
  {
    name: 'Instant Coffee',
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400',
    brands: ['Nescafe Classic Premium', 'Bru Gold Premium', 'Tata Coffee Grand'],
    variations: [{ unit: '50g', price: 155 }, { unit: '100g', price: 290 }]
  },
  {
    name: 'Fruit Juice',
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400',
    brands: ['Real Activ Orange', 'Tropicana Apple Juice', 'B Natural Guava'],
    variations: [{ unit: '200ml', price: 25 }, { unit: '1L', price: 110 }]
  },
  // 7. Personal Care
  {
    name: 'Shampoo',
    category: 'Personal Care',
    image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400',
    brands: ['Head & Shoulders Cool', 'Dove Intense Repair', 'L\'Oreal Total Repair', 'Clinic Plus Strong'],
    variations: [{ unit: '180ml', price: 135 }, { unit: '340ml', price: 245 }]
  },
  {
    name: 'Toothpaste',
    category: 'Personal Care',
    image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400',
    brands: ['Colgate MaxFresh Red', 'Sensodyne Fresh Mint Gel', 'Pepsodent Germicheck', 'Dabur Red Ayurvedic'],
    variations: [{ unit: '80g', price: 50 }, { unit: '150g', price: 95 }]
  },
  {
    name: 'Bath Soap',
    category: 'Personal Care',
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400',
    brands: ['Dettol Soap Original', 'Lifebuoy Soap Total', 'Santoor Soap Sandal', 'Fiama Soap Gel Bar'],
    variations: [{ unit: '125g', price: 42 }]
  },
  // 8. Snacks & Munchies
  {
    name: 'Potato Chips',
    category: 'Snacks & Munchies',
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400',
    brands: ['Lays Classic Salted', 'Lays American Cream & Onion', 'Uncle Chipps Spicy', 'Pringles Original Sour'],
    variations: [{ unit: '50g', price: 20 }, { unit: '90g', price: 35 }]
  },
  {
    name: 'Chocolate Bar',
    category: 'Snacks & Munchies',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400',
    brands: ['Cadbury Dairy Milk Silk', 'Amul 75% Dark Chocolate', 'Nestle KitKat Pack', 'Five Star Fudge'],
    variations: [{ unit: '50g', price: 45 }, { unit: '150g', price: 110 }]
  },
  {
    name: 'Almonds & Nuts',
    category: 'Snacks & Munchies',
    image: 'https://images.unsplash.com/photo-1560790671-b76ca4de55ef?w=400',
    brands: ['Happilo California Raw', 'Tata Sampann Premium', 'Tulsi Raw Gold'],
    variations: [{ unit: '100g', price: 125 }, { unit: '200g', price: 240 }]
  }
];

const packageTypes = ['Standard', 'Family Pack', 'Super Saver', 'Promo Combo', 'Bumper Pack', 'Value Pack'];

const seed500Products = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'smart-grocery' });
    console.log('Connected to database successfully.');

    // Fetch a user for reviews
    const user = await User.findOne({ email: 'user@gmail.com' });
    const customerId = user ? user._id : new mongoose.Types.ObjectId();

    console.log('Deleting existing products...');
    await Product.deleteMany({});
    console.log('Existing products deleted.');

    const productsToSeed = [];

    // Loop until we reach exactly 500 unique products
    for (let i = 1; i <= 500; i++) {
      const baseIndex = (i - 1) % baseItems.length;
      const base = baseItems[baseIndex];

      const brandIndex = Math.floor((i - 1) / baseItems.length) % base.brands.length;
      const brand = base.brands[brandIndex];

      const variationIndex = Math.floor((i - 1) / (baseItems.length * base.brands.length)) % base.variations.length;
      const variation = base.variations[variationIndex];

      const packIndex = Math.floor((i - 1) / (baseItems.length * base.brands.length * base.variations.length)) % packageTypes.length;
      const pack = packageTypes[packIndex];

      // Formulate unique real-world product names
      let productName = `${brand} ${base.name}`;
      let finalPrice = variation.price;
      let finalUnit = variation.unit;

      if (pack === 'Family Pack') {
        productName = `${brand} ${base.name} (Family Pack)`;
        finalPrice = Math.round(variation.price * 1.8);
        finalUnit = `2 x ${variation.unit}`;
      } else if (pack === 'Super Saver') {
        productName = `${brand} ${base.name} (Super Saver)`;
        finalPrice = Math.round(variation.price * 2.5);
        finalUnit = `3 x ${variation.unit}`;
      } else if (pack === 'Promo Combo') {
        productName = `${brand} ${base.name} (Combo Pack)`;
        finalPrice = Math.round(variation.price * 1.6);
        finalUnit = `2 Units`;
      } else if (pack === 'Bumper Pack') {
        productName = `${brand} ${base.name} (Bumper Pack)`;
        finalPrice = Math.round(variation.price * 3.2);
        finalUnit = `4 x ${variation.unit}`;
      } else if (pack === 'Value Pack') {
        productName = `${brand} ${base.name} (Value Pack)`;
        finalPrice = Math.round(variation.price * 0.95);
      }

      // Add variation to price to ensure different prices
      finalPrice = Math.max(10, finalPrice + (i % 7) - 3);

      const description = `Freshly packed ${brand} ${base.name} sourced under strict quality checks. Perfect for daily household needs and premium lifestyle.`;
      const stock = Math.round(10 + ((i * 13) % 85));
      const barcode = `890${String(1000000000 + i)}`;

      productsToSeed.push({
        name: productName,
        description,
        price: finalPrice,
        category: base.category,
        image: base.image,
        stock,
        barcode,
        unit: finalUnit,
        rating: 4.1 + (i % 9) * 0.1,
        numReviews: i % 3 === 0 ? 1 : 0,
        reviews: i % 3 === 0 ? [
          { user: customerId, name: 'Verified Purchaser', rating: 5, comment: 'High quality product, fresh packaging and excellent pricing.' }
        ] : [],
        storeAvailability: [
          { storeName: 'HD Mart Powai', stock: Math.round(stock * 0.4), lat: 19.1176, lng: 72.9060 },
          { storeName: 'HD Mart Malad', stock: Math.round(stock * 0.3), lat: 19.1860, lng: 72.8485 },
          { storeName: 'HD Mart Thane', stock: Math.round(stock * 0.3), lat: 19.2183, lng: 72.9781 }
        ],
        tags: [base.name.toLowerCase(), brand.toLowerCase(), base.category.toLowerCase()]
      });
    }

    console.log('Inserting 500 realistic products with correct images...');
    await Product.insertMany(productsToSeed);
    console.log('500 products successfully seeded!');
    
    mongoose.disconnect();
    console.log('Disconnected from database.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seed500Products();
