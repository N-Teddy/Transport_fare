// utils/fareUtils.ts
export const calculateFare = (
    baseFare: number,
    perKmRate: number,
    distanceKm: number,
    durationMinutes: number,
    nightMultiplier: number = 1,
    regionalMultiplier: number = 1
): any => {
    const distanceFare = perKmRate * distanceKm;
    const timeFare = durationMinutes * 50; // 50 FCFA per minute (adjust as needed)
    const subtotal = baseFare + distanceFare + timeFare;
    const totalFare = subtotal * nightMultiplier * regionalMultiplier;

    return {
        baseFare: Math.round(baseFare),
        distanceFare: Math.round(distanceFare),
        timeFare: Math.round(timeFare),
        surcharges: 0,
        totalFare: Math.round(totalFare)
    };
};
