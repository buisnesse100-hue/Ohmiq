/**
 * Types générés manuellement à partir des migrations SQL (supabase/migrations).
 * Si tu utilises le Supabase CLI, tu peux régénérer un fichier équivalent avec :
 *   npx supabase gen types typescript --project-id <ton-projet> > src/types/database.ts
 * Dans ce cas, remplace ce fichier par la sortie générée.
 */

export type AppRole = "user" | "admin";
export type ListingStatus = "draft" | "pending" | "active" | "sold" | "hidden" | "deleted";
export type ListingCondition = "new" | "like_new" | "good" | "fair" | "for_parts";
export type ReportReason =
  | "scam"
  | "fake_product"
  | "prohibited_content"
  | "wrong_category"
  | "spam"
  | "already_sold"
  | "other";
export type ReportStatus = "pending" | "reviewing" | "resolved" | "dismissed";
export type ListingEventType = "view" | "call_click" | "whatsapp_click" | "email_click" | "favorite";
export type SubscriptionStatus = "inactive" | "active" | "past_due" | "canceled";
export type AttributeInputType = "text" | "number" | "select" | "boolean";
export type OfferStatus = "pending" | "accepted" | "declined" | "expired" | "withdrawn";
export type OrderStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          avatar_url: string | null;
          city: string | null;
          bio: string | null;
          phone: string | null;
          phone_verified: boolean;
          email_verified: boolean;
          role: AppRole;
          is_banned: boolean;
          banned_until: string | null;
          ban_reason: string | null;
          listing_count: number;
          rating: number | null;
          is_professional: boolean;
          company_name: string | null;
          siret: string | null;
          professional_verified: boolean;
          sales_count: number;
          rating_average: number | null;
          rating_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          slug: string;
          name: string;
          icon: string | null;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["categories"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["categories"]["Row"]>;
        Relationships: [];
      };
      subcategories: {
        Row: {
          id: string;
          category_id: string;
          slug: string;
          name: string;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["subcategories"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["subcategories"]["Row"]>;
        Relationships: [];
      };
      listings: {
        Row: {
          id: string;
          seller_id: string;
          slug: string;
          title: string;
          description: string;
          price: number;
          is_negotiable: boolean;
          category_id: string;
          subcategory_id: string | null;
          city: string;
          postal_code: string | null;
          latitude: number | null;
          longitude: number | null;
          condition: ListingCondition;
          delivery_available: boolean;
          contact_phone: string | null;
          contact_phone_public: boolean;
          contact_whatsapp: string | null;
          contact_whatsapp_public: boolean;
          contact_email: string | null;
          contact_email_public: boolean;
          status: ListingStatus;
          is_promoted: boolean;
          promotion_started_at: string | null;
          promotion_expires_at: string | null;
          view_count: number;
          call_click_count: number;
          whatsapp_click_count: number;
          email_click_count: number;
          favorite_count: number;
          published_at: string | null;
          sold_at: string | null;
          brand_id: string | null;
          model_id: string | null;
          has_invoice: boolean;
          has_warranty: boolean;
          warranty_until: string | null;
          purchase_date: string | null;
          known_defects: string | null;
          serial_number: string | null;
          accessories_included: string | null;
          is_professional_listing: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["listings"]["Row"]> & {
          seller_id: string;
          title: string;
          description: string;
          price: number;
          category_id: string;
          city: string;
        };
        Update: Partial<Database["public"]["Tables"]["listings"]["Row"]>;
        Relationships: [];
      };
      listing_images: {
        Row: {
          id: string;
          listing_id: string;
          storage_path: string;
          display_order: number;
          is_primary: boolean;
          width: number | null;
          height: number | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["listing_images"]["Row"]> & {
          listing_id: string;
          storage_path: string;
        };
        Update: Partial<Database["public"]["Tables"]["listing_images"]["Row"]>;
        Relationships: [];
      };
      favorites: {
        Row: {
          user_id: string;
          listing_id: string;
          created_at: string;
        };
        Insert: { user_id: string; listing_id: string };
        Update: Partial<Database["public"]["Tables"]["favorites"]["Row"]>;
        Relationships: [];
      };
      reports: {
        Row: {
          id: string;
          listing_id: string;
          reporter_id: string | null;
          reason: ReportReason;
          message: string | null;
          status: ReportStatus;
          handled_by: string | null;
          handled_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["reports"]["Row"]> & {
          listing_id: string;
          reason: ReportReason;
        };
        Update: Partial<Database["public"]["Tables"]["reports"]["Row"]>;
        Relationships: [];
      };
      listing_events: {
        Row: {
          id: string;
          listing_id: string;
          event_type: ListingEventType;
          viewer_id: string | null;
          session_id: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["listing_events"]["Row"]> & {
          listing_id: string;
          event_type: ListingEventType;
          session_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["listing_events"]["Row"]>;
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          status: SubscriptionStatus;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          price_cents: number;
          currency: string;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]> & { user_id: string };
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]>;
        Relationships: [];
      };
      admin_actions: {
        Row: {
          id: string;
          admin_id: string;
          action_type: string;
          target_type: string;
          target_id: string;
          reason: string | null;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["admin_actions"]["Row"]> & {
          admin_id: string;
          action_type: string;
          target_type: string;
          target_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["admin_actions"]["Row"]>;
        Relationships: [];
      };
      brands: {
        Row: {
          id: string;
          slug: string;
          name: string;
          logo_url: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["brands"]["Row"]> & { slug: string; name: string };
        Update: Partial<Database["public"]["Tables"]["brands"]["Row"]>;
        Relationships: [];
      };
      brand_categories: {
        Row: {
          brand_id: string;
          category_id: string;
        };
        Insert: Database["public"]["Tables"]["brand_categories"]["Row"];
        Update: Partial<Database["public"]["Tables"]["brand_categories"]["Row"]>;
        Relationships: [];
      };
      models: {
        Row: {
          id: string;
          brand_id: string;
          subcategory_id: string | null;
          slug: string;
          name: string;
          release_year: number | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["models"]["Row"]> & {
          brand_id: string;
          slug: string;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["models"]["Row"]>;
        Relationships: [];
      };
      category_attributes: {
        Row: {
          id: string;
          category_id: string;
          subcategory_id: string | null;
          key: string;
          label: string;
          input_type: AttributeInputType;
          unit: string | null;
          options: string[] | null;
          is_required: boolean;
          display_order: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["category_attributes"]["Row"]> & {
          category_id: string;
          key: string;
          label: string;
        };
        Update: Partial<Database["public"]["Tables"]["category_attributes"]["Row"]>;
        Relationships: [];
      };
      listing_attribute_values: {
        Row: {
          id: string;
          listing_id: string;
          attribute_id: string;
          value: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["listing_attribute_values"]["Row"]> & {
          listing_id: string;
          attribute_id: string;
          value: string;
        };
        Update: Partial<Database["public"]["Tables"]["listing_attribute_values"]["Row"]>;
        Relationships: [];
      };
      conversations: {
        Row: {
          id: string;
          listing_id: string;
          buyer_id: string;
          seller_id: string;
          last_message_at: string;
          buyer_unread_count: number;
          seller_unread_count: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["conversations"]["Row"]> & {
          listing_id: string;
          buyer_id: string;
          seller_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["conversations"]["Row"]>;
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          read_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["messages"]["Row"]> & {
          conversation_id: string;
          sender_id: string;
          content: string;
        };
        Update: Partial<Database["public"]["Tables"]["messages"]["Row"]>;
        Relationships: [];
      };
      offers: {
        Row: {
          id: string;
          conversation_id: string;
          listing_id: string;
          buyer_id: string;
          amount: number;
          status: OfferStatus;
          expires_at: string;
          responded_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["offers"]["Row"]> & {
          conversation_id: string;
          listing_id: string;
          buyer_id: string;
          amount: number;
        };
        Update: Partial<Database["public"]["Tables"]["offers"]["Row"]>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          listing_id: string;
          buyer_id: string;
          seller_id: string;
          amount: number;
          status: OrderStatus;
          completed_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["orders"]["Row"]> & {
          listing_id: string;
          buyer_id: string;
          seller_id: string;
          amount: number;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Row"]>;
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          order_id: string;
          reviewer_id: string;
          reviewee_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["reviews"]["Row"]> & {
          order_id: string;
          reviewer_id: string;
          reviewee_id: string;
          rating: number;
        };
        Update: Partial<Database["public"]["Tables"]["reviews"]["Row"]>;
        Relationships: [];
      };
      price_estimates: {
        Row: {
          id: string;
          model_id: string | null;
          category_id: string | null;
          condition: ListingCondition;
          estimated_price: number;
          sample_size: number;
          source: string;
          computed_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["price_estimates"]["Row"]> & {
          condition: ListingCondition;
          estimated_price: number;
        };
        Update: Partial<Database["public"]["Tables"]["price_estimates"]["Row"]>;
        Relationships: [];
      };
    };
    Views: {
      listing_views: {
        Row: {
          id: string;
          listing_id: string;
          viewer_id: string | null;
          session_id: string;
          created_at: string;
        };
        Relationships: [];
      };
    };
    Functions: {
      record_listing_event: {
        Args: {
          p_listing_id: string;
          p_event_type: ListingEventType;
          p_viewer_id: string | null;
          p_session_id: string;
        };
        Returns: boolean;
      };
      get_listing_contacts: {
        Args: { p_listing_id: string };
        Returns: {
          contact_phone: string | null;
          contact_whatsapp: string | null;
          contact_email: string | null;
          serial_number: string | null;
        }[];
      };
      get_my_phone: { Args: Record<string, never>; Returns: string | null };
      is_admin: { Args: Record<string, never>; Returns: boolean };
      is_banned: { Args: Record<string, never>; Returns: boolean };
    };
  };
}
