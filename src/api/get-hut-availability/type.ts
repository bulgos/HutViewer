const ExampleAvailability = [
  {
    freeBedsPerCategory: {
      '576': 17
    },
    freeBeds: 17,
    hutStatus: 'SERVICED',
    date: '2026-05-21T00:00:00Z',
    dateFormatted: '21.05.2026',
    totalSleepingPlaces: 24,
    percentage: 'AVAILABLE'
  },
  {
    freeBedsPerCategory: {
      '576': 2
    },
    freeBeds: 2,
    hutStatus: 'SERVICED',
    date: '2026-05-22T00:00:00Z',
    dateFormatted: '22.05.2026',
    totalSleepingPlaces: 24,
    percentage: 'NEARLY FULL'
  }
] as const;

export type HutAvailabilityApi = typeof ExampleAvailability;
