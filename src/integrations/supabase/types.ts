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
      access_denied_logs: {
        Row: {
          attempted_path: string
          created_at: string
          id: string
          ip_address: string | null
          required_role: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string
          user_role: string | null
        }
        Insert: {
          attempted_path: string
          created_at?: string
          id?: string
          ip_address?: string | null
          required_role?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id: string
          user_role?: string | null
        }
        Update: {
          attempted_path?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          required_role?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string
          user_role?: string | null
        }
        Relationships: []
      }
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
      bitrix24_sync_logs: {
        Row: {
          companies_from_bitrix: number | null
          companies_to_bitrix: number | null
          created_at: string
          deals_from_bitrix: number | null
          deals_to_bitrix: number | null
          duration_ms: number | null
          error_message: string | null
          id: string
          status: string
          sync_type: string
          triggered_by: string | null
        }
        Insert: {
          companies_from_bitrix?: number | null
          companies_to_bitrix?: number | null
          created_at?: string
          deals_from_bitrix?: number | null
          deals_to_bitrix?: number | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          status?: string
          sync_type?: string
          triggered_by?: string | null
        }
        Update: {
          companies_from_bitrix?: number | null
          companies_to_bitrix?: number | null
          created_at?: string
          deals_from_bitrix?: number | null
          deals_to_bitrix?: number | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          status?: string
          sync_type?: string
          triggered_by?: string | null
        }
        Relationships: []
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
      challenge_progress: {
        Row: {
          challenge_id: string
          completed_at: string | null
          created_at: string
          current_value: number
          id: string
          salesperson_id: string
          updated_at: string
          xp_claimed: boolean
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          created_at?: string
          current_value?: number
          id?: string
          salesperson_id: string
          updated_at?: string
          xp_claimed?: boolean
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          created_at?: string
          current_value?: number
          id?: string
          salesperson_id?: string
          updated_at?: string
          xp_claimed?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "weekly_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_progress_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          salesperson_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          salesperson_id: string
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          salesperson_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_conversations_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      circuit_breaker_events: {
        Row: {
          circuit_name: string
          created_at: string
          details: Json | null
          event_type: string
          failure_count: number | null
          id: string
          new_state: string | null
          previous_state: string | null
        }
        Insert: {
          circuit_name: string
          created_at?: string
          details?: Json | null
          event_type: string
          failure_count?: number | null
          id?: string
          new_state?: string | null
          previous_state?: string | null
        }
        Update: {
          circuit_name?: string
          created_at?: string
          details?: Json | null
          event_type?: string
          failure_count?: number | null
          id?: string
          new_state?: string | null
          previous_state?: string | null
        }
        Relationships: []
      }
      client_portfolio: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          client_id: string
          created_at: string
          id: string
          last_purchase_date: string | null
          salesperson_id: string
          source: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          client_id: string
          created_at?: string
          id?: string
          last_purchase_date?: string | null
          salesperson_id: string
          source?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          client_id?: string
          created_at?: string
          id?: string
          last_purchase_date?: string | null
          salesperson_id?: string
          source?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_portfolio_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_portfolio_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_portfolio_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
        ]
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
      daily_challenge_progress: {
        Row: {
          challenge_id: string
          completed_at: string | null
          created_at: string
          current_value: number
          id: string
          salesperson_id: string
          updated_at: string
          xp_claimed: boolean
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          created_at?: string
          current_value?: number
          id?: string
          salesperson_id: string
          updated_at?: string
          xp_claimed?: boolean
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          created_at?: string
          current_value?: number
          id?: string
          salesperson_id?: string
          updated_at?: string
          xp_claimed?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "daily_challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "daily_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_challenge_progress_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_challenges: {
        Row: {
          challenge_date: string
          challenge_type: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          target_value: number
          title: string
          updated_at: string
          xp_reward: number
        }
        Insert: {
          challenge_date?: string
          challenge_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          target_value?: number
          title: string
          updated_at?: string
          xp_reward?: number
        }
        Update: {
          challenge_date?: string
          challenge_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          target_value?: number
          title?: string
          updated_at?: string
          xp_reward?: number
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
      daily_streak_achievements: {
        Row: {
          achieved_at: string
          created_at: string
          id: string
          salesperson_id: string
          streak_count: number
          streak_type: string
          xp_awarded: number
        }
        Insert: {
          achieved_at?: string
          created_at?: string
          id?: string
          salesperson_id: string
          streak_count: number
          streak_type: string
          xp_awarded?: number
        }
        Update: {
          achieved_at?: string
          created_at?: string
          id?: string
          salesperson_id?: string
          streak_count?: number
          streak_type?: string
          xp_awarded?: number
        }
        Relationships: [
          {
            foreignKeyName: "daily_streak_achievements_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_chat_history: {
        Row: {
          created_at: string
          deal_id: string
          id: string
          question: string
          question_type: string
          response: string | null
          salesperson_id: string | null
        }
        Insert: {
          created_at?: string
          deal_id: string
          id?: string
          question: string
          question_type?: string
          response?: string | null
          salesperson_id?: string | null
        }
        Update: {
          created_at?: string
          deal_id?: string
          id?: string
          question?: string
          question_type?: string
          response?: string | null
          salesperson_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_chat_history_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_chat_history_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
        ]
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
      demand_forecasts: {
        Row: {
          confidence_score: number | null
          created_at: string
          factors: Json | null
          forecast_date: string
          id: string
          model_version: string | null
          predicted_quantity: number
          predicted_revenue: number
          product_id: string | null
          updated_at: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          factors?: Json | null
          forecast_date: string
          id?: string
          model_version?: string | null
          predicted_quantity?: number
          predicted_revenue?: number
          product_id?: string | null
          updated_at?: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          factors?: Json | null
          forecast_date?: string
          id?: string
          model_version?: string | null
          predicted_quantity?: number
          predicted_revenue?: number
          product_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "demand_forecasts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          created_at: string
          error_message: string | null
          function_name: string
          id: string
          metadata: Json | null
          recipient_email: string
          status: string
          subject: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          function_name: string
          id?: string
          metadata?: Json | null
          recipient_email: string
          status?: string
          subject?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          function_name?: string
          id?: string
          metadata?: Json | null
          recipient_email?: string
          status?: string
          subject?: string | null
        }
        Relationships: []
      }
      icp_data: {
        Row: {
          bitrix_id: string | null
          capital_social: number | null
          client_id: string
          created_at: string
          grupo_nicho: string | null
          id: string
          is_icp_match: boolean | null
          num_colaboradores: number | null
          ramo_atividade: string | null
          updated_at: string
        }
        Insert: {
          bitrix_id?: string | null
          capital_social?: number | null
          client_id: string
          created_at?: string
          grupo_nicho?: string | null
          id?: string
          is_icp_match?: boolean | null
          num_colaboradores?: number | null
          ramo_atividade?: string | null
          updated_at?: string
        }
        Update: {
          bitrix_id?: string | null
          capital_social?: number | null
          client_id?: string
          created_at?: string
          grupo_nicho?: string | null
          id?: string
          is_icp_match?: boolean | null
          num_colaboradores?: number | null
          ramo_atividade?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "icp_data_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_levels: {
        Row: {
          created_at: string
          current_stock: number
          id: string
          last_restock_date: string | null
          lead_time_days: number | null
          max_stock_level: number
          min_stock_level: number
          product_id: string | null
          reorder_point: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_stock?: number
          id?: string
          last_restock_date?: string | null
          lead_time_days?: number | null
          max_stock_level?: number
          min_stock_level?: number
          product_id?: string | null
          reorder_point?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_stock?: number
          id?: string
          last_restock_date?: string | null
          lead_time_days?: number | null
          max_stock_level?: number
          min_stock_level?: number
          product_id?: string | null
          reorder_point?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_levels_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_routing_log: {
        Row: {
          client_id: string | null
          created_at: string
          from_salesperson_id: string | null
          id: string
          notes: string | null
          routing_reason: string
          to_salesperson_id: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          from_salesperson_id?: string | null
          id?: string
          notes?: string | null
          routing_reason: string
          to_salesperson_id?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          from_salesperson_id?: string | null
          id?: string
          notes?: string | null
          routing_reason?: string
          to_salesperson_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_routing_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_routing_log_from_salesperson_id_fkey"
            columns: ["from_salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_routing_log_to_salesperson_id_fkey"
            columns: ["to_salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
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
          consecutive_days_threshold: number
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
          consecutive_days_threshold?: number
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
          consecutive_days_threshold?: number
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
      portfolio_settings: {
        Row: {
          description: string | null
          id: string
          setting_key: string
          setting_value: string
          updated_at: string
        }
        Insert: {
          description?: string | null
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string
        }
        Update: {
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: string
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
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      sdr_alert_history: {
        Row: {
          admin_emails: string[]
          created_at: string
          id: string
          sdr_details: Json
          sdrs_notified: number
          threshold_used: number
          triggered_by: string | null
        }
        Insert: {
          admin_emails?: string[]
          created_at?: string
          id?: string
          sdr_details?: Json
          sdrs_notified?: number
          threshold_used?: number
          triggered_by?: string | null
        }
        Update: {
          admin_emails?: string[]
          created_at?: string
          id?: string
          sdr_details?: Json
          sdrs_notified?: number
          threshold_used?: number
          triggered_by?: string | null
        }
        Relationships: []
      }
      security_alert_history: {
        Row: {
          access_count: number
          alert_type: string
          created_at: string
          id: string
          recipients: string[]
          threshold_used: number
          time_window_hours: number
        }
        Insert: {
          access_count: number
          alert_type?: string
          created_at?: string
          id?: string
          recipients: string[]
          threshold_used: number
          time_window_hours: number
        }
        Update: {
          access_count?: number
          alert_type?: string
          created_at?: string
          id?: string
          recipients?: string[]
          threshold_used?: number
          time_window_hours?: number
        }
        Relationships: []
      }
      security_alert_settings: {
        Row: {
          cooldown_hours: number
          created_at: string
          id: string
          spike_threshold: number
          time_window_hours: number
          updated_at: string
        }
        Insert: {
          cooldown_hours?: number
          created_at?: string
          id?: string
          spike_threshold?: number
          time_window_hours?: number
          updated_at?: string
        }
        Update: {
          cooldown_hours?: number
          created_at?: string
          id?: string
          spike_threshold?: number
          time_window_hours?: number
          updated_at?: string
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          created_at: string
          id: string
          movement_type: string
          performed_by: string | null
          product_id: string | null
          quantity: number
          reason: string | null
          reference_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          movement_type: string
          performed_by?: string | null
          product_id?: string | null
          quantity: number
          reason?: string | null
          reference_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          movement_type?: string
          performed_by?: string | null
          product_id?: string | null
          quantity?: number
          reason?: string | null
          reference_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
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
      team_closers: {
        Row: {
          closer_id: string
          created_at: string
          id: string
          team_id: string
        }
        Insert: {
          closer_id: string
          created_at?: string
          id?: string
          team_id: string
        }
        Update: {
          closer_id?: string
          created_at?: string
          id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_closers_closer_id_fkey"
            columns: ["closer_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_closers_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          id: string
          inactivity_days: number
          is_active: boolean
          name: string
          sdr_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          inactivity_days?: number
          is_active?: boolean
          name: string
          sdr_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          inactivity_days?: number
          is_active?: boolean
          name?: string
          sdr_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_sdr_id_fkey"
            columns: ["sdr_id"]
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
      weekly_challenges: {
        Row: {
          challenge_type: string
          created_at: string
          description: string | null
          end_date: string
          id: string
          is_active: boolean
          start_date: string
          target_value: number
          title: string
          updated_at: string
          xp_reward: number
        }
        Insert: {
          challenge_type?: string
          created_at?: string
          description?: string | null
          end_date: string
          id?: string
          is_active?: boolean
          start_date: string
          target_value?: number
          title: string
          updated_at?: string
          xp_reward?: number
        }
        Update: {
          challenge_type?: string
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          is_active?: boolean
          start_date?: string
          target_value?: number
          title?: string
          updated_at?: string
          xp_reward?: number
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
      calculate_daily_challenge_streak: {
        Args: { p_salesperson_id: string }
        Returns: number
      }
      get_current_salesperson_id: { Args: never; Returns: string }
      get_current_user_email: { Args: never; Returns: string }
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
