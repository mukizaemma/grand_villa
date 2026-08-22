import { Coffee, Wifi, MapPin, BedDouble, ParkingCircle, UtensilsCrossed, Waves, Bell } from 'lucide-react'

export const FEATURE_ICONS = {
  coffee: Coffee,
  wifi: Wifi,
  'map-pin': MapPin,
  bed: BedDouble,
  parking: ParkingCircle,
  utensils: UtensilsCrossed,
  waves: Waves,
  bell: Bell,
}

export const DEFAULT_HOME_FEATURES = [
  { icon: 'coffee', title: 'Breakfast included', text: 'A calm start before meetings or a morning run.' },
  { icon: 'wifi', title: 'Free high-speed Wi-Fi', text: 'Work from your room without hunting for a signal.' },
  { icon: 'map-pin', title: 'Prime location', text: 'By Lake Kivu in Karongi, with town and the shoreline close by.' },
  { icon: 'bed', title: 'Comfort & convenience', text: 'Thoughtful rooms for couples, families, and business stays.' },
]
