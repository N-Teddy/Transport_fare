export const fareSeed = [
    {
        vehicleTypeId: '6a949cdc-5a50-42ff-a4af-142bd9d3eccc', // taxi
        baseFare: 500,
        perKmRate: 70,
        nightMultiplier: 1.2,
        effectiveFrom: new Date('2024-01-15T00:00:00Z'),
        effectiveUntil: new Date('2024-12-31T23:59:59Z'),
        isActive: true,
        notes: 'Standard taxi fare rate for urban areas',
    },
    {
        vehicleTypeId: '1d26d319-5b3f-496a-85ba-f6e41b5099ae', // bus
        baseFare: 1000,
        perKmRate: 100,
        nightMultiplier: 1.1,
        effectiveFrom: new Date('2024-01-15T00:00:00Z'),
        effectiveUntil: new Date('2024-12-31T23:59:59Z'),
        isActive: true,
        notes: 'Standard bus fare for intercity and urban routes',
    },
    {
        vehicleTypeId: 'cc547ee5-745b-400a-a5fb-89c3e5de0291', // truck
        baseFare: 3000,
        perKmRate: 300,
        nightMultiplier: 1.0,
        effectiveFrom: new Date('2024-01-15T00:00:00Z'),
        effectiveUntil: new Date('2024-12-31T23:59:59Z'),
        isActive: true,
        notes: 'Base cargo transport fare for trucks',
    },
];
