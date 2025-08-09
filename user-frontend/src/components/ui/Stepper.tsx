// src/components/ui/Stepper.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface Step {
    id: number;
    title: string;
    description: string;
    icon: React.ComponentType<any>;
}

interface StepperProps {
    currentStep: number;
    steps: Step[];
}

const Stepper: React.FC<StepperProps> = ({ currentStep, steps }) => {
    return (
        <div className="w-full max-w-4xl mx-auto mb-8">
            <div className="flex items-center justify-between relative">
                {/* Progress Line */}
                <div className="absolute top-8 left-0 w-full h-0.5 bg-gray-200 z-0">
                    <motion.div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                        initial={{ width: '0%' }}
                        animate={{
                            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`
                        }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                    />
                </div>

                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = stepNumber < currentStep;
                    const isCurrent = stepNumber === currentStep;
                    // const isUpcoming = stepNumber > currentStep;

                    return (
                        <div key={step.id} className="flex flex-col items-center relative z-10">
                            {/* Step Circle */}
                            <motion.div
                                className={`
                  w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all duration-300
                  ${isCompleted
                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 border-emerald-500 text-white shadow-lg'
                                        : isCurrent
                                            ? 'bg-white border-emerald-500 text-emerald-600 shadow-lg ring-4 ring-emerald-100'
                                            : 'bg-gray-100 border-gray-300 text-gray-400'
                                    }
                `}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {isCompleted ? (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <Check className="w-6 h-6" />
                                    </motion.div>
                                ) : (
                                    <step.icon className="w-6 h-6" />
                                )}
                            </motion.div>

                            {/* Step Content */}
                            <div className="mt-4 text-center max-w-32">
                                <motion.h3
                                    className={`
                    text-sm font-semibold transition-colors duration-300
                    ${isCurrent ? 'text-emerald-600' : isCompleted ? 'text-gray-700' : 'text-gray-400'}
                  `}
                                    animate={{ scale: isCurrent ? 1.05 : 1 }}
                                >
                                    {step.title}
                                </motion.h3>
                                <p className={`
                  text-xs mt-1 transition-colors duration-300
                  ${isCurrent ? 'text-emerald-500' : isCompleted ? 'text-gray-500' : 'text-gray-400'}
                `}>
                                    {step.description}
                                </p>
                            </div>

                            {/* Current Step Indicator */}
                            {isCurrent && (
                                <motion.div
                                    className="absolute -bottom-2 w-2 h-2 bg-emerald-500 rounded-full"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.3 }}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Stepper;
