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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          achievement_date: string
          achievement_type: string
          created_at: string
          details: Json | null
          id: string
          salesperson_id: string
        }
        Insert: {
          achievement_date?: string
          achievement_type?: string
          created_at?: string
          details?: Json | null
          id?: string
          salesperson_id: string
        }
        Update: {
          achievement_date?: string
          achievement_type?: string
          created_at?: string
          details?: Json | null
          id?: string
          salesperson_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievements_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
        ]
      }
      activities: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          contact_name: string | null
          created_at: string
          duration_minutes: number | null
          id: string
          notes: string | null
          outcome: Database["public"]["Enums"]["activity_outcome"]
          sale_id: string | null
          salesperson_id: string | null
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          contact_name?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          outcome: Database["public"]["Enums"]["activity_outcome"]
          sale_id?: string | null
          salesperson_id?: string | null
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type"]
          contact_name?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          outcome?: Database["public"]["Enums"]["activity_outcome"]
          sale_id?: string | null
          salesperson_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_goals: {
        Row: {
          calls_goal: number
          created_at: string
          emails_goal: number
          id: string
          linkedin_goal: number
          meetings_goal: number
          salesperson_id: string
          updated_at: string
          whatsapp_goal: number
        }
        Insert: {
          calls_goal?: number
          created_at?: string
          emails_goal?: number
          id?: string
          linkedin_goal?: number
          meetings_goal?: number
          salesperson_id: string
          updated_at?: string
          whatsapp_goal?: number
        }
        Update: {
          calls_goal?: number
          created_at?: string
          emails_goal?: number
          id?: string
          linkedin_goal?: number
          meetings_goal?: number
          salesperson_id?: string
          updated_at?: string
          whatsapp_goal?: number
        }
        Relationships: [
          {
            foreignKeyName: "activity_goals_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: true
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
        ]
      }
      cadence_steps: {
        Row: {
          action_type: string
          cadence_id: string
          created_at: string
          day_number: number
          description: string | null
          id: string
          step_order: number
          template_content: string | null
          title: string
        }
        Insert: {
          action_type: string
          cadence_id: string
          created_at?: string
          day_number?: number
          description?: string | null
          id?: string
          step_order?: number
          template_content?: string | null
          title: string
        }
        Update: {
          action_type?: string
          cadence_id?: string
          created_at?: string
          day_number?: number
          description?: string | null
          id?: string
          step_order?: number
          template_content?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "cadence_steps_cadence_id_fkey"
            columns: ["cadence_id"]
            isOneToOne: false
            referencedRelation: "cadences"
            referencedColumns: ["id"]
          },
        ]
      }
      cadence_tasks: {
        Row: {
          cadence_step_id: string
          completed_at: string | null
          created_at: string
          id: string
          notes: string | null
          prospect_cadence_id: string
          scheduled_date: string
          status: string
        }
        Insert: {
          cadence_step_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          prospect_cadence_id: string
          scheduled_date: string
          status?: string
        }
        Update: {
          cadence_step_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          prospect_cadence_id?: string
          scheduled_date?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "cadence_tasks_cadence_step_id_fkey"
            columns: ["cadence_step_id"]
            isOneToOne: false
            referencedRelation: "cadence_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cadence_tasks_prospect_cadence_id_fkey"
            columns: ["prospect_cadence_id"]
            isOneToOne: false
            referencedRelation: "prospect_cadences"
            referencedColumns: ["id"]
          },
        ]
      }
      cadences: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      category_metrics: {
        Row: {
          category: string
          created_at: string
          date: string
          id: string
          percentage: number
        }
        Insert: {
          category: string
          created_at?: string
          date: string
          id?: string
          percentage?: number
        }
        Update: {
          category?: string
          created_at?: string
          date?: string
          id?: string
          percentage?: number
        }
        Relationships: []
      }
      clients: {
        Row: {
          company: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          total_value: number
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          total_value?: number
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          total_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      daily_metrics: {
        Row: {
          avg_ticket: number
          conversion_rate: number
          created_at: string
          date: string
          id: string
          new_clients: number
          revenue: number
          revenue_goal: number
          total_sales: number
        }
        Insert: {
          avg_ticket?: number
          conversion_rate?: number
          created_at?: string
          date: string
          id?: string
          new_clients?: number
          revenue?: number
          revenue_goal?: number
          total_sales?: number
        }
        Update: {
          avg_ticket?: number
          conversion_rate?: number
          created_at?: string
          date?: string
          id?: string
          new_clients?: number
          revenue?: number
          revenue_goal?: number
          total_sales?: number
        }
        Relationships: []
      }
      deal_outcomes: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          outcome: string
          reason: string
          sale_id: string | null
          salesperson_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          outcome: string
          reason: string
          sale_id?: string | null
          salesperson_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          outcome?: string
          reason?: string
          sale_id?: string | null
          salesperson_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_outcomes_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_outcomes_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_stage_history: {
        Row: {
          entered_at: string
          exited_at: string | null
          id: string
          sale_id: string | null
          stage: string
        }
        Insert: {
          entered_at?: string
          exited_at?: string | null
          id?: string
          sale_id?: string | null
          stage: string
        }
        Update: {
          entered_at?: string
          exited_at?: string | null
          id?: string
          sale_id?: string | null
          stage?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_stage_history_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_scores: {
        Row: {
          calculated_at: string
          created_at: string
          factors: Json
          id: string
          sale_id: string
          score: number
          updated_at: string
        }
        Insert: {
          calculated_at?: string
          created_at?: string
          factors?: Json
          id?: string
          sale_id: string
          score?: number
          updated_at?: string
        }
        Update: {
          calculated_at?: string
          created_at?: string
          factors?: Json
          id?: string
          sale_id?: string
          score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_scores_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: true
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string
          email: string
          frequency: string
          id: string
          inactive_threshold_days: number
          is_active: boolean
          notify_at_risk_goals: boolean
          notify_inactive_clients: boolean
          notify_stagnant_deals: boolean
          preferred_time: string
          stagnant_threshold_days: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          frequency?: string
          id?: string
          inactive_threshold_days?: number
          is_active?: boolean
          notify_at_risk_goals?: boolean
          notify_inactive_clients?: boolean
          notify_stagnant_deals?: boolean
          preferred_time?: string
          stagnant_threshold_days?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          frequency?: string
          id?: string
          inactive_threshold_days?: number
          is_active?: boolean
          notify_at_risk_goals?: boolean
          notify_inactive_clients?: boolean
          notify_stagnant_deals?: boolean
          preferred_time?: string
          stagnant_threshold_days?: number
          updated_at?: string
        }
        Relationships: []
      }
      objections_library: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          effectiveness_score: number | null
          id: string
          objection: string
          response: string
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          effectiveness_score?: number | null
          id?: string
          objection: string
          response: string
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          effectiveness_score?: number | null
          id?: string
          objection?: string
          response?: string
          updated_at?: string
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "objections_library_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
        ]
      }
      playbook_items: {
        Row: {
          content: string
          created_at: string
          id: string
          is_required: boolean
          item_order: number
          item_type: string
          playbook_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_required?: boolean
          item_order?: number
          item_type?: string
          playbook_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_required?: boolean
          item_order?: number
          item_type?: string
          playbook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playbook_items_playbook_id_fkey"
            columns: ["playbook_id"]
            isOneToOne: false
            referencedRelation: "playbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      playbook_progress: {
        Row: {
          completed_at: string
          completed_by: string | null
          id: string
          playbook_item_id: string
          sale_id: string
        }
        Insert: {
          completed_at?: string
          completed_by?: string | null
          id?: string
          playbook_item_id: string
          sale_id: string
        }
        Update: {
          completed_at?: string
          completed_by?: string | null
          id?: string
          playbook_item_id?: string
          sale_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playbook_progress_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playbook_progress_playbook_item_id_fkey"
            columns: ["playbook_item_id"]
            isOneToOne: false
            referencedRelation: "playbook_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playbook_progress_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      playbooks: {
        Row: {
          created_at: string
          description: string | null
          id: string
          stage: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          stage: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          stage?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          created_at: string
          id: string
          name: string
          price: number
          rating: number
          sales_count: number
          status: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          name: string
          price?: number
          rating?: number
          sales_count?: number
          status?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          name?: string
          price?: number
          rating?: number
          sales_count?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      prospect_cadences: {
        Row: {
          cadence_id: string
          completed_at: string | null
          created_at: string
          current_step: number
          id: string
          next_action_date: string | null
          sale_id: string
          salesperson_id: string | null
          started_at: string
          status: string
          updated_at: string
        }
        Insert: {
          cadence_id: string
          completed_at?: string | null
          created_at?: string
          current_step?: number
          id?: string
          next_action_date?: string | null
          sale_id: string
          salesperson_id?: string | null
          started_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          cadence_id?: string
          completed_at?: string | null
          created_at?: string
          current_step?: number
          id?: string
          next_action_date?: string | null
          sale_id?: string
          salesperson_id?: string | null
          started_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prospect_cadences_cadence_id_fkey"
            columns: ["cadence_id"]
            isOneToOne: false
            referencedRelation: "cadences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospect_cadences_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospect_cadences_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          amount: number
          category: string
          client_name: string
          created_at: string
          id: string
          product_name: string
          salesperson_id: string | null
          source: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          category?: string
          client_name: string
          created_at?: string
          id?: string
          product_name: string
          salesperson_id?: string | null
          source?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          client_name?: string
          created_at?: string
          id?: string
          product_name?: string
          salesperson_id?: string | null
          source?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_goals: {
        Row: {
          created_at: string
          goal_amount: number
          id: string
          month: string
          salesperson_id: string
        }
        Insert: {
          created_at?: string
          goal_amount?: number
          id?: string
          month: string
          salesperson_id: string
        }
        Update: {
          created_at?: string
          goal_amount?: number
          id?: string
          month?: string
          salesperson_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_goals_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
        ]
      }
      salespeople: {
        Row: {
          auth_user_id: string | null
          avatar_url: string | null
          commission_rate: number
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          role: Database["public"]["Enums"]["salesperson_role"]
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          avatar_url?: string | null
          commission_rate?: number
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          role?: Database["public"]["Enums"]["salesperson_role"]
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          avatar_url?: string | null
          commission_rate?: number
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          role?: Database["public"]["Enums"]["salesperson_role"]
          updated_at?: string
        }
        Relationships: []
      }
      salesperson_xp: {
        Row: {
          created_at: string
          current_level: number
          id: string
          salesperson_id: string
          total_xp: number
          updated_at: string
          xp_to_next_level: number
        }
        Insert: {
          created_at?: string
          current_level?: number
          id?: string
          salesperson_id: string
          total_xp?: number
          updated_at?: string
          xp_to_next_level?: number
        }
        Update: {
          created_at?: string
          current_level?: number
          id?: string
          salesperson_id?: string
          total_xp?: number
          updated_at?: string
          xp_to_next_level?: number
        }
        Relationships: [
          {
            foreignKeyName: "salesperson_xp_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: true
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string
          due_time: string | null
          id: string
          priority: Database["public"]["Enums"]["task_priority"]
          sale_id: string | null
          salesperson_id: string | null
          status: Database["public"]["Enums"]["task_status"]
          task_type: Database["public"]["Enums"]["task_type"]
          title: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string
          due_time?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          sale_id?: string | null
          salesperson_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          task_type?: Database["public"]["Enums"]["task_type"]
          title: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string
          due_time?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          sale_id?: string | null
          salesperson_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          task_type?: Database["public"]["Enums"]["task_type"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      xp_history: {
        Row: {
          created_at: string
          description: string | null
          id: string
          salesperson_id: string
          source_id: string | null
          source_type: string
          xp_amount: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          salesperson_id: string
          source_id?: string | null
          source_type: string
          xp_amount: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          salesperson_id?: string
          source_id?: string | null
          source_type?: string
          xp_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "xp_history_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_salesperson_id: { Args: never; Returns: string }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_or_manager: { Args: { _user_id: string }; Returns: boolean }
      is_authenticated: { Args: never; Returns: boolean }
    }
    Enums: {
      activity_outcome:
        | "connected"
        | "no_answer"
        | "scheduled"
        | "voicemail"
        | "busy"
        | "callback"
        | "not_interested"
        | "qualified"
      activity_type:
        | "call"
        | "email"
        | "meeting"
        | "linkedin"
        | "whatsapp"
        | "other"
      app_role: "admin" | "manager" | "salesperson"
      salesperson_role: "sdr" | "closer" | "hybrid"
      task_priority: "high" | "medium" | "low"
      task_status: "pending" | "in_progress" | "completed" | "cancelled"
      task_type:
        | "call"
        | "meeting"
        | "follow_up"
        | "email"
        | "proposal"
        | "other"
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
      activity_outcome: [
        "connected",
        "no_answer",
        "scheduled",
        "voicemail",
        "busy",
        "callback",
        "not_interested",
        "qualified",
      ],
      activity_type: [
        "call",
        "email",
        "meeting",
        "linkedin",
        "whatsapp",
        "other",
      ],
      app_role: ["admin", "manager", "salesperson"],
      salesperson_role: ["sdr", "closer", "hybrid"],
      task_priority: ["high", "medium", "low"],
      task_status: ["pending", "in_progress", "completed", "cancelled"],
      task_type: ["call", "meeting", "follow_up", "email", "proposal", "other"],
    },
  },
} as const
