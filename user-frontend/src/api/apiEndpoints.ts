// src/api/apiEndpoints.ts

export const API_ENDPOINTS = {

  DRIVERS: {
    BASE: '/drivers',
    CREATE: '/drivers',
    GET_BY_ID: (id: string) => `drivers/${id}`,
    UPDATE: (id: string) => `drivers/${id}`,
    VERIFY_PHOTOS: (id: string) => `drivers/${id}/photos/verify`,

    // Ratings
    RATINGS: {
      BASE: '/drivers/ratings',
      GET_BY_ID: (id: string) => `drivers/${id}/ratings`,
    },

    AUTH: {
      LOGIN: 'auth/drivers/login',
      VERIFY_OPT: 'auth/driver/verify-opt',
      REFRESH: 'auth/refresh'
    }
  },

  RATES: {
    FARE: {
      BASE: '/rates',
      GET_ALL_RATES: 'fares/rates',
      GET_BY_VEHICLE_TYPE: (id: string) => `rates/vehicle-type/${id}`,
    },

    //Region
    REGION: {
      BASE: 'fates/regional-multipliers',
      GET_RATES: 'fares/regional-multipliers',
      GET_BY_ID: (id: string) => `regional-multipliers/region/${id}`
    },
  },

  TAX: {
    BASE: 'tax',
    GET_TAX_ACCOUNT: (id: string) => `tax/tax/driver/${id}`
  },

  TRIP: {
    BASE: '/trip',
    CREATE: 'trip/',
    END: 'trip/end',
    CREATE_TRIP_GPS_TRACKING: 'trip/gps',
    GET_TRIPS_BY_DRIVER: (id: string) => `trip/${id}`,
    GET_TRIP_DETAILS: (id: string) => `trip/${id}`
  },

  VEHICLE: {
    BASE: '/vehicles',
    CREATE: 'vehicles/',
    GET_BY_ID: (id: string) => `vehicles/${id}`,

    // Vehicle Types
    VEHICLE_TYPE: {
      BASE: '/vehicles/types',
      GET_TYPE: '/vehicles/types/',
      GET_BY_ID: (id: string) => `/vehicles/types/${id}`,
    },
  },

  DOCUMENT: {
    BASE: 'documents/upload',
    CREATE: 'documents/upload/',
    CREATE_MULTIPLE: 'documents/upload/multiple'
  },

  GEOGRAPHY: {
    CITIES: {
      BASE: '/geography',
      GET_ALL: '/geography/cities',
      GET_MAJOR: '/geography/cities/major',
      GET_BY_ID: (id: string) => `/geography/cities/${id}`,
      GET_BY_REGION_ID: (regionId: string) => `/geography/regions/${regionId}/cities`
    },
    REGIONS: {
      BASE: '/regions',
      GET_ALL: '/geography/regions',
      GET_BY_ID: (id: string) => `/geography/regions/${id}`,
      GET_CITIES_BY_REGION_ID: (id: string) => `/geography/regions/${id}/cities`
    }
  }

};