import type { User } from './auth';
import type { Content } from './content';

// Series types
export interface Series {
  id: number;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
  partner?: Partner;
  content?: Content[];
}

export interface Partner {
  id: number;
  name: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface FeaturedSeries extends Series {
  partner: Partner;
}
