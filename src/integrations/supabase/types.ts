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
      account_activities: {
        Row: {
          account_id: string
          activity_type: string
          contact_id: string | null
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          occurred_at: string
          salesperson_id: string | null
          title: string
        }
        Insert: {
          account_id: string
          activity_type: string
          contact_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          occurred_at?: string
          salesperson_id?: string | null
          title: string
        }
        Update: {
          account_id?: string
          activity_type?: string
          contact_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          occurred_at?: string
          salesperson_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_activities_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "account_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_activities_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_activities_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      account_contacts: {
        Row: {
          account_id: string
          buying_role: string
          created_at: string
          department: string | null
          email: string | null
          id: string
          influence_level: number
          job_title: string | null
          last_contacted_at: string | null
          linkedin_url: string | null
          name: string
          notes: string | null
          phone: string | null
          sentiment: string
          updated_at: string
        }
        Insert: {
          account_id: string
          buying_role?: string
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          influence_level?: number
          job_title?: string | null
          last_contacted_at?: string | null
          linkedin_url?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          sentiment?: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          buying_role?: string
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          influence_level?: number
          job_title?: string | null
          last_contacted_at?: string | null
          linkedin_url?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          sentiment?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_contacts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts: {
        Row: {
          account_score: number
          annual_revenue: number | null
          country: string | null
          created_at: string
          employee_count: number | null
          health_status: string
          id: string
          industry: string | null
          name: string
          notes: string | null
          owner_id: string | null
          parent_account_id: string | null
          tier: string
          updated_at: string
          website: string | null
        }
        Insert: {
          account_score?: number
          annual_revenue?: number | null
          country?: string | null
          created_at?: string
          employee_count?: number | null
          health_status?: string
          id?: string
          industry?: string | null
          name: string
          notes?: string | null
          owner_id?: string | null
          parent_account_id?: string | null
          tier?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          account_score?: number
          annual_revenue?: number | null
          country?: string | null
          created_at?: string
          employee_count?: number | null
          health_status?: string
          id?: string
          industry?: string | null
          name?: string
          notes?: string | null
          owner_id?: string | null
          parent_account_id?: string | null
          tier?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_parent_account_id_fkey"
            columns: ["parent_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
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
          {
            foreignKeyName: "achievements_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      active_power_ups: {
        Row: {
          activated_at: string
          expires_at: string
          id: string
          is_active: boolean
          multiplier: number
          power_up_type: string
          salesperson_id: string
          source: string | null
        }
        Insert: {
          activated_at?: string
          expires_at: string
          id?: string
          is_active?: boolean
          multiplier?: number
          power_up_type: string
          salesperson_id: string
          source?: string | null
        }
        Update: {
          activated_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          multiplier?: number
          power_up_type?: string
          salesperson_id?: string
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "active_power_ups_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "active_power_ups_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      active_sessions: {
        Row: {
          created_at: string | null
          device_info: Json | null
          expires_at: string | null
          id: string
          ip_address: string | null
          last_activity: string | null
          last_refresh_at: string | null
          max_lifetime_hours: number | null
          refresh_count: number | null
          session_token: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          last_activity?: string | null
          last_refresh_at?: string | null
          max_lifetime_hours?: number | null
          refresh_count?: number | null
          session_token?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          last_activity?: string | null
          last_refresh_at?: string | null
          max_lifetime_hours?: number | null
          refresh_count?: number | null
          session_token?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
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
          {
            foreignKeyName: "activities_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
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
          {
            foreignKeyName: "activity_goals_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: true
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      agenda_events: {
        Row: {
          client_id: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          event_type: string
          id: string
          priority: string
          reminder_minutes_before: number | null
          sale_id: string | null
          salesperson_id: string
          scheduled_at: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          priority?: string
          reminder_minutes_before?: number | null
          sale_id?: string | null
          salesperson_id: string
          scheduled_at: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          priority?: string
          reminder_minutes_before?: number | null
          sale_id?: string | null
          salesperson_id?: string
          scheduled_at?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agenda_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agenda_events_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agenda_events_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agenda_events_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      api_tokens: {
        Row: {
          company_name: string
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          is_active: boolean
          last_used_at: string | null
          team_id: string | null
          token: string
          usage_count: number
        }
        Insert: {
          company_name?: string
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          team_id?: string | null
          token: string
          usage_count?: number
        }
        Update: {
          company_name?: string
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          team_id?: string | null
          token?: string
          usage_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "api_tokens_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_decisions: {
        Row: {
          approver_id: string
          comments: string | null
          decided_at: string
          decision: string
          id: string
          level: number
          request_id: string
        }
        Insert: {
          approver_id: string
          comments?: string | null
          decided_at?: string
          decision: string
          id?: string
          level?: number
          request_id: string
        }
        Update: {
          approver_id?: string
          comments?: string | null
          decided_at?: string
          decision?: string
          id?: string
          level?: number
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_decisions_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "approval_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_requests: {
        Row: {
          created_at: string
          current_level: number
          deal_id: string | null
          deal_name: string | null
          discount_percentage: number | null
          expires_at: string | null
          id: string
          justification: string | null
          original_value: number | null
          requested_value: number
          requester_id: string
          resolved_at: string | null
          status: string
          updated_at: string
          workflow_id: string
        }
        Insert: {
          created_at?: string
          current_level?: number
          deal_id?: string | null
          deal_name?: string | null
          discount_percentage?: number | null
          expires_at?: string | null
          id?: string
          justification?: string | null
          original_value?: number | null
          requested_value: number
          requester_id: string
          resolved_at?: string | null
          status?: string
          updated_at?: string
          workflow_id: string
        }
        Update: {
          created_at?: string
          current_level?: number
          deal_id?: string | null
          deal_name?: string | null
          discount_percentage?: number | null
          expires_at?: string | null
          id?: string
          justification?: string | null
          original_value?: number | null
          requested_value?: number
          requester_id?: string
          resolved_at?: string | null
          status?: string
          updated_at?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_requests_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_requests_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "approval_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_workflows: {
        Row: {
          auto_approve_below: number | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          required_approvers: number
          threshold_amount: number | null
          threshold_percentage: number | null
          updated_at: string
          workflow_type: string
        }
        Insert: {
          auto_approve_below?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          required_approvers?: number
          threshold_amount?: number | null
          threshold_percentage?: number | null
          updated_at?: string
          workflow_type?: string
        }
        Update: {
          auto_approve_below?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          required_approvers?: number
          threshold_amount?: number | null
          threshold_percentage?: number | null
          updated_at?: string
          workflow_type?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          changes: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          changes?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          changes?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
        }
        Relationships: []
      }
      automation_runs: {
        Row: {
          actions_executed: Json | null
          completed_at: string | null
          duration_ms: number | null
          error_message: string | null
          id: string
          started_at: string
          status: string
          trigger_payload: Json | null
          workflow_id: string
        }
        Insert: {
          actions_executed?: Json | null
          completed_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          started_at?: string
          status?: string
          trigger_payload?: Json | null
          workflow_id: string
        }
        Update: {
          actions_executed?: Json | null
          completed_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          started_at?: string
          status?: string
          trigger_payload?: Json | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_runs_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "automation_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_workflows: {
        Row: {
          actions: Json
          conditions: Json
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          last_run_at: string | null
          name: string
          run_count: number
          trigger_config: Json
          trigger_type: string
          updated_at: string
        }
        Insert: {
          actions?: Json
          conditions?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          name: string
          run_count?: number
          trigger_config?: Json
          trigger_type: string
          updated_at?: string
        }
        Update: {
          actions?: Json
          conditions?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          name?: string
          run_count?: number
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      available_spins: {
        Row: {
          id: string
          salesperson_id: string
          spins_count: number
          updated_at: string
        }
        Insert: {
          id?: string
          salesperson_id: string
          spins_count?: number
          updated_at?: string
        }
        Update: {
          id?: string
          salesperson_id?: string
          spins_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "available_spins_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: true
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "available_spins_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: true
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_participants: {
        Row: {
          battle_id: string
          current_score: number
          id: string
          joined_at: string
          salesperson_id: string
          team_name: string | null
        }
        Insert: {
          battle_id: string
          current_score?: number
          id?: string
          joined_at?: string
          salesperson_id: string
          team_name?: string | null
        }
        Update: {
          battle_id?: string
          current_score?: number
          id?: string
          joined_at?: string
          salesperson_id?: string
          team_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "battle_participants_battle_id_fkey"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "sales_battles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_participants_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_participants_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
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
      blocked_ips: {
        Row: {
          block_count: number | null
          blocked_at: string | null
          blocked_by: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          ip_address: string
          is_permanent: boolean | null
          reason: string
          updated_at: string | null
        }
        Insert: {
          block_count?: number | null
          blocked_at?: string | null
          blocked_by?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          ip_address: string
          is_permanent?: boolean | null
          reason: string
          updated_at?: string | null
        }
        Update: {
          block_count?: number | null
          blocked_at?: string | null
          blocked_by?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string
          is_permanent?: boolean | null
          reason?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      cadence_ab_assignments: {
        Row: {
          ab_test_id: string
          assigned_at: string
          id: string
          prospect_cadence_id: string
          variant: string
        }
        Insert: {
          ab_test_id: string
          assigned_at?: string
          id?: string
          prospect_cadence_id: string
          variant: string
        }
        Update: {
          ab_test_id?: string
          assigned_at?: string
          id?: string
          prospect_cadence_id?: string
          variant?: string
        }
        Relationships: [
          {
            foreignKeyName: "cadence_ab_assignments_ab_test_id_fkey"
            columns: ["ab_test_id"]
            isOneToOne: false
            referencedRelation: "cadence_ab_tests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cadence_ab_assignments_prospect_cadence_id_fkey"
            columns: ["prospect_cadence_id"]
            isOneToOne: false
            referencedRelation: "prospect_cadences"
            referencedColumns: ["id"]
          },
        ]
      }
      cadence_ab_tests: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          ended_at: string | null
          hypothesis: string | null
          id: string
          name: string
          started_at: string | null
          status: string
          traffic_split: number
          updated_at: string
          variant_a_id: string
          variant_b_id: string
          winner_variant: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          ended_at?: string | null
          hypothesis?: string | null
          id?: string
          name: string
          started_at?: string | null
          status?: string
          traffic_split?: number
          updated_at?: string
          variant_a_id: string
          variant_b_id: string
          winner_variant?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          ended_at?: string | null
          hypothesis?: string | null
          id?: string
          name?: string
          started_at?: string | null
          status?: string
          traffic_split?: number
          updated_at?: string
          variant_a_id?: string
          variant_b_id?: string
          winner_variant?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cadence_ab_tests_variant_a_id_fkey"
            columns: ["variant_a_id"]
            isOneToOne: false
            referencedRelation: "cadences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cadence_ab_tests_variant_b_id_fkey"
            columns: ["variant_b_id"]
            isOneToOne: false
            referencedRelation: "cadences"
            referencedColumns: ["id"]
          },
        ]
      }
      cadence_enrollment_rules: {
        Row: {
          cadence_id: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          max_amount: number | null
          min_amount: number | null
          name: string
          priority: number
          trigger_category: string | null
          trigger_source: string | null
          trigger_stage: string | null
          updated_at: string
        }
        Insert: {
          cadence_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          max_amount?: number | null
          min_amount?: number | null
          name: string
          priority?: number
          trigger_category?: string | null
          trigger_source?: string | null
          trigger_stage?: string | null
          updated_at?: string
        }
        Update: {
          cadence_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          max_amount?: number | null
          min_amount?: number | null
          name?: string
          priority?: number
          trigger_category?: string | null
          trigger_source?: string | null
          trigger_stage?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cadence_enrollment_rules_cadence_id_fkey"
            columns: ["cadence_id"]
            isOneToOne: false
            referencedRelation: "cadences"
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
      call_insights: {
        Row: {
          ai_model: string | null
          coaching_tips: Json | null
          created_at: string
          id: string
          key_moments: Json | null
          next_steps: Json | null
          objections: Json | null
          questions_asked: number | null
          recording_id: string
          sentiment_label: string | null
          sentiment_score: number | null
          summary: string | null
          talk_ratio_client: number | null
          talk_ratio_salesperson: number | null
          topics: Json | null
        }
        Insert: {
          ai_model?: string | null
          coaching_tips?: Json | null
          created_at?: string
          id?: string
          key_moments?: Json | null
          next_steps?: Json | null
          objections?: Json | null
          questions_asked?: number | null
          recording_id: string
          sentiment_label?: string | null
          sentiment_score?: number | null
          summary?: string | null
          talk_ratio_client?: number | null
          talk_ratio_salesperson?: number | null
          topics?: Json | null
        }
        Update: {
          ai_model?: string | null
          coaching_tips?: Json | null
          created_at?: string
          id?: string
          key_moments?: Json | null
          next_steps?: Json | null
          objections?: Json | null
          questions_asked?: number | null
          recording_id?: string
          sentiment_label?: string | null
          sentiment_score?: number | null
          summary?: string | null
          talk_ratio_client?: number | null
          talk_ratio_salesperson?: number | null
          topics?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "call_insights_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "call_recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      call_recordings: {
        Row: {
          audio_url: string | null
          client_id: string | null
          created_at: string
          duration_seconds: number | null
          id: string
          metadata: Json | null
          participants: Json | null
          recorded_at: string
          sale_id: string | null
          salesperson_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          audio_url?: string | null
          client_id?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          metadata?: Json | null
          participants?: Json | null
          recorded_at?: string
          sale_id?: string | null
          salesperson_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          audio_url?: string | null
          client_id?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          metadata?: Json | null
          participants?: Json | null
          recorded_at?: string
          sale_id?: string | null
          salesperson_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_recordings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_recordings_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_recordings_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_recordings_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      call_transcripts: {
        Row: {
          created_at: string
          full_text: string
          id: string
          language: string | null
          recording_id: string
          segments: Json
          word_count: number | null
        }
        Insert: {
          created_at?: string
          full_text: string
          id?: string
          language?: string | null
          recording_id: string
          segments?: Json
          word_count?: number | null
        }
        Update: {
          created_at?: string
          full_text?: string
          id?: string
          language?: string | null
          recording_id?: string
          segments?: Json
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "call_transcripts_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "call_recordings"
            referencedColumns: ["id"]
          },
        ]
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
          {
            foreignKeyName: "challenge_progress_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_interactions: {
        Row: {
          channel: string
          contact_info: string | null
          contact_name: string
          created_at: string
          deal_id: string | null
          direction: string
          id: string
          message_preview: string | null
          metadata: Json | null
          salesperson_id: string
          status: string | null
          template_id: string | null
        }
        Insert: {
          channel?: string
          contact_info?: string | null
          contact_name: string
          created_at?: string
          deal_id?: string | null
          direction?: string
          id?: string
          message_preview?: string | null
          metadata?: Json | null
          salesperson_id: string
          status?: string | null
          template_id?: string | null
        }
        Update: {
          channel?: string
          contact_info?: string | null
          contact_name?: string
          created_at?: string
          deal_id?: string | null
          direction?: string
          id?: string
          message_preview?: string | null
          metadata?: Json | null
          salesperson_id?: string
          status?: string | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "channel_interactions_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_interactions_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_interactions_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_interactions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
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
          {
            foreignKeyName: "chat_conversations_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
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
            foreignKeyName: "client_portfolio_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
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
          {
            foreignKeyName: "client_portfolio_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
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
          lat: number | null
          lng: number | null
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
          lat?: number | null
          lng?: number | null
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
          lat?: number | null
          lng?: number | null
          name?: string
          phone?: string | null
          total_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      collectible_badges: {
        Row: {
          category: string
          created_at: string
          description: string | null
          icon: string
          id: string
          name: string
          rarity: string
          unlock_condition: string
          unlock_threshold: number
          xp_reward: number
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          name: string
          rarity?: string
          unlock_condition: string
          unlock_threshold?: number
          xp_reward?: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          name?: string
          rarity?: string
          unlock_condition?: string
          unlock_threshold?: number
          xp_reward?: number
        }
        Relationships: []
      }
      combo_tracking: {
        Row: {
          actions_count: number
          combo_date: string
          created_at: string
          current_multiplier: number
          current_tier: number
          id: string
          max_tier_today: number
          salesperson_id: string
          updated_at: string
        }
        Insert: {
          actions_count?: number
          combo_date?: string
          created_at?: string
          current_multiplier?: number
          current_tier?: number
          id?: string
          max_tier_today?: number
          salesperson_id: string
          updated_at?: string
        }
        Update: {
          actions_count?: number
          combo_date?: string
          created_at?: string
          current_multiplier?: number
          current_tier?: number
          id?: string
          max_tier_today?: number
          salesperson_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "combo_tracking_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "combo_tracking_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_rules: {
        Row: {
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          max_amount: number | null
          min_amount: number | null
          name: string
          percentage: number
          priority: number
          salesperson_id: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          max_amount?: number | null
          min_amount?: number | null
          name: string
          percentage?: number
          priority?: number
          salesperson_id?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          max_amount?: number | null
          min_amount?: number | null
          name?: string
          percentage?: number
          priority?: number
          salesperson_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commission_rules_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_rules_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      commissions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          base_amount: number
          commission_amount: number
          created_at: string
          id: string
          paid_at: string | null
          paid_by: string | null
          payment_notes: string | null
          percentage: number
          rule_id: string | null
          sale_id: string
          salesperson_id: string
          status: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          base_amount: number
          commission_amount: number
          created_at?: string
          id?: string
          paid_at?: string | null
          paid_by?: string | null
          payment_notes?: string | null
          percentage: number
          rule_id?: string | null
          sale_id: string
          salesperson_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          base_amount?: number
          commission_amount?: number
          created_at?: string
          id?: string
          paid_at?: string | null
          paid_by?: string | null
          payment_notes?: string | null
          percentage?: number
          rule_id?: string | null
          sale_id?: string
          salesperson_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "commission_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: true
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      competitive_chat_messages: {
        Row: {
          created_at: string
          id: string
          matchup_id: string | null
          message: string
          message_type: string
          reactions: Json | null
          salesperson_id: string
          target_salesperson_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          matchup_id?: string | null
          message: string
          message_type?: string
          reactions?: Json | null
          salesperson_id: string
          target_salesperson_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          matchup_id?: string | null
          message?: string
          message_type?: string
          reactions?: Json | null
          salesperson_id?: string
          target_salesperson_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competitive_chat_messages_matchup_id_fkey"
            columns: ["matchup_id"]
            isOneToOne: false
            referencedRelation: "weekly_matchups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitive_chat_messages_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitive_chat_messages_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitive_chat_messages_target_salesperson_id_fkey"
            columns: ["target_salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitive_chat_messages_target_salesperson_id_fkey"
            columns: ["target_salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      competitive_seasons: {
        Row: {
          created_at: string
          ends_at: string
          id: string
          metadata: Json | null
          name: string
          season_number: number
          starts_at: string
          status: string
          xp_multiplier: number
        }
        Insert: {
          created_at?: string
          ends_at: string
          id?: string
          metadata?: Json | null
          name: string
          season_number?: number
          starts_at: string
          status?: string
          xp_multiplier?: number
        }
        Update: {
          created_at?: string
          ends_at?: string
          id?: string
          metadata?: Json | null
          name?: string
          season_number?: number
          starts_at?: string
          status?: string
          xp_multiplier?: number
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
          {
            foreignKeyName: "daily_challenge_progress_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
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
          {
            foreignKeyName: "daily_streak_achievements_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_layouts: {
        Row: {
          created_at: string
          id: string
          layout_config: Json
          salesperson_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          layout_config?: Json
          salesperson_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          layout_config?: Json
          salesperson_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_layouts_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: true
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dashboard_layouts_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: true
            referencedRelation: "salespeople_public"
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
          {
            foreignKeyName: "deal_chat_history_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_health_scores: {
        Row: {
          ai_recommendation: string | null
          computed_at: string
          created_at: string
          health_label: string
          health_score: number
          id: string
          negative_factors: Json | null
          positive_factors: Json | null
          sale_id: string
        }
        Insert: {
          ai_recommendation?: string | null
          computed_at?: string
          created_at?: string
          health_label: string
          health_score: number
          id?: string
          negative_factors?: Json | null
          positive_factors?: Json | null
          sale_id: string
        }
        Update: {
          ai_recommendation?: string | null
          computed_at?: string
          created_at?: string
          health_label?: string
          health_score?: number
          id?: string
          negative_factors?: Json | null
          positive_factors?: Json | null
          sale_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_health_scores_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
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
          {
            foreignKeyName: "deal_outcomes_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_risk_signals: {
        Row: {
          description: string
          detected_at: string
          id: string
          metadata: Json | null
          resolved_at: string | null
          resolved_by: string | null
          sale_id: string
          severity: string
          signal_type: string
        }
        Insert: {
          description: string
          detected_at?: string
          id?: string
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          sale_id: string
          severity: string
          signal_type: string
        }
        Update: {
          description?: string
          detected_at?: string
          id?: string
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          sale_id?: string
          severity?: string
          signal_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_risk_signals_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_risk_signals_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_risk_signals_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
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
      digital_signatures: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          expires_at: string | null
          file_url: string | null
          id: string
          signed_at: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          expires_at?: string | null
          file_url?: string | null
          id?: string
          signed_at?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          expires_at?: string | null
          file_url?: string | null
          id?: string
          signed_at?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "digital_signatures_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_signatures_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      document_signers: {
        Row: {
          created_at: string
          document_id: string
          email: string
          id: string
          name: string
          sign_order: number | null
          signed_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          document_id: string
          email: string
          id?: string
          name: string
          sign_order?: number | null
          signed_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          document_id?: string
          email?: string
          id?: string
          name?: string
          sign_order?: number | null
          signed_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_signers_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "digital_signatures"
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
      email_tracking_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          recipient_email: string
          sale_id: string | null
          salesperson_id: string | null
          subject: string
          tracked_at: string
        }
        Insert: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          recipient_email: string
          sale_id?: string | null
          salesperson_id?: string | null
          subject: string
          tracked_at?: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          recipient_email?: string
          sale_id?: string | null
          salesperson_id?: string | null
          subject?: string
          tracked_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_tracking_events_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_tracking_events_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_tracking_events_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      error_logs: {
        Row: {
          category: string
          component: string | null
          created_at: string
          id: string
          message: string
          metadata: Json | null
          severity: string
          stack_trace: string | null
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          category?: string
          component?: string | null
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          severity?: string
          stack_trace?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string
          component?: string | null
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          severity?: string
          stack_trace?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          allowed_roles: string[] | null
          created_at: string
          description: string | null
          id: string
          is_enabled: boolean
          key: string
          metadata: Json | null
          rollout_percentage: number
          updated_at: string
        }
        Insert: {
          allowed_roles?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          is_enabled?: boolean
          key: string
          metadata?: Json | null
          rollout_percentage?: number
          updated_at?: string
        }
        Update: {
          allowed_roles?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          is_enabled?: boolean
          key?: string
          metadata?: Json | null
          rollout_percentage?: number
          updated_at?: string
        }
        Relationships: []
      }
      feed_comments: {
        Row: {
          content: string
          created_at: string
          feed_item_id: string
          id: string
          salesperson_id: string
        }
        Insert: {
          content: string
          created_at?: string
          feed_item_id: string
          id?: string
          salesperson_id: string
        }
        Update: {
          content?: string
          created_at?: string
          feed_item_id?: string
          id?: string
          salesperson_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_comments_feed_item_id_fkey"
            columns: ["feed_item_id"]
            isOneToOne: false
            referencedRelation: "victory_feed"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_comments_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_comments_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_reactions: {
        Row: {
          created_at: string
          feed_item_id: string
          id: string
          reaction: string
          salesperson_id: string
        }
        Insert: {
          created_at?: string
          feed_item_id: string
          id?: string
          reaction?: string
          salesperson_id: string
        }
        Update: {
          created_at?: string
          feed_item_id?: string
          id?: string
          reaction?: string
          salesperson_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_reactions_feed_item_id_fkey"
            columns: ["feed_item_id"]
            isOneToOne: false
            referencedRelation: "victory_feed"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_reactions_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_reactions_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      geo_access_logs: {
        Row: {
          attempted_path: string | null
          blocked: boolean | null
          city: string | null
          country_code: string | null
          country_name: string | null
          created_at: string
          id: string
          ip_address: string
          region: string | null
          user_agent: string | null
        }
        Insert: {
          attempted_path?: string | null
          blocked?: boolean | null
          city?: string | null
          country_code?: string | null
          country_name?: string | null
          created_at?: string
          id?: string
          ip_address: string
          region?: string | null
          user_agent?: string | null
        }
        Update: {
          attempted_path?: string | null
          blocked?: boolean | null
          city?: string | null
          country_code?: string | null
          country_name?: string | null
          created_at?: string
          id?: string
          ip_address?: string
          region?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      geo_blocked_regions: {
        Row: {
          blocked_at: string | null
          blocked_by: string | null
          country_code: string
          country_name: string
          created_at: string
          id: string
          is_active: boolean | null
          reason: string | null
          updated_at: string
        }
        Insert: {
          blocked_at?: string | null
          blocked_by?: string | null
          country_code: string
          country_name: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          reason?: string | null
          updated_at?: string
        }
        Update: {
          blocked_at?: string | null
          blocked_by?: string | null
          country_code?: string
          country_name?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          reason?: string | null
          updated_at?: string
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
      ip_whitelist: {
        Row: {
          added_by: string | null
          created_at: string | null
          description: string | null
          id: string
          ip_address: string
          updated_at: string | null
        }
        Insert: {
          added_by?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          ip_address: string
          updated_at?: string | null
        }
        Update: {
          added_by?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          ip_address?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      known_devices: {
        Row: {
          browser: string | null
          created_at: string | null
          device_fingerprint: string
          device_name: string | null
          first_seen_at: string | null
          id: string
          ip_address: string | null
          is_trusted: boolean | null
          last_seen_at: string | null
          location: string | null
          os: string | null
          user_id: string
        }
        Insert: {
          browser?: string | null
          created_at?: string | null
          device_fingerprint: string
          device_name?: string | null
          first_seen_at?: string | null
          id?: string
          ip_address?: string | null
          is_trusted?: boolean | null
          last_seen_at?: string | null
          location?: string | null
          os?: string | null
          user_id: string
        }
        Update: {
          browser?: string | null
          created_at?: string | null
          device_fingerprint?: string
          device_name?: string | null
          first_seen_at?: string | null
          id?: string
          ip_address?: string | null
          is_trusted?: boolean | null
          last_seen_at?: string | null
          location?: string | null
          os?: string | null
          user_id?: string
        }
        Relationships: []
      }
      kudos: {
        Row: {
          created_at: string
          from_salesperson_id: string
          id: string
          is_pinned: boolean
          kudos_type: string
          message: string
          to_salesperson_id: string
        }
        Insert: {
          created_at?: string
          from_salesperson_id: string
          id?: string
          is_pinned?: boolean
          kudos_type?: string
          message: string
          to_salesperson_id: string
        }
        Update: {
          created_at?: string
          from_salesperson_id?: string
          id?: string
          is_pinned?: boolean
          kudos_type?: string
          message?: string
          to_salesperson_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kudos_from_salesperson_id_fkey"
            columns: ["from_salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kudos_from_salesperson_id_fkey"
            columns: ["from_salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kudos_to_salesperson_id_fkey"
            columns: ["to_salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kudos_to_salesperson_id_fkey"
            columns: ["to_salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_assignments: {
        Row: {
          assigned_at: string
          id: string
          metadata: Json | null
          rule_id: string | null
          sale_id: string
          salesperson_id: string
          strategy_used: string
        }
        Insert: {
          assigned_at?: string
          id?: string
          metadata?: Json | null
          rule_id?: string | null
          sale_id: string
          salesperson_id: string
          strategy_used: string
        }
        Update: {
          assigned_at?: string
          id?: string
          metadata?: Json | null
          rule_id?: string | null
          sale_id?: string
          salesperson_id?: string
          strategy_used?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_assignments_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "lead_routing_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_assignments_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_assignments_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_assignments_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
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
            foreignKeyName: "lead_routing_log_from_salesperson_id_fkey"
            columns: ["from_salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_routing_log_to_salesperson_id_fkey"
            columns: ["to_salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_routing_log_to_salesperson_id_fkey"
            columns: ["to_salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_routing_rules: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          filter_min_value: number | null
          filter_role: string | null
          filter_source: string | null
          filter_state: string | null
          id: string
          is_active: boolean
          name: string
          priority: number
          strategy: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          filter_min_value?: number | null
          filter_role?: string | null
          filter_source?: string | null
          filter_state?: string | null
          id?: string
          is_active?: boolean
          name: string
          priority?: number
          strategy?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          filter_min_value?: number | null
          filter_role?: string | null
          filter_source?: string | null
          filter_state?: string | null
          id?: string
          is_active?: boolean
          name?: string
          priority?: number
          strategy?: string
          updated_at?: string
        }
        Relationships: []
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
      league_members: {
        Row: {
          id: string
          joined_at: string
          league_id: string
          salesperson_id: string
          updated_at: string
          weekly_xp: number
        }
        Insert: {
          id?: string
          joined_at?: string
          league_id: string
          salesperson_id: string
          updated_at?: string
          weekly_xp?: number
        }
        Update: {
          id?: string
          joined_at?: string
          league_id?: string
          salesperson_id?: string
          updated_at?: string
          weekly_xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "league_members_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "league_members_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: true
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "league_members_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: true
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      leagues: {
        Row: {
          color: string
          created_at: string
          demotion_slots: number
          icon: string
          id: string
          min_xp: number
          name: string
          promotion_slots: number
          tier: number
          xp_bonus_percent: number
        }
        Insert: {
          color?: string
          created_at?: string
          demotion_slots?: number
          icon?: string
          id?: string
          min_xp?: number
          name: string
          promotion_slots?: number
          tier?: number
          xp_bonus_percent?: number
        }
        Update: {
          color?: string
          created_at?: string
          demotion_slots?: number
          icon?: string
          id?: string
          min_xp?: number
          name?: string
          promotion_slots?: number
          tier?: number
          xp_bonus_percent?: number
        }
        Relationships: []
      }
      login_alerts: {
        Row: {
          acknowledged: boolean | null
          acknowledged_at: string | null
          alert_type: string | null
          browser: string | null
          created_at: string | null
          device_fingerprint: string
          email_sent: boolean | null
          email_sent_at: string | null
          id: string
          ip_address: string | null
          location: string | null
          os: string | null
          user_id: string
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          alert_type?: string | null
          browser?: string | null
          created_at?: string | null
          device_fingerprint: string
          email_sent?: boolean | null
          email_sent_at?: string | null
          id?: string
          ip_address?: string | null
          location?: string | null
          os?: string | null
          user_id: string
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          alert_type?: string | null
          browser?: string | null
          created_at?: string | null
          device_fingerprint?: string
          email_sent?: boolean | null
          email_sent_at?: string | null
          id?: string
          ip_address?: string | null
          location?: string | null
          os?: string | null
          user_id?: string
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          created_at: string | null
          email: string
          failure_reason: string | null
          id: string
          ip_address: string | null
          success: boolean | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          failure_reason?: string | null
          id?: string
          ip_address?: string | null
          success?: boolean | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          failure_reason?: string | null
          id?: string
          ip_address?: string | null
          success?: boolean | null
          user_agent?: string | null
        }
        Relationships: []
      }
      message_templates: {
        Row: {
          body: string
          category: string | null
          channel: string
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          pipeline_stage: string | null
          salesperson_id: string
          subject: string | null
          updated_at: string
          usage_count: number | null
          variables: string[] | null
        }
        Insert: {
          body: string
          category?: string | null
          channel?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          pipeline_stage?: string | null
          salesperson_id: string
          subject?: string | null
          updated_at?: string
          usage_count?: number | null
          variables?: string[] | null
        }
        Update: {
          body?: string
          category?: string | null
          channel?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          pipeline_stage?: string | null
          salesperson_id?: string
          subject?: string | null
          updated_at?: string
          usage_count?: number | null
          variables?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "message_templates_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_templates_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      mfa_verification_attempts: {
        Row: {
          created_at: string | null
          id: string
          ip_address: string | null
          method: string
          success: boolean | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          method: string
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          method?: string
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      mood_entries: {
        Row: {
          created_at: string
          entry_date: string
          id: string
          mood_value: number
          salesperson_id: string
        }
        Insert: {
          created_at?: string
          entry_date?: string
          id?: string
          mood_value: number
          salesperson_id: string
        }
        Update: {
          created_at?: string
          entry_date?: string
          id?: string
          mood_value?: number
          salesperson_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mood_entries_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mood_entries_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
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
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
        }
        Relationships: []
      }
      nps_surveys: {
        Row: {
          client_name: string
          comment: string | null
          created_at: string
          id: string
          responded_at: string | null
          sale_id: string | null
          salesperson_id: string | null
          score: number | null
          sent_at: string | null
          status: string
          survey_type: string
        }
        Insert: {
          client_name: string
          comment?: string | null
          created_at?: string
          id?: string
          responded_at?: string | null
          sale_id?: string | null
          salesperson_id?: string | null
          score?: number | null
          sent_at?: string | null
          status?: string
          survey_type?: string
        }
        Update: {
          client_name?: string
          comment?: string | null
          created_at?: string
          id?: string
          responded_at?: string | null
          sale_id?: string | null
          salesperson_id?: string | null
          score?: number | null
          sent_at?: string | null
          status?: string
          survey_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "nps_surveys_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nps_surveys_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nps_surveys_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
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
          {
            foreignKeyName: "objections_library_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      page_analytics: {
        Row: {
          created_at: string
          device_type: string | null
          duration_seconds: number | null
          entered_at: string
          exited_at: string | null
          id: string
          interactions: number | null
          page_title: string | null
          referrer_route: string | null
          route: string
          salesperson_id: string | null
          session_id: string | null
        }
        Insert: {
          created_at?: string
          device_type?: string | null
          duration_seconds?: number | null
          entered_at?: string
          exited_at?: string | null
          id?: string
          interactions?: number | null
          page_title?: string | null
          referrer_route?: string | null
          route: string
          salesperson_id?: string | null
          session_id?: string | null
        }
        Update: {
          created_at?: string
          device_type?: string | null
          duration_seconds?: number | null
          entered_at?: string
          exited_at?: string | null
          id?: string
          interactions?: number | null
          page_title?: string | null
          referrer_route?: string | null
          route?: string
          salesperson_id?: string | null
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "page_analytics_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "page_analytics_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      password_reset_requests: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          ip_address: string | null
          rejection_reason: string | null
          requested_at: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_agent: string | null
          user_email: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          rejection_reason?: string | null
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_agent?: string | null
          user_email: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          rejection_reason?: string | null
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_agent?: string | null
          user_email?: string
          user_id?: string | null
        }
        Relationships: []
      }
      performance_bets: {
        Row: {
          bet_type: string
          created_at: string
          current_value: number
          description: string | null
          ends_at: string
          id: string
          resolved_at: string | null
          salesperson_id: string
          starts_at: string
          status: string
          target_value: number
          xp_multiplier: number
          xp_wagered: number
        }
        Insert: {
          bet_type: string
          created_at?: string
          current_value?: number
          description?: string | null
          ends_at: string
          id?: string
          resolved_at?: string | null
          salesperson_id: string
          starts_at?: string
          status?: string
          target_value: number
          xp_multiplier?: number
          xp_wagered?: number
        }
        Update: {
          bet_type?: string
          created_at?: string
          current_value?: number
          description?: string | null
          ends_at?: string
          id?: string
          resolved_at?: string | null
          salesperson_id?: string
          starts_at?: string
          status?: string
          target_value?: number
          xp_multiplier?: number
          xp_wagered?: number
        }
        Relationships: [
          {
            foreignKeyName: "performance_bets_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_bets_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          action: string
          created_at: string
          description: string | null
          id: string
          name: string
          resource: string
        }
        Insert: {
          action: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          resource: string
        }
        Update: {
          action?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          resource?: string
        }
        Relationships: []
      }
      pipeline_stages: {
        Row: {
          color: string
          created_at: string
          id: string
          is_final: boolean
          label: string
          name: string
          pipeline_id: string
          probability: number
          stage_order: number
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          is_final?: boolean
          label: string
          name: string
          pipeline_id: string
          probability?: number
          stage_order?: number
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          is_final?: boolean
          label?: string
          name?: string
          pipeline_id?: string
          probability?: number
          stage_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_stages_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
        ]
      }
      pipelines: {
        Row: {
          color: string
          created_at: string
          description: string | null
          display_order: number
          icon: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
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
            foreignKeyName: "playbook_progress_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
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
      price_alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          is_read: boolean
          new_price: number
          old_price: number | null
          price_change_percent: number | null
          product_id: string | null
          supplier_id: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          is_read?: boolean
          new_price: number
          old_price?: number | null
          price_change_percent?: number | null
          product_id?: string | null
          supplier_id?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          is_read?: boolean
          new_price?: number
          old_price?: number | null
          price_change_percent?: number | null
          product_id?: string | null
          supplier_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_alerts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_alerts_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      price_history: {
        Row: {
          created_at: string
          id: string
          new_price: number
          old_price: number
          price_change_percent: number | null
          product_id: string | null
          recorded_at: string
          supplier_id: string | null
          supplier_product_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          new_price: number
          old_price: number
          price_change_percent?: number | null
          product_id?: string | null
          recorded_at?: string
          supplier_id?: string | null
          supplier_product_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          new_price?: number
          old_price?: number
          price_change_percent?: number | null
          product_id?: string | null
          recorded_at?: string
          supplier_id?: string | null
          supplier_product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_history_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_history_supplier_product_id_fkey"
            columns: ["supplier_product_id"]
            isOneToOne: false
            referencedRelation: "supplier_products"
            referencedColumns: ["id"]
          },
        ]
      }
      prize_wheel_spins: {
        Row: {
          id: string
          prize_label: string
          prize_type: string
          prize_value: number
          salesperson_id: string
          spun_at: string
          trigger_type: string
        }
        Insert: {
          id?: string
          prize_label: string
          prize_type: string
          prize_value?: number
          salesperson_id: string
          spun_at?: string
          trigger_type?: string
        }
        Update: {
          id?: string
          prize_label?: string
          prize_type?: string
          prize_value?: number
          salesperson_id?: string
          spun_at?: string
          trigger_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "prize_wheel_spins_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prize_wheel_spins_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
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
      progressive_goals: {
        Row: {
          completed_levels: number
          created_at: string
          current_level: number
          current_progress: number
          current_target: number
          goal_type: string
          id: string
          multiplier: number
          salesperson_id: string
          total_xp_earned: number
          updated_at: string
        }
        Insert: {
          completed_levels?: number
          created_at?: string
          current_level?: number
          current_progress?: number
          current_target?: number
          goal_type?: string
          id?: string
          multiplier?: number
          salesperson_id: string
          total_xp_earned?: number
          updated_at?: string
        }
        Update: {
          completed_levels?: number
          created_at?: string
          current_level?: number
          current_progress?: number
          current_target?: number
          goal_type?: string
          id?: string
          multiplier?: number
          salesperson_id?: string
          total_xp_earned?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "progressive_goals_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progressive_goals_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      prospect_cadences: {
        Row: {
          cadence_id: string
          completed_at: string | null
          created_at: string
          current_step: number
          enrolled_via_rule_id: string | null
          enrollment_source: string
          id: string
          next_action_date: string | null
          paused_at: string | null
          paused_reason: string | null
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
          enrolled_via_rule_id?: string | null
          enrollment_source?: string
          id?: string
          next_action_date?: string | null
          paused_at?: string | null
          paused_reason?: string | null
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
          enrolled_via_rule_id?: string | null
          enrollment_source?: string
          id?: string
          next_action_date?: string | null
          paused_at?: string | null
          paused_reason?: string | null
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
            foreignKeyName: "prospect_cadences_enrolled_via_rule_id_fkey"
            columns: ["enrolled_via_rule_id"]
            isOneToOne: false
            referencedRelation: "cadence_enrollment_rules"
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
          {
            foreignKeyName: "prospect_cadences_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
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
      query_telemetry: {
        Row: {
          count_mode: string | null
          created_at: string
          duration_ms: number
          error_message: string | null
          id: string
          operation: string
          query_limit: number | null
          query_offset: number | null
          record_count: number | null
          rpc_name: string | null
          severity: string
          table_name: string | null
          user_id: string | null
        }
        Insert: {
          count_mode?: string | null
          created_at?: string
          duration_ms?: number
          error_message?: string | null
          id?: string
          operation?: string
          query_limit?: number | null
          query_offset?: number | null
          record_count?: number | null
          rpc_name?: string | null
          severity?: string
          table_name?: string | null
          user_id?: string | null
        }
        Update: {
          count_mode?: string | null
          created_at?: string
          duration_ms?: number
          error_message?: string | null
          id?: string
          operation?: string
          query_limit?: number | null
          query_offset?: number | null
          record_count?: number | null
          rpc_name?: string | null
          severity?: string
          table_name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      quote_sync_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          error_message: string | null
          external_quote_id: string | null
          id: string
          quote_number: string | null
          status: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          error_message?: string | null
          external_quote_id?: string | null
          id?: string
          quote_number?: string | null
          status?: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          error_message?: string | null
          external_quote_id?: string | null
          id?: string
          quote_number?: string | null
          status?: string
        }
        Relationships: []
      }
      quotes: {
        Row: {
          approved_at: string | null
          client_email: string | null
          client_name: string
          client_phone: string | null
          created_at: string
          created_by: string | null
          description: string | null
          discount_amount: number | null
          discount_percent: number | null
          external_quote_id: string | null
          external_reference: string | null
          id: string
          items: Json | null
          last_synced_at: string | null
          notes: string | null
          pdf_url: string | null
          quote_number: string | null
          rejected_at: string | null
          rejection_reason: string | null
          sale_id: string | null
          seller_name: string | null
          sent_at: string | null
          source: string | null
          status: string
          subtotal: number | null
          sync_status: string | null
          synced_from_external: boolean | null
          title: string
          total_value: number
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          approved_at?: string | null
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          external_quote_id?: string | null
          external_reference?: string | null
          id?: string
          items?: Json | null
          last_synced_at?: string | null
          notes?: string | null
          pdf_url?: string | null
          quote_number?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          sale_id?: string | null
          seller_name?: string | null
          sent_at?: string | null
          source?: string | null
          status?: string
          subtotal?: number | null
          sync_status?: string | null
          synced_from_external?: boolean | null
          title: string
          total_value?: number
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          approved_at?: string | null
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          external_quote_id?: string | null
          external_reference?: string | null
          id?: string
          items?: Json | null
          last_synced_at?: string | null
          notes?: string | null
          pdf_url?: string | null
          quote_number?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          sale_id?: string | null
          seller_name?: string | null
          sent_at?: string | null
          source?: string | null
          status?: string
          subtotal?: number | null
          sync_status?: string | null
          synced_from_external?: boolean | null
          title?: string
          total_value?: number
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      rank_change_notifications: {
        Row: {
          context: string | null
          created_at: string
          id: string
          is_read: boolean | null
          new_rank: number
          old_rank: number
          overtaken_by_id: string
          salesperson_id: string
        }
        Insert: {
          context?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          new_rank: number
          old_rank: number
          overtaken_by_id: string
          salesperson_id: string
        }
        Update: {
          context?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          new_rank?: number
          old_rank?: number
          overtaken_by_id?: string
          salesperson_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rank_change_notifications_overtaken_by_id_fkey"
            columns: ["overtaken_by_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rank_change_notifications_overtaken_by_id_fkey"
            columns: ["overtaken_by_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rank_change_notifications_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rank_change_notifications_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limit_logs: {
        Row: {
          action: string
          blocked: boolean | null
          created_at: string | null
          id: string
          identifier: string
          identifier_type: string
          request_count: number | null
          window_end: string | null
          window_start: string | null
        }
        Insert: {
          action: string
          blocked?: boolean | null
          created_at?: string | null
          id?: string
          identifier: string
          identifier_type?: string
          request_count?: number | null
          window_end?: string | null
          window_start?: string | null
        }
        Update: {
          action?: string
          blocked?: boolean | null
          created_at?: string | null
          id?: string
          identifier?: string
          identifier_type?: string
          request_count?: number | null
          window_end?: string | null
          window_start?: string | null
        }
        Relationships: []
      }
      rate_limit_settings: {
        Row: {
          action: string
          block_duration_seconds: number
          created_at: string | null
          id: string
          is_active: boolean | null
          max_requests: number
          updated_at: string | null
          window_seconds: number
        }
        Insert: {
          action: string
          block_duration_seconds?: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_requests?: number
          updated_at?: string | null
          window_seconds?: number
        }
        Update: {
          action?: string
          block_duration_seconds?: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_requests?: number
          updated_at?: string | null
          window_seconds?: number
        }
        Relationships: []
      }
      reauthentication_requests: {
        Row: {
          action_type: string
          created_at: string | null
          expires_at: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string
          verified: boolean | null
          verified_at: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id: string
          verified?: boolean | null
          verified_at?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string
          verified?: boolean | null
          verified_at?: string | null
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permission_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          id?: string
          permission_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          id?: string
          permission_id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
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
          pipeline_id: string | null
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
          pipeline_id?: string | null
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
          pipeline_id?: string | null
          product_name?: string
          salesperson_id?: string | null
          source?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_battles: {
        Row: {
          battle_type: string
          created_at: string
          created_by: string | null
          ends_at: string
          id: string
          metric: string
          starts_at: string
          status: string
          target_value: number | null
          title: string
          winner_id: string | null
          xp_reward: number
        }
        Insert: {
          battle_type?: string
          created_at?: string
          created_by?: string | null
          ends_at: string
          id?: string
          metric?: string
          starts_at?: string
          status?: string
          target_value?: number | null
          title: string
          winner_id?: string | null
          xp_reward?: number
        }
        Update: {
          battle_type?: string
          created_at?: string
          created_by?: string | null
          ends_at?: string
          id?: string
          metric?: string
          starts_at?: string
          status?: string
          target_value?: number | null
          title?: string
          winner_id?: string | null
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_battles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_battles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_battles_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_battles_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
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
          {
            foreignKeyName: "sales_goals_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_streaks: {
        Row: {
          current_streak: number
          id: string
          last_sale_date: string | null
          longest_streak: number
          salesperson_id: string
          updated_at: string
          xp_multiplier: number
        }
        Insert: {
          current_streak?: number
          id?: string
          last_sale_date?: string | null
          longest_streak?: number
          salesperson_id: string
          updated_at?: string
          xp_multiplier?: number
        }
        Update: {
          current_streak?: number
          id?: string
          last_sale_date?: string | null
          longest_streak?: number
          salesperson_id?: string
          updated_at?: string
          xp_multiplier?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_streaks_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: true
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_streaks_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: true
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_territories: {
        Row: {
          conquered_at: string | null
          created_at: string
          current_owner_id: string | null
          id: string
          is_contested: boolean
          territory_name: string
          territory_type: string
          total_deals: number
          total_revenue: number
          updated_at: string
        }
        Insert: {
          conquered_at?: string | null
          created_at?: string
          current_owner_id?: string | null
          id?: string
          is_contested?: boolean
          territory_name: string
          territory_type?: string
          total_deals?: number
          total_revenue?: number
          updated_at?: string
        }
        Update: {
          conquered_at?: string | null
          created_at?: string
          current_owner_id?: string | null
          id?: string
          is_contested?: boolean
          territory_name?: string
          territory_type?: string
          total_deals?: number
          total_revenue?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_territories_current_owner_id_fkey"
            columns: ["current_owner_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_territories_current_owner_id_fkey"
            columns: ["current_owner_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
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
          score_total: number
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
          score_total?: number
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
          score_total?: number
          updated_at?: string
        }
        Relationships: []
      }
      salesperson_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          is_showcase: boolean
          salesperson_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          is_showcase?: boolean
          salesperson_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          is_showcase?: boolean
          salesperson_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "salesperson_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "collectible_badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salesperson_badges_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salesperson_badges_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      salesperson_custom_field_values: {
        Row: {
          boolean_value: boolean | null
          field_id: string
          id: string
          numeric_value: number | null
          salesperson_id: string
          text_value: string | null
          updated_at: string
        }
        Insert: {
          boolean_value?: boolean | null
          field_id: string
          id?: string
          numeric_value?: number | null
          salesperson_id: string
          text_value?: string | null
          updated_at?: string
        }
        Update: {
          boolean_value?: boolean | null
          field_id?: string
          id?: string
          numeric_value?: number | null
          salesperson_id?: string
          text_value?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "salesperson_custom_field_values_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "team_custom_fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salesperson_custom_field_values_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salesperson_custom_field_values_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      salesperson_leagues: {
        Row: {
          created_at: string
          demoted_at: string | null
          id: string
          league: Database["public"]["Enums"]["sales_league"]
          points: number
          promoted_at: string | null
          salesperson_id: string
          season_number: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          demoted_at?: string | null
          id?: string
          league?: Database["public"]["Enums"]["sales_league"]
          points?: number
          promoted_at?: string | null
          salesperson_id: string
          season_number?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          demoted_at?: string | null
          id?: string
          league?: Database["public"]["Enums"]["sales_league"]
          points?: number
          promoted_at?: string | null
          salesperson_id?: string
          season_number?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "salesperson_leagues_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salesperson_leagues_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      salesperson_preferences: {
        Row: {
          ai_assistant_avatar: string | null
          ai_assistant_name: string
          created_at: string
          id: string
          response_mode: string
          salesperson_id: string
          updated_at: string
          voice_id: string | null
          voice_name: string | null
        }
        Insert: {
          ai_assistant_avatar?: string | null
          ai_assistant_name?: string
          created_at?: string
          id?: string
          response_mode?: string
          salesperson_id: string
          updated_at?: string
          voice_id?: string | null
          voice_name?: string | null
        }
        Update: {
          ai_assistant_avatar?: string | null
          ai_assistant_name?: string
          created_at?: string
          id?: string
          response_mode?: string
          salesperson_id?: string
          updated_at?: string
          voice_id?: string | null
          voice_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "salesperson_preferences_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: true
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salesperson_preferences_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: true
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
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
          {
            foreignKeyName: "salesperson_xp_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: true
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_filters: {
        Row: {
          created_at: string
          entity_type: string
          filters: Json
          id: string
          is_default: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_type: string
          filters?: Json
          id?: string
          is_default?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entity_type?: string
          filters?: Json
          id?: string
          is_default?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      score_change_logs: {
        Row: {
          api_token_id: string | null
          change_value: number
          changed_by: string
          created_at: string
          field_name: string
          id: string
          new_value: number
          old_value: number
          operation: string
          salesperson_id: string
        }
        Insert: {
          api_token_id?: string | null
          change_value?: number
          changed_by?: string
          created_at?: string
          field_name?: string
          id?: string
          new_value?: number
          old_value?: number
          operation: string
          salesperson_id: string
        }
        Update: {
          api_token_id?: string | null
          change_value?: number
          changed_by?: string
          created_at?: string
          field_name?: string
          id?: string
          new_value?: number
          old_value?: number
          operation?: string
          salesperson_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "score_change_logs_api_token_id_fkey"
            columns: ["api_token_id"]
            isOneToOne: false
            referencedRelation: "api_tokens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_change_logs_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_change_logs_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
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
      sla_policies: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          max_hours: number
          stage: string
          updated_at: string
          warning_hours: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          max_hours?: number
          stage: string
          updated_at?: string
          warning_hours?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          max_hours?: number
          stage?: string
          updated_at?: string
          warning_hours?: number
        }
        Relationships: []
      }
      sla_violations: {
        Row: {
          created_at: string
          detected_at: string
          hours_in_stage: number
          id: string
          metadata: Json | null
          policy_id: string | null
          resolved_at: string | null
          sale_id: string
          stage: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          detected_at?: string
          hours_in_stage?: number
          id?: string
          metadata?: Json | null
          policy_id?: string | null
          resolved_at?: string | null
          sale_id: string
          stage: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          detected_at?: string
          hours_in_stage?: number
          id?: string
          metadata?: Json | null
          policy_id?: string | null
          resolved_at?: string | null
          sale_id?: string
          stage?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sla_violations_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "sla_policies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sla_violations_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_verification_codes: {
        Row: {
          code: string
          created_at: string | null
          expires_at: string
          id: string
          phone_number: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string | null
          expires_at: string
          id?: string
          phone_number: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          phone_number?: string
          used_at?: string | null
          user_id?: string
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
      supplier_order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string | null
          product_id: string | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "supplier_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "supplier_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_orders: {
        Row: {
          actual_delivery: string | null
          created_at: string
          created_by: string | null
          expected_delivery: string | null
          id: string
          notes: string | null
          order_date: string | null
          order_number: string | null
          status: string | null
          supplier_id: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          actual_delivery?: string | null
          created_at?: string
          created_by?: string | null
          expected_delivery?: string | null
          id?: string
          notes?: string | null
          order_date?: string | null
          order_number?: string | null
          status?: string | null
          supplier_id?: string | null
          total_amount?: number
          updated_at?: string
        }
        Update: {
          actual_delivery?: string | null
          created_at?: string
          created_by?: string | null
          expected_delivery?: string | null
          id?: string
          notes?: string | null
          order_date?: string | null
          order_number?: string | null
          status?: string | null
          supplier_id?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_products: {
        Row: {
          created_at: string
          currency: string | null
          id: string
          is_preferred: boolean | null
          last_price_update: string | null
          min_order_quantity: number | null
          product_id: string | null
          supplier_id: string | null
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          id?: string
          is_preferred?: boolean | null
          last_price_update?: string | null
          min_order_quantity?: number | null
          product_id?: string | null
          supplier_id?: string | null
          unit_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          id?: string
          is_preferred?: boolean | null
          last_price_update?: string | null
          min_order_quantity?: number | null
          product_id?: string | null
          supplier_id?: string | null
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_risk_assessments: {
        Row: {
          assessed_by: string | null
          assessment_date: string
          created_at: string
          delivery_risk: number | null
          factors: Json | null
          financial_risk: number | null
          id: string
          overall_risk: number | null
          quality_risk: number | null
          recommendations: string | null
          risk_level: string | null
          supplier_id: string | null
        }
        Insert: {
          assessed_by?: string | null
          assessment_date?: string
          created_at?: string
          delivery_risk?: number | null
          factors?: Json | null
          financial_risk?: number | null
          id?: string
          overall_risk?: number | null
          quality_risk?: number | null
          recommendations?: string | null
          risk_level?: string | null
          supplier_id?: string | null
        }
        Update: {
          assessed_by?: string | null
          assessment_date?: string
          created_at?: string
          delivery_risk?: number | null
          factors?: Json | null
          financial_risk?: number | null
          id?: string
          overall_risk?: number | null
          quality_risk?: number | null
          recommendations?: string | null
          risk_level?: string | null
          supplier_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_risk_assessments_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          category: string | null
          city: string | null
          cnpj: string | null
          contact_name: string | null
          country: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          lead_time_days: number | null
          name: string
          notes: string | null
          payment_terms: string | null
          phone: string | null
          reliability_score: number | null
          state: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          category?: string | null
          city?: string | null
          cnpj?: string | null
          contact_name?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          lead_time_days?: number | null
          name: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          reliability_score?: number | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          category?: string | null
          city?: string | null
          cnpj?: string | null
          contact_name?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          lead_time_days?: number | null
          name?: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          reliability_score?: number | null
          state?: string | null
          updated_at?: string
        }
        Relationships: []
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
          {
            foreignKeyName: "tasks_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
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
            foreignKeyName: "team_closers_closer_id_fkey"
            columns: ["closer_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
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
      team_custom_fields: {
        Row: {
          created_at: string
          field_key: string
          field_label: string
          field_type: string
          id: string
          is_active: boolean
          team_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          field_key: string
          field_label: string
          field_type?: string
          id?: string
          is_active?: boolean
          team_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          field_key?: string
          field_label?: string
          field_type?: string
          id?: string
          is_active?: boolean
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_custom_fields_team_id_fkey"
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
          {
            foreignKeyName: "teams_sdr_id_fkey"
            columns: ["sdr_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      territory_history: {
        Row: {
          conquered_at: string | null
          created_at: string
          deals_count: number
          id: string
          lost_at: string | null
          revenue_contribution: number
          salesperson_id: string
          territory_id: string
        }
        Insert: {
          conquered_at?: string | null
          created_at?: string
          deals_count?: number
          id?: string
          lost_at?: string | null
          revenue_contribution?: number
          salesperson_id: string
          territory_id: string
        }
        Update: {
          conquered_at?: string | null
          created_at?: string
          deals_count?: number
          id?: string
          lost_at?: string | null
          revenue_contribution?: number
          salesperson_id?: string
          territory_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "territory_history_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "territory_history_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "territory_history_territory_id_fkey"
            columns: ["territory_id"]
            isOneToOne: false
            referencedRelation: "sales_territories"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_matches: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          match_order: number
          player1_id: string | null
          player1_score: number
          player2_id: string | null
          player2_score: number
          round_number: number
          started_at: string | null
          status: string
          tournament_id: string
          winner_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          match_order?: number
          player1_id?: string | null
          player1_score?: number
          player2_id?: string | null
          player2_score?: number
          round_number: number
          started_at?: string | null
          status?: string
          tournament_id: string
          winner_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          match_order?: number
          player1_id?: string | null
          player1_score?: number
          player2_id?: string | null
          player2_score?: number
          round_number?: number
          started_at?: string | null
          status?: string
          tournament_id?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_matches_player1_id_fkey"
            columns: ["player1_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_matches_player1_id_fkey"
            columns: ["player1_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_matches_player2_id_fkey"
            columns: ["player2_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_matches_player2_id_fkey"
            columns: ["player2_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_matches_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_matches_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_matches_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_participants: {
        Row: {
          created_at: string
          eliminated_in_round: number | null
          final_position: number | null
          id: string
          is_eliminated: boolean
          salesperson_id: string
          seed: number | null
          tournament_id: string
        }
        Insert: {
          created_at?: string
          eliminated_in_round?: number | null
          final_position?: number | null
          id?: string
          is_eliminated?: boolean
          salesperson_id: string
          seed?: number | null
          tournament_id: string
        }
        Update: {
          created_at?: string
          eliminated_in_round?: number | null
          final_position?: number | null
          id?: string
          is_eliminated?: boolean
          salesperson_id?: string
          seed?: number | null
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_participants_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_participants_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_participants_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          bracket_type: string
          created_at: string
          created_by: string | null
          current_round: number
          description: string | null
          ends_at: string | null
          id: string
          metric_type: string
          name: string
          round_duration_days: number
          starts_at: string
          status: string
          total_rounds: number
          xp_reward: number
        }
        Insert: {
          bracket_type?: string
          created_at?: string
          created_by?: string | null
          current_round?: number
          description?: string | null
          ends_at?: string | null
          id?: string
          metric_type?: string
          name: string
          round_duration_days?: number
          starts_at: string
          status?: string
          total_rounds?: number
          xp_reward?: number
        }
        Update: {
          bracket_type?: string
          created_at?: string
          created_by?: string | null
          current_round?: number
          description?: string | null
          ends_at?: string | null
          id?: string
          metric_type?: string
          name?: string
          round_duration_days?: number
          starts_at?: string
          status?: string
          total_rounds?: number
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "tournaments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournaments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      user_mfa_settings: {
        Row: {
          backup_codes: string[] | null
          backup_codes_generated_at: string | null
          created_at: string | null
          id: string
          phone_number: string | null
          phone_verified_at: string | null
          preferred_method: string | null
          sms_enabled: boolean | null
          totp_enabled: boolean | null
          totp_secret: string | null
          totp_verified_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          backup_codes?: string[] | null
          backup_codes_generated_at?: string | null
          created_at?: string | null
          id?: string
          phone_number?: string | null
          phone_verified_at?: string | null
          preferred_method?: string | null
          sms_enabled?: boolean | null
          totp_enabled?: boolean | null
          totp_secret?: string | null
          totp_verified_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          backup_codes?: string[] | null
          backup_codes_generated_at?: string | null
          created_at?: string | null
          id?: string
          phone_number?: string | null
          phone_verified_at?: string | null
          preferred_method?: string | null
          sms_enabled?: boolean | null
          totp_enabled?: boolean | null
          totp_secret?: string | null
          totp_verified_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      victory_feed: {
        Row: {
          created_at: string
          description: string | null
          event_type: string
          id: string
          metadata: Json | null
          salesperson_id: string
          title: string
          value: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          salesperson_id: string
          title: string
          value?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          salesperson_id?: string
          title?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "victory_feed_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "victory_feed_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      webauthn_challenges: {
        Row: {
          challenge: string
          created_at: string
          expires_at: string
          id: string
          type: string
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          challenge: string
          created_at?: string
          expires_at: string
          id?: string
          type: string
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          challenge?: string
          created_at?: string
          expires_at?: string
          id?: string
          type?: string
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      webauthn_credentials: {
        Row: {
          backed_up: boolean | null
          counter: number
          created_at: string
          credential_id: string
          device_type: string | null
          friendly_name: string | null
          id: string
          last_used_at: string | null
          public_key: string
          transports: string[] | null
          user_id: string
        }
        Insert: {
          backed_up?: boolean | null
          counter?: number
          created_at?: string
          credential_id: string
          device_type?: string | null
          friendly_name?: string | null
          id?: string
          last_used_at?: string | null
          public_key: string
          transports?: string[] | null
          user_id: string
        }
        Update: {
          backed_up?: boolean | null
          counter?: number
          created_at?: string
          credential_id?: string
          device_type?: string | null
          friendly_name?: string | null
          id?: string
          last_used_at?: string | null
          public_key?: string
          transports?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      webhook_deliveries: {
        Row: {
          attempts: number
          created_at: string
          duration_ms: number | null
          error_message: string | null
          event_type: string
          id: string
          payload: Json
          response_body: string | null
          response_status: number | null
          success: boolean
          webhook_id: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          event_type: string
          id?: string
          payload: Json
          response_body?: string | null
          response_status?: number | null
          success?: boolean
          webhook_id: string
        }
        Update: {
          attempts?: number
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          event_type?: string
          id?: string
          payload?: Json
          response_body?: string | null
          response_status?: number | null
          success?: boolean
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          created_at: string
          created_by: string | null
          events: string[]
          failure_count: number
          headers: Json | null
          id: string
          is_active: boolean
          last_failure_at: string | null
          last_success_at: string | null
          last_triggered_at: string | null
          name: string
          secret: string | null
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          events?: string[]
          failure_count?: number
          headers?: Json | null
          id?: string
          is_active?: boolean
          last_failure_at?: string | null
          last_success_at?: string | null
          last_triggered_at?: string | null
          name: string
          secret?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          events?: string[]
          failure_count?: number
          headers?: Json | null
          id?: string
          is_active?: boolean
          last_failure_at?: string | null
          last_success_at?: string | null
          last_triggered_at?: string | null
          name?: string
          secret?: string | null
          updated_at?: string
          url?: string
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
      weekly_matchups: {
        Row: {
          created_at: string
          id: string
          salesperson_a_id: string
          salesperson_b_id: string
          score_a: number
          score_b: number
          status: string
          week_start: string
          winner_id: string | null
          xp_reward: number
        }
        Insert: {
          created_at?: string
          id?: string
          salesperson_a_id: string
          salesperson_b_id: string
          score_a?: number
          score_b?: number
          status?: string
          week_start: string
          winner_id?: string | null
          xp_reward?: number
        }
        Update: {
          created_at?: string
          id?: string
          salesperson_a_id?: string
          salesperson_b_id?: string
          score_a?: number
          score_b?: number
          status?: string
          week_start?: string
          winner_id?: string | null
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "weekly_matchups_salesperson_a_id_fkey"
            columns: ["salesperson_a_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_matchups_salesperson_a_id_fkey"
            columns: ["salesperson_a_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_matchups_salesperson_b_id_fkey"
            columns: ["salesperson_b_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_matchups_salesperson_b_id_fkey"
            columns: ["salesperson_b_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_matchups_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_matchups_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_executions: {
        Row: {
          duration_ms: number | null
          error_message: string | null
          finished_at: string | null
          id: string
          input_payload: Json | null
          started_at: string
          status: string
          step_log: Json
          triggered_by: string | null
          workflow_id: string
        }
        Insert: {
          duration_ms?: number | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          input_payload?: Json | null
          started_at?: string
          status?: string
          step_log?: Json
          triggered_by?: string | null
          workflow_id: string
        }
        Update: {
          duration_ms?: number | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          input_payload?: Json | null
          started_at?: string
          status?: string
          step_log?: Json
          triggered_by?: string | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_rules: {
        Row: {
          action_config: Json
          action_type: string
          created_at: string
          description: string | null
          executions_count: number
          id: string
          is_active: boolean
          last_executed_at: string | null
          name: string
          salesperson_id: string | null
          trigger_config: Json
          trigger_type: string
          updated_at: string
        }
        Insert: {
          action_config?: Json
          action_type?: string
          created_at?: string
          description?: string | null
          executions_count?: number
          id?: string
          is_active?: boolean
          last_executed_at?: string | null
          name: string
          salesperson_id?: string | null
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string
        }
        Update: {
          action_config?: Json
          action_type?: string
          created_at?: string
          description?: string | null
          executions_count?: number
          id?: string
          is_active?: boolean
          last_executed_at?: string | null
          name?: string
          salesperson_id?: string | null
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_rules_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_rules_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          edges: Json
          execution_count: number
          id: string
          is_active: boolean
          last_executed_at: string | null
          name: string
          nodes: Json
          trigger_config: Json
          trigger_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          edges?: Json
          execution_count?: number
          id?: string
          is_active?: boolean
          last_executed_at?: string | null
          name: string
          nodes?: Json
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          edges?: Json
          execution_count?: number
          id?: string
          is_active?: boolean
          last_executed_at?: string | null
          name?: string
          nodes?: Json
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string
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
          {
            foreignKeyName: "xp_history_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople_public"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      salespeople_public: {
        Row: {
          avatar_url: string | null
          id: string | null
          is_active: boolean | null
          name: string | null
          role: Database["public"]["Enums"]["salesperson_role"] | null
        }
        Insert: {
          avatar_url?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          role?: Database["public"]["Enums"]["salesperson_role"] | null
        }
        Update: {
          avatar_url?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          role?: Database["public"]["Enums"]["salesperson_role"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_league_weekly_xp: {
        Args: { p_salesperson_id: string; p_xp: number }
        Returns: boolean
      }
      add_salesperson_xp: {
        Args: {
          p_salesperson_id: string
          p_source?: string
          p_xp_amount: number
        }
        Returns: boolean
      }
      assign_cadence_variant: { Args: { _ab_test_id: string }; Returns: string }
      auto_assign_lead: {
        Args: { _sale_id: string }
        Returns: {
          assigned_to: string
          rule_id: string
          strategy: string
        }[]
      }
      calculate_account_score: {
        Args: { p_account_id: string }
        Returns: number
      }
      calculate_daily_challenge_streak: {
        Args: { p_salesperson_id: string }
        Returns: number
      }
      calculate_deal_health: {
        Args: { _sale_id: string }
        Returns: {
          health_label: string
          health_score: number
          negative_factors: Json
          positive_factors: Json
        }[]
      }
      check_rate_limit: {
        Args: { p_action: string; p_identifier: string }
        Returns: {
          allowed: boolean
          remaining: number
          reset_at: string
        }[]
      }
      check_sla_violations: {
        Args: never
        Returns: {
          new_violations: number
          new_warnings: number
          processed: number
        }[]
      }
      count_failed_login_attempts: {
        Args: { check_email: string; check_ip: string; window_minutes?: number }
        Returns: number
      }
      count_reset_requests_24h: {
        Args: { check_email: string }
        Returns: number
      }
      disable_sms: { Args: never; Returns: boolean }
      disable_totp: { Args: never; Returns: boolean }
      find_matching_cadence_rule: {
        Args: { _sale_id: string }
        Returns: {
          cadence_id: string
          rule_id: string
          rule_name: string
        }[]
      }
      generate_api_token: { Args: never; Returns: string }
      generate_device_fingerprint: {
        Args: { p_ip_address: string; p_user_agent: string }
        Returns: string
      }
      generate_mfa_backup_codes: { Args: never; Returns: string[] }
      get_ab_test_results: {
        Args: { _ab_test_id: string }
        Returns: {
          cadence_name: string
          completed: number
          conversion_rate: number
          converted: number
          enrolled: number
          replied: number
          reply_rate: number
          variant: string
        }[]
      }
      get_active_salespeople: {
        Args: never
        Returns: {
          avatar_url: string
          id: string
          is_active: boolean
          name: string
          role: string
        }[]
      }
      get_auto_paused_count: { Args: { _days?: number }; Returns: number }
      get_cadence_metrics: {
        Args: { _cadence_id?: string; _days?: number }
        Returns: {
          active_count: number
          auto_paused_count: number
          cadence_id: string
          cadence_name: string
          cancelled_count: number
          completed_count: number
          completion_rate: number
          conversion_rate: number
          paused_count: number
          reply_rate: number
          tasks_completed: number
          tasks_skipped: number
          total_enrolled: number
          total_tasks: number
        }[]
      }
      get_current_salesperson_id: { Args: never; Returns: string }
      get_current_user_email: { Args: never; Returns: string }
      get_mfa_status: {
        Args: never
        Returns: {
          preferred_method: string
          sms_enabled: boolean
          totp_enabled: boolean
        }[]
      }
      get_revenue_forecast: {
        Args: { _days?: number }
        Returns: {
          avg_health: number
          deal_count: number
          period: string
          raw_pipeline: number
          weighted_revenue: number
        }[]
      }
      get_user_permissions: {
        Args: never
        Returns: {
          action: string
          permission_name: string
          resource: string
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_pending_reset_request: {
        Args: { check_email: string }
        Returns: boolean
      }
      has_permission: {
        Args: { _action: string; _resource: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_combo: { Args: { p_salesperson_id: string }; Returns: boolean }
      increment_goal_progress: {
        Args: { p_goal_id: string; p_increment?: number }
        Returns: boolean
      }
      increment_sales_streak: {
        Args: { p_salesperson_id: string }
        Returns: boolean
      }
      initialize_totp: {
        Args: { p_email: string }
        Returns: {
          qr_url: string
        }[]
      }
      is_admin_or_manager: { Args: { _user_id: string }; Returns: boolean }
      is_authenticated: { Args: never; Returns: boolean }
      is_country_blocked: {
        Args: { check_country_code: string }
        Returns: boolean
      }
      is_ip_blocked: { Args: { check_ip: string }; Returns: boolean }
      is_ip_whitelisted: { Args: { check_ip: string }; Returns: boolean }
      is_known_device: {
        Args: { p_fingerprint: string; p_user_id: string }
        Returns: boolean
      }
      is_mfa_enabled: { Args: { check_user_id: string }; Returns: boolean }
      log_audit_event: {
        Args: {
          _action: string
          _changes?: Json
          _entity_id?: string
          _entity_type: string
          _metadata?: Json
        }
        Returns: string
      }
      log_rate_limit: {
        Args: {
          p_action: string
          p_blocked?: boolean
          p_identifier: string
          p_identifier_type: string
        }
        Returns: undefined
      }
      refresh_session: { Args: { session_id: string }; Returns: boolean }
      regenerate_backup_codes: { Args: never; Returns: string[] }
      search_products_semantic: {
        Args: { _keywords: string[]; _limit?: number; _query?: string }
        Returns: {
          category: string
          id: string
          name: string
          price: number
          rating: number
          sales_count: number
          similarity_score: number
          status: string
        }[]
      }
      set_mfa_preferred_method: { Args: { p_method: string }; Returns: boolean }
      setup_sms_mfa: { Args: { p_phone: string }; Returns: boolean }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      toggle_workflow_active: {
        Args: { p_active: boolean; p_workflow_id: string }
        Returns: boolean
      }
      update_own_profile: {
        Args: { p_avatar_url?: string; p_name?: string }
        Returns: undefined
      }
      update_own_sale: {
        Args: {
          p_category?: string
          p_client_name?: string
          p_product_name?: string
          p_sale_id: string
          p_source?: string
        }
        Returns: boolean
      }
      update_user_mfa_settings: {
        Args: {
          p_backup_codes?: string[]
          p_preferred_method?: string
          p_sms_enabled?: boolean
          p_totp_enabled?: boolean
          p_totp_secret?: string
        }
        Returns: boolean
      }
      validate_api_token: {
        Args: { p_token: string }
        Returns: {
          company_name: string
          team_id: string
          token_id: string
        }[]
      }
      validate_session: {
        Args: { session_id: string }
        Returns: {
          needs_refresh: boolean
          reason: string
          valid: boolean
        }[]
      }
      verify_and_enable_sms: { Args: { p_code: string }; Returns: boolean }
      verify_and_enable_totp: { Args: { p_token: string }; Returns: Json }
      verify_mfa_code: {
        Args: { p_code: string; p_method?: string }
        Returns: boolean
      }
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
      sales_league: "bronze" | "silver" | "gold" | "diamond"
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
      sales_league: ["bronze", "silver", "gold", "diamond"],
      salesperson_role: ["sdr", "closer", "hybrid"],
      task_priority: ["high", "medium", "low"],
      task_status: ["pending", "in_progress", "completed", "cancelled"],
      task_type: ["call", "meeting", "follow_up", "email", "proposal", "other"],
    },
  },
} as const
