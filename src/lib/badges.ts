export interface Badge {
  id: string
  label: string
  emoji: string
  description: string
}

export const ALL_BADGES: Badge[] = [
  { id: 'first_post', label: 'First Post', emoji: '✍️', description: 'Posted for the first time' },
  { id: 'post_10', label: 'Regular', emoji: '📝', description: 'Made 10 posts' },
  { id: 'post_50', label: 'Prolific', emoji: '🖊️', description: 'Made 50 posts' },
  { id: 'upvote_10', label: 'Noticed', emoji: '👀', description: 'Received 10 upvotes on a post' },
  { id: 'upvote_50', label: 'Popular', emoji: '🔥', description: 'Received 50 upvotes on a post' },
  { id: 'upvote_100', label: 'Viral', emoji: '🚀', description: 'Received 100 upvotes on a post' },
  { id: 'trust_active', label: 'Active Member', emoji: '⭐', description: 'Reached Active trust level' },
  { id: 'trust_trusted', label: 'Trusted', emoji: '🏅', description: 'Reached Trusted trust level' },
  { id: 'trust_top', label: 'Top Member', emoji: '👑', description: 'Reached Top trust level' },
  { id: 'referral_1', label: 'Recruiter', emoji: '🤝', description: 'Referred 1 person to wiispr' },
  { id: 'referral_5', label: 'Ambassador', emoji: '🌟', description: 'Referred 5 people to wiispr' },
]

export function computeBadges(user: {
  post_count?: number
  max_post_upvotes?: number
  trust_level?: string
  referral_count?: number
}): string[] {
  const earned: string[] = []
  const posts = user.post_count || 0
  const upvotes = user.max_post_upvotes || 0
  const trust = user.trust_level || 'new'
  const referrals = user.referral_count || 0

  if (posts >= 1) earned.push('first_post')
  if (posts >= 10) earned.push('post_10')
  if (posts >= 50) earned.push('post_50')
  if (upvotes >= 10) earned.push('upvote_10')
  if (upvotes >= 50) earned.push('upvote_50')
  if (upvotes >= 100) earned.push('upvote_100')
  if (['active', 'trusted', 'top'].includes(trust)) earned.push('trust_active')
  if (['trusted', 'top'].includes(trust)) earned.push('trust_trusted')
  if (trust === 'top') earned.push('trust_top')
  if (referrals >= 1) earned.push('referral_1')
  if (referrals >= 5) earned.push('referral_5')

  return earned
}
