export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      collections: {
        Row: {
          created_at: string
          description: string
          handle: string
          id: string
          product_condition: string
          sort_order: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string
          handle?: string
          id?: string
          product_condition?: string
          sort_order?: number
          title?: string
        }
        Update: {
          created_at?: string
          description?: string
          handle?: string
          id?: string
          product_condition?: string
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      discounts: {
        Row: {
          buy_qty: number
          can_combine: boolean
          collections: string
          created_at: string
          discount_value: string
          get_qty: number
          id: string
          max_per_order: string
          max_total: string
          name: string
          priority: number
          status: string
          title: string
          uses: number
        }
        Insert: {
          buy_qty?: number
          can_combine?: boolean
          collections?: string
          created_at?: string
          discount_value?: string
          get_qty?: number
          id?: string
          max_per_order?: string
          max_total?: string
          name?: string
          priority?: number
          status?: string
          title?: string
          uses?: number
        }
        Update: {
          buy_qty?: number
          can_combine?: boolean
          collections?: string
          created_at?: string
          discount_value?: string
          get_qty?: number
          id?: string
          max_per_order?: string
          max_total?: string
          name?: string
          priority?: number
          status?: string
          title?: string
          uses?: number
        }
        Relationships: []
      }
      featured_collections: {
        Row: {
          collection_id: string
          featured: boolean
          id: string
          products_to_show: number
          sort_order: number
        }
        Insert: {
          collection_id: string
          featured?: boolean
          id?: string
          products_to_show?: number
          sort_order?: number
        }
        Update: {
          collection_id?: string
          featured?: boolean
          id?: string
          products_to_show?: number
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "featured_collections_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      featured_collections_settings: {
        Row: {
          id: string
          visible: boolean
        }
        Insert: {
          id?: string
          visible?: boolean
        }
        Update: {
          id?: string
          visible?: boolean
        }
        Relationships: []
      }
      google_reviews: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          rating: number
          review_text: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          rating?: number
          review_text?: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          rating?: number
          review_text?: string
          sort_order?: number
        }
        Relationships: []
      }
      google_reviews_settings: {
        Row: {
          average_rating: number
          id: string
          max_reviews_to_show: number
          show_on_homepage: boolean
          show_on_product: boolean
          total_review_count: number
          updated_at: string
        }
        Insert: {
          average_rating?: number
          id?: string
          max_reviews_to_show?: number
          show_on_homepage?: boolean
          show_on_product?: boolean
          total_review_count?: number
          updated_at?: string
        }
        Update: {
          average_rating?: number
          id?: string
          max_reviews_to_show?: number
          show_on_homepage?: boolean
          show_on_product?: boolean
          total_review_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      import_logs: {
        Row: {
          created_at: string | null
          errors: Json | null
          failed_rows: number | null
          file_name: string | null
          id: string
          success_rows: number | null
          total_rows: number | null
        }
        Insert: {
          created_at?: string | null
          errors?: Json | null
          failed_rows?: number | null
          file_name?: string | null
          id?: string
          success_rows?: number | null
          total_rows?: number | null
        }
        Update: {
          created_at?: string | null
          errors?: Json | null
          failed_rows?: number | null
          file_name?: string | null
          id?: string
          success_rows?: number | null
          total_rows?: number | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          address: string
          apartment: string
          city: string
          country: string
          created_at: string
          discount: number
          discount_label: string
          email: string
          first_name: string
          id: string
          items: Json
          last_name: string
          order_number: string
          payment_method: string
          phone: string
          pin_code: string
          save_info: boolean
          shipping_cost: number
          shipping_method: string
          state: string
          status: string
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          address?: string
          apartment?: string
          city?: string
          country?: string
          created_at?: string
          discount?: number
          discount_label?: string
          email?: string
          first_name?: string
          id?: string
          items?: Json
          last_name?: string
          order_number?: string
          payment_method?: string
          phone?: string
          pin_code?: string
          save_info?: boolean
          shipping_cost?: number
          shipping_method?: string
          state?: string
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Update: {
          address?: string
          apartment?: string
          city?: string
          country?: string
          created_at?: string
          discount?: number
          discount_label?: string
          email?: string
          first_name?: string
          id?: string
          items?: Json
          last_name?: string
          order_number?: string
          payment_method?: string
          phone?: string
          pin_code?: string
          save_info?: boolean
          shipping_cost?: number
          shipping_method?: string
          state?: string
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      payment_logs: {
        Row: {
          amount: number
          created_at: string
          error_message: string | null
          event: string
          id: string
          method: string
          order_id: string | null
          order_number: string
          payment_id: string | null
          raw_data: Json | null
          status: string
        }
        Insert: {
          amount?: number
          created_at?: string
          error_message?: string | null
          event?: string
          id?: string
          method?: string
          order_id?: string | null
          order_number?: string
          payment_id?: string | null
          raw_data?: Json | null
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          error_message?: string | null
          event?: string
          id?: string
          method?: string
          order_id?: string | null
          order_number?: string
          payment_id?: string | null
          raw_data?: Json | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_logs_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          order_id: string | null
          order_number: string
          payment_method: string
          payu_bank_ref: string | null
          payu_bankcode: string | null
          payu_error: string | null
          payu_mihpayid: string | null
          payu_mode: string | null
          payu_status: string | null
          payu_unmappedstatus: string | null
          response_data: Json | null
          status: string
          txn_id: string
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          order_id?: string | null
          order_number?: string
          payment_method?: string
          payu_bank_ref?: string | null
          payu_bankcode?: string | null
          payu_error?: string | null
          payu_mihpayid?: string | null
          payu_mode?: string | null
          payu_status?: string | null
          payu_unmappedstatus?: string | null
          response_data?: Json | null
          status?: string
          txn_id?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          order_id?: string | null
          order_number?: string
          payment_method?: string
          payu_bank_ref?: string | null
          payu_bankcode?: string | null
          payu_error?: string | null
          payu_mihpayid?: string | null
          payu_mode?: string | null
          payu_status?: string | null
          payu_unmappedstatus?: string | null
          response_data?: Json | null
          status?: string
          txn_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string | null
          id: string
          position: number | null
          product_id: string | null
          src: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          id?: string
          position?: number | null
          product_id?: string | null
          src?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          id?: string
          position?: number | null
          product_id?: string | null
          src?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_metafields: {
        Row: {
          age_group: string | null
          clothing_features: string | null
          color_pattern: string | null
          fabric: string | null
          id: string
          product_id: string | null
          size: string | null
          sleeve_length_type: string | null
          target_gender: string | null
          top_length_type: string | null
        }
        Insert: {
          age_group?: string | null
          clothing_features?: string | null
          color_pattern?: string | null
          fabric?: string | null
          id?: string
          product_id?: string | null
          size?: string | null
          sleeve_length_type?: string | null
          target_gender?: string | null
          top_length_type?: string | null
        }
        Update: {
          age_group?: string | null
          clothing_features?: string | null
          color_pattern?: string | null
          fabric?: string | null
          id?: string
          product_id?: string | null
          size?: string | null
          sleeve_length_type?: string | null
          target_gender?: string | null
          top_length_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_metafields_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_options: {
        Row: {
          id: string
          option1_linked_to: string | null
          option1_name: string | null
          option2_linked_to: string | null
          option2_name: string | null
          option3_linked_to: string | null
          option3_name: string | null
          product_id: string | null
        }
        Insert: {
          id?: string
          option1_linked_to?: string | null
          option1_name?: string | null
          option2_linked_to?: string | null
          option2_name?: string | null
          option3_linked_to?: string | null
          option3_name?: string | null
          product_id?: string | null
        }
        Update: {
          id?: string
          option1_linked_to?: string | null
          option1_name?: string | null
          option2_linked_to?: string | null
          option2_name?: string | null
          option3_linked_to?: string | null
          option3_name?: string | null
          product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_options_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_seo: {
        Row: {
          id: string
          product_id: string | null
          seo_description: string | null
          seo_title: string | null
        }
        Insert: {
          id?: string
          product_id?: string | null
          seo_description?: string | null
          seo_title?: string | null
        }
        Update: {
          id?: string
          product_id?: string | null
          seo_description?: string | null
          seo_title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_seo_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          barcode: string | null
          compare_at_price: number | null
          cost_per_item: number | null
          created_at: string | null
          fulfillment_service: string | null
          grams: number | null
          id: string
          inventory_policy: string | null
          inventory_quantity: number | null
          inventory_tracker: string | null
          option1_value: string | null
          option2_value: string | null
          option3_value: string | null
          price: number | null
          product_id: string | null
          requires_shipping: boolean | null
          sku: string | null
          tax_code: string | null
          taxable: boolean | null
          unit_price_base_measure: number | null
          unit_price_base_measure_unit: string | null
          unit_price_total_measure: number | null
          unit_price_total_measure_unit: string | null
          variant_image: string | null
          weight_unit: string | null
        }
        Insert: {
          barcode?: string | null
          compare_at_price?: number | null
          cost_per_item?: number | null
          created_at?: string | null
          fulfillment_service?: string | null
          grams?: number | null
          id?: string
          inventory_policy?: string | null
          inventory_quantity?: number | null
          inventory_tracker?: string | null
          option1_value?: string | null
          option2_value?: string | null
          option3_value?: string | null
          price?: number | null
          product_id?: string | null
          requires_shipping?: boolean | null
          sku?: string | null
          tax_code?: string | null
          taxable?: boolean | null
          unit_price_base_measure?: number | null
          unit_price_base_measure_unit?: string | null
          unit_price_total_measure?: number | null
          unit_price_total_measure_unit?: string | null
          variant_image?: string | null
          weight_unit?: string | null
        }
        Update: {
          barcode?: string | null
          compare_at_price?: number | null
          cost_per_item?: number | null
          created_at?: string | null
          fulfillment_service?: string | null
          grams?: number | null
          id?: string
          inventory_policy?: string | null
          inventory_quantity?: number | null
          inventory_tracker?: string | null
          option1_value?: string | null
          option2_value?: string | null
          option3_value?: string | null
          price?: number | null
          product_id?: string | null
          requires_shipping?: boolean | null
          sku?: string | null
          tax_code?: string | null
          taxable?: boolean | null
          unit_price_base_measure?: number | null
          unit_price_base_measure_unit?: string | null
          unit_price_total_measure?: number | null
          unit_price_total_measure_unit?: string | null
          variant_image?: string | null
          weight_unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          body_html: string | null
          collection_name: string | null
          created_at: string | null
          gift_card: boolean | null
          handle: string | null
          id: string
          product_category: string | null
          product_type: string | null
          published: boolean | null
          status: string | null
          tags: string[] | null
          title: string | null
          vendor: string | null
        }
        Insert: {
          body_html?: string | null
          collection_name?: string | null
          created_at?: string | null
          gift_card?: boolean | null
          handle?: string | null
          id?: string
          product_category?: string | null
          product_type?: string | null
          published?: boolean | null
          status?: string | null
          tags?: string[] | null
          title?: string | null
          vendor?: string | null
        }
        Update: {
          body_html?: string | null
          collection_name?: string | null
          created_at?: string | null
          gift_card?: boolean | null
          handle?: string | null
          id?: string
          product_category?: string | null
          product_type?: string | null
          published?: boolean | null
          status?: string | null
          tags?: string[] | null
          title?: string | null
          vendor?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      visitor_sessions: {
        Row: {
          created_at: string
          id: string
          ip_hint: string | null
          last_seen_at: string
          page_url: string
          referrer: string | null
          session_id: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_hint?: string | null
          last_seen_at?: string
          page_url?: string
          referrer?: string | null
          session_id: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_hint?: string | null
          last_seen_at?: string
          page_url?: string
          referrer?: string | null
          session_id?: string
          user_agent?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
