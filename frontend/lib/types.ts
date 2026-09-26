export type MediaType = "photo" | "video";

export interface MediaItem {
  id: string;
  media_type: MediaType;
  url: string;
  thumbnail_url?: string | null;
  title: string;
  caption: string;
  date_label: string;
  order_index: number;
  duration_seconds: number;
  include_in_finale: boolean;
  include_in_gallery: boolean;
}

export interface Balloon {
  id: string;
  message: string;
  enabled: boolean;
  order_index: number;
}

export interface PublicConfig {
  recipient_name: string;

  birthday_date: string;
  birthday_time: string;
  timezone: string;

  intro_message: string;
  birthday_message: string;
  cake_message: string;
  gift_message: string;
  final_message: string;
  finale_subtitle: string;

  music_url?: string | null;

  photo_duration_seconds: number;

  special_media_id?: string | null;

  theme: string;

  media_items: MediaItem[];
  balloons: Balloon[];
}

export interface AdminConfig extends PublicConfig {
  id: string;
  slug: string;
  updated_at: string;
}

export type Scene =
  | "lock"
  | "welcome"
  | "countdown"
  | "birthday"
  | "memories"
  | "gallery"
  | "cake"
  | "gift"
  | "message"
  | "special"
  | "finale";