export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      group_memberships: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          paid_amount_cents: number
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          paid_amount_cents: number
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          paid_amount_cents?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_memberships_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          access_credentials: string | null
          access_sent_at: string | null
          admin_approved: boolean | null
          admin_id: string
          created_at: string
          current_members: number | null
          description: string | null
          id: string
          instant_access: boolean | null
          max_members: number
          name: string
          price_per_slot_cents: number
          relationship_type: string
          rules: string | null
          service_id: string
          status: Database["public"]["Enums"]["group_status"] | null
          updated_at: string
        }
        Insert: {
          access_credentials?: string | null
          access_sent_at?: string | null
          admin_approved?: boolean | null
          admin_id: string
          created_at?: string
          current_members?: number | null
          description?: string | null
          id?: string
          instant_access?: boolean | null
          max_members: number
          name: string
          price_per_slot_cents: number
          relationship_type: string
          rules?: string | null
          service_id: string
          status?: Database["public"]["Enums"]["group_status"] | null
          updated_at?: string
        }
        Update: {
          access_credentials?: string | null
          access_sent_at?: string | null
          admin_approved?: boolean | null
          admin_id?: string
          created_at?: string
          current_members?: number | null
          description?: string | null
          id?: string
          instant_access?: boolean | null
          max_members?: number
          name?: string
          price_per_slot_cents?: number
          relationship_type?: string
          rules?: string | null
          service_id?: string
          status?: Database["public"]["Enums"]["group_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address_city: string | null
          address_number: string | null
          address_state: string | null
          address_street: string | null
          address_zipcode: string | null
          balance_cents: number | null
          cpf: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          pix_key: string | null
          two_fa_enabled: boolean | null
          updated_at: string
          user_id: string
          verification_code: string | null
          verification_expires_at: string | null
          verification_status:
            | Database["public"]["Enums"]["user_verification_status"]
            | null
        }
        Insert: {
          address_city?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zipcode?: string | null
          balance_cents?: number | null
          cpf?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          pix_key?: string | null
          two_fa_enabled?: boolean | null
          updated_at?: string
          user_id: string
          verification_code?: string | null
          verification_expires_at?: string | null
          verification_status?:
            | Database["public"]["Enums"]["user_verification_status"]
            | null
        }
        Update: {
          address_city?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zipcode?: string | null
          balance_cents?: number | null
          cpf?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          pix_key?: string | null
          two_fa_enabled?: boolean | null
          updated_at?: string
          user_id?: string
          verification_code?: string | null
          verification_expires_at?: string | null
          verification_status?:
            | Database["public"]["Enums"]["user_verification_status"]
            | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          admin_notes: string | null
          created_at: string
          description: string | null
          group_id: string | null
          id: string
          reason: string
          reported_user_id: string | null
          reporter_id: string
          resolved_at: string | null
          status: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          description?: string | null
          group_id?: string | null
          id?: string
          reason: string
          reported_user_id?: string | null
          reporter_id: string
          resolved_at?: string | null
          status?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          description?: string | null
          group_id?: string | null
          id?: string
          reason?: string
          reported_user_id?: string | null
          reporter_id?: string
          resolved_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category: Database["public"]["Enums"]["service_category"]
          created_at: string
          icon_url: string | null
          id: string
          max_users: number
          name: string
          pre_approved: boolean | null
        }
        Insert: {
          category: Database["public"]["Enums"]["service_category"]
          created_at?: string
          icon_url?: string | null
          id?: string
          max_users?: number
          name: string
          pre_approved?: boolean | null
        }
        Update: {
          category?: Database["public"]["Enums"]["service_category"]
          created_at?: string
          icon_url?: string | null
          id?: string
          max_users?: number
          name?: string
          pre_approved?: boolean | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount_cents: number
          created_at: string
          description: string | null
          external_payment_id: string | null
          fee_cents: number | null
          group_id: string | null
          id: string
          payment_method: string | null
          status: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          description?: string | null
          external_payment_id?: string | null
          fee_cents?: number | null
          group_id?: string | null
          id?: string
          payment_method?: string | null
          status?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          description?: string | null
          external_payment_id?: string | null
          fee_cents?: number | null
          group_id?: string | null
          id?: string
          payment_method?: string | null
          status?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawals: {
        Row: {
          amount_cents: number
          created_at: string
          id: string
          pix_key: string
          processed_at: string | null
          status: string | null
          two_fa_verified: boolean | null
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          id?: string
          pix_key: string
          processed_at?: string | null
          status?: string | null
          two_fa_verified?: boolean | null
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          id?: string
          pix_key?: string
          processed_at?: string | null
          status?: string | null
          two_fa_verified?: boolean | null
          user_id?: string
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
      group_status: "waiting_subscription" | "queue" | "active_with_slots"
      service_category:
        | "streaming"
        | "music"
        | "education"
        | "ai"
        | "gaming"
        | "productivity"
        | "other"
      user_verification_status: "pending" | "verified"
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
    Enums: {
      group_status: ["waiting_subscription", "queue", "active_with_slots"],
      service_category: [
        "streaming",
        "music",
        "education",
        "ai",
        "gaming",
        "productivity",
        "other",
      ],
      user_verification_status: ["pending", "verified"],
    },
  },
} as const
