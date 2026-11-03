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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      app_user: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          is_blocked: boolean | null
          record_status: string
          role: string
          stamp: string | null
          status: string
          username: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          is_blocked?: boolean | null
          record_status?: string
          role: string
          stamp?: string | null
          status?: string
          username: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_blocked?: boolean | null
          record_status?: string
          role?: string
          stamp?: string | null
          status?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_user_approved_by_fk"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "app_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_user_role_fk"
            columns: ["role"]
            isOneToOne: false
            referencedRelation: "role"
            referencedColumns: ["role_code"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          action_at: string
          action_by: string
          audit_id: number
          new_values: Json | null
          old_values: Json | null
          record_key: string | null
          table_name: string
        }
        Insert: {
          action: string
          action_at?: string
          action_by: string
          audit_id?: never
          new_values?: Json | null
          old_values?: Json | null
          record_key?: string | null
          table_name: string
        }
        Update: {
          action?: string
          action_at?: string
          action_by?: string
          audit_id?: never
          new_values?: Json | null
          old_values?: Json | null
          record_key?: string | null
          table_name?: string
        }
        Relationships: []
      }
      customer: {
        Row: {
          address: string | null
          custname: string | null
          custno: string
          is_deleted: boolean
          payterm: string | null
          stamp: string | null
        }
        Insert: {
          address?: string | null
          custname?: string | null
          custno: string
          is_deleted?: boolean
          payterm?: string | null
          stamp?: string | null
        }
        Update: {
          address?: string | null
          custname?: string | null
          custno?: string
          is_deleted?: boolean
          payterm?: string | null
          stamp?: string | null
        }
        Relationships: []
      }
      department: {
        Row: {
          deptcode: string
          deptname: string | null
          is_deleted: boolean
          stamp: string | null
        }
        Insert: {
          deptcode: string
          deptname?: string | null
          is_deleted?: boolean
          stamp?: string | null
        }
        Update: {
          deptcode?: string
          deptname?: string | null
          is_deleted?: boolean
          stamp?: string | null
        }
        Relationships: []
      }
      employee: {
        Row: {
          birthdate: string | null
          empno: string
          firstname: string | null
          gender: string | null
          hiredate: string | null
          is_deleted: boolean
          lastname: string | null
          sepdate: string | null
          stamp: string | null
        }
        Insert: {
          birthdate?: string | null
          empno: string
          firstname?: string | null
          gender?: string | null
          hiredate?: string | null
          is_deleted?: boolean
          lastname?: string | null
          sepdate?: string | null
          stamp?: string | null
        }
        Update: {
          birthdate?: string | null
          empno?: string
          firstname?: string | null
          gender?: string | null
          hiredate?: string | null
          is_deleted?: boolean
          lastname?: string | null
          sepdate?: string | null
          stamp?: string | null
        }
        Relationships: []
      }
      job: {
        Row: {
          is_deleted: boolean
          jobcode: string
          jobdesc: string | null
          stamp: string | null
        }
        Insert: {
          is_deleted?: boolean
          jobcode: string
          jobdesc?: string | null
          stamp?: string | null
        }
        Update: {
          is_deleted?: boolean
          jobcode?: string
          jobdesc?: string | null
          stamp?: string | null
        }
        Relationships: []
      }
      jobhistory: {
        Row: {
          deptcode: string | null
          effdate: string
          empno: string
          is_deleted: boolean
          jobcode: string
          salary: number | null
          stamp: string | null
        }
        Insert: {
          deptcode?: string | null
          effdate: string
          empno: string
          is_deleted?: boolean
          jobcode: string
          salary?: number | null
          stamp?: string | null
        }
        Update: {
          deptcode?: string | null
          effdate?: string
          empno?: string
          is_deleted?: boolean
          jobcode?: string
          salary?: number | null
          stamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobhistory_deptcode_fkey"
            columns: ["deptcode"]
            isOneToOne: false
            referencedRelation: "department"
            referencedColumns: ["deptcode"]
          },
          {
            foreignKeyName: "jobhistory_deptcode_fkey"
            columns: ["deptcode"]
            isOneToOne: false
            referencedRelation: "department_active"
            referencedColumns: ["deptcode"]
          },
          {
            foreignKeyName: "jobhistory_empno_fkey"
            columns: ["empno"]
            isOneToOne: false
            referencedRelation: "employee"
            referencedColumns: ["empno"]
          },
          {
            foreignKeyName: "jobhistory_empno_fkey"
            columns: ["empno"]
            isOneToOne: false
            referencedRelation: "employee_active"
            referencedColumns: ["empno"]
          },
          {
            foreignKeyName: "jobhistory_jobcode_fkey"
            columns: ["jobcode"]
            isOneToOne: false
            referencedRelation: "job"
            referencedColumns: ["jobcode"]
          },
          {
            foreignKeyName: "jobhistory_jobcode_fkey"
            columns: ["jobcode"]
            isOneToOne: false
            referencedRelation: "job_active"
            referencedColumns: ["jobcode"]
          },
        ]
      }
      module: {
        Row: {
          description: string | null
          module_code: string
          module_name: string
        }
        Insert: {
          description?: string | null
          module_code: string
          module_name: string
        }
        Update: {
          description?: string | null
          module_code?: string
          module_name?: string
        }
        Relationships: []
      }
      payment: {
        Row: {
          amount: number | null
          is_deleted: boolean
          orno: string
          paydate: string | null
          stamp: string | null
          transno: string | null
        }
        Insert: {
          amount?: number | null
          is_deleted?: boolean
          orno: string
          paydate?: string | null
          stamp?: string | null
          transno?: string | null
        }
        Update: {
          amount?: number | null
          is_deleted?: boolean
          orno?: string
          paydate?: string | null
          stamp?: string | null
          transno?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transno_fkey"
            columns: ["transno"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["transno"]
          },
          {
            foreignKeyName: "payment_transno_fkey"
            columns: ["transno"]
            isOneToOne: false
            referencedRelation: "sales_active"
            referencedColumns: ["transno"]
          },
        ]
      }
      pricehist: {
        Row: {
          effdate: string
          is_deleted: boolean
          prodcode: string
          stamp: string | null
          unitprice: number | null
        }
        Insert: {
          effdate: string
          is_deleted?: boolean
          prodcode: string
          stamp?: string | null
          unitprice?: number | null
        }
        Update: {
          effdate?: string
          is_deleted?: boolean
          prodcode?: string
          stamp?: string | null
          unitprice?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pricehist_prodcode_fkey"
            columns: ["prodcode"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["prodcode"]
          },
          {
            foreignKeyName: "pricehist_prodcode_fkey"
            columns: ["prodcode"]
            isOneToOne: false
            referencedRelation: "product_active"
            referencedColumns: ["prodcode"]
          },
        ]
      }
      product: {
        Row: {
          description: string | null
          is_deleted: boolean
          prodcode: string
          stamp: string | null
          unit: string | null
        }
        Insert: {
          description?: string | null
          is_deleted?: boolean
          prodcode: string
          stamp?: string | null
          unit?: string | null
        }
        Update: {
          description?: string | null
          is_deleted?: boolean
          prodcode?: string
          stamp?: string | null
          unit?: string | null
        }
        Relationships: []
      }
      rights_catalogue: {
        Row: {
          description: string | null
          module_code: string
          right_code: string
          right_name: string
        }
        Insert: {
          description?: string | null
          module_code: string
          right_code: string
          right_name: string
        }
        Update: {
          description?: string | null
          module_code?: string
          right_code?: string
          right_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "rights_catalogue_module_fk"
            columns: ["module_code"]
            isOneToOne: false
            referencedRelation: "module"
            referencedColumns: ["module_code"]
          },
        ]
      }
      role: {
        Row: {
          description: string | null
          role_code: string
          role_name: string
        }
        Insert: {
          description?: string | null
          role_code: string
          role_name: string
        }
        Update: {
          description?: string | null
          role_code?: string
          role_name?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          custno: string | null
          empno: string | null
          is_deleted: boolean
          salesdate: string | null
          stamp: string | null
          transno: string
        }
        Insert: {
          custno?: string | null
          empno?: string | null
          is_deleted?: boolean
          salesdate?: string | null
          stamp?: string | null
          transno: string
        }
        Update: {
          custno?: string | null
          empno?: string | null
          is_deleted?: boolean
          salesdate?: string | null
          stamp?: string | null
          transno?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_custno_fkey"
            columns: ["custno"]
            isOneToOne: false
            referencedRelation: "customer"
            referencedColumns: ["custno"]
          },
          {
            foreignKeyName: "sales_custno_fkey"
            columns: ["custno"]
            isOneToOne: false
            referencedRelation: "customer_active"
            referencedColumns: ["custno"]
          },
          {
            foreignKeyName: "sales_empno_fkey"
            columns: ["empno"]
            isOneToOne: false
            referencedRelation: "employee"
            referencedColumns: ["empno"]
          },
          {
            foreignKeyName: "sales_empno_fkey"
            columns: ["empno"]
            isOneToOne: false
            referencedRelation: "employee_active"
            referencedColumns: ["empno"]
          },
        ]
      }
      salesdetail: {
        Row: {
          is_deleted: boolean
          prodcode: string
          quantity: number | null
          stamp: string | null
          transno: string
        }
        Insert: {
          is_deleted?: boolean
          prodcode: string
          quantity?: number | null
          stamp?: string | null
          transno: string
        }
        Update: {
          is_deleted?: boolean
          prodcode?: string
          quantity?: number | null
          stamp?: string | null
          transno?: string
        }
        Relationships: [
          {
            foreignKeyName: "salesdetail_prodcode_fkey"
            columns: ["prodcode"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["prodcode"]
          },
          {
            foreignKeyName: "salesdetail_prodcode_fkey"
            columns: ["prodcode"]
            isOneToOne: false
            referencedRelation: "product_active"
            referencedColumns: ["prodcode"]
          },
          {
            foreignKeyName: "salesdetail_transno_fkey"
            columns: ["transno"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["transno"]
          },
          {
            foreignKeyName: "salesdetail_transno_fkey"
            columns: ["transno"]
            isOneToOne: false
            referencedRelation: "sales_active"
            referencedColumns: ["transno"]
          },
        ]
      }
      user_module: {
        Row: {
          created_at: string
          module_code: string
          record_status: string
          stamp: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          module_code: string
          record_status?: string
          stamp?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          module_code?: string
          record_status?: string
          stamp?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_module_module_fk"
            columns: ["module_code"]
            isOneToOne: false
            referencedRelation: "module"
            referencedColumns: ["module_code"]
          },
          {
            foreignKeyName: "user_module_user_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_user"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permission: {
        Row: {
          created_at: string
          module_code: string
          record_status: string
          right_code: string
          stamp: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          module_code: string
          record_status?: string
          right_code: string
          stamp?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          module_code?: string
          record_status?: string
          right_code?: string
          stamp?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_permission_module_right_fk"
            columns: ["module_code", "right_code"]
            isOneToOne: false
            referencedRelation: "rights_catalogue"
            referencedColumns: ["module_code", "right_code"]
          },
          {
            foreignKeyName: "user_permission_user_module_fk"
            columns: ["user_id", "module_code"]
            isOneToOne: false
            referencedRelation: "user_module"
            referencedColumns: ["user_id", "module_code"]
          },
        ]
      }
    }
    Views: {
      customer_active: {
        Row: {
          address: string | null
          custname: string | null
          custno: string | null
          is_deleted: boolean | null
          payterm: string | null
          stamp: string | null
        }
        Insert: {
          address?: string | null
          custname?: string | null
          custno?: string | null
          is_deleted?: boolean | null
          payterm?: string | null
          stamp?: string | null
        }
        Update: {
          address?: string | null
          custname?: string | null
          custno?: string | null
          is_deleted?: boolean | null
          payterm?: string | null
          stamp?: string | null
        }
        Relationships: []
      }
      department_active: {
        Row: {
          deptcode: string | null
          deptname: string | null
          is_deleted: boolean | null
          stamp: string | null
        }
        Insert: {
          deptcode?: string | null
          deptname?: string | null
          is_deleted?: boolean | null
          stamp?: string | null
        }
        Update: {
          deptcode?: string | null
          deptname?: string | null
          is_deleted?: boolean | null
          stamp?: string | null
        }
        Relationships: []
      }
      employee_active: {
        Row: {
          birthdate: string | null
          empno: string | null
          firstname: string | null
          gender: string | null
          hiredate: string | null
          is_deleted: boolean | null
          lastname: string | null
          sepdate: string | null
          stamp: string | null
        }
        Insert: {
          birthdate?: string | null
          empno?: string | null
          firstname?: string | null
          gender?: string | null
          hiredate?: string | null
          is_deleted?: boolean | null
          lastname?: string | null
          sepdate?: string | null
          stamp?: string | null
        }
        Update: {
          birthdate?: string | null
          empno?: string | null
          firstname?: string | null
          gender?: string | null
          hiredate?: string | null
          is_deleted?: boolean | null
          lastname?: string | null
          sepdate?: string | null
          stamp?: string | null
        }
        Relationships: []
      }
      job_active: {
        Row: {
          is_deleted: boolean | null
          jobcode: string | null
          jobdesc: string | null
          stamp: string | null
        }
        Insert: {
          is_deleted?: boolean | null
          jobcode?: string | null
          jobdesc?: string | null
          stamp?: string | null
        }
        Update: {
          is_deleted?: boolean | null
          jobcode?: string | null
          jobdesc?: string | null
          stamp?: string | null
        }
        Relationships: []
      }
      jobhistory_active: {
        Row: {
          deptcode: string | null
          effdate: string | null
          empno: string | null
          is_deleted: boolean | null
          jobcode: string | null
          salary: number | null
          stamp: string | null
        }
        Insert: {
          deptcode?: string | null
          effdate?: string | null
          empno?: string | null
          is_deleted?: boolean | null
          jobcode?: string | null
          salary?: number | null
          stamp?: string | null
        }
        Update: {
          deptcode?: string | null
          effdate?: string | null
          empno?: string | null
          is_deleted?: boolean | null
          jobcode?: string | null
          salary?: number | null
          stamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobhistory_deptcode_fkey"
            columns: ["deptcode"]
            isOneToOne: false
            referencedRelation: "department"
            referencedColumns: ["deptcode"]
          },
          {
            foreignKeyName: "jobhistory_deptcode_fkey"
            columns: ["deptcode"]
            isOneToOne: false
            referencedRelation: "department_active"
            referencedColumns: ["deptcode"]
          },
          {
            foreignKeyName: "jobhistory_empno_fkey"
            columns: ["empno"]
            isOneToOne: false
            referencedRelation: "employee"
            referencedColumns: ["empno"]
          },
          {
            foreignKeyName: "jobhistory_empno_fkey"
            columns: ["empno"]
            isOneToOne: false
            referencedRelation: "employee_active"
            referencedColumns: ["empno"]
          },
          {
            foreignKeyName: "jobhistory_jobcode_fkey"
            columns: ["jobcode"]
            isOneToOne: false
            referencedRelation: "job"
            referencedColumns: ["jobcode"]
          },
          {
            foreignKeyName: "jobhistory_jobcode_fkey"
            columns: ["jobcode"]
            isOneToOne: false
            referencedRelation: "job_active"
            referencedColumns: ["jobcode"]
          },
        ]
      }
      payment_active: {
        Row: {
          amount: number | null
          is_deleted: boolean | null
          orno: string | null
          paydate: string | null
          stamp: string | null
          transno: string | null
        }
        Insert: {
          amount?: number | null
          is_deleted?: boolean | null
          orno?: string | null
          paydate?: string | null
          stamp?: string | null
          transno?: string | null
        }
        Update: {
          amount?: number | null
          is_deleted?: boolean | null
          orno?: string | null
          paydate?: string | null
          stamp?: string | null
          transno?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transno_fkey"
            columns: ["transno"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["transno"]
          },
          {
            foreignKeyName: "payment_transno_fkey"
            columns: ["transno"]
            isOneToOne: false
            referencedRelation: "sales_active"
            referencedColumns: ["transno"]
          },
        ]
      }
      pricehist_active: {
        Row: {
          effdate: string | null
          is_deleted: boolean | null
          prodcode: string | null
          stamp: string | null
          unitprice: number | null
        }
        Insert: {
          effdate?: string | null
          is_deleted?: boolean | null
          prodcode?: string | null
          stamp?: string | null
          unitprice?: number | null
        }
        Update: {
          effdate?: string | null
          is_deleted?: boolean | null
          prodcode?: string | null
          stamp?: string | null
          unitprice?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pricehist_prodcode_fkey"
            columns: ["prodcode"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["prodcode"]
          },
          {
            foreignKeyName: "pricehist_prodcode_fkey"
            columns: ["prodcode"]
            isOneToOne: false
            referencedRelation: "product_active"
            referencedColumns: ["prodcode"]
          },
        ]
      }
      product_active: {
        Row: {
          description: string | null
          is_deleted: boolean | null
          prodcode: string | null
          stamp: string | null
          unit: string | null
        }
        Insert: {
          description?: string | null
          is_deleted?: boolean | null
          prodcode?: string | null
          stamp?: string | null
          unit?: string | null
        }
        Update: {
          description?: string | null
          is_deleted?: boolean | null
          prodcode?: string | null
          stamp?: string | null
          unit?: string | null
        }
        Relationships: []
      }
      sales_active: {
        Row: {
          custno: string | null
          empno: string | null
          is_deleted: boolean | null
          salesdate: string | null
          stamp: string | null
          transno: string | null
        }
        Insert: {
          custno?: string | null
          empno?: string | null
          is_deleted?: boolean | null
          salesdate?: string | null
          stamp?: string | null
          transno?: string | null
        }
        Update: {
          custno?: string | null
          empno?: string | null
          is_deleted?: boolean | null
          salesdate?: string | null
          stamp?: string | null
          transno?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_custno_fkey"
            columns: ["custno"]
            isOneToOne: false
            referencedRelation: "customer"
            referencedColumns: ["custno"]
          },
          {
            foreignKeyName: "sales_custno_fkey"
            columns: ["custno"]
            isOneToOne: false
            referencedRelation: "customer_active"
            referencedColumns: ["custno"]
          },
          {
            foreignKeyName: "sales_empno_fkey"
            columns: ["empno"]
            isOneToOne: false
            referencedRelation: "employee"
            referencedColumns: ["empno"]
          },
          {
            foreignKeyName: "sales_empno_fkey"
            columns: ["empno"]
            isOneToOne: false
            referencedRelation: "employee_active"
            referencedColumns: ["empno"]
          },
        ]
      }
      salesdetail_active: {
        Row: {
          is_deleted: boolean | null
          prodcode: string | null
          quantity: number | null
          stamp: string | null
          transno: string | null
        }
        Insert: {
          is_deleted?: boolean | null
          prodcode?: string | null
          quantity?: number | null
          stamp?: string | null
          transno?: string | null
        }
        Update: {
          is_deleted?: boolean | null
          prodcode?: string | null
          quantity?: number | null
          stamp?: string | null
          transno?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "salesdetail_prodcode_fkey"
            columns: ["prodcode"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["prodcode"]
          },
          {
            foreignKeyName: "salesdetail_prodcode_fkey"
            columns: ["prodcode"]
            isOneToOne: false
            referencedRelation: "product_active"
            referencedColumns: ["prodcode"]
          },
          {
            foreignKeyName: "salesdetail_transno_fkey"
            columns: ["transno"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["transno"]
          },
          {
            foreignKeyName: "salesdetail_transno_fkey"
            columns: ["transno"]
            isOneToOne: false
            referencedRelation: "sales_active"
            referencedColumns: ["transno"]
          },
        ]
      }
    }
    Functions: {
      audit_stamp: { Args: { p_action: string }; Returns: string }
      audit_user: { Args: never; Returns: string }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
