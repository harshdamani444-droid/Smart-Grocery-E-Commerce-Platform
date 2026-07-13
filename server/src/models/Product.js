import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true }
}, { timestamps: true });

const storeAvailabilitySchema = new mongoose.Schema({
  storeName: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
  category: { type: String, required: true },
  image: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  barcode: { type: String, unique: true, sparse: true },
  unit: { type: String, default: '1 unit' },
  reviews: [reviewSchema],
  rating: { type: Number, required: true, default: 0 },
  numReviews: { type: Number, required: true, default: 0 },
  storeAvailability: [storeAvailabilitySchema],
  tags: [String]
}, { timestamps: true });

// Auto calculate rating when reviews are added
productSchema.methods.calculateRating = function() {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
  } else {
    this.numReviews = this.reviews.length;
    const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    this.rating = Math.round((sum / this.reviews.length) * 10) / 10;
  }
};

const Product = mongoose.model('Product', productSchema);
export default Product;
