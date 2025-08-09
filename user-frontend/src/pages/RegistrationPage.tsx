// src/pages/RegistrationPage.tsx

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { type CreateDriverDto } from '../types/driver';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Loader2, User, Hash, Phone, MapPin, Calendar, ArrowRight, Car, Upload } from 'lucide-react';
import { useCreateDriver } from '../hooks/driverHook';
import { useFindAllCities } from '../hooks/geographyHook';
import { motion, AnimatePresence } from 'framer-motion';
import FormField from '../components/ui/FormField';
import Stepper from '../components/ui/Stepper';

// Zod schema for validation
export const driverSchema = z.object({
  licenseNumber: z.string().min(1, 'License number is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phoneNumber: z.string().min(9, 'Phone number is required'),
  cniNumber: z.string().min(1, 'CNI number is required'),
  birthDate: z.string().optional(),
  address: z.string().optional(),
  cityId: z.string().min(1, 'Please select a city'),
});

const steps = [
  {
    id: 1,
    title: 'Personal Info',
    description: 'Basic details',
    icon: User,
  },
  {
    id: 2,
    title: 'Vehicle Details',
    description: 'Car information',
    icon: Car,
  },
  {
    id: 3,
    title: 'Documents',
    description: 'Upload files',
    icon: Upload,
  },
];

const RegistrationPage = () => {
  const navigate = useNavigate();
  const { data: cities, isLoading: isLoadingCities } = useFindAllCities({});
  const createDriverMutation = useCreateDriver();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateDriverDto>({
    resolver: zodResolver(driverSchema),
  });

  const onSubmit = async (data: CreateDriverDto) => {
    toast.promise(
      createDriverMutation.mutateAsync(data, {
        onSuccess: (response) => {
          const driverId = response.data.id;
          navigate(`/register/vehicle?driverId=${driverId}`);
        },
      }),
      {
        loading: 'Registering driver...',
        success: 'Driver registered! Proceeding to next step.',
        error: 'Registration failed. Please try again.',
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-bounce-in">
          <div className="flex items-center justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
              <User className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Driver Registration
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Complete your driver registration in just three simple steps
          </p>
        </div>

        {/* Stepper Component */}
        <Stepper currentStep={1} steps={steps} />

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-6 text-white">
              <div className="flex items-center space-x-3">
                <User className="h-8 w-8" />
                <div>
                  <h2 className="text-2xl font-bold">Personal Information</h2>
                  <p className="text-emerald-100">Let's start with your basic details</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
              {/* First Row - 2 columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  name="firstName"
                  label="First Name"
                  register={register}
                  errors={errors}
                  icon={User}
                  placeholder="Enter your first name"
                />
                <FormField
                  name="lastName"
                  label="Last Name"
                  register={register}
                  errors={errors}
                  icon={User}
                  placeholder="Enter your last name"
                />
              </div>

              {/* Second Row - 2 columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  name="licenseNumber"
                  label="License Number"
                  register={register}
                  errors={errors}
                  icon={Hash}
                  placeholder="Enter your license number"
                />
                <FormField
                  name="phoneNumber"
                  label="Phone Number"
                  register={register}
                  errors={errors}
                  icon={Phone}
                  placeholder="Enter your phone number"
                />
              </div>

              {/* Third Row - 2 columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  name="cniNumber"
                  label="CNI Number"
                  register={register}
                  errors={errors}
                  icon={Hash}
                  placeholder="Enter your CNI number"
                />
                <FormField
                  name="birthDate"
                  label="Date of Birth"
                  register={register}
                  errors={errors}
                  icon={Calendar}
                  type="date"
                />
              </div>

              {/* Fourth Row - City and Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <label htmlFor="cityId" className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 z-10">
                      <MapPin className={`h-5 w-5 transition-colors duration-200 ${errors.cityId ? 'text-red-400' : 'text-gray-400 group-focus-within:text-emerald-500'
                        }`} />
                    </span>
                    <select
                      id="cityId"
                      {...register('cityId')}
                      disabled={isLoadingCities}
                      className={`
                        w-full pl-12 pr-4 py-3 border-2 rounded-xl transition-all duration-200
                        focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 focus:outline-none
                        bg-white shadow-sm hover:shadow-md
                        ${errors.cityId
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <option value="">
                        {isLoadingCities ? 'Loading cities...' : 'Select a city'}
                      </option>
                      {cities?.data.items.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <AnimatePresence>
                    {errors.cityId && (
                      <motion.p
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        className="text-red-500 text-sm mt-2 flex items-center"
                      >
                        <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                        {errors.cityId.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <FormField
                  name="address"
                  label="Address (Optional)"
                  register={register}
                  errors={errors}
                  icon={MapPin}
                  placeholder="Enter your address"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={createDriverMutation.isPending}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:bg-gray-400 disabled:shadow-none"
              >
                {createDriverMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Next: Vehicle Details</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegistrationPage;
