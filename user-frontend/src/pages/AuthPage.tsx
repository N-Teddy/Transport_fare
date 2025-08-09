// src/pages/AuthPage.tsx

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import FormField from '../components/ui/FormField';
import { Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRequestOtp, useVerifyOtp } from '../hooks/authHook';
import type { ApiResponseDto, AuthResponseDto, MessageResponseDto } from '../types/auth';
import { motion } from 'framer-motion';
import OtpInput from 'react-otp-input';


const phoneSchema = z.object({
    phoneNumber: z.string().min(1, 'Phone number is required').regex(/^\d{9}$/, 'Phone number must be 9 digits'),
});

const otpSchema = z.object({
    otp: z.string().min(6, 'OTP must be 6 digits').max(6, 'OTP must be 6 digits'),
});

const AuthPage: React.FC = () => {
    const [isOtpVisible, setIsOtpVisible] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState<string>('');
    const [otp, setOtp] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const { mutate: requestOtp, isPending: isLoadingOtp } = useRequestOtp({
        onSuccess: (data: ApiResponseDto<MessageResponseDto>) => {
            if (data.status === 'success') {
                setIsOtpVisible(true);
            }
        },
    });

    const { mutate: verifyOtp, isPending: isLoadingVerify } = useVerifyOtp({
        onSuccess: (data: ApiResponseDto<AuthResponseDto>) => {
            if (data.status === 'success') {
                login(data.data.tokens); // Save tokens in AuthContext
                navigate('/dashboard');
            }
        },
    });


    const {
        register: registerPhone,
        handleSubmit: handleSubmitPhone,
        formState: { errors: phoneErrors },
    } = useForm({
        resolver: zodResolver(phoneSchema),
    });

    const {
        // register: registerOtp,
        // handleSubmit: handleSubmitOtp,
        formState: { errors: otpErrors },
    } = useForm({
        resolver: zodResolver(otpSchema),
    });

    const onSubmitPhone = (data: { phoneNumber: string }) => {
        const formatted = `+237${data.phoneNumber}`;
        setPhoneNumber(formatted);
        setIsOtpVisible(true)
        requestOtp({ phoneNumber: formatted });
    };


    // const onSubmitOtp = (data: { otp: string }) => {
    //     verifyOtp({ phoneNumber, otp: data.otp });
    // };

    const handleVerifyOtp = () => {
        if (otp.length !== 6) {
            console.error('OTP must be 6 digits');
            return;
        }
        verifyOtp({ phoneNumber, otp });
    };



    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="container mx-auto px-4 py-8 max-w-md">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">{isOtpVisible ? 'Verify OTP' : 'Driver Login'}</h1>
                    <p className="text-xl text-gray-600">{isOtpVisible ? 'Enter the OTP sent to your phone number' : 'Please enter your phone number to receive an OTP'}</p>
                </div>

                <motion.div
                    className={`bg-white rounded-3xl shadow-xl p-8 relative overflow-hidden ${isOtpVisible ? 'hidden' : ''}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <img src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/3075ca23-7ae5-46bd-855b-9fd272daadee.png" alt="Driver illustration" className="absolute top-0 right-0 opacity-10 w-48 h-48 -mr-8 -mt-8" />
                    <form onSubmit={handleSubmitPhone(onSubmitPhone)} className="space-y-6 relative z-10">
                        <FormField
                            name="phoneNumber"
                            label="Phone Number"
                            register={registerPhone}
                            errors={phoneErrors}
                            icon={Phone}
                            placeholder="Enter your phone number"
                        />
                        <button
                            type="submit"
                            className={`w-full bg-emerald-500 text-white font-bold py-3 rounded-lg hover:bg-emerald-600 transition-all duration-300 shadow-lg flex items-center justify-center`}
                            disabled={isLoadingOtp}
                        >
                            {isLoadingOtp ? 'Sending...' : 'Request OTP'}
                        </button>
                    </form>
                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Don't have an account?
                            <a href="/register/driver" className="text-emerald-500 font-semibold hover:text-emerald-600 hover:underline"> Register</a>
                        </p>
                    </div>
                </motion.div>

                <motion.div
                    className={`bg-white rounded-3xl shadow-xl p-8 relative overflow-hidden ${isOtpVisible ? '' : 'hidden'}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <img src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/c5c8204a-3a9f-4072-b5b3-c59ca63c6f4e.png" alt="OTP verification illustration" className="absolute top-0 left-0 opacity-10 w-48 h-48 -ml-8 -mt-8" />
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        handleVerifyOtp();
                    }} className="space-y-6 relative z-10">
                        <div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-4 text-center">Enter OTP Code</label>
                                <div className="flex justify-center mb-6">
                                    <OtpInput
                                        value={otp}
                                        onChange={setOtp}
                                        numInputs={6}
                                        renderSeparator={<span>-</span>}
                                        renderInput={(props) => <input {...props} />}
                                        inputType='text'
                                        shouldAutoFocus
                                        inputStyle="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 focus:outline-none bg-white shadow-sm mx-1"
                                    />
                                </div>
                                {otpErrors.otp && <p className="text-red-500 text-sm text-center mt-1">{otpErrors.otp.message}</p>}
                            </div>
                        </div>
                        <button
                            type="submit"
                            className={`w-full bg-emerald-500 text-white font-bold py-3 rounded-lg hover:bg-emerald-600 transition-all duration-300 shadow-lg flex items-center justify-center`}
                            disabled={isLoadingVerify}
                        >
                            {isLoadingVerify ? 'Verifying...' : 'Verify OTP'}
                        </button>
                        <button
                            type="button"
                            className="w-full border-2 border-gray-300 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-50 transition-all duration-300 flex items-center justify-center"
                            onClick={() => setIsOtpVisible(false)}
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Go Back
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default AuthPage;
