import {
  Beef, Briefcase, Camera, Car, Coffee, Cpu, Flame, GraduationCap, Heart, Home, Landmark, Leaf, Map as MapIcon,
  MessageCircle, MessagesSquare, MapPin, Mountain, Music, Newspaper, Palette, PawPrint, Gamepad2, ShoppingBag,
  Store, Tag, Users, Utensils, HelpCircle, Sparkles, Ticket, Bed, ShoppingBasket, Activity, Wine, Wrench, Landmark as Temple,
  type LucideIcon,
} from "lucide-react";

export const ICONS: Record<string, LucideIcon> = {
  flame: Flame,
  talk: MessagesSquare,
  food: Utensils,
  cafe: Coffee,
  events: Music,
  business: Store,
  home: Home,
  car: Car,
  tech: Cpu,
  education: GraduationCap,
  jobs: Briefcase,
  market: ShoppingBag,
  heart: Heart,
  pets: PawPrint,
  photo: Camera,
  travel: Mountain,
  agri: Leaf,
  games: Gamepad2,
  art: Palette,
  news: Newspaper,
  qa: HelpCircle,
  community: Users,
  pin: MapPin,
  map: MapIcon,
  deal: Tag,
  chat: MessageCircle,
  sparkle: Sparkles,
  ticket: Ticket,
  hotel: Bed,
  shopping: ShoppingBasket,
  activity: Activity,
  nightlife: Wine,
  service: Wrench,
  temple: Temple,
  beef: Beef,
  landmark: Landmark,
};

export function RoomIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? MessagesSquare;
  return <Icon className={className} aria-hidden="true" />;
}
