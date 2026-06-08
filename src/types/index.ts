export interface Profile {
  id: string;
  user_id: string;
  general_philosophy: string;
  routines: string;
  created_at: string;
}

export interface Chat {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
}

export interface Message {
  id: string;
  chat_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_name: string;
  notes: string;
  created_at: string;
}

export interface UserMemory {
  id: string;
  user_id: string;
  category: string;
  content: string;
  created_at: string;
}

export interface ProductScan {
  id: string;
  user_id: string;
  product_name: string;
  image_base64: string;
  image_mime: string;
  verdict: 'validated' | 'rejected';
  summary: string;
  full_analysis: string;
  created_at: string;
}
