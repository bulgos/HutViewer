export type OpeningType = 'closed' | 'open' | 'serviced';
type ServiceMap = Partial<{
  "drinks": boolean;
  "internet": boolean;
  "not_paid": boolean;
  "css_rebate": boolean;
  "half_board": boolean;
  "plain_meals": boolean;
  "family_rooms": boolean;
  "payment_mobile": boolean;
  "cooking_catered": boolean;
  "dogs_on_request": boolean;
  "payment_creditcard": boolean;
  "cooking_non_catered": boolean;
  "separable_group_rooms": boolean;
}>;
type SuitabilityMap = Partial<{
  "family": boolean;
  "climbing": boolean;
  "alpine_tour": boolean;
  "via_ferrata": boolean;
  "climbing_kids": boolean;
  "mountain_hiking": boolean;
  "ski_snowboard_tour": boolean;
}>;

export type HutType = {
  location: [number, number];
  geographical_name: string;
  sleeps: number;
  id: number;
  apiId: number;
  is_private: boolean;
  openings: OpeningType[]; // should have 12 of them
  services: ServiceMap;
  suitable: SuitabilityMap;
};
