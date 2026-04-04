

import { User, Product, Order, UserRole, OrderStatus, DashboardStats, SiteSettings, LocationData, Branch, Coupon, CartItem, DeliverySettings } from '../types.ts';

// Dynamic API URL - uses current domain's /api proxy (works with Static Web Apps)
const getApiBaseUrl = () => {
  // If explicitly set, use it
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  // Use relative /api (Static Web App will proxy to backendUri)
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

let isSimulationLocked = false;
let lastFailureTime = 0;
const RECOVERY_COOLDOWN = 30000; // 30 seconds

// Haversine formula for distance calculation
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@8guys.com';
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'Admin@123';

const INITIAL_BRANCHES: Branch[] = [
  {
    id: import.meta.env.VITE_DEFAULT_BRANCH_ID || 'branch-1',
    name: import.meta.env.VITE_BRANCH_NAME || 'Downtown 8GUYS',
    address: import.meta.env.VITE_BRANCH_ADDRESS || '123 Pizza Lane, City Center',
    latitude: Number(import.meta.env.VITE_BRANCH_LAT) || 31.5204,
    longitude: Number(import.meta.env.VITE_BRANCH_LNG) || 74.3587,
    deliveryRadius: Number(import.meta.env.VITE_DELIVERY_RADIUS) || 10,
    baseDeliveryFee: Number(import.meta.env.VITE_BASE_DELIVERY_FEE) || 150,
    isActive: true
  }
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: '507f1f77bcf86cd799439011',
    name: 'Margherita Classic',
    description: 'Authentic Italian taste with fresh basil, mozzarella, and our signature tomato sauce.',
    basePrice: 1200,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbad80ad50?auto=format&fit=crop&w=800&q=80',
    category: 'Pizza',
    isVegetarian: true,
    isAvailable: true,
    ingredients: ['Mozzarella', 'Fresh Basil', 'Tomato Sauce', 'Olive Oil'],
    sizes: [{ size: 'Small', priceModifier: -300 }, { size: 'Medium', priceModifier: 0 }, { size: 'Large', priceModifier: 400 }],
    crustOptions: [{ name: 'Hand Tossed', price: 0 }, { name: 'Thin Crust', price: 0 }, { name: 'Cheese Burst', price: 300 }],
    extraToppings: [{ name: 'Extra Cheese', price: 150 }, { name: 'Olives', price: 100 }, { name: 'Jalapenos', price: 100 }],
    rating: 4.8,
    reviewsCount: 124
  },
  {
    id: '507f1f77bcf86cd799439012',
    name: 'The 8Guys Signature',
    description: 'Our ultimate premium pizza loaded with 8 types of meat, premium cheese blend, and signature sauce.',
    basePrice: 2200,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    category: 'Pizza',
    isVegetarian: false,
    isAvailable: true,
    ingredients: ['Pepperoni', 'Italian Sausage', 'Smoked Bacon', 'Ham', 'Beef chunks', 'Chicken Tikka', 'Salami', 'Prosciutto', 'Mozzarella', 'Signature Sauce'],
    sizes: [{ size: 'Small', priceModifier: -500 }, { size: 'Medium', priceModifier: 0 }, { size: 'Large', priceModifier: 700 }],
    crustOptions: [{ name: 'Hand Tossed', price: 0 }, { name: 'Cheese Burst', price: 300 }, { name: 'Sausage Stuffed Crust', price: 400 }],
    extraToppings: [{ name: 'Extra Cheese', price: 200 }, { name: 'Mushrooms', price: 150 }, { name: 'Caramelized Onions', price: 100 }],
    rating: 4.9,
    reviewsCount: 342
  },
  {
    id: '507f1f77bcf86cd799439013',
    name: 'Classic Pepperoni',
    description: 'A timeless favorite packed with generous slices of premium beef pepperoni and gooey mozzarella.',
    basePrice: 1500,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80',
    category: 'Pizza',
    isVegetarian: false,
    isAvailable: true,
    ingredients: ['Beef Pepperoni', 'Mozzarella', 'Tomato Sauce'],
    sizes: [{ size: 'Small', priceModifier: -400 }, { size: 'Medium', priceModifier: 0 }, { size: 'Large', priceModifier: 500 }],
    crustOptions: [{ name: 'Hand Tossed', price: 0 }, { name: 'Thin Crust', price: 0 }, { name: 'Cheese Burst', price: 300 }],
    extraToppings: [{ name: 'Extra Cheese', price: 150 }, { name: 'Extra Pepperoni', price: 200 }, { name: 'Chili Flakes', price: 50 }],
    rating: 4.7,
    reviewsCount: 289
  },
  {
    id: '507f1f77bcf86cd799439014',
    name: 'BBQ Chicken Supreme',
    description: 'Smoky BBQ sauce base topped with grilled chicken, red onions, sweet corn, and fresh cilantro.',
    basePrice: 1800,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
    category: 'Pizza',
    isVegetarian: false,
    isAvailable: true,
    ingredients: ['Grilled Chicken', 'BBQ Sauce', 'Red Onions', 'Sweet Corn', 'Cilantro', 'Mozzarella'],
    sizes: [{ size: 'Small', priceModifier: -450 }, { size: 'Medium', priceModifier: 0 }, { size: 'Large', priceModifier: 600 }],
    crustOptions: [{ name: 'Hand Tossed', price: 0 }, { name: 'Thin Crust', price: 0 }, { name: 'Cheese Burst', price: 300 }],
    extraToppings: [{ name: 'Extra Chicken', price: 200 }, { name: 'Jalapenos', price: 100 }, { name: 'Extra Cheese', price: 150 }],
    rating: 4.6,
    reviewsCount: 156
  },
  {
    id: '507f1f77bcf86cd799439015',
    name: 'Vegetarian Truffle Mushroom',
    description: 'An elegant white pizza with roasted wild mushrooms, truffle oil, roasted garlic, and parmesan.',
    basePrice: 1650,
    image: 'https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?auto=format&fit=crop&w=800&q=80',
    category: 'Pizza',
    isVegetarian: true,
    isAvailable: true,
    ingredients: ['Wild Mushrooms', 'Truffle Oil', 'Roasted Garlic', 'Parmesan', 'Mozzarella', 'White Sauce Base'],
    sizes: [{ size: 'Small', priceModifier: -400 }, { size: 'Medium', priceModifier: 0 }, { size: 'Large', priceModifier: 550 }],
    crustOptions: [{ name: 'Hand Tossed', price: 0 }, { name: 'Thin Crust', price: 0 }],
    extraToppings: [{ name: 'Extra Truffle Oil', price: 150 }, { name: 'Caramelized Onions', price: 100 }, { name: 'Spinach', price: 100 }],
    rating: 4.5,
    reviewsCount: 98
  },
  {
    id: '507f1f77bcf86cd799439016',
    name: 'Spicy Peri-Peri Chicken',
    description: 'For spice lovers: Peri-peri flavored chicken, mixed bell peppers, jalapenos, and a drizzle of spicy mayo.',
    basePrice: 1750,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    category: 'Pizza',
    isVegetarian: false,
    isAvailable: true,
    ingredients: ['Peri-Peri Chicken', 'Bell Peppers', 'Jalapenos', 'Spicy Mayo', 'Mozzarella', 'Tomato Sauce'],
    sizes: [{ size: 'Small', priceModifier: -400 }, { size: 'Medium', priceModifier: 0 }, { size: 'Large', priceModifier: 550 }],
    crustOptions: [{ name: 'Hand Tossed', price: 0 }, { name: 'Thin Crust', price: 0 }, { name: 'Cheese Burst', price: 300 }],
    extraToppings: [{ name: 'Extra Chicken', price: 200 }, { name: 'Extra Jalapenos', price: 100 }, { name: 'Chili Flakes', price: 50 }],
    rating: 4.7,
    reviewsCount: 210
  }
];

const callApi = async (path: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('ph_auth_token');
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {})
  };

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  // Helper for ID normalization
  const normalize = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(normalize);
    const newObj = { ...obj };
    if (newObj._id && !newObj.id) newObj.id = newObj._id;
    if (newObj.id && !newObj._id) newObj._id = newObj.id;
    return newObj;
  };

  const method = (options.method || 'GET').toUpperCase();
  const isMutation = ['POST', 'PUT', 'DELETE'].includes(method);
  const now = Date.now();

  // Consolidation of simulation logic
  // We simulate IF:
  // 1. We are locked 
  // 2. AND it's NOT a mutation (mutations always try live to check recovery)
  // 3. AND it's been LESS than 30 seconds since last failure (periodic re-test)
  if (isSimulationLocked && !isMutation && (now - lastFailureTime < RECOVERY_COOLDOWN)) {
    return simulateBackend(path, options);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

    if (!response.ok) {
      if (response.status === 404 || response.status === 405) {
        console.info(`[API] Route ${path} returned ${response.status} on backend. Falling back to simulation.`);
        isSimulationLocked = true;
        lastFailureTime = Date.now();
        return simulateBackend(path, options);
      }
      const data = await response.json().catch(() => ({}));

      // Handle Authentication Errors Specifically
      if (response.status === 401 || (response.status === 400 && data.message === 'Invalid token.') || data.message === 'Access denied. No token provided.') {
        console.warn(`[API] Auth failed at ${path}: ${data.message}. Clearing session.`);
        localStorage.removeItem('ph_auth_token');
        localStorage.removeItem('ph_session_user');
        window.dispatchEvent(new Event('unauthorized'));
      }

      throw new Error(data.message || `API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const normalizedData = normalize(data);

    // Auto-recovery: If we successfully called a live API, unlock the simulation
    if (isSimulationLocked) {
      console.info(`[API] Backend recovered at ${path}. Unlocking simulation mode.`);
      isSimulationLocked = false;
      lastFailureTime = 0;
    }

    // Sync backend products to localStorage for consistent fallback
    if (path === '/products' && method === 'GET' && Array.isArray(normalizedData)) {
      localStorage.setItem('ph_local_products', JSON.stringify(normalizedData));
    }

    return normalizedData;
  } catch (error: any) {
    // ONLY enter simulation if it's a network failure (TypeError) 
    // or if we've already returned early for 404 above.
    // Application errors (like 400, 401, 500) should NOT trigger simulation mode.
    if (error instanceof TypeError) {
      if (!isSimulationLocked) {
        console.info(`[API] Connection issue at ${path}: ${error.message}. Switching to simulation.`);
      }
      isSimulationLocked = true;
      lastFailureTime = Date.now();
      return simulateBackend(path, options);
    }

    // Log application errors for debugging but don't enter simulation
    console.error(`[API] Error at ${path}:`, error.message);
    throw error;
  }
};

export const getIsSimulationLocked = () => isSimulationLocked;
export const resetSimulationLock = () => { isSimulationLocked = false; };

export const authenticateUser = async (email: string, password: string) => {
  const data = await callApi('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  if (data.token) localStorage.setItem('ph_auth_token', data.token);
  return data.user;
};

export const registerUser = async (name: string, email: string, password: string) => {
  const data = await callApi('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password })
  });
  if (data.token) localStorage.setItem('ph_auth_token', data.token);
  return data.user;
};

export const getProducts = async () => {
  return await callApi('/products');
};

export const saveProduct = async (product: Product) => {
  const pid = product.id || (product as any)._id;
  // An update is when we have an ID that is NOT a temporary simulation ID
  const isBackendUpdate = pid && pid.length > 5 && !pid.startsWith('sim_');

  try {
    return await callApi(isBackendUpdate ? `/products/${pid}` : '/products', {
      method: isBackendUpdate ? 'PUT' : 'POST',
      body: JSON.stringify(product)
    });
  } catch (error) {
    // If backend fails, the simulateBackend will handle it via callApi fallback
    // The fallback logic is already in callApi, so we don't need a separate try-catch here
    // unless we want to handle simulation-specific update logic.
    throw error;
  }
};

export const deleteProduct = async (id: string) => {
  try {
    return await callApi(`/products/${id}`, { method: 'DELETE' });
  } catch (error) {
    console.error('API delete failed, falling back to localStorage:', error);
    // Fallback to simulation mode
    return await simulateBackend(`/products/${id}`, { method: 'DELETE' });
  }
};

export const verifyLocation = (latitude?: number, longitude?: number, fullAddress?: string) =>
  callApi('/location/verify', { method: 'POST', body: JSON.stringify({ latitude, longitude, fullAddress }) });

export const validateCoupon = (code: string, subtotal: number) =>
  callApi('/coupons/validate', { method: 'POST', body: JSON.stringify({ code, subtotal }) });

export const createOrder = (orderData: Partial<Order>) =>
  callApi('/orders', { method: 'POST', body: JSON.stringify(orderData) });

export const getOrders = () => callApi('/orders');

export const updateOrderStatus = (orderId: string, status: OrderStatus) =>
  callApi(`/orders/${orderId}/status`, { method: 'PUT', body: JSON.stringify({ status }) });

export const getDashboardStats = () => callApi('/stats');

export const getAllUsers = () => callApi('/users');

export const toggleUserBlock = (userId: string) => callApi(`/users/${userId}/toggle-block`, { method: 'POST' });

export const updateUserProfile = (userId: string, data: Partial<User>) =>
  callApi('/users/profile', { method: 'PUT', body: JSON.stringify(data) });

export const getSiteSettings = async (): Promise<SiteSettings> => {
  const settings = localStorage.getItem('ph_site_settings');
  return settings ? JSON.parse(settings) : {
    contactEmail: import.meta.env.VITE_CONTACT_EMAIL || 'support@8guys.com',
    contactPhone: import.meta.env.VITE_CONTACT_PHONE || '+92 300 1234567',
    delivery: { isLocationBasedEnabled: false, allowedCityCodes: ['GRW'] }
  };
};

export const saveSiteSettings = async (settings: SiteSettings) => {
  localStorage.setItem('ph_site_settings', JSON.stringify(settings));
};

export const uploadImage = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    const data = await callApi('/upload', {
      method: 'POST',
      body: formData
    });
    return data.url;
  } catch (error) {
    console.info('[API] Image upload failed, falling back to base64 simulation.');
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }
};

export const getCurrentPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
    } else {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
    }
  });
};

export const reverseGeocode = async (lat: number, lng: number): Promise<LocationData> => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
    if (!response.ok) throw new Error('Geocoding failed');
    const data = await response.json();
    return {
      latitude: lat,
      longitude: lng,
      display_name: data.display_name
    };
  } catch (error) {
    console.error('Reverse Geocoding Error:', error);
    throw error;
  }
};

async function simulateBackend(path: string, options: RequestInit) {
  const getLocal = (key: string) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  };
  const setLocal = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

  // Initialize products on first run only
  if (!getLocal('ph_local_products')) {
    setLocal('ph_local_products', INITIAL_PRODUCTS);
  }

  if (!getLocal('ph_local_branches')) setLocal('ph_local_branches', INITIAL_BRANCHES);
  if (!getLocal('ph_local_users')) {
    setLocal('ph_local_users', [{
      id: 'admin_id',
      _id: 'admin_id',
      name: 'System Admin',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: UserRole.ADMIN,
      createdAt: new Date().toISOString()
    }]);
  }
  if (!getLocal('ph_local_orders')) setLocal('ph_local_orders', []);

  const method = options.method || 'GET';
  const body = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : {};

  if (path === '/auth/register' && method === 'POST') {
    const { name, email, password } = body;
    const users = getLocal('ph_local_users') || [];
    if (users.find((u: any) => u.email === email)) throw new Error('Email already registered');
    const newUser = { id: 'sim_' + Date.now(), name, email, role: UserRole.USER, createdAt: new Date().toISOString() };
    users.push({ ...newUser, password });
    setLocal('ph_local_users', users);
    return { user: newUser, token: 'sim_token_' + newUser.id };
  }

  if (path === '/auth/login' && method === 'POST') {
    const { email, password } = body;
    const users = getLocal('ph_local_users') || [];
    const user = users.find((u: any) => u.email === email && u.password === password);
    if (!user) throw new Error('Invalid email or password');
    const { password: _, ...userSafe } = user;
    return { user: userSafe, token: 'sim_token_' + user.id };
  }

  if (path === '/products') {
    let products = getLocal('ph_local_products') || [];
    if (method === 'GET') {
      // Ensure products array is valid
      if (!Array.isArray(products)) {
        products = INITIAL_PRODUCTS;
        setLocal('ph_local_products', products);
      }
      return products;
    }
    if (method === 'POST') {
      const existingIndex = products.findIndex((p: any) => (p.id && p.id === body.id) || (p._id && p._id === (body.id || body._id)));
      if (existingIndex >= 0) {
        // Handle as update if it already exists in stimulation
        products[existingIndex] = { ...products[existingIndex], ...body, updatedAt: new Date().toISOString() };
        setLocal('ph_local_products', products);
        return products[existingIndex];
      }
      const newProduct = {
        ...body,
        id: body.id || 'sim_' + Date.now(),
        _id: body._id || 'sim_' + Date.now(),
        createdAt: new Date().toISOString()
      };
      products.push(newProduct);
      setLocal('ph_local_products', products);
      return newProduct;
    }
  }

  if (path.startsWith('/products/') && (method === 'PUT' || method === 'DELETE')) {
    const id = path.split('/').pop();
    let products = getLocal('ph_local_products') || [];

    if (method === 'PUT') {
      const productIndex = products.findIndex((p: any) => p.id === id || p._id === id);
      if (productIndex >= 0) {
        products[productIndex] = { ...products[productIndex], ...body };
      }
      setLocal('ph_local_products', products);
      return { message: 'Product updated', ...products[productIndex] };
    }

    if (method === 'DELETE') {
      const initialLength = products.length;
      products = products.filter((p: any) => p.id !== id && p._id !== id);

      // If we are in simulation mode, we want to be more forgiving.
      // If it's not found, maybe it was deleted on backend but still in memory?
      // Or it's a backend ID that isn't in simulation.
      if (products.length < initialLength) {
        setLocal('ph_local_products', products);
        return { message: 'Product deleted from local storage', success: true };
      } else {
        // Don't throw if not found during simulated delete, just return "success" to avoid UI breaking
        console.warn(`[Simulation] Product ${id} not found for deletion, skipping.`);
        return { message: 'Product not found in local storage, assuming already deleted', success: true };
      }
    }
  }

  if (path === '/location/verify') {
    // In simulation mode, always approve the location
    return {
      success: true,
      message: 'Location verified (simulation mode)',
      cityCode: 'GRW',
      branch: INITIAL_BRANCHES[0]
    };
  }

  if (path === '/coupons/validate') {
    // In simulation mode, reject coupons
    throw new Error('Invalid or expired coupon code');
  }

  if (path === '/orders') {
    if (method === 'GET') return getLocal('ph_local_orders') || [];
    if (method === 'POST') {
      const orders = getLocal('ph_local_orders') || [];
      const newOrder = { ...body, id: 'sim_ord_' + Date.now(), createdAt: new Date().toISOString(), status: OrderStatus.PENDING };
      orders.push(newOrder);
      setLocal('ph_local_orders', orders);
      return newOrder;
    }
  }

  if (path === '/users') return getLocal('ph_local_users') || [];

  if (path.startsWith('/users/') && path.endsWith('/toggle-block')) {
    const id = path.split('/')[2];
    const users = getLocal('ph_local_users') || [];
    const userIndex = users.findIndex((u: any) => u.id === id);
    if (userIndex > -1) {
      users[userIndex].isBlocked = !users[userIndex].isBlocked;
      setLocal('ph_local_users', users);
      return { message: 'User status toggled' };
    }
  }

  if (path === '/stats') {
    const orders = getLocal('ph_local_orders') || [];
    return {
      totalUsers: (getLocal('ph_local_users') || []).length,
      totalOrders: orders.length,
      totalProducts: (getLocal('ph_local_products') || []).length,
      totalRevenue: orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0)
    };
  }

  if (path.startsWith('/orders/') && path.endsWith('/status')) {
    const id = path.split('/')[2];
    const orders = getLocal('ph_local_orders') || [];
    const orderIndex = orders.findIndex((o: any) => o.id === id || o._id === id);
    if (orderIndex > -1) {
      orders[orderIndex].status = body.status;
      if (!orders[orderIndex].logs) orders[orderIndex].logs = [];
      orders[orderIndex].logs.push({ status: body.status, timestamp: new Date().toISOString(), note: 'Status updated by admin (sim)' });
      setLocal('ph_local_orders', orders);
      return orders[orderIndex];
    }
  }

  return [];
}
