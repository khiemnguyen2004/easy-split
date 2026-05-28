export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.4';
  };
  public: {
    Tables: {
      categories: {
        Row: {
          category_id: string;
          created_at: string | null;
          group_id: string | null;
          icon: string | null;
          name: string;
        };
        Insert: {
          category_id?: string;
          created_at?: string | null;
          group_id?: string | null;
          icon?: string | null;
          name: string;
        };
        Update: {
          category_id?: string;
          created_at?: string | null;
          group_id?: string | null;
          icon?: string | null;
          name?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'categories_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'groups';
            referencedColumns: ['group_id'];
          },
        ];
      };
      debt_settlements: {
        Row: {
          amount: number;
          created_at: string | null;
          creditor_id: string | null;
          debtor_id: string | null;
          group_id: string | null;
          proof_image_url: string | null;
          settlement_id: string;
          status: string | null;
        };
        Insert: {
          amount: number;
          created_at?: string | null;
          creditor_id?: string | null;
          debtor_id?: string | null;
          group_id?: string | null;
          proof_image_url?: string | null;
          settlement_id?: string;
          status?: string | null;
        };
        Update: {
          amount?: number;
          created_at?: string | null;
          creditor_id?: string | null;
          debtor_id?: string | null;
          group_id?: string | null;
          proof_image_url?: string | null;
          settlement_id?: string;
          status?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'debt_settlements_creditor_id_fkey';
            columns: ['creditor_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'debt_settlements_debtor_id_fkey';
            columns: ['debtor_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'debt_settlements_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'groups';
            referencedColumns: ['group_id'];
          },
        ];
      };
      expense_splits: {
        Row: {
          expense_id: string | null;
          share_amount: number;
          split_id: string;
          status: string | null;
          user_id: string | null;
        };
        Insert: {
          expense_id?: string | null;
          share_amount: number;
          split_id?: string;
          status?: string | null;
          user_id?: string | null;
        };
        Update: {
          expense_id?: string | null;
          share_amount?: number;
          split_id?: string;
          status?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'expense_splits_expense_id_fkey';
            columns: ['expense_id'];
            isOneToOne: false;
            referencedRelation: 'expenses';
            referencedColumns: ['expense_id'];
          },
          {
            foreignKeyName: 'expense_splits_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['user_id'];
          },
        ];
      };
      expenses: {
        Row: {
          amount: number;
          category: string | null;
          category_id: string | null;
          created_at: string | null;
          description: string | null;
          expense_id: string;
          group_id: string | null;
          image_url: string | null;
          payer_id: string | null;
          title: string | null;
        };
        Insert: {
          amount: number;
          category?: string | null;
          category_id?: string | null;
          created_at?: string | null;
          description?: string | null;
          expense_id?: string;
          group_id?: string | null;
          image_url?: string | null;
          payer_id?: string | null;
          title?: string | null;
        };
        Update: {
          amount?: number;
          category?: string | null;
          category_id?: string | null;
          created_at?: string | null;
          description?: string | null;
          expense_id?: string;
          group_id?: string | null;
          image_url?: string | null;
          payer_id?: string | null;
          title?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'expenses_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['category_id'];
          },
          {
            foreignKeyName: 'expenses_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'groups';
            referencedColumns: ['group_id'];
          },
          {
            foreignKeyName: 'expenses_payer_id_fkey';
            columns: ['payer_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['user_id'];
          },
        ];
      };
      fund_contributions: {
        Row: {
          amount: number;
          contribution_id: string;
          created_at: string | null;
          funding_id: string;
          proof_img: string | null;
          status: string | null;
          user_id: string;
        };
        Insert: {
          amount: number;
          contribution_id?: string;
          created_at?: string | null;
          funding_id: string;
          proof_img?: string | null;
          status?: string | null;
          user_id: string;
        };
        Update: {
          amount?: number;
          contribution_id?: string;
          created_at?: string | null;
          funding_id?: string;
          proof_img?: string | null;
          status?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'fund_contributions_funding_id_fkey';
            columns: ['funding_id'];
            isOneToOne: false;
            referencedRelation: 'fundings';
            referencedColumns: ['funding_id'];
          },
          {
            foreignKeyName: 'fund_contributions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['user_id'];
          },
        ];
      };
      fundings: {
        Row: {
          created_at: string | null;
          current_amount: number | null;
          funding_id: string;
          group_id: string;
          name: string;
          status: string | null;
          target_amount: number;
        };
        Insert: {
          created_at?: string | null;
          current_amount?: number | null;
          funding_id?: string;
          group_id: string;
          name: string;
          status?: string | null;
          target_amount: number;
        };
        Update: {
          created_at?: string | null;
          current_amount?: number | null;
          funding_id?: string;
          group_id?: string;
          name?: string;
          status?: string | null;
          target_amount?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'fundings_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'groups';
            referencedColumns: ['group_id'];
          },
        ];
      };
      group_members: {
        Row: {
          group_id: string;
          joined_at: string | null;
          role: string | null;
          user_id: string;
        };
        Insert: {
          group_id: string;
          joined_at?: string | null;
          role?: string | null;
          user_id: string;
        };
        Update: {
          group_id?: string;
          joined_at?: string | null;
          role?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'group_members_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'groups';
            referencedColumns: ['group_id'];
          },
          {
            foreignKeyName: 'group_members_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['user_id'];
          },
        ];
      };
      groups: {
        Row: {
          budget_amount: number | null;
          created_at: string | null;
          created_by: string | null;
          description: string | null;
          group_avatar: string | null;
          group_id: string;
          group_name: string;
          invite_code: string;
        };
        Insert: {
          budget_amount?: number | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          group_avatar?: string | null;
          group_id?: string;
          group_name: string;
          invite_code: string;
        };
        Update: {
          budget_amount?: number | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          group_avatar?: string | null;
          group_id?: string;
          group_name?: string;
          invite_code?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'groups_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['user_id'];
          },
        ];
      };
      media: {
        Row: {
          created_at: string | null;
          expense_id: string | null;
          media_id: string;
          message_id: string | null;
          type: string | null;
          url: string;
        };
        Insert: {
          created_at?: string | null;
          expense_id?: string | null;
          media_id?: string;
          message_id?: string | null;
          type?: string | null;
          url: string;
        };
        Update: {
          created_at?: string | null;
          expense_id?: string | null;
          media_id?: string;
          message_id?: string | null;
          type?: string | null;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'media_expense_id_fkey';
            columns: ['expense_id'];
            isOneToOne: false;
            referencedRelation: 'expenses';
            referencedColumns: ['expense_id'];
          },
          {
            foreignKeyName: 'media_message_id_fkey';
            columns: ['message_id'];
            isOneToOne: false;
            referencedRelation: 'messages';
            referencedColumns: ['message_id'];
          },
        ];
      };
      messages: {
        Row: {
          content: string | null;
          created_at: string | null;
          group_id: string;
          message_id: string;
          sender_id: string;
        };
        Insert: {
          content?: string | null;
          created_at?: string | null;
          group_id: string;
          message_id?: string;
          sender_id: string;
        };
        Update: {
          content?: string | null;
          created_at?: string | null;
          group_id?: string;
          message_id?: string;
          sender_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'messages_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'groups';
            referencedColumns: ['group_id'];
          },
          {
            foreignKeyName: 'messages_sender_id_fkey';
            columns: ['sender_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['user_id'];
          },
        ];
      };
      notifications: {
        Row: {
          created_at: string | null;
          data: Json | null;
          is_read: boolean | null;
          message: string;
          notification_id: string;
          title: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          data?: Json | null;
          is_read?: boolean | null;
          message: string;
          notification_id?: string;
          title: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          data?: Json | null;
          is_read?: boolean | null;
          message?: string;
          notification_id?: string;
          title?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['user_id'];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bank_info: Json | null;
          created_at: string | null;
          email: string;
          full_name: string;
          phone_number: string | null;
          user_id: string;
        };
        Insert: {
          avatar_url?: string | null;
          bank_info?: Json | null;
          created_at?: string | null;
          email: string;
          full_name: string;
          phone_number?: string | null;
          user_id: string;
        };
        Update: {
          avatar_url?: string | null;
          bank_info?: Json | null;
          created_at?: string | null;
          email?: string;
          full_name?: string;
          phone_number?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
