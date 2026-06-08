const GROUP_BG_IMAGES = [
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80', // Friends
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80', // Team/Work
  'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=400&q=80', // Group meeting
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400&q=80', // Trip planning
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80', // Event/Party
];

/**
 * Returns a stable, beautiful, blurred group-themed background image Unsplash URL
 * based on the unique group ID.
 */
export const getGroupBgImage = (groupId: string): string => {
  if (!groupId) return GROUP_BG_IMAGES[0];
  let hash = 0;
  for (let i = 0; i < groupId.length; i++) {
    hash = groupId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GROUP_BG_IMAGES.length;
  return GROUP_BG_IMAGES[index];
};
