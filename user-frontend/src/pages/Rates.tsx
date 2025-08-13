import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Tabs,
    Tab,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Avatar,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Alert,
    LinearProgress,
    Divider,
    IconButton,
} from '@mui/material';
import {
    DollarSign,
    Calculator,
    MapPin,
    Car,
    Bus,
    Truck,
    Banknote,
    Route,
    Map,
    TrendingUp,
    TrendingDown,
    CheckCircle,
    RefreshCw,
    Download,
    Printer,
} from 'lucide-react';

import Sidebar from '../components/Sidebar';
import { useFareRates, useRegionalMultipliers } from '../hooks/fareHook';

interface RegionalMultiplier {
    id: string;
    regionId: string;
    multiplier: string;
    reason: string;
    effectiveFrom: string;
    effectiveUntil: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    region: {
        id: string;
        name: string;
        code: string;
        capitalCity: string;
        cityCount: number;
        createdAt: string;
        updatedAt: string;
    };
}

interface FareRate {
    id: string;
    vehicleTypeId: string;
    baseFare: number;
    perKmRate: number;
    nightMultiplier: string;
    effectiveFrom: string;
    effectiveUntil: string;
    isActive: boolean;
    notes: string;
    createdAt: string;
    updatedAt: string;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`rates-tabpanel-${index}`}
            aria-labelledby={`rates-tab-${index}`}
            {...other}
        >
            {value === index && <Box>{children}</Box>}
        </div>
    );
}

const RegionalRatesPage: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);
    const [calculatorData, setCalculatorData] = useState({
        vehicleType: '',
        distance: '',
        region: '',
        timeOfDay: 'day',
    });
    const [fareResult, setFareResult] = useState<{
        total: number;
        breakdown: string;
    } | null>(null);

    // API queries
    const { data: regionalMultipliersData, isLoading: loadingMultipliers, refetch: refetchMultipliers } = useRegionalMultipliers({});
    const { data: fareRatesData, isLoading: loadingRates, refetch: refetchRates } = useFareRates({});

    // Process data
    const processedData = useMemo(() => {
        const multipliers: RegionalMultiplier[] = regionalMultipliersData?.data || [];
        const fareRates: FareRate[] = fareRatesData?.data?.items || [];

        // Calculate statistics
        const totalRegions = multipliers.length;
        const highestMultiplier = multipliers.length > 0 ? Math.max(...multipliers.map(m => parseFloat(m.multiplier))) : 0;
        const lowestMultiplier = multipliers.length > 0 ? Math.min(...multipliers.map(m => parseFloat(m.multiplier))) : 0;

        const avgBaseFare = fareRates.length > 0 ? fareRates.reduce((sum, rate) => sum + rate.baseFare, 0) / fareRates.length : 0;
        const avgPerKm = fareRates.length > 0 ? fareRates.reduce((sum, rate) => sum + rate.perKmRate, 0) / fareRates.length : 0;

        return {
            multipliers,
            fareRates,
            stats: {
                totalRegions,
                highestMultiplier,
                lowestMultiplier,
                avgBaseFare,
                avgPerKm,
                totalVehicleTypes: fareRates.length,
            }
        };
    }, [regionalMultipliersData, fareRatesData]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleRefreshRates = async () => {
        try {
            await Promise.all([refetchMultipliers(), refetchRates()]);
            console.log('Rates refreshed successfully');
        } catch (error) {
            console.error('Error refreshing rates:', error);
        }
    };

    const getVehicleIcon = (vehicleTypeId: string) => {
        const iconMap: { [key: string]: React.ReactNode } = {
            'cc547ee5-745b-400a-a5fb-89c3e5de0291': <Truck size={20} />,
            '1d26d319-5b3f-496a-85ba-f6e41b5099ae': <Bus size={20} />,
            '6a949cdc-5a50-42ff-a4af-142bd9d3eccc': <Car size={20} />,
        };
        return iconMap[vehicleTypeId] || <Car size={20} />;
    };

    const getVehicleColor = (vehicleTypeId: string) => {
        const colorMap: { [key: string]: string } = {
            'cc547ee5-745b-400a-a5fb-89c3e5de0291': '#f97316',
            '1d26d319-5b3f-496a-85ba-f6e41b5099ae': '#22c55e',
            '6a949cdc-5a50-42ff-a4af-142bd9d3eccc': '#3b82f6',
        };
        return colorMap[vehicleTypeId] || '#6b7280';
    };

    const getVehicleName = (vehicleTypeId: string) => {
        const nameMap: { [key: string]: string } = {
            'cc547ee5-745b-400a-a5fb-89c3e5de0291': 'Truck',
            '1d26d319-5b3f-496a-85ba-f6e41b5099ae': 'Bus',
            '6a949cdc-5a50-42ff-a4af-142bd9d3eccc': 'Taxi',
        };
        return nameMap[vehicleTypeId] || 'Vehicle';
    };

    const getMultiplierColor = (multiplier: number) => {
        if (multiplier < 1.0) return { bg: '#dcfce7', text: '#166534', progress: '#22c55e' };
        if (multiplier === 1.0) return { bg: '#ecfdf5', text: '#047857', progress: '#10b981' };
        if (multiplier <= 1.05) return { bg: '#fef3c7', text: '#92400e', progress: '#f59e0b' };
        if (multiplier <= 1.10) return { bg: '#fed7aa', text: '#9a3412', progress: '#f97316' };
        return { bg: '#fecaca', text: '#991b1b', progress: '#ef4444' };
    };

    const calculateFare = () => {
        const { vehicleType, distance, region, timeOfDay } = calculatorData;

        if (!vehicleType || !distance || !region) {
            alert('Please fill in all required fields');
            return;
        }

        const selectedVehicle = processedData.fareRates.find(rate => rate.vehicleTypeId === vehicleType);
        const selectedRegion = processedData.multipliers.find(mult => mult.id === region);

        if (!selectedVehicle || !selectedRegion) {
            alert('Invalid vehicle type or region selected');
            return;
        }

        const distanceNum = parseFloat(distance);
        const baseFare = selectedVehicle.baseFare;
        const perKmCost = distanceNum * selectedVehicle.perKmRate;
        const regionMultiplier = parseFloat(selectedRegion.multiplier);
        const nightMultiplier = timeOfDay === 'night' ? parseFloat(selectedVehicle.nightMultiplier) : 1.0;

        const totalFare = (baseFare + perKmCost) * regionMultiplier * nightMultiplier;

        setFareResult({
            total: totalFare,
            breakdown: `Base fare: ${baseFare.toLocaleString()} XAF + Distance (${distanceNum}km × ${selectedVehicle.perKmRate} XAF): ${perKmCost.toLocaleString()} XAF × Regional multiplier: ${regionMultiplier}x × Time multiplier: ${nightMultiplier}x`
        });
    };

    const exportData = () => {
        const data = {
            fareRates: processedData.fareRates,
            regionalMultipliers: processedData.multipliers,
            exportedAt: new Date().toISOString(),
            exportedBy: 'FareWay Driver Portal'
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `fareway-regional-rates-${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        URL.revokeObjectURL(url);
    };

    if (loadingMultipliers || loadingRates) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <Box textAlign="center">
                    <LinearProgress sx={{ width: 200, mb: 2 }} />
                    <Typography>Loading regional rates...</Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f9fafb' }}>
            <Sidebar />

            <Box component="main" sx={{ flexGrow: 1, ml: { lg: '288px' }, minHeight: '100vh' }}>
                <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
                    {/* Header Section */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6"
                    >
                        <Card sx={{
                            background: 'linear-gradient(135deg, #10B981 0%, #14B8A6 100%)',
                            color: 'white',
                            borderRadius: 3,
                            boxShadow: 3
                        }}>
                            <CardContent sx={{ p: 4 }}>
                                <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }}
                                    justifyContent="space-between" alignItems={{ xs: 'start', md: 'center' }}
                                    gap={2}>
                                    <Box>
                                        <Typography variant="h4" fontWeight="bold" display="flex" alignItems="center" gap={2} mb={1}>
                                            <DollarSign size={32} />
                                            Regional Rates
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                            View current fare rates and regional multipliers
                                        </Typography>
                                    </Box>
                                    <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
                                        <Button
                                            variant="contained"
                                            startIcon={<RefreshCw size={20} />}
                                            onClick={handleRefreshRates}
                                            sx={{
                                                bgcolor: 'white',
                                                color: '#10B981',
                                                fontWeight: 'bold',
                                                borderRadius: 3,
                                                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                                            }}
                                        >
                                            Refresh Rates
                                        </Button>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Tab Navigation */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card sx={{ borderRadius: 2, mb: 3, boxShadow: 1, p: 0.5 }}>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <Button
                                    onClick={() => setTabValue(0)}
                                    startIcon={<Calculator size={16} />}
                                    sx={{
                                        flex: 1,
                                        py: 1.5,
                                        px: 2,
                                        borderRadius: 1.5,
                                        textTransform: 'none',
                                        fontWeight: 'medium',
                                        bgcolor: tabValue === 0 ? '#ecfdf5' : 'transparent',
                                        color: tabValue === 0 ? '#047857' : '#6b7280',
                                        '&:hover': {
                                            bgcolor: tabValue === 0 ? '#ecfdf5' : '#f9fafb'
                                        }
                                    }}
                                >
                                    Fare Rates
                                </Button>
                                <Button
                                    onClick={() => setTabValue(1)}
                                    startIcon={<MapPin size={16} />}
                                    sx={{
                                        flex: 1,
                                        py: 1.5,
                                        px: 2,
                                        borderRadius: 1.5,
                                        textTransform: 'none',
                                        fontWeight: 'medium',
                                        bgcolor: tabValue === 1 ? '#ecfdf5' : 'transparent',
                                        color: tabValue === 1 ? '#047857' : '#6b7280',
                                        '&:hover': {
                                            bgcolor: tabValue === 1 ? '#ecfdf5' : '#f9fafb'
                                        }
                                    }}
                                >
                                    Regional Multipliers
                                </Button>
                            </Box>
                        </Card>
                    </motion.div>

                    {/* Fare Rates Tab */}
                    {tabValue === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            {/* Summary Cards */}
                            <Grid container spacing={3} sx={{ mb: 4 }}>
                                <Grid item xs={12} md={4}>
                                    <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
                                        <CardContent sx={{ p: 3 }}>
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary" fontWeight="medium">
                                                        Vehicle Types
                                                    </Typography>
                                                    <Typography variant="h4" fontWeight="bold">
                                                        {processedData.stats.totalVehicleTypes}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ p: 1.5, bgcolor: '#dbeafe', borderRadius: 2 }}>
                                                    <Car size={24} color="#3b82f6" />
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
                                        <CardContent sx={{ p: 3 }}>
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary" fontWeight="medium">
                                                        Avg Base Fare
                                                    </Typography>
                                                    <Typography variant="h4" fontWeight="bold">
                                                        {Math.round(processedData.stats.avgBaseFare).toLocaleString()} XAF
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ p: 1.5, bgcolor: '#ecfdf5', borderRadius: 2 }}>
                                                    <Banknote size={24} color="#10b981" />
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
                                        <CardContent sx={{ p: 3 }}>
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary" fontWeight="medium">
                                                        Avg Per KM
                                                    </Typography>
                                                    <Typography variant="h4" fontWeight="bold">
                                                        {Math.round(processedData.stats.avgPerKm)} XAF
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ p: 1.5, bgcolor: '#faf5ff', borderRadius: 2 }}>
                                                    <Route size={24} color="#8b5cf6" />
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>

                            {/* Fare Rates Table */}
                            <Card sx={{ borderRadius: 2, boxShadow: 1, overflow: 'hidden' }}>
                                <Box sx={{ p: 3, borderBottom: '1px solid #e5e7eb' }}>
                                    <Typography variant="h6" fontWeight="bold">
                                        Current Fare Rates
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Base fares and per-kilometer rates by vehicle type
                                    </Typography>
                                </Box>

                                <TableContainer>
                                    <Table>
                                        <TableHead sx={{ bgcolor: '#f9fafb' }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280' }}>Vehicle Type</TableCell>
                                                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280' }}>Base Fare</TableCell>
                                                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280' }}>Per KM Rate</TableCell>
                                                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280' }}>Night Multiplier</TableCell>
                                                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280' }}>Status</TableCell>
                                                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280' }}>Effective Period</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {processedData.fareRates.map((rate) => (
                                                <TableRow
                                                    key={rate.id}
                                                    sx={{ '&:hover': { bgcolor: '#f9fafb' } }}
                                                >
                                                    <TableCell>
                                                        <Box display="flex" alignItems="center" gap={1.5}>
                                                            <Box sx={{
                                                                p: 1,
                                                                bgcolor: `${getVehicleColor(rate.vehicleTypeId)}20`,
                                                                borderRadius: 1.5
                                                            }}>
                                                                {getVehicleIcon(rate.vehicleTypeId)}
                                                            </Box>
                                                            <Box>
                                                                <Typography variant="body2" fontWeight="medium">
                                                                    {getVehicleName(rate.vehicleTypeId)}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {rate.notes}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" fontWeight="bold">
                                                            {rate.baseFare.toLocaleString()} XAF
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" fontWeight="bold">
                                                            {rate.perKmRate.toLocaleString()} XAF
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={`${parseFloat(rate.nightMultiplier).toFixed(2)}x`}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: parseFloat(rate.nightMultiplier) > 1 ? '#fef3c7' : '#f3f4f6',
                                                                color: parseFloat(rate.nightMultiplier) > 1 ? '#92400e' : '#374151',
                                                                fontWeight: 'medium',
                                                                fontSize: '0.75rem'
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            icon={<CheckCircle size={12} />}
                                                            label={rate.isActive ? 'Active' : 'Inactive'}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: rate.isActive ? '#dcfce7' : '#fee2e2',
                                                                color: rate.isActive ? '#166534' : '#991b1b',
                                                                fontWeight: 'medium',
                                                                fontSize: '0.75rem'
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {new Date(rate.effectiveFrom).toLocaleDateString()} - {new Date(rate.effectiveUntil).toLocaleDateString()}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Card>
                        </motion.div>
                    )}

                    {/* Regional Multipliers Tab */}
                    {tabValue === 1 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            {/* Summary Cards */}
                            <Grid container spacing={3} sx={{ mb: 4 }}>
                                <Grid item xs={12} md={4}>
                                    <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
                                        <CardContent sx={{ p: 3 }}>
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary" fontWeight="medium">
                                                        Total Regions
                                                    </Typography>
                                                    <Typography variant="h4" fontWeight="bold">
                                                        {processedData.stats.totalRegions}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ p: 1.5, bgcolor: '#dbeafe', borderRadius: 2 }}>
                                                    <Map size={24} color="#3b82f6" />
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
                                        <CardContent sx={{ p: 3 }}>
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary" fontWeight="medium">
                                                        Highest Multiplier
                                                    </Typography>
                                                    <Typography variant="h4" fontWeight="bold">
                                                        {processedData.stats.highestMultiplier.toFixed(2)}x
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ p: 1.5, bgcolor: '#fee2e2', borderRadius: 2 }}>
                                                    <TrendingUp size={24} color="#dc2626" />
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
                                        <CardContent sx={{ p: 3 }}>
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary" fontWeight="medium">
                                                        Lowest Multiplier
                                                    </Typography>
                                                    <Typography variant="h4" fontWeight="bold">
                                                        {processedData.stats.lowestMultiplier.toFixed(2)}x
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ p: 1.5, bgcolor: '#dcfce7', borderRadius: 2 }}>
                                                    <TrendingDown size={24} color="#16a34a" />
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>

                            {/* Regional Multipliers Grid */}
                            <Grid container spacing={3} sx={{ mb: 4 }}>
                                {processedData.multipliers.map((multiplier) => {
                                    const colors = getMultiplierColor(parseFloat(multiplier.multiplier));
                                    const progressWidth = ((parseFloat(multiplier.multiplier) - 0.9) / (1.2 - 0.9)) * 100;

                                    return (
                                        <Grid item xs={12} md={6} lg={4} key={multiplier.id}>
                                            <Card sx={{
                                                borderRadius: 2,
                                                boxShadow: 1,
                                                '&:hover': { boxShadow: 2 },
                                                transition: 'box-shadow 0.3s ease'
                                            }}>
                                                <CardContent sx={{ p: 3 }}>
                                                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                                                        <Box sx={{
                                                            p: 1.5,
                                                            bgcolor: colors.bg,
                                                            borderRadius: 2
                                                        }}>
                                                            <MapPin size={24} color={colors.text} />
                                                        </Box>
                                                        <Chip
                                                            label={multiplier.isActive ? 'Active' : 'Inactive'}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: multiplier.isActive ? '#dcfce7' : '#fee2e2',
                                                                color: multiplier.isActive ? '#166534' : '#991b1b',
                                                                fontWeight: 'medium',
                                                                fontSize: '0.75rem'
                                                            }}
                                                        />
                                                    </Box>

                                                    <Typography variant="h6" fontWeight="bold" mb={1}>
                                                        {multiplier.region.name}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" mb={3}>
                                                        {multiplier.reason}
                                                    </Typography>

                                                    <Box mb={2}>
                                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Multiplier
                                                            </Typography>
                                                            <Typography variant="h6" fontWeight="bold" sx={{ color: colors.text }}>
                                                                {parseFloat(multiplier.multiplier).toFixed(2)}x
                                                            </Typography>
                                                        </Box>
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={Math.max(10, Math.min(100, progressWidth))}
                                                            sx={{
                                                                height: 8,
                                                                borderRadius: 4,
                                                                bgcolor: '#f3f4f6',
                                                                '& .MuiLinearProgress-bar': {
                                                                    bgcolor: colors.progress,
                                                                    borderRadius: 4,
                                                                }
                                                            }}
                                                        />
                                                    </Box>

                                                    <Typography variant="caption" color="text.secondary">
                                                        Effective: {new Date(multiplier.effectiveFrom).toLocaleDateString()} - {new Date(multiplier.effectiveUntil).toLocaleDateString()}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    );
                                })}
                            </Grid>

                            {/* Fare Calculator */}
                            <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
                                <CardContent sx={{ p: 4 }}>
                                    <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" gap={1} mb={2}>
                                        <Calculator size={20} />
                                        Fare Calculator
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" mb={4}>
                                        Calculate estimated fare based on distance and region
                                    </Typography>

                                    <Grid container spacing={3} sx={{ mb: 3 }}>
                                        <Grid item xs={12} md={3}>
                                            <FormControl fullWidth>
                                                <InputLabel>Vehicle Type</InputLabel>
                                                <Select
                                                    value={calculatorData.vehicleType}
                                                    label="Vehicle Type"
                                                    onChange={(e) => setCalculatorData(prev => ({ ...prev, vehicleType: e.target.value }))}
                                                    sx={{
                                                        borderRadius: 1.5,
                                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: '#10b981'
                                                        },
                                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: '#10b981'
                                                        }
                                                    }}
                                                >
                                                    {processedData.fareRates.map((rate) => (
                                                        <MenuItem key={rate.vehicleTypeId} value={rate.vehicleTypeId}>
                                                            <Box display="flex" alignItems="center" gap={1}>
                                                                {getVehicleIcon(rate.vehicleTypeId)}
                                                                {getVehicleName(rate.vehicleTypeId)}
                                                            </Box>
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        <Grid item xs={12} md={3}>
                                            <TextField
                                                fullWidth
                                                label="Distance (KM)"
                                                type="number"
                                                value={calculatorData.distance}
                                                onChange={(e) => setCalculatorData(prev => ({ ...prev, distance: e.target.value }))}
                                                placeholder="10"
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 1.5,
                                                        '&:hover fieldset': {
                                                            borderColor: '#10b981'
                                                        },
                                                        '&.Mui-focused fieldset': {
                                                            borderColor: '#10b981'
                                                        }
                                                    }
                                                }}
                                            />
                                        </Grid>

                                        <Grid item xs={12} md={3}>
                                            <FormControl fullWidth>
                                                <InputLabel>Region</InputLabel>
                                                <Select
                                                    value={calculatorData.region}
                                                    label="Region"
                                                    onChange={(e) => setCalculatorData(prev => ({ ...prev, region: e.target.value }))}
                                                    sx={{
                                                        borderRadius: 1.5,
                                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: '#10b981'
                                                        },
                                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: '#10b981'
                                                        }
                                                    }}
                                                >
                                                    {processedData.multipliers.map((multiplier) => (
                                                        <MenuItem key={multiplier.id} value={multiplier.id}>
                                                            {multiplier.region.name} ({parseFloat(multiplier.multiplier).toFixed(2)}x)
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        <Grid item xs={12} md={3}>
                                            <FormControl fullWidth>
                                                <InputLabel>Time</InputLabel>
                                                <Select
                                                    value={calculatorData.timeOfDay}
                                                    label="Time"
                                                    onChange={(e) => setCalculatorData(prev => ({ ...prev, timeOfDay: e.target.value }))}
                                                    sx={{
                                                        borderRadius: 1.5,
                                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: '#10b981'
                                                        },
                                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: '#10b981'
                                                        }
                                                    }}
                                                >
                                                    <MenuItem value="day">Day Time</MenuItem>
                                                    <MenuItem value="night">Night Time</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    </Grid>

                                    <Button
                                        variant="contained"
                                        onClick={calculateFare}
                                        sx={{
                                            bgcolor: '#10b981',
                                            '&:hover': { bgcolor: '#059669' },
                                            borderRadius: 1.5,
                                            px: 3,
                                            py: 1.5,
                                            mb: 3,
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        Calculate Fare
                                    </Button>

                                    {fareResult && (
                                        <Box sx={{
                                            p: 2,
                                            bgcolor: '#f9fafb',
                                            borderRadius: 1.5,
                                            border: '1px solid #e5e7eb'
                                        }}>
                                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Estimated Fare:
                                                </Typography>
                                                <Typography variant="h5" fontWeight="bold" color="#10b981">
                                                    {Math.round(fareResult.total).toLocaleString()} XAF
                                                </Typography>
                                            </Box>
                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                                {fareResult.breakdown}
                                            </Typography>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default RegionalRatesPage;
