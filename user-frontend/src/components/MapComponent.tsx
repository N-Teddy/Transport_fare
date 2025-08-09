// components/MapComponent.tsx
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

interface MapComponentProps {
    onDistanceUpdate?: (distance: number) => void;
    tripMarkers?: Array<{ id: string; lat: number; lng: number; number: number }>;
}

export interface MapComponentRef {
    addTripMarker: (tripId: string, tripNumber: number) => Promise<{ lat: number; lng: number }>;
    removeTripMarker: (tripId: string) => void;
    calculateRoute: (start: [number, number], end: [number, number]) => Promise<number>;
    getCurrentLocation: () => Promise<[number, number]>;
}

declare module 'leaflet' {
    namespace Routing {
        interface RoutingControlOptions {
            createMarker?: (i: number, waypoint: Waypoint, n: number) => L.Marker | null;
        }
    }
}

const MapComponent = forwardRef<MapComponentRef, MapComponentProps>(
    ({ onDistanceUpdate = [] }, ref) => {
        const mapRef = useRef<L.Map | null>(null);
        const markersRef = useRef<{ [key: string]: L.Marker }>({});
        const routingControlRef = useRef<L.Routing.Control | null>(null);


        const getCurrentLocation = () => {
            return new Promise<[number, number]>((resolve) => {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            resolve([position.coords.latitude, position.coords.longitude]);
                        },
                        () => {
                            resolve([4.0511, 9.7679]);
                        }
                    );
                } else {
                    resolve([4.0511, 9.7679]);
                }
            });
        };

        useImperativeHandle(ref, () => ({
            addTripMarker: async (tripId: string, tripNumber: number) => {
                if (!mapRef.current) return { lat: 0, lng: 0 };

                const [lat, lng] = await getCurrentLocation();

                const markerIcon = L.divIcon({
                    html: `<div style="background: #10b981; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">${tripNumber}</div>`,
                    iconSize: [30, 30],
                    className: `trip-marker-${tripNumber}`
                });

                const marker = L.marker([lat, lng], { icon: markerIcon }).addTo(mapRef.current);
                markersRef.current[tripId] = marker;

                return { lat, lng };
            },

            removeTripMarker: (tripId: string) => {
                if (markersRef.current[tripId] && mapRef.current) {
                    mapRef.current.removeLayer(markersRef.current[tripId]);
                    delete markersRef.current[tripId];
                }
            },

            calculateRoute: async (start: [number, number], end: [number, number]) => {
                return new Promise((resolve) => {
                    if (!mapRef.current) {
                        resolve(0);
                        return;
                    }

                    // Remove existing routing control if any
                    if (routingControlRef.current) {
                        mapRef.current.removeControl(routingControlRef.current);
                    }

                    routingControlRef.current = L.Routing.control({
                        waypoints: [
                            L.latLng(start[0], start[1]),
                            L.latLng(end[0], end[1])
                        ],
                        routeWhileDragging: false,
                        addWaypoints: false,
                        createMarker: () => null, // Don't create default markers
                        lineOptions: {
                            styles: [{ color: '#10b981', weight: 4, opacity: 0.7 }],
                            extendToWaypoints: true, // Required property
                            missingRouteTolerance: 1 // Required property
                        }
                    }).on('routesfound', (e: any) => {
                        const routes = e.routes;
                        const distance = routes[0].summary.totalDistance / 1000; // Convert to km
                        resolve(distance);
                        if (onDistanceUpdate && typeof onDistanceUpdate === 'function') {
                            onDistanceUpdate(distance);
                        }
                    }).addTo(mapRef.current);
                });
            },

            getCurrentLocation

        }));

        useEffect(() => {
            if (!mapRef.current) {
                mapRef.current = L.map('map').setView([4.0511, 9.7679], 14);

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors',
                    maxZoom: 19
                }).addTo(mapRef.current);
            }

            return () => {
                if (mapRef.current) {
                    mapRef.current.remove();
                    mapRef.current = null;
                }
            };
        }, []);

        const handleZoomToLocation = async () => {
            const currentLocation = await getCurrentLocation();
            mapRef.current?.setView(currentLocation, 14); // Zoom to the user's location
        };


        return (
            <div id='teddy' style={{ height: '100%', width: '100%', position: 'relative', zIndex: 1, overflow: 'visible', }}>
                <button
                    onClick={handleZoomToLocation}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        padding: '10px',
                        cursor: 'pointer',
                        zIndex: 1000
                    }}
                >
                    My Location
                </button>
                <div id="map" style={{ height: '100%', width: '100%', zIndex: 0 }} />
            </div>
        );
    }
);

MapComponent.displayName = 'MapComponent';
export default MapComponent;
