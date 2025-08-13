// src/seeds/data/ratings.seed-data.ts
import { v4 as uuid } from 'uuid';

export const ratingsSeed = [
    {
        driverId: 'b5041c53-bcf6-4cf0-bf79-724cf3f337ad', // Replace with an actual Driver UUID
        passengerPhone: '+237612345978',
        rating: 5,
        comment: 'Great service!',
        categories: {
            safety: 5,
            punctuality: 4,
            vehicle_condition: 5,
        },
        createdAt: new Date(),
    },
    {
        driverId: 'b5041c53-bcf6-4cf0-bf79-724cf3f337ad',
        passengerPhone: '+237699167233',
        rating: 4,
        comment: 'Very punctual and friendly driver.',
        categories: {
            safety: 4,
            punctuality: 5,
            vehicle_condition: 4,
        },
        createdAt: new Date(),
    },
    {
        driverId: 'b5041c53-bcf6-4cf0-bf79-724cf3f337ad',
        passengerPhone: '+237645112233',
        rating: 4,
        comment: 'Very punctual',
        categories: {
            safety: 4,
            punctuality: 5,
            vehicle_condition: 4,
        },
        createdAt: new Date(),
    },
    {
        driverId: 'b5041c53-bcf6-4cf0-bf79-724cf3f337ad',
        passengerPhone: '+237699123233',
        rating: 4,
        comment: 'friendly driver.',
        categories: {
            safety: 4,
            punctuality: 5,
            vehicle_condition: 4,
        },
        createdAt: new Date(),
    },
];
