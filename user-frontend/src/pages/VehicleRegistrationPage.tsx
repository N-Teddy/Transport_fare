// src/pages/VehicleRegistrationPage.tsx
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, AlertTriangle, Car, Tag, Calendar, Palette, User, Upload, ArrowRight, Hash } from 'lucide-react';
import { useCreateVehicle, useGetAllVehicleTypes } from '../hooks/vehicleHook';
import { motion } from 'framer-motion';
import Stepper from '../components/ui/Stepper';
import FormField from '../components/ui/FormField';

export const vehicleSchema = z.object({
  vehicleTypeId: z.string().min(1, 'Vehicle type is required'),
  licensePlate: z.string().min(1, 'License plate is required'),
  make: z.string().optional(),
  model: z.string().optional(),
  year: z
    .number()
    .optional(),
  engineCapacity: z
    .number()
    .optional(),
  color: z.string().optional(),
  insuranceNumber: z.string().optional(),
  insuranceExpiry: z.string().optional(),
  inspectionExpiry: z.string().optional(),
  ownerDriverId: z.string().optional(),
});

export type CreateVehicleDto = z.infer<typeof vehicleSchema>;


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

const VehicleRegistrationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const driverId = searchParams.get('driverId');
  const { data: vehicleTypesData, isLoading: isLoadingVehicleTypes } = useGetAllVehicleTypes({});
  const createVehicleMutation = useCreateVehicle();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateVehicleDto>({
    resolver: zodResolver(vehicleSchema),
  });

  useEffect(() => {
    if (!driverId) {
      toast.error('Driver ID is missing. Please start from the beginning.');
      navigate('/register');
      return;
    }
    setValue('ownerDriverId', driverId);
  }, [driverId, navigate, setValue]);

  const onSubmit = async (data: CreateVehicleDto) => {
    if (!driverId) {
      toast.error('Cannot submit without a Driver ID.');
      return;
    }

    toast.promise(
      createVehicleMutation.mutateAsync(data, {
        onSuccess: (response) => {
          const vehicleId = response.data.id;
          navigate(`/register/documents?driverId=${driverId}&vehicleId=${vehicleId}`);
        },
      }),
      {
        loading: 'Registering vehicle...',
        success: 'Vehicle registered! Proceeding to document upload.',
        error: 'Failed to register vehicle. Please check your details.',
      }
    );
  };

  if (!driverId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Invalid Access</h2>
          <p className="text-gray-600">Redirecting you to the start of the registration process...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-bounce-in">
          <div className="flex items-center justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
              <Car className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Vehicle Registration
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tell us about your vehicle to continue the registration process
          </p>
        </div>

        {/* Stepper Component */}
        <Stepper currentStep={2} steps={steps} />

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
                <Car className="h-8 w-8" />
                <div>
                  <h2 className="text-2xl font-bold">Vehicle Information</h2>
                  <p className="text-emerald-100">Tell us about your vehicle</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
              {/* First Row - Vehicle Type (Full Width) */}
              <div className="grid grid-cols-1 gap-6">
                <FormField
                  name="vehicleTypeId"
                  label="Vehicle Type"
                  register={register}
                  errors={errors}
                  icon={Car}
                  as="select"
                >
                  <option value="">
                    {isLoadingVehicleTypes ? 'Loading types...' : 'Select a vehicle type'}
                  </option>
                  {vehicleTypesData?.data.items.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.typeName}
                    </option>
                  ))}
                </FormField>
              </div>

              {/* Second Row - License Plate and Make */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  name="licensePlate"
                  label="License Plate"
                  register={register}
                  errors={errors}
                  icon={Tag}
                  placeholder="e.g., ABC-1234"
                />
                <FormField
                  name="make"
                  label="Make"
                  register={register}
                  errors={errors}
                  icon={Car}
                  placeholder="e.g., Toyota"
                />
              </div>

              {/* Third Row - Model and Year */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  name="model"
                  label="Model"
                  register={register}
                  errors={errors}
                  icon={Car}
                  placeholder="e.g., Camry"
                />
                <FormField
                  name="year"
                  label="Year"
                  register={register}
                  errors={errors}
                  icon={Calendar}
                  // type="number"
                  required
                  placeholder="e.g., 2020"
                />
              </div>

              {/* Fourth Row - Color and Engine Capacity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  name="color"
                  label="Color"
                  register={register}
                  errors={errors}
                  icon={Palette}
                  placeholder="e.g., Red"
                />
                <FormField
                  name="engineCapacity"
                  label="Engine Capacity (Optional)"
                  register={register}
                  errors={errors}
                  icon={Hash}
                  type="number"
                  placeholder="e.g., 2000"
                />
              </div>

              {/* Fifth Row - Insurance Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  name="insuranceNumber"
                  label="Insurance Number (Optional)"
                  register={register}
                  errors={errors}
                  icon={Hash}
                  placeholder="Enter insurance number"
                />
                <FormField
                  name="insuranceExpiry"
                  label="Insurance Expiry (Optional)"
                  register={register}
                  errors={errors}
                  icon={Calendar}
                  type="date"
                />
              </div>

              {/* Sixth Row - Inspection Expiry */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  name="inspectionExpiry"
                  label="Inspection Expiry (Optional)"
                  register={register}
                  errors={errors}
                  icon={Calendar}
                  type="date"
                />
                {/* Empty column for spacing */}
                <div></div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={createVehicleMutation.isPending}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:bg-gray-400 disabled:shadow-none"
              >
                {createVehicleMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Next: Upload Documents</span>
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

export default VehicleRegistrationPage;
