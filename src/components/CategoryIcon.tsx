import { Monitor, Trophy, Leaf, Briefcase, Gamepad2, Users, Sparkles, MessageCircle } from 'lucide-react'

const icons: Record<string, React.ReactNode> = {
  tech:      <Monitor size={14} />,
  sports:    <Trophy size={14} />,
  lifestyle: <Leaf size={14} />,
  business:  <Briefcase size={14} />,
  gaming:    <Gamepad2 size={14} />,
  family:    <Users size={14} />,
  women:     <Sparkles size={14} />,
  open:      <MessageCircle size={14} />,
}

export default function CategoryIcon({ slug }: { slug: string }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', lineHeight: 1 }}>{icons[slug?.toLowerCase()] || <MessageCircle size={14} />}</span>
}