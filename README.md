# Sparkathon E-commerce Platform

## Overview
Sparkathon is a modern e-commerce platform built with Next.js that provides a seamless shopping experience. The application features comprehensive user account management, product browsing, and order processing capabilities. 

Key characteristics:
- **User-centric design**: Intuitive interface with personalized recommendations
- **Scalable architecture**: Modular structure for easy feature expansion
- **Performance optimized**: Server-side rendering and efficient data fetching
- **Secure authentication**: NextAuth.js with MongoDB session storage

Tech Stack:
- Frontend: Next.js 15, React 18, Tailwind CSS
- Backend: Next.js API routes
- Database: MongoDB with Mongoose ODM
- Authentication: NextAuth.js

## Project Structure
```
sparkathon/
├── app/                   # Application routes
│   ├── account/           # User account management
│   │   ├── orders/        # Order history
│   │   │   └── [id]/      # Dynamic order detail pages
│   │   │       └── page.js
│   │   ├── preferences/   # User preferences
│   │   │   └── page.js
│   │   └── security/      # Security settings
│   │       └── page.js
│   ├── api/               # API endpoints
│   │   └── account/       # Account-related APIs
│   │       └── preferences/
│   │           └── route.js
│   └── ...                # Other application routes
├── components/            # Reusable UI components
│   └── account/           # Account-specific components
│       └── AccountSidebar.js
├── hooks/                 # Custom React hooks
│   ├── useAccountData.js  # Account data fetching
│   └── useUser.js         # User authentication state
├── lib/                   # Utility libraries
│   ├── mongodb.js         # MongoDB connection
│   └── validations/       # Validation utilities
│       └── userValidation.js
├── models/                # Data models
│   └── User.js            # User schema
├── public/                # Static assets
├── styles/                # Global styles
├── utils/                 # Helper functions
├── .env.local             # Environment variables
├── package.json           # Dependencies
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
