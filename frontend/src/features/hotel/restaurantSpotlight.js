import { UtensilsCrossed, Wine, Coffee } from 'lucide-react'

export const RESTAURANT_FEATURE_ICONS = {
  food: UtensilsCrossed,
  drinks: Wine,
  coffee: Coffee,
}

export const DEFAULT_RESTAURANT_FEATURES = [
  { icon: 'food', title: 'Delicious food', text: 'Fresh local & international dishes.' },
  { icon: 'drinks', title: 'Refreshing drinks', text: 'Cocktails, wine & more.' },
  { icon: 'coffee', title: 'Gourmet coffee', text: 'Specialty coffee & pastries.' },
]
