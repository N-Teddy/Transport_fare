// TripDetailsModal.tsx
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    MapPin,
    Clock,
    Calendar,
    DollarSign,
    CreditCard,
    Car,
    Phone,
    Navigation,
    CheckCircle,
    AlertCircle,
    Route,
    Play,
    Square,
    Download,
    Flag,
    Map as MapIcon,
    Receipt,
    RefreshCw,
} from 'lucide-react';
import { format, parseISO, differenceInMinutes } from 'date-fns';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Fix for default markers in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
});

interface Trip {
    id: string;
    createdAt: string;
    updatedAt: string;
    driverId: string;
    vehicleId: string;
    meterId: string | null;
    startTime: string;
    endTime: string | null;
    startLatitude: string;
    startLongitude: string;
    endLatitude: string | null;
    endLongitude: string | null;
    distanceKm: string;
    durationMinutes: number | null;
    baseFare: number;
    distanceFare: number;
    timeFare: number;
    surcharges: number;
    totalFare: number;
    paymentMethod: string;
    paymentStatus: string;
    paymentReference: string | null;
    passengerPhone: string | null;
    dataSource: string;
    syncStatus: string;
    syncedAt: string | null;
}

interface TripDetailsModalProps {
    trip: Trip;
    isOpen: boolean;
    onClose: () => void;
}

const TripDetailsModal: React.FC<TripDetailsModalProps> = ({ trip, isOpen, onClose }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);

    useEffect(() => {
        if (isOpen && mapRef.current && !mapInstanceRef.current) {
            // Initialize map after modal opens
            setTimeout(() => {
                initializeMap();
            }, 100);
        }

        return () => {
            // Cleanup map on unmount
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [isOpen]);

    const initializeMap = () => {
        if (!mapRef.current || mapInstanceRef.current) return;

        const startLat = parseFloat(trip.startLatitude);
        const startLng = parseFloat(trip.startLongitude);
        const endLat = trip.endLatitude ? parseFloat(trip.endLatitude) : startLat;
        const endLng = trip.endLongitude ? parseFloat(trip.endLongitude) : startLng;

        // Initialize the map
        const map = L.map(mapRef.current).setView([startLat, startLng], 14);
        mapInstanceRef.current = map;

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);

        // Create custom icons for start and end markers
        const startIcon = L.divIcon({
            html: `
        <div style="
          background-color: #10b981;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 3px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        ">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
      `,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -15],
            className: 'custom-div-icon'
        });

        const endIcon = L.divIcon({
            html: `
        <div style="
          background-color: #ef4444;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 3px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        ">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
            <rect x="6" y="6" width="12" height="12"/>
          </svg>
        </div>
      `,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -15],
            className: 'custom-div-icon'
        });

        // Add start marker
        L.marker([startLat, startLng], { icon: startIcon })
            .addTo(map)
            .bindPopup(`
        <b>Start Point</b><br>
        Time: ${format(parseISO(trip.startTime), 'h:mm a')}<br>
        Coordinates: ${startLat.toFixed(6)}, ${startLng.toFixed(6)}
      `);

        // Add end marker if trip has ended
        if (trip.endLatitude && trip.endLongitude) {
            L.marker([endLat, endLng], { icon: endIcon })
                .addTo(map)
                .bindPopup(`
          <b>End Point</b><br>
          Time: ${trip.endTime ? format(parseISO(trip.endTime), 'h:mm a') : 'Ongoing'}<br>
          Coordinates: ${endLat.toFixed(6)}, ${endLng.toFixed(6)}
        `);

            // Fetch and draw the actual driving route
            fetchRoute(startLat, startLng, endLat, endLng, map);
        }
    };

    const fetchRoute = async (startLat: number, startLng: number, endLat: number, endLng: number, map: L.Map) => {
        try {
            // OSRM public server for routing
            const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.routes && data.routes.length > 0) {
                const route = data.routes[0];

                // Extract coordinates from the route
                const coordinates = route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]] as L.LatLngTuple);

                // Draw the route on the map
                const routeLine = L.polyline(coordinates, {
                    color: '#3b82f6',
                    weight: 4,
                    opacity: 0.7,
                    smoothFactor: 1
                }).addTo(map);

                // Calculate route statistics
                const distance = (route.distance / 1000).toFixed(2); // Convert to km
                const duration = Math.round(route.duration / 60); // Convert to minutes

                setRouteInfo({ distance, duration: `${duration}` });

                routeLine.bindPopup(`
          <b>Route Information</b><br>
          Distance: ${distance} km<br>
          Estimated Duration: ${duration} minutes
        `);

                // Fit map to show the entire route
                const bounds = L.latLngBounds(coordinates);
                map.fitBounds(bounds, { padding: [50, 50] });
            } else {
                // Fallback to straight line if routing fails
                drawStraightLine(startLat, startLng, endLat, endLng, map);
            }
        } catch (error) {
            console.error('Error fetching route:', error);
            drawStraightLine(startLat, startLng, endLat, endLng, map);
        }
    };

    const drawStraightLine = (startLat: number, startLng: number, endLat: number, endLng: number, map: L.Map) => {
        const routeLine = L.polyline([
            [startLat, startLng],
            [endLat, endLng]
        ], {
            color: '#ef4444',
            weight: 3,
            opacity: 0.5,
            dashArray: '10, 10',
            smoothFactor: 1
        }).addTo(map);

        routeLine.bindPopup('<b>Direct Path</b><br><i>Actual route unavailable</i>');

        const bounds = L.latLngBounds([
            [startLat, startLng],
            [endLat, endLng]
        ]);
        map.fitBounds(bounds, { padding: [50, 50] });
    };

    const formatDuration = (minutes: number | null) => {
        if (!minutes) return 'Ongoing';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins} min`;
    };

    const getStatusColor = () => {
        switch (trip.paymentStatus) {
            case 'completed':
                return 'bg-green-50 border-green-200';
            case 'pending':
                return 'bg-yellow-50 border-yellow-200';
            case 'failed':
                return 'bg-red-50 border-red-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    const getStatusIcon = () => {
        switch (trip.paymentStatus) {
            case 'completed':
                return <CheckCircle className="text-green-600" size={18} />;
            case 'pending':
                return <Clock className="text-yellow-600" size={18} />;
            default:
                return <AlertCircle className="text-gray-600" size={18} />;
        }
    };

    const getStatusBadgeColor = () => {
        switch (trip.paymentStatus) {
            case 'completed':
                return 'bg-green-100 text-green-700';
            case 'pending':
                return 'bg-yellow-100 text-yellow-700';
            case 'failed':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getSyncStatusColor = () => {
        switch (trip.syncStatus) {
            case 'synced':
                return 'bg-green-100 text-green-700';
            case 'pending':
                return 'bg-yellow-100 text-yellow-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const handleDownloadReceipt = () => {
        // Implement receipt download logic
        console.log('Downloading receipt for trip:', trip.id);
    };

    const handleReportIssue = () => {
        // Implement issue reporting logic
        console.log('Reporting issue for trip:', trip.id);
    };

    return (
        <AnimatePresence>
            {isOpen && (
        <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black bg-opacity-50 z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div
                            className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="sticky top-0 bg-gradient-to-r from-emerald-500 to-teal-500 p-6 rounded-t-3xl z-10">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                            <Route size={24} />
                                            Trip Details
                                        </h2>
                                        <p className="text-emerald-100 mt-1">Trip #{trip.id.substring(0, 8)}</p>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                                    >
                                        <X className="text-white" size={24} />
                                    </button>
                                </div>
                            </div>

                            {/* Trip Status Banner */}
                            <div className={`${getStatusColor()} border-b px-6 py-4`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-lg">
                                            {getStatusIcon()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">
                                                {trip.paymentStatus === 'completed' ? 'Trip Completed Successfully' :
                                                    trip.paymentStatus === 'pending' ? 'Trip In Progress' :
                                                        'Trip Status Unknown'}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Payment {trip.paymentStatus === 'completed' ? 'received' : 'pending'} via {trip.paymentMethod}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeColor()}`}>
                                        {trip.paymentStatus.charAt(0).toUpperCase() + trip.paymentStatus.slice(1)}
                                    </span>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 space-y-6">
                                {/* Trip Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <DollarSign className="text-emerald-600" size={20} />
                                            <span className="text-xs text-emerald-600 font-semibold">FARE</span>
                                        </div>
                                        <p className="text-3xl font-bold text-gray-800">
                                            ${trip.totalFare ? trip.totalFare.toFixed(2) : '0.00'}
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">Total Earnings</p>
                                    </div>

                                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <Route className="text-purple-600" size={20} />
                                            <span className="text-xs text-purple-600 font-semibold">DISTANCE</span>
                                        </div>
                                        <p className="text-3xl font-bold text-gray-800">
                                            {trip.distanceKm || '0'} km
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">Total Distance</p>
                                    </div>

                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <Clock className="text-blue-600" size={20} />
                                            <span className="text-xs text-blue-600 font-semibold">DURATION</span>
                                        </div>
                                        <p className="text-3xl font-bold text-gray-800">
                                            {formatDuration(trip.durationMinutes)}
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">Trip Duration</p>
                                    </div>
                                </div>

                                {/* Trip Route Map */}
                                <div className="bg-white border border-gray-200 rounded-2xl p-5">
                                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <MapIcon className="text-gray-600" size={20} />
                                        Trip Route
                                    </h3>

                                    {/* Map Container */}
                                    <div
                                        ref={mapRef}
                                        className="h-96 w-full rounded-xl mb-4"
                                        style={{ zIndex: 1 }}
                                    />

                                    {/* Map Legend */}
                                    <div className="flex flex-wrap gap-4 mt-4 p-3 bg-gray-50 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
                                            <span className="text-sm text-gray-700">Start Point</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-sm"></div>
                                            <span className="text-sm text-gray-700">End Point</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-0.5 bg-blue-500"></div>
                                            <span className="text-sm text-gray-700">Route Path</span>
                                        </div>
                                        {routeInfo && (
                                            <div className="ml-auto text-sm text-gray-600">
                                                Route: {routeInfo.distance} km • ~{routeInfo.duration} min
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Trip Timeline */}
                                <div className="bg-gray-50 rounded-2xl p-5">
                                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <Clock className="text-gray-600" size={20} />
                                        Trip Timeline
                                    </h3>

                                    <div className="space-y-4">
                                        {/* Start Point */}
                                        <div className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                                    <Play className="text-emerald-600" size={16} />
                                                </div>
                                                <div className="w-0.5 h-16 bg-gray-300"></div>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-800">Trip Started</p>
                                                <p className="text-sm text-gray-600">
                                                    {format(parseISO(trip.startTime), 'MMM d, yyyy')} at {format(parseISO(trip.startTime), 'h:mm a')}
                                                </p>
                                                <div className="mt-2 p-3 bg-white rounded-xl border border-gray-200">
                                                    <p className="text-xs text-gray-500 mb-1">Start Location</p>
                                                    <p className="text-sm text-gray-700 flex items-center gap-2">
                                                        <MapPin className="text-emerald-500" size={16} />
                                                        {parseFloat(trip.startLatitude).toFixed(6)}, {parseFloat(trip.startLongitude).toFixed(6)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* End Point */}
                                        {trip.endTime && (
                                            <div className="flex gap-4">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                                        <Square className="text-red-600" size={16} />
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-800">Trip Ended</p>
                                                    <p className="text-sm text-gray-600">
                                                        {format(parseISO(trip.endTime), 'MMM d, yyyy')} at {format(parseISO(trip.endTime), 'h:mm a')}
                                                    </p>
                                                    <div className="mt-2 p-3 bg-white rounded-xl border border-gray-200">
                                                        <p className="text-xs text-gray-500 mb-1">End Location</p>
                                                        <p className="text-sm text-gray-700 flex items-center gap-2">
                                                            <MapPin className="text-red-500" size={16} />
                                                            {trip.endLatitude && trip.endLongitude
                                                                ? `${parseFloat(trip.endLatitude).toFixed(6)}, ${parseFloat(trip.endLongitude).toFixed(6)}`
                                                                : 'Not available'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Fare Breakdown */}
                                <div className="bg-white border border-gray-200 rounded-2xl p-5">
                                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <Receipt className="text-gray-600" size={20} />
                                        Fare Breakdown
                                    </h3>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-gray-600">Base Fare</span>
                                            <span className="font-semibold text-gray-800">
                                                ${trip.baseFare ? trip.baseFare.toFixed(2) : '0.00'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-t border-gray-100">
                                            <span className="text-gray-600">Distance Fare</span>
                                            <span className="font-semibold text-gray-800">
                                                ${trip.distanceFare ? trip.distanceFare.toFixed(2) : '0.00'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-t border-gray-100">
                                            <span className="text-gray-600">Time Fare</span>
                                            <span className="font-semibold text-gray-800">
                                                ${trip.timeFare ? trip.timeFare.toFixed(2) : '0.00'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-t border-gray-100">
                                            <span className="text-gray-600">Surcharges</span>
                                            <span className="font-semibold text-gray-800">
                                                ${trip.surcharges ? trip.surcharges.toFixed(2) : '0.00'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 border-t-2 border-gray-200 mt-2">
                                            <span className="text-lg font-semibold text-gray-800">Total Fare</span>
                                            <span className="text-2xl font-bold text-emerald-600">
                                                ${trip.totalFare ? trip.totalFare.toFixed(2) : '0.00'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Vehicle Information */}
                                    <div className="bg-gray-50 rounded-2xl p-5">
                                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                            <Car className="text-gray-600" size={20} />
                                            Vehicle Information
                                        </h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Vehicle ID</span>
                                                <span className="text-sm font-medium text-gray-800">
                                                    {trip.vehicleId ? trip.vehicleId.substring(0, 8) : 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Data Source</span>
                                                <span className="text-sm font-medium text-gray-800 capitalize">
                                                    {trip.dataSource?.replace('_', ' ') || 'N/A'}
                                                </span>
                                            </div>
                                            {trip.passengerPhone && (
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Passenger Phone</span>
                                                    <span className="text-sm font-medium text-gray-800">
                                                        {trip.passengerPhone}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Sync Status */}
                                    <div className="bg-gray-50 rounded-2xl p-5">
                                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                            <RefreshCw className="text-gray-600" size={20} />
                                            Sync Status
                                        </h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Status</span>
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSyncStatusColor()}`}>
                                                    {trip.syncStatus?.charAt(0).toUpperCase() + trip.syncStatus?.slice(1) || 'Unknown'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Last Updated</span>
                                                <span className="text-sm font-medium text-gray-800">
                                                    {trip.syncedAt ? format(parseISO(trip.syncedAt), 'MMM d, h:mm a') : 'Not synced'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                    <button
                                        onClick={handleDownloadReceipt}
                                        className="flex-1 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Download size={20} />
                                        Download Receipt
                                    </button>
                                    <button
                                        onClick={handleReportIssue}
                                        className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Flag size={20} />
                                        Report Issue
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default TripDetailsModal;
