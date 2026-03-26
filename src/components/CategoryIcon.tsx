import { Monitor, Trophy, Leaf, Briefcase, Gamepad2, Users, Sparkles, MessageCircle, Clapperboard, Heart, UtensilsCrossed, Moon, HeartHandshake, BriefcaseBusiness, Plane, Wallet } from 'lucide-react'

const icons: Record<string, React.ReactNode> = {
  technology:     <Monitor size={14} />,
  tech:           <Monitor size={14} />,
  sports:         <Trophy size={14} />,
  lifestyle:      <Leaf size={14} />,
  business:       <Briefcase size={14} />,
  gaming:         <Gamepad2 size={14} />,
  family:         <Users size={14} />,
  women:          <Sparkles size={14} />,
  "women's space": <Sparkles size={14} />,
  open:           <MessageCircle size={14} />,
  entertainment:  <Clapperboard size={14} />,
  health:         <Heart size={14} />,
  food:           <UtensilsCrossed size={14} />,
  religion:       <Moon size={14} />,
  relationships:  <HeartHandshake size={14} />,
  career:         <BriefcaseBusiness size={14} />,
  travel:         <Plane size={14} />,
  finance:        <Wallet size={14} />,
}

export default function CategoryIcon({ slug }: { slug: string }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', lineHeight: 1 }}>{icons[slug?.toLowerCase()] || <MessageCircle size={14} />}</span>
}
