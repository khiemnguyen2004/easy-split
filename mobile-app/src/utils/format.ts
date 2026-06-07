/** Shared number/date/currency formatting (Vietnamese locale, VND). */

const LOCALE = 'vi-VN';
const CURRENCY_SUFFIX = 'đ';

type DateInput = string | number | Date | null | undefined;

/** Plain grouped number, e.g. 1.000.000 (no currency suffix). */
export const formatNumber = (amount: number) => amount.toLocaleString(LOCALE);

/** Currency with the VND suffix, e.g. 1.000.000đ. Pass `abs` to drop the sign. */
export const formatCurrency = (amount: number, opts?: { abs?: boolean }) =>
  formatNumber(opts?.abs ? Math.abs(amount) : amount) + CURRENCY_SUFFIX;

/** Short day/month, e.g. 15/06. Returns '' for a nullish date. */
export const formatDate = (date: DateInput) =>
  date == null
    ? ''
    : new Date(date).toLocaleDateString(LOCALE, { day: '2-digit', month: '2-digit' });

/** Full localized date, e.g. 15/06/2026. */
export const formatFullDate = (date: DateInput) =>
  date == null ? '' : new Date(date).toLocaleDateString(LOCALE);

/** Day/month + time, e.g. 15/06 14:30. */
export const formatDateTime = (date: DateInput) =>
  date == null
    ? ''
    : new Date(date).toLocaleString(LOCALE, {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });

/** Time only, e.g. 14:30. */
export const formatTime = (date: DateInput) =>
  date == null ? '' : new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

/**
 * Group a raw amount-input string with thousand separators as the user types,
 * e.g. "1000000" → "1.000.000". Strips any non-digit characters first.
 */
export const formatAmountInput = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  return digits ? Number(digits).toLocaleString(LOCALE) : '';
};

/** Parse a (possibly grouped) amount string back to a number, e.g. "1.000.000" → 1000000. */
export const parseAmount = (value: string): number => {
  const digits = value.replace(/\D/g, '');
  return digits ? Number(digits) : 0;
};
