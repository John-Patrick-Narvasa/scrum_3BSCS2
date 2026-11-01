export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      employee: {
        Row: {
          empno: string
          lastname: string | null
          firstname: string | null
          gender: string | null
          birthdate: string | null
          hiredate: string | null
          sepDate: string | null
        }
        Insert: {
          empno: string
          lastname?: string | null
          firstname?: string | null
          gender?: string | null
          birthdate?: string | null
          hiredate?: string | null
          sepDate?: string | null
        }
        Update: {
          empno?: string
          lastname?: string | null
          firstname?: string | null
          gender?: string | null
          birthdate?: string | null
          hiredate?: string | null
          sepDate?: string | null
        }
        Relationships: []
      }
      department: {
        Row: {
          deptcode: string
          deptname: string | null
          depthead: string | null
        }
        Insert: {
          deptcode: string
          deptname?: string | null
          depthead?: string | null
        }
        Update: {
          deptcode?: string
          deptname?: string | null
          depthead?: string | null
        }
        Relationships: []
      }
      job: {
        Row: {
          jobcode: string
          jobdesc: string | null
        }
        Insert: {
          jobcode: string
          jobdesc?: string | null
        }
        Update: {
          jobcode?: string
          jobdesc?: string | null
        }
        Relationships: []
      }
      jobHistory: {
        Row: {
          empno: string
          deptcode: string
          jobcode: string
          startdate: string
          enddate: string | null
        }
        Insert: {
          empno: string
          deptcode: string
          jobcode: string
          startdate: string
          enddate?: string | null
        }
        Update: {
          empno?: string
          deptcode?: string
          jobcode?: string
          startdate?: string
          enddate?: string | null
        }
        Relationships: []
      }
      customer: {
        Row: {
          custno: string
          custname: string | null
          address: string | null
          telno: string | null
        }
        Insert: {
          custno: string
          custname?: string | null
          address?: string | null
          telno?: string | null
        }
        Update: {
          custno?: string
          custname?: string | null
          address?: string | null
          telno?: string | null
        }
        Relationships: []
      }
      sales: {
        Row: {
          orderno: string
          orderdate: string | null
          custno: string | null
          empno: string | null
          totalamount: number | null
        }
        Insert: {
          orderno: string
          orderdate?: string | null
          custno?: string | null
          empno?: string | null
          totalamount?: number | null
        }
        Update: {
          orderno?: string
          orderdate?: string | null
          custno?: string | null
          empno?: string | null
          totalamount?: number | null
        }
        Relationships: []
      }
      salesDetail: {
        Row: {
          orderno: string
          prodcode: string
          qty: number | null
          unitprice: number | null
        }
        Insert: {
          orderno: string
          prodcode: string
          qty?: number | null
          unitprice?: number | null
        }
        Update: {
          orderno?: string
          prodcode?: string
          qty?: number | null
          unitprice?: number | null
        }
        Relationships: []
      }
      product: {
        Row: {
          prodcode: string
          proddesc: string | null
          unit: string | null
          unitprice: number | null
          qtyonhand: number | null
          reorderlevel: number | null
        }
        Insert: {
          prodcode: string
          proddesc?: string | null
          unit?: string | null
          unitprice?: number | null
          qtyonhand?: number | null
          reorderlevel?: number | null
        }
        Update: {
          prodcode?: string
          proddesc?: string | null
          unit?: string | null
          unitprice?: number | null
          qtyonhand?: number | null
          reorderlevel?: number | null
        }
        Relationships: []
      }
      payment: {
        Row: {
          paymentno: string
          orderno: string | null
          paymentdate: string | null
          amount: number | null
          paymenttype: string | null
        }
        Insert: {
          paymentno: string
          orderno?: string | null
          paymentdate?: string | null
          amount?: number | null
          paymenttype?: string | null
        }
        Update: {
          paymentno?: string
          orderno?: string | null
          paymentdate?: string | null
          amount?: number | null
          paymenttype?: string | null
        }
        Relationships: []
      }
      priceHist: {
        Row: {
          prodcode: string
          startdate: string
          enddate: string | null
          unitprice: number | null
        }
        Insert: {
          prodcode: string
          startdate: string
          enddate?: string | null
          unitprice?: number | null
        }
        Update: {
          prodcode?: string
          startdate?: string
          enddate?: string | null
          unitprice?: number | null
        }
        Relationships: []
      }
      app_user: {
        Row: {
          id: string
          username: string
          email: string
          full_name: string
          role: string
          status: string
          approved_by: string | null
          approved_at: string | null
          created_at: string
          stamp: string | null
          is_deleted: boolean
        }
        Insert: {
          id?: string
          username: string
          email: string
          full_name: string
          role?: string
          status?: string
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          stamp?: string | null
          is_deleted?: boolean
        }
        Update: {
          id?: string
          username?: string
          email?: string
          full_name?: string
          role?: string
          status?: string
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          stamp?: string | null
          is_deleted?: boolean
        }
        Relationships: []
      }
      user_permission: {
        Row: {
          id: string
          user_id: string
          module: string
          right_code: string
          granted_by: string | null
          granted_at: string
        }
        Insert: {
          id?: string
          user_id: string
          module: string
          right_code: string
          granted_by?: string | null
          granted_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          module?: string
          right_code?: string
          granted_by?: string | null
          granted_at?: string
        }
        Relationships: []
      }
      password_reset_token: {
        Row: {
          id: string
          user_id: string
          token_hash: string
          expires_at: string
          is_used: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          token_hash: string
          expires_at: string
          is_used?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          token_hash?: string
          expires_at?: string
          is_used?: boolean
          created_at?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          log_id: string
          table_name: string | null
          action: string | null
          record_id: string | null
          changed_by: string | null
          changed_at: string | null
          old_data: Json | null
          new_data: Json | null
        }
        Insert: {
          log_id?: string
          table_name?: string | null
          action?: string | null
          record_id?: string | null
          changed_by?: string | null
          changed_at?: string | null
          old_data?: Json | null
          new_data?: Json | null
        }
        Update: {
          log_id?: string
          table_name?: string | null
          action?: string | null
          record_id?: string | null
          changed_by?: string | null
          changed_at?: string | null
          old_data?: Json | null
          new_data?: Json | null
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
