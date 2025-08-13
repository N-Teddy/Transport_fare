import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Avatar,
    Chip,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Divider,
    IconButton,
} from '@mui/material';
import {
    Star,
    ShieldCheck,
    Clock,
    Car,
    QrCode,
    Download,
    Phone,
    X,
} from 'lucide-react';
import QRCode from 'qrcode';
import { jwtDecode } from 'jwt-decode';
import { useGetDriverRating } from '../hooks/driverHook';

interface Rating {
    id: string;
    driverId: string;
    driverName: string;
    driverLicenseNumber: string;
    passengerPhone: string;
    rating: number;
    comment: string;
    categories: {
        safety: number;
        punctuality: number;
        vehicle_condition: number;
    };
    createdAt: string;
    updatedAt: string;
}

interface ApiResponse {
    status: string;
    message: string;
    data: Rating[];
}

const DriverRatingDashboard: React.FC = () => {
    const [filterRating, setFilterRating] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('latest');
    const [qrDialogOpen, setQrDialogOpen] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

    const getUserIdFromToken = (): string | null => {
        try {
            const token = localStorage.getItem('access_token');
            if (token) {
                const decoded: any = jwtDecode(token);
                return decoded.userId || decoded.sub || decoded.id || decoded.driverId;
            }
        } catch (error) {
            console.error('Error decoding token:', error);
        }
        return null;
    };

    const driverId = getUserIdFromToken();
    const { data: apiResponse, isLoading, error } = useGetDriverRating(driverId || '', !!driverId);

    // Calculate aggregated data from ratings array
    const aggregatedData = useMemo(() => {
        if (!apiResponse?.data || apiResponse.data.length === 0) {
            return {
                overallRating: 0,
                totalRatings: 0,
                categoryAverages: {
                    safety: 0,
                    punctuality: 0,
                    vehicle_condition: 0,
                },
                ratings: [],
                driverName: 'Driver'
            };
        }

        const ratings = apiResponse.data;
        const totalRatings = ratings.length;

        // Calculate overall rating average
        const overallRating = ratings.reduce((sum, rating) => sum + rating.rating, 0) / totalRatings;

        // Calculate category averages
        const categoryAverages = {
            safety: ratings.reduce((sum, rating) => sum + rating.categories.safety, 0) / totalRatings,
            punctuality: ratings.reduce((sum, rating) => sum + rating.categories.punctuality, 0) / totalRatings,
            vehicle_condition: ratings.reduce((sum, rating) => sum + rating.categories.vehicle_condition, 0) / totalRatings,
        };

        // Get driver name from first rating
        const driverName = ratings[0]?.driverName || 'Driver';

        return {
            overallRating,
            totalRatings,
            categoryAverages,
            ratings,
            driverName
        };
    }, [apiResponse]);

    // Filter and sort ratings
    const filteredAndSortedRatings = useMemo(() => {
        let filtered = aggregatedData.ratings;

        // Apply rating filter
        if (filterRating !== 'all') {
            const targetRating = parseInt(filterRating);
            filtered = filtered.filter(rating => Math.floor(rating.rating) === targetRating);
        }

        // Apply sorting
        const sorted = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'latest':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'oldest':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'highest':
                    return b.rating - a.rating;
                case 'lowest':
                    return a.rating - b.rating;
                default:
                    return 0;
            }
        });

        return sorted;
    }, [aggregatedData.ratings, filterRating, sortBy]);

    const generateQRCode = async () => {
        if (!driverId) return;

        try {
            const ratingUrl = `${window.location.origin}/rate-driver/${driverId}`;
            const qrDataUrl = await QRCode.toDataURL(ratingUrl, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#10B981',
                    light: '#FFFFFF',
                },
            });
            setQrCodeUrl(qrDataUrl);
            setQrDialogOpen(true);
        } catch (error) {
            console.error('Error generating QR code:', error);
        }
    };

    const downloadQRCode = () => {
        const link = document.createElement('a');
        link.download = `driver-${driverId}-rating-qr.png`;
        link.href = qrCodeUrl;
        link.click();
    };

    const maskPhoneNumber = (phone: string) => {
        // Format: +237 6XX XXX XXX
        if (phone.startsWith('+237')) {
            return phone.replace(/(\+237)(\d{1})(\d{2})(\d{3})(\d{3})/, '$1 $2XX XXX $5');
        }
        // Fallback for other formats
        return phone.replace(/(\d{3})(\d{3})(\d{3})/, 'XXX XXX $3');
    };

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours} hours ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} days ago`;
    };

    const renderStars = (rating: number, size: 'small' | 'medium' | 'large' = 'medium') => {
        const starSize = size === 'small' ? 16 : size === 'medium' ? 20 : 28;
        return (
            <Box display="flex" gap={0.5}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={starSize}
                        className={star <= rating ? 'text-emerald-500 fill-current' : 'text-gray-300'}
                    />
                ))}
            </Box>
        );
    };

    if (!driverId) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <Typography color="error">Unable to get driver ID from token</Typography>
            </Box>
        );
    }

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <Typography>Loading ratings...</Typography>
            </Box>
        );
    }

    if (error || !apiResponse) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <Typography color="error">Error loading ratings</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
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
                                    <Star size={32} />
                                    My Ratings
                                </Typography>
                                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                    View and manage your customer feedback
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 1 }}>
                                    Welcome, {aggregatedData.driverName}
                                </Typography>
                            </Box>
                            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
                                <Chip
                                    icon={<Star size={20} />}
                                    label={`${aggregatedData.overallRating.toFixed(1)}`}
                                    sx={{
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        fontSize: '1.1rem'
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    startIcon={<QrCode size={20} />}
                                    onClick={generateQRCode}
                                    sx={{
                                        bgcolor: 'white',
                                        color: '#10B981',
                                        fontWeight: 'bold',
                                        borderRadius: 3,
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                                    }}
                                >
                                    Generate QR Code
                                </Button>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Overall Rating Summary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Card sx={{ borderRadius: 3, mb: 3, boxShadow: 1 }}>
                    <CardContent sx={{ p: 4 }}>
                        <Box textAlign="center" mb={4}>
                            <Typography variant="h2" fontWeight="bold" color="text.primary" mb={2}>
                                {aggregatedData.overallRating.toFixed(1)}
                            </Typography>
                            {renderStars(aggregatedData.overallRating, 'large')}
                            <Typography variant="h6" color="text.secondary" mt={2}>
                                Based on {aggregatedData.totalRatings} ratings
                            </Typography>
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        {/* Category Breakdown */}
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={4}>
                                <Card sx={{
                                    background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
                                    borderRadius: 2,
                                    textAlign: 'center',
                                    p: 2
                                }}>
                                    <Box display="flex" justifyContent="center" mb={2}>
                                        <Avatar sx={{ bgcolor: '#10B981', width: 56, height: 56 }}>
                                            <ShieldCheck size={28} />
                                        </Avatar>
                                    </Box>
                                    <Typography variant="h4" fontWeight="bold" color="#047857">
                                        {aggregatedData.categoryAverages.safety.toFixed(1)}
                                    </Typography>
                                    <Typography variant="body2" fontWeight="medium" color="#065F46">
                                        Safety
                                    </Typography>
                                </Card>
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Card sx={{
                                    background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                                    borderRadius: 2,
                                    textAlign: 'center',
                                    p: 2
                                }}>
                                    <Box display="flex" justifyContent="center" mb={2}>
                                        <Avatar sx={{ bgcolor: '#3B82F6', width: 56, height: 56 }}>
                                            <Clock size={28} />
                                        </Avatar>
                                    </Box>
                                    <Typography variant="h4" fontWeight="bold" color="#1D4ED8">
                                        {aggregatedData.categoryAverages.punctuality.toFixed(1)}
                                    </Typography>
                                    <Typography variant="body2" fontWeight="medium" color="#1E3A8A">
                                        Punctuality
                                    </Typography>
                                </Card>
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Card sx={{
                                    background: 'linear-gradient(135deg, #FAF5FF 0%, #E9D5FF 100%)',
                                    borderRadius: 2,
                                    textAlign: 'center',
                                    p: 2
                                }}>
                                    <Box display="flex" justifyContent="center" mb={2}>
                                        <Avatar sx={{ bgcolor: '#8B5CF6', width: 56, height: 56 }}>
                                            <Car size={28} />
                                        </Avatar>
                                    </Box>
                                    <Typography variant="h4" fontWeight="bold" color="#7C3AED">
                                        {aggregatedData.categoryAverages.vehicle_condition.toFixed(1)}
                                    </Typography>
                                    <Typography variant="body2" fontWeight="medium" color="#5B21B6">
                                        Vehicle Condition
                                    </Typography>
                                </Card>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Filter and Sort */}
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between" alignItems={{ xs: 'start', sm: 'center' }}
                gap={2} mb={3}>
                <Box display="flex" gap={2}>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Filter</InputLabel>
                        <Select
                            value={filterRating}
                            label="Filter"
                            onChange={(e) => setFilterRating(e.target.value)}
                        >
                            <MenuItem value="all">All Ratings</MenuItem>
                            <MenuItem value="5">5 Stars</MenuItem>
                            <MenuItem value="4">4 Stars</MenuItem>
                            <MenuItem value="3">3 Stars</MenuItem>
                            <MenuItem value="2">2 Stars</MenuItem>
                            <MenuItem value="1">1 Star</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Sort</InputLabel>
                        <Select
                            value={sortBy}
                            label="Sort"
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <MenuItem value="latest">Latest First</MenuItem>
                            <MenuItem value="oldest">Oldest First</MenuItem>
                            <MenuItem value="highest">Highest Rating</MenuItem>
                            <MenuItem value="lowest">Lowest Rating</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                <Chip
                    label={`Showing ${filteredAndSortedRatings.length} of ${aggregatedData.totalRatings} ratings`}
                    variant="outlined"
                />
            </Box>

            {/* Ratings List */}
            <Box display="flex" flexDirection="column" gap={2}>
                {filteredAndSortedRatings.length === 0 ? (
                    <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
                        <CardContent sx={{ p: 4, textAlign: 'center' }}>
                            <Typography variant="h6" color="text.secondary" mb={2}>
                                No ratings found
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {aggregatedData.totalRatings === 0
                                    ? "You haven't received any ratings yet. Share your QR code with passengers to get started!"
                                    : "No ratings match your current filter criteria."
                                }
                            </Typography>
                        </CardContent>
                    </Card>
                ) : (
                    filteredAndSortedRatings.map((rating, index) => (
                        <motion.div
                            key={rating.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card sx={{ borderRadius: 2, boxShadow: 1, '&:hover': { boxShadow: 2 } }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Avatar sx={{
                                                bgcolor: '#10B981',
                                                width: 48,
                                                height: 48,
                                                fontSize: '0.875rem'
                                            }}>
                                                +237
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight="medium">
                                                    {maskPhoneNumber(rating.passengerPhone)}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {getTimeAgo(rating.createdAt)}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Box display="flex" alignItems="center" gap={1}
                                            sx={{
                                                bgcolor: 'rgba(16, 185, 129, 0.1)',
                                                px: 2,
                                                py: 1,
                                                borderRadius: 2
                                            }}>
                                            {renderStars(rating.rating, 'small')}
                                            <Typography variant="body2" fontWeight="medium" color="#10B981" ml={1}>
                                                {rating.rating.toFixed(1)}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {rating.comment && (
                                        <Typography variant="body1" color="text.primary" mb={3}>
                                            {rating.comment}
                                        </Typography>
                                    )}

                                    <Box display="flex" flexWrap="wrap" gap={3}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <ShieldCheck size={16} className="text-emerald-500" />
                                            <Typography variant="body2" color="text.secondary">Safety:</Typography>
                                            <Typography variant="body2" fontWeight="medium">{rating.categories.safety.toFixed(1)}</Typography>
                                        </Box>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Clock size={16} className="text-blue-500" />
                                            <Typography variant="body2" color="text.secondary">Punctuality:</Typography>
                                            <Typography variant="body2" fontWeight="medium">{rating.categories.punctuality.toFixed(1)}</Typography>
                                        </Box>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Car size={16} className="text-purple-500" />
                                            <Typography variant="body2" color="text.secondary">Vehicle:</Typography>
                                            <Typography variant="body2" fontWeight="medium">{rating.categories.vehicle_condition.toFixed(1)}</Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))
                )}
            </Box>

            {/* Load More Button - if you want to implement pagination */}
            {filteredAndSortedRatings.length > 0 && filteredAndSortedRatings.length < aggregatedData.totalRatings && (
                <Box textAlign="center" mt={4}>
                    <Button
                        variant="outlined"
                        sx={{
                            borderColor: '#10B981',
                            color: '#10B981',
                            '&:hover': {
                                borderColor: '#059669',
                                bgcolor: 'rgba(16, 185, 129, 0.04)'
                            },
                            borderRadius: 2,
                            px: 4,
                            py: 1.5
                        }}
                    >
                        Load More Ratings
                    </Button>
                </Box>
            )}

            {/* QR Code Dialog */}
            <Dialog
                open={qrDialogOpen}
                onClose={() => setQrDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="bold">Rating QR Code</Typography>
                    <IconButton onClick={() => setQrDialogOpen(false)}>
                        <X size={20} />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ textAlign: 'center', py: 3 }}>
                    {qrCodeUrl && (
                        <Box>
                            <img src={qrCodeUrl} alt="Rating QR Code" style={{ maxWidth: '100%', height: 'auto' }} />
                            <Typography variant="body2" color="text.secondary" mt={2}>
                                Passengers can scan this QR code to rate your service
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                                Rating URL: {`${window.location.origin}/rate-driver/${driverId}`}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                    <Button
                        variant="contained"
                        startIcon={<Download size={20} />}
                        onClick={downloadQRCode}
                        sx={{
                            bgcolor: '#10B981',
                            '&:hover': { bgcolor: '#059669' },
                            borderRadius: 2,
                            px: 3
                        }}
                    >
                        Download QR Code
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default DriverRatingDashboard;
