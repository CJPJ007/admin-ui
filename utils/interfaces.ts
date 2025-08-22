
export interface PropertyImages {
  imageUrl: string;
}

export interface Property {
  id: number | null;
  title: string;
  description: string;
  price: number;
  location: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  areaSqft: number;
  featured: boolean;
  sold: boolean;
  slug: string;
  latitude: number;
  longitude: number;
  seoTitle: string;
  seoDescription: string;
  images: PropertyImages[];
  pinCode: number;
  thumbnailImage: string;
  virtualTourLink: string;
  cents:number;
}

export interface FilterType {
  field: string;
  operator: string;
  value: string;
}

export interface Slider {
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  mobileImageUrl: string;
  linkUrl: string;
  buttonText: string;
  sortOrder: number;
  isActive: boolean;
  page: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
}

export interface ActivityLog {
  id: number;
  userId: number;
  name: string;  
  action: string;
  tableName: string;
  ipAddress: string;
  createdAt: string;
  userAgent: string;
}


export interface Blog {
  id: number;
  title: string;
  slug: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  publishedAt: string;
  status: string;
  thumbnailImage: string;
  createdAt: string;
}

export interface CacheItem {
  id: string
  name: string
  description: string
  icon: any
  lastCleared: string
  size: number
  status: "active" | "clearing" | "cleared"
}

export interface CacheManagementResponse {
  cacheName: string
  size: number
  lastClearedTime: string
}


export interface FAQ {
  id: number
  question: string
  answer: string
}

export interface Customer {
  id:number
  name:string
  email:string
  mobile:string
  avatar:string
}


export interface Inquiry {
  id:number
  name:string
  email:string
  mobile:string
  property:string
  appointmentDate:string
  message:string
}

export interface Testimonial {
  id: number,
  youtubeUrl: string,
}

export interface GalleryVideo {
  id: number,
  youtubeUrl: string,
}