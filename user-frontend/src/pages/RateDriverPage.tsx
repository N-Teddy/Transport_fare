import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Avatar,
    Chip,
    Alert,
    CircularProgress,
    Divider,
    IconButton,
} from '@mui/material';
import {
    Star,
    ShieldCheck,
    Clock,
    Car,
    Phone,
    MessageCircle,
    X,
    CheckCircle,
} from 'lucide-react';
import axios from 'axios';

interface DriverInfo {
    id: string;
    name: string;
    licenseNumber: string;
    rating: number;
    totalTrips: number;
}

interface RatingData {
    driverId: string;
    passengerPhone: string;
    rating: number;
    comment: string;
    categories: {
        safety: number;
        punctuality: number;
        vehicle_condition: number;
    };
}

const RateDriverPage: React.FC = () => {
    const { driverId } = useParams<{ driverId: string }>();

    const [phoneNumber, setPhoneNumber] = useState('');
    const [overallRating, setOverallRating] = useState(0);
    const [categoryRatings, setCategoryRatings] = useState({
        safety: 0,
        punctuality: 0,
        vehicle_condition: 0,
    });
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [driverInfo, setDriverInfo] = useState<DriverInfo | null>(null);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    console.log(API_BASE_URL)

    useEffect(() => {
        // Fetch driver info from ratings to get driver details
        const fetchDriverInfo = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}drivers/${driverId}/ratings/`);
                if (response.data.status === 'success' && response.data.data.length > 0) {
                    const firstRating = response.data.data[0];
                    setDriverInfo({
                        id: firstRating.driverId,
                        name: firstRating.driverName,
                        licenseNumber: firstRating.driverLicenseNumber,
                        rating: response.data.data.reduce((sum: number, rating: any) => sum + rating.rating, 0) / response.data.data.length,
                        totalTrips: response.data.data.length
                    });
                } else {
                    // Fallback if no ratings exist yet
                    setDriverInfo({
                        id: driverId || '',
                        name: 'Driver',
                        licenseNumber: 'N/A',
                        rating: 0,
                        totalTrips: 0
                    });
                }
            } catch (error) {
                console.error('Error fetching driver info:', error);
                // Fallback driver info
                setDriverInfo({
                    id: driverId || '',
                    name: 'Driver',
                    licenseNumber: 'N/A',
                    rating: 0,
                    totalTrips: 0
                });
            }
        };

        if (driverId) {
            fetchDriverInfo();
        }
    }, [driverId, API_BASE_URL]);

    const handleStarClick = (rating: number, category?: keyof typeof categoryRatings) => {
        if (category) {
            setCategoryRatings(prev => ({
                ...prev,
                [category]: rating
            }));
        } else {
            setOverallRating(rating);
        }
    };

    const renderStars = (
        currentRating: number,
        onStarClick: (rating: number) => void,
        color: string = '#10B981',
        size: number = 40
    ) => {
        return (
            <Box display="flex" gap={0.5} justifyContent="center">
                {[1, 2, 3, 4, 5].map((star) => (
                    <IconButton
                        key={star}
                        onClick={() => onStarClick(star)}
                        sx={{
                            p: 0.5,
                            color: star <= currentRating ? color : '#D1D5DB',
                            '&:hover': {
                                color: color,
                                transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s'
                        }}
                    >
                        <Star size={size} fill={star <= currentRating ? color : 'none'} />
                    </IconButton>
                ))}
            </Box>
        );
    };

    const getRatingText = (rating: number) => {
        if (rating === 0) return 'Tap to rate';
        const texts = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
        return texts[rating];
    };

    const isFormValid = () => {
        return phoneNumber.trim() !== '' && overallRating > 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid() || !driverId) return;

        setIsSubmitting(true);
        setError(null);

        const ratingData: RatingData = {
            driverId,
            passengerPhone: phoneNumber,
            rating: overallRating,
            comment: comment.trim(),
            categories: categoryRatings
        };

        try {
            await axios.post(`${API_BASE_URL}drivers/ratings`, ratingData);
            setSubmitted(true);
        } catch (error: any) {
            console.error('Error submitting rating:', error);
            if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError('Failed to submit rating. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value.length <= 500) {
            setComment(value);
        }
    };

    if (submitted) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card sx={{ maxWidth: 400, textAlign: 'center', borderRadius: 3, boxShadow: 3 }}>
                        <CardContent sx={{ p: 4 }}>
                            <CheckCircle size={64} className="text-emerald-500 mx-auto mb-4" />
                            <Typography variant="h5" fontWeight="bold" color="text.primary" mb={2}>
                                Thank You!
                            </Typography>
                            <Typography variant="body1" color="text.secondary" mb={3}>
                                Your rating has been submitted successfully. Your feedback helps us improve our service.
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={() => window.close()}
                                sx={{
                                    bgcolor: '#10B981',
                                    '&:hover': { bgcolor: '#059669' },
                                    borderRadius: 2,
                                    px: 4
                                }}
                            >
                                Close
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F9FAFB' }}>
            {/* Header */}
            <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #E5E7EB' }}>
                <Box sx={{ maxWidth: 800, mx: 'auto', px: 3, py: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center" gap={2}>
                            <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="40" height="40" rx="10" fill="url(#gradient1)" />
                                <path d="M10 20L15 15L20 20L25 15L30 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="15" cy="25" r="2" fill="white" />
                                <circle cx="25" cy="25" r="2" fill="white" />
                                <defs>
                                    <linearGradient id="gradient1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#10B981" />
                                        <stop offset="1" stopColor="#14B8A6" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <Box>
                                <Typography variant="h6" fontWeight="bold" color="text.primary">
                                    FareWay
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Rate Your Experience
                                </Typography>
                            </Box>
                        </Box>
                        <IconButton onClick={() => window.close()}>
                            <X size={20} />
                        </IconButton>
                    </Box>
                </Box>
            </Box>

            <Box sx={{ maxWidth: 600, mx: 'auto', px: 3, py: 4 }}>
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
                        <CardContent sx={{ p: 4, textAlign: 'center' }}>
                            <Typography variant="h4" fontWeight="bold" display="flex" alignItems="center" justifyContent="center" gap={2} mb={2}>
                                <Star size={32} />
                                Rate Your Driver
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                Help us improve our service by sharing your experience
                            </Typography>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Driver Info Card */}
                {driverInfo && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card sx={{ borderRadius: 2, mb: 3, boxShadow: 1 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box display="flex" alignItems="center" gap={2}>
                                    <Avatar sx={{
                                        width: 60,
                                        height: 60,
                                        bgcolor: '#10B981',
                                        fontSize: '1.5rem',
                                        fontWeight: 'bold'
                                    }}>
                                        {driverInfo.name.charAt(0)}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6" fontWeight="semibold">
                                            {driverInfo.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            License: {driverInfo.licenseNumber}
                                        </Typography>
                                        <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                                            <Star size={16} className="text-emerald-500" />
                                            <Typography variant="body2" fontWeight="medium" color="#10B981">
                                                {driverInfo.rating > 0 ? `${driverInfo.rating.toFixed(1)} rating` : 'New driver'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                • {driverInfo.totalTrips} trips
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Phone Number Input */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card sx={{ borderRadius: 2, mb: 3, boxShadow: 1 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="subtitle1" fontWeight="semibold" display="flex" alignItems="center" gap={1} mb={2}>
                                    <Phone size={16} />
                                    Your Phone Number
                                </Typography>
                                <TextField
                                    fullWidth
                                    type="tel"
                                    placeholder="+237 6XX XXX XXX"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    required
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            '&:hover fieldset': { borderColor: '#10B981' },
                                            '&.Mui-focused fieldset': { borderColor: '#10B981' }
                                        }
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Overall Rating */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card sx={{ borderRadius: 2, mb: 3, boxShadow: 1 }}>
                            <CardContent sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="subtitle1" fontWeight="semibold" mb={3}>
                                    Overall Rating
                                </Typography>
                                {renderStars(overallRating, setOverallRating)}
                                <Typography variant="body2" color="text.secondary" mt={2}>
                                    {getRatingText(overallRating)}
                                </Typography>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Category Ratings */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card sx={{ borderRadius: 2, mb: 3, boxShadow: 1 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="subtitle1" fontWeight="semibold" mb={3}>
                                    Rate Specific Categories
                                </Typography>

                                {/* Safety Rating */}
                                <Box mb={3}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Avatar sx={{ bgcolor: '#ECFDF5', color: '#10B981', width: 40, height: 40 }}>
                                                <ShieldCheck size={20} />
                                            </Avatar>
                                            <Typography variant="body1" fontWeight="medium">Safety</Typography>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary">
                                            {categoryRatings.safety > 0 ? getRatingText(categoryRatings.safety) : 'Not rated'}
                                        </Typography>
                                    </Box>
                                    {renderStars(
                                        categoryRatings.safety,
                                        (rating) => handleStarClick(rating, 'safety'),
                                        '#10B981',
                                        24
                                    )}
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                {/* Punctuality Rating */}
                                <Box mb={3}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Avatar sx={{ bgcolor: '#EFF6FF', color: '#3B82F6', width: 40, height: 40 }}>
                                                <Clock size={20} />
                                            </Avatar>
                                            <Typography variant="body1" fontWeight="medium">Punctuality</Typography>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary">
                                            {categoryRatings.punctuality > 0 ? getRatingText(categoryRatings.punctuality) : 'Not rated'}
                                        </Typography>
                                    </Box>
                                    {renderStars(
                                        categoryRatings.punctuality,
                                        (rating) => handleStarClick(rating, 'punctuality'),
                                        '#3B82F6',
                                        24
                                    )}
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                {/* Vehicle Condition Rating */}
                                <Box>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Avatar sx={{ bgcolor: '#FAF5FF', color: '#8B5CF6', width: 40, height: 40 }}>
                                                <Car size={20} />
                                            </Avatar>
                                            <Typography variant="body1" fontWeight="medium">Vehicle Condition</Typography>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary">
                                            {categoryRatings.vehicle_condition > 0 ? getRatingText(categoryRatings.vehicle_condition) : 'Not rated'}
                                        </Typography>
                                    </Box>
                                    {renderStars(
                                        categoryRatings.vehicle_condition,
                                        (rating) => handleStarClick(rating, 'vehicle_condition'),
                                        '#8B5CF6',
                                        24
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Comment Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Card sx={{ borderRadius: 2, mb: 3, boxShadow: 1 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="subtitle1" fontWeight="semibold" display="flex" alignItems="center" gap={1} mb={2}>
                                    <MessageCircle size={16} />
                                    Additional Comments (Optional)
                                </Typography>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    placeholder="Share your experience with this driver..."
                                    value={comment}
                                    onChange={handleCommentChange}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            '&:hover fieldset': { borderColor: '#10B981' },
                                            '&.Mui-focused fieldset': { borderColor: '#10B981' }
                                        }
                                    }}
                                />
                                <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                                    <Typography variant="caption" color="text.secondary">
                                        Help other passengers by sharing your experience
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {comment.length}/500
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Error Alert */}
                    {error && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Submit Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    disabled={!isFormValid() || isSubmitting}
                                    sx={{
                                        py: 2,
                                        bgcolor: '#10B981',
                                        '&:hover': { bgcolor: '#059669' },
                                        '&:disabled': { bgcolor: '#D1D5DB' },
                                        borderRadius: 2,
                                        fontSize: '1.1rem',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {isSubmitting ? (
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <CircularProgress size={20} color="inherit" />
                                            Submitting Rating...
                                        </Box>
                                    ) : (
                                        'Submit Rating'
                                    )}
                                </Button>
                                {!isFormValid() && (
                                    <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={1}>
                                        Please enter your phone number and overall rating to submit
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </form>
            </Box>
        </Box>
    );
};

export default RateDriverPage;
