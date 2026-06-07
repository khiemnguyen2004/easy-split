import { User } from '@supabase/supabase-js';
import i18n from '../i18n';
import { supabase } from '../api/supabase';

export interface UpdateProfilePayload {
  full_name: string;
  phone_number?: string | null;
}

export const accountService = {
  /**
   * Update the signed-in user's profile.
   *
   * Writes to the `profiles` table (the source of truth used across the app)
   * and mirrors `full_name` / `phone` into auth `user_metadata` so screens that
   * read `user.user_metadata` (e.g. the settings header) stay in sync.
   * Returns the refreshed auth user.
   */
  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error(i18n.t('account.errNotLoggedIn'));

    const fullName = payload.full_name.trim();
    const phone = payload.phone_number?.trim() ? payload.phone_number.trim() : null;

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ full_name: fullName, phone_number: phone })
      .eq('user_id', user.id);
    if (profileError) throw profileError;

    const { data: updated, error: authError } = await supabase.auth.updateUser({
      data: { full_name: fullName, phone },
    });
    if (authError) throw authError;

    return updated.user;
  },

  /**
   * Change the signed-in user's password.
   *
   * Supabase doesn't verify the current password on `updateUser`, so we first
   * re-authenticate with it to confirm the user knows their existing password
   * before applying the new one.
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user?.email) throw new Error(i18n.t('account.errNoAccount'));

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (signInError) throw new Error(i18n.t('account.errWrongPassword'));

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) throw updateError;
  },
};
