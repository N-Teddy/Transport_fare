// pages/TripPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import MapComponent, { type MapComponentRef } from '../components/MapComponent';
import { calculateFare } from '../utils/fareUtils';
import { useCreateTrip, useEndTrip } from '../hooks/tripHook';
import { useGetVehicle } from '../hooks/vehicleHook';
// Your existing hooks

// interface Trip {
//     id: string;
//     number: number;
//     startTime: string;
//     distance: number;
//     duration: number;
//     fare: number;
//     status: 'active' | 'ended';
//     startLocation?: [number, number];
//     endLocation?: [number, number];
//     timer?: NodeJS.Timeout;
// }

const TripPage: React.FC = () => {
    const mapRef = useRef<MapComponentRef>(null);
    // const [trips, setTrips] = useState<Trip[]>([]);
    const [activeTrips, setActiveTrips] = useState<any[]>([]);
    const [vehicleData, setVehicleData] = useState<any>(null);
    const [fareRates, setFareRates] = useState<any>(null);
    const [regionalMultiplier, setRegionalMultiplier] = useState<number>(1);
    const maxTrips = 4;
        const navigate = useNavigate();


    // Decode JWT to get userId
    const getDriverId = () => {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                return decoded.sub || decoded.userId;
            } catch (error) {
                console.error('Error decoding token:', error);
                return null;
            }
        }
        return null;
    };

    const driverId = getDriverId();

    // Hooks
    const { data: vehicleResponse, isLoading: vehicleLoading } = useGetVehicle(driverId || '', !!driverId);
    const createTripMutation = useCreateTrip();
    const endTripMutation = useEndTrip();

    // Get vehicle data and store in localStorage
    useEffect(() => {
        if (vehicleResponse?.status === 'success' && vehicleResponse.data.items.length > 0) {
            const vehicle = vehicleResponse.data.items[0];
            setVehicleData(vehicle);

            // Store in localStorage
            localStorage.setItem('vehicleInfo', JSON.stringify({
                vehicleId: vehicle.id,
                ownerDriverId: vehicle.ownerDriverId
            }));

            // Fetch fare rates for vehicle type
            fetchFareRates(vehicle.vehicleType.id);

            // Fetch regional multiplier
            if (vehicle.ownerDriver?.cityId) {
                fetchRegionalMultiplier(vehicle.ownerDriver.cityId);
            }
        }
    }, [vehicleResponse]);

    const fetchFareRates = async (vehicleTypeId: string) => {
        try {
            const response = await fetch(`/api/rates/fare/vehicle-type/${vehicleTypeId}`);
            const data = await response.json();
            if (data.status === 'success' && data.data.items.length > 0) {
                setFareRates(data.data.items[0]);
            }
        } catch (error) {
            console.error('Error fetching fare rates:', error);
        }
    };

    const fetchRegionalMultiplier = async (cityId: string) => {
        try {
            // First get city details
            const cityResponse = await fetch(`/api/geography/cities/${cityId}`);
            const cityData = await cityResponse.json();

            if (cityData.regionId) {
                // Then get regional multiplier
                const multiplierResponse = await fetch(`/api/rates/regional-multiplier/region/${cityData.regionId}`);
                const multiplierData = await multiplierResponse.json();

                if (multiplierData.data && multiplierData.data.length > 0) {
                    setRegionalMultiplier(parseFloat(multiplierData.data[0].multiplier));
                }
            }
        } catch (error) {
            console.error('Error fetching regional multiplier:', error);
        }
    };

    const handleAddTrip = async () => {
        if (activeTrips.length >= maxTrips) {
            alert(`Maximum ${maxTrips} trips allowed`);
            return;
        }

        try {
            const currentLocation = await mapRef.current?.getCurrentLocation();
            const tripNumber = activeTrips.length + 1;

            const payload = {
                driverId: vehicleData.ownerDriverId,
                vehicleId: vehicleData.id,
                startTime: new Date().toISOString(),
                startLatitude: currentLocation?.[0] || 0,
                startLongitude: currentLocation?.[1] || 0,
                dataSource: 'web_app'
            };

            const response = await createTripMutation.mutateAsync(payload);

            if (response.status === 'success') {
                const newTrip = {
                    ...response.data,
                    number: tripNumber,
                    distance: 0,
                    duration: 0,
                    startTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    status: 'active' as const,
                    startLocation: currentLocation
                };

                // Add marker to map
                mapRef.current?.addTripMarker(response.data.id, tripNumber);

                // Start duration timer
                const timer = setInterval(() => {
                    setActiveTrips(prev => prev.map(trip =>
                        trip.id === response.data.id
                            ? { ...trip, duration: trip.duration + 1 }
                            : trip
                    ));
                }, 60000); // Update every minute

                setActiveTrips(prev => [...prev, { ...newTrip, timer }]);
            }
        } catch (error) {
            console.error('Error creating trip:', error);
            alert('Failed to create trip');
        }
    };

    const handleEndTrip = async (tripId: string) => {
        const trip = activeTrips.find(t => t.id === tripId);
        if (!trip) return;

        try {
            const endLocation = await mapRef.current?.getCurrentLocation();
            const distance = await mapRef.current?.calculateRoute(
                trip.startLocation || [0, 0],
                endLocation || [0, 0]
            ) || 0;

            const fareDetails = calculateFare(
                fareRates?.baseFare || 1000,
                fareRates?.perKmRate || 100,
                distance,
                trip.duration,
                parseFloat(fareRates?.nightMultiplier || '1'),
                regionalMultiplier
            );

            const payload = {
                tripId: tripId,
                endTime: new Date().toISOString(),
                endLatitude: endLocation?.[0] || 0,
                endLongitude: endLocation?.[1] || 0,
                distanceKm: distance,
                durationMinutes: trip.duration,
                baseFare: fareDetails.baseFare,
                distanceFare: fareDetails.distanceFare,
                timeFare: fareDetails.timeFare,
                surcharges: fareDetails.surcharges,
                totalFare: fareDetails.totalFare,
                paymentMethod: 'cash'
            };

            const response = await endTripMutation.mutateAsync(payload);

            if (response.status === 'success') {
                // Clear timer
                if (trip.timer) {
                    clearInterval(trip.timer);
                }

                // Remove marker
                mapRef.current?.removeTripMarker(tripId);

                // Remove from active trips
                setActiveTrips(prev => prev.filter(t => t.id !== tripId));

                // Renumber remaining trips
                setActiveTrips(prev => prev.map((t, index) => ({ ...t, number: index + 1 })));
            }
        } catch (error) {
            console.error('Error ending trip:', error);
            alert('Failed to end trip');
        }
    };

    if (vehicleLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500"></div>
            </div>
        );
    }

    // Trip card colors
    const tripColors = ['#10b981', '#3b82f6', '#f97316', '#a855f7'];

    return (
        <div className="h-screen relative overflow-hidden">
            {/* Map Container */}
            <div className="absolute inset-0">
                <MapComponent ref={mapRef} />
            </div>

            {/* Back to Dashboard Button */}
            <button
                onClick={() => navigate('/dashboard')}
                className="absolute top-5 right-5 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors shadow-lg"
                style={{ zIndex: 1000 }}
            >
                Back to Dashboard
            </button>

            {/* Route Info Banner */}
            <div
                className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg"
                style={{ zIndex: 1000 }}
            >
                <span className="text-sm text-gray-600">
                    Active Trips: <span className="font-semibold text-emerald-500">{activeTrips.length}</span> / {maxTrips}
                </span>
            </div>

            {/* Trips Container */}
            <div
                className="absolute bottom-0 left-0 right-0 bg-transparent p-4 max-h-[70vh] overflow-y-auto"
                style={{ zIndex: 1000, pointerEvents: 'none' }}
            >
                <div className="space-y-3" style={{ pointerEvents: 'auto' }}>
                    {/* Empty State */}
                    {activeTrips.length === 0 && (
                        <div className="bg-white rounded-2xl p-8 text-center shadow-xl">
                            <h3 className="text-gray-600 text-lg font-semibold mb-2">No Active Trips</h3>
                            <p className="text-gray-400 text-sm">Click the + button to start a new trip</p>
                        </div>
                    )}

                    {/* Trip Cards */}
                    {activeTrips.map((trip, index) => (
                        <div
                            key={trip.id}
                            className="bg-white rounded-2xl p-4 shadow-xl"
                            style={{ borderLeft: `4px solid ${tripColors[index % tripColors.length]}` }}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                                        style={{ backgroundColor: tripColors[index % tripColors.length] }}
                                    >
                                        {trip.number}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            <span className="font-semibold text-gray-700 text-sm">Trip in Progress</span>
                                        </div>
                                        <span className="text-xs text-gray-500">ID: #{trip.id.slice(0, 8)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-2 mb-3">
                                <div className="text-center p-2 bg-gray-50 rounded-lg">
                                    <div className="text-xs text-gray-500 uppercase">Distance</div>
                                    <div className="font-semibold text-sm">{trip.distance.toFixed(1)} km</div>
                                </div>
                                <div className="text-center p-2 bg-gray-50 rounded-lg">
                                    <div className="text-xs text-gray-500 uppercase">Duration</div>
                                    <div className="font-semibold text-sm">{trip.duration} min</div>
                                </div>
                                <div className="text-center p-2 bg-gray-50 rounded-lg">
                                    <div className="text-xs text-gray-500 uppercase">Start</div>
                                    <div className="font-semibold text-sm">{trip.startTime}</div>
                                </div>
                                <div className="text-center p-2 bg-gray-50 rounded-lg">
                                    <div className="text-xs text-gray-500 uppercase">Fare</div>
                                    <div className="font-semibold text-sm text-emerald-500">
                                        {Math.round((fareRates?.baseFare || 1000) + (fareRates?.perKmRate || 100) * trip.distance)} FCFA
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleEndTrip(trip.id)}
                                className="w-full py-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors font-semibold text-sm"
                            >
                                End Trip
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Trip Button */}
            <button
                onClick={handleAddTrip}
                disabled={activeTrips.length >= maxTrips}
                className={`absolute bottom-5 right-5 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all ${activeTrips.length >= maxTrips
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-emerald-500 hover:bg-emerald-600 hover:scale-110'
                    }`}
                style={{ zIndex: 1001 }}
            >
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
                {activeTrips.length > 0 && (
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {activeTrips.length}
                    </span>
                )}
            </button>
        </div>
    );
};

export default TripPage;
