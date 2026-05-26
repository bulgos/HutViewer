export const SERVICE_LABELS = {
  drinks: 'Drinks',
  internet: 'Internet',
  not_paid: 'Members / no fee',
  css_rebate: 'CSS rebate',
  half_board: 'Half board',
  plain_meals: 'Meals',
  family_rooms: 'Family rooms',
  payment_mobile: 'Mobile pay',
  cooking_catered: 'Catered cooking',
  dogs_on_request: 'Dogs on request',
  payment_creditcard: 'Card payment',
  cooking_non_catered: 'Self-catering kitchen',
  separable_group_rooms: 'Group rooms',
} as const;

export const SUITABILITY_LABELS = {
  family: 'Families',
  climbing: 'Climbing',
  alpine_tour: 'Alpine tours',
  via_ferrata: 'Via ferrata',
  climbing_kids: 'Kids climbing',
  mountain_hiking: 'Hiking',
  ski_snowboard_tour: 'Ski / snowboard tours',
} as const;

export type ServiceKey = keyof typeof SERVICE_LABELS;
export type SuitabilityKey = keyof typeof SUITABILITY_LABELS;

export const SERVICE_KEYS = Object.keys(SERVICE_LABELS) as ServiceKey[];
export const SUITABILITY_KEYS = Object.keys(SUITABILITY_LABELS) as SuitabilityKey[];
