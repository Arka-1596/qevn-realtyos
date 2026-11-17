export type PropertyType =
  | "APARTMENT"
  | "HOUSE"
  | "VILLA"
  | "LAND"
  | "COMMERCIAL";

export type ListingType = "SALE" | "RENT";

export type PropertySort =
  | "newest"
  | "price_asc"
  | "price_desc";

export type PropertyImage = {
  id: string;
  image_url: string;
  alt_text: string;
  sort_order: number;
  is_cover: boolean;
};

export type Property = {
  id: string;
  slug: string;
  title: string;
  description: string;
  city: string;
  locality: string;
  state: string;
  country: string;
  latitude: string | null;
  longitude: string | null;
  property_type: PropertyType;
  listing_type: ListingType;
  price: string;
  currency: string;
  bhk: number;
  bathrooms: number;
  area_sqft: string;
  furnished_status: string;
  availability_status: string;
  is_featured: boolean;
  images: PropertyImage[];
};

export type PropertyListResponse = {
  items: Property[];
  total: number;
  page: number;
  limit: number;
};

export type PropertyFilters = {
  keyword?: string;
  city?: string;
  min_price?: string;
  max_price?: string;
  property_type?: string;
  listing_type?: string;
  bhk?: string;
  sort?: PropertySort;
  page?: number;
  limit?: number;
};

export type LeadCreated = {
  id: string;
  status: string;
  success: boolean;
};

export type VisitCreated = {
  id: string;
  property_id: string;
  status: string;
  preferred_start_at: string;
};