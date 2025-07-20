# Sparkathon E-commerce Platform

## Overview
Sparkathon Walmart is a modern e-commerce platform built with Next.js that provides an intelligent and seamless shopping experience. The application features comprehensive user account management, product browsing, and order processing capabilities.

Key characteristics:
- **Personalized recommendations**: Suggests products tailored to each user using a collaborative filtering model (Truncated SVD).
- **AI-powered chatbot**: Helps users with product queries and recommends items based on their demands.
- **Full shopping workflow**: Users can browse products, add items to wishlist and cart, and place orders securely.
- **Scalable architecture**: Modular design for easy integration of additional features and ML models.
- **Smooth user experience**: Responsive design with Framer Motion animations for interactive UI transitions.
- **Secure authentication**: NextAuth.js with JWT-based session management.

Tech Stack:
- Frontend: Next.js 14, React 18, Tailwind CSS, Framer Motion
- Backend: FastAPI (for ML APIs), Next.js API routes
- Database: MongoDB with Mongoose ODM
- Authentication: NextAuth.js (JWT strategy)
- Machine Learning: Truncated SVD (Collaborative Filtering), OpenAI API (Chatbot)


## Project Structure
```
## Project Structure

ShopSmart/
├── app/                   # Next.js app directory (pages, API routes)
│   ├── account/           # User account pages
│   │   ├── wishlist/      # Wishlist page
│   │   ├── orders/        # Order history
│   │   └── profile/       # User profile management
│   ├── admin/             # Admin dashboard
│   │   ├── dashboard/     # Admin overview
│   │   ├── users/         # User management
│   │   └── retailer-applications/ # Approve/reject retailer applications
│   ├── api/               # API routes for backend logic
│   │   ├── cart/          # Add/remove/update cart items
│   │   ├── wishlist/      # Wishlist management APIs
│   │   ├── product/       # Fetch products by ID, category
│   │   └── retailer/      # Retailer applications APIs
│   ├── backend/           # FastAPI ML APIs (recommendations)
│   │   ├── app.py         # Main FastAPI app
│   │   ├── product_chain.py # GenAI chatbot logic
│   │   ├── data_loader.py # Loads product data for ML
│   │   └── requirements.txt # Python dependencies
│   ├── bothelp/           # GenAI chatbot page
│   ├── cart/              # Shopping cart page
│   ├── product/           # Product details page
│   └── recommendations/   # Personalized recommendations page
├── components/            # Reusable React components
│   ├── Navbar.js          # Top navigation bar
│   ├── HeroSection.js     # Landing page hero
│   ├── ForYouSection.js   # "For You" personalized section
│   └── PopularProductsSection.js # Popular items showcase
├── hooks/                 # Custom React hooks (useCart, useWish, etc.)
├── lib/                   # Supabase, MongoDB, and store utilities
│   ├── supabase/          # Supabase client setup
│   ├── mongodb.js         # MongoDB connection helper
│   └── store.js           # Redux store configuration
├── ml models/             # Truncated SVD model files
│   ├── svd_model.pkl      # Pre-trained SVD model
│   ├── user_enc.pkl       # User encoding mapping
│   ├── item_enc.pkl       # Item encoding mapping
│   ├── sparse_matrix.npz  # Sparse user-item matrix
│   └── popular_products.json # Precomputed popular products
├── models/                # Mongoose schemas for MongoDB
│   ├── User.js            # User model
│   ├── Product.js         # Product model
│   ├── Cart.js            # Cart model
│   └── Wishlist.js        # Wishlist model
├── public/                # Static assets (SVGs, images)
├── utils/                 # Helper functions
│   ├── addressUtils.js    # Address handling logic
│   ├── navbar-wrapper.js  # Navbar UI helper
│   └── redux-provider.js  # Redux provider setup
├── .env                   # Environment variables
├── package.json           # Project dependencies and scripts
├── next.config.mjs        # Next.js configuration
├── recommender.py         # Python ML logic for recommendations
└── README.md              # Project documentation

```

### Directory Explanations:
1. **app/**: Contains all application routes using Next.js App Router
2. **components/**: Reusable UI components following atomic design principles
3. **hooks/**: Custom hooks for state management and data fetching
4. **lib/**: Shared utilities and helper functions
5. **models/**: MongoDB data schemas and models
6. **public/**: Static assets like images and fonts
7. **utils/**: Generic helper functions used throughout the app

## User Account Management

### User Model Schema
Defined in `models/User.js`:
```javascript
const UserSchema = new mongoose.Schema({
  supabaseId: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true 
  },
  role: { 
    type: String, 
    enum: ['Buyer', 'Retailer', 'Admin'], 
    default: 'Buyer', 
    required: true 
  },
  profile: {
    name: String,
    avatar: String,
    phone: String
  },
  addresses: [{
    type: { 
      type: String, 
      enum: ['home', 'office', 'other'], 
      default: 'home' 
    },
    label: String,
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'India' },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
  }],
  preferences: {
    categories: [String],
    priceRange: { 
      min: { type: Number, default: 0 }, 
      max: { type: Number, default: 1000 } 
    },
    currency: { type: String, default: 'INR' },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      orderUpdates: { type: Boolean, default: true },
      deals: { type: Boolean, default: true },
      newArrivals: { type: Boolean, default: false }
    },
    privacy: {
      showEmail: { type: Boolean, default: false },
      profileVisibility: { 
        type: String, 
        enum: ['public', 'private'], 
        default: 'public' 
      }
    }
  },
  behavior: {
    searchHistory: [String],
    viewedProducts: [String],
    lastActive: { type: Date, default: Date.now }
  }
}, { timestamps: true });
```

### Custom Hooks
#### `useUser.js`
Manages authentication state and provides:
- `signIn()`: Handle user login
- `signOut()`: Handle user logout
- `changePassword()`: Update user password
- `getSession()`: Retrieve current session

#### `useAccountData.js`
Fetches and manages user account data:
- `user`: Current user object
- `preferences`: User preferences
- `updatePreferences()`: Update user preferences
- `refreshData()`: Refresh account data

### API Endpoints
#### `GET /api/account/preferences`
Retrieves user preferences:
```javascript
// Example response
{
  "preferences": {
    "categories": ["Electronics", "Fashion"],
    "priceRange": { "min": 0, "max": 50000 },
    "currency": "INR",
    "notifications": {
      "email": true,
      "push": true,
      "orderUpdates": true,
      "deals": true,
      "newArrivals": false
    }
  }
}
```

#### `PUT /api/account/preferences`
Updates user preferences:
```javascript
// Request body
{
  "categories": ["Electronics", "Books"],
  "priceRange": { "min": 1000, "max": 30000 },
  "currency": "USD",
  "notifications": {
    "email": false,
    "newArrivals": true
  }
}
```

### Security Considerations
1. **Authentication**: NextAuth.js with JWT session tokens
2. **Password Handling**: bcrypt hashing before storage
3. **Data Validation**: Server-side validation using `userValidation.js`
4. **Session Management**: Secure HTTP-only cookies
5. **Rate Limiting**: Implemented on sensitive endpoints
