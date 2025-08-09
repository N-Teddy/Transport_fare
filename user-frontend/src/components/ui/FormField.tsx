// src/components/ui/FormField.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';

interface FormFieldProps {
    name: string;
    label: string;
    register: any;
    errors: any;
    icon: LucideIcon;
    type?: string;
    as?: 'input' | 'select';
    children?: React.ReactNode;
    placeholder?: string;
    [key: string]: any;
}

const FormField: React.FC<FormFieldProps> = ({
    name,
    label,
    register,
    errors,
    icon: Icon,
    type = 'text',
    as = 'input',
    children,
    placeholder,
    ...props
}) => {
    const hasError = errors[name];

    return (
        <motion.div
            className="relative"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <label
                htmlFor={name}
                className="block text-sm font-medium text-gray-700 mb-2"
            >
                {label}
            </label>

            <div className="relative group">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 z-10">
                    <Icon className={`h-5 w-5 transition-colors duration-200 ${hasError ? 'text-red-400' : 'text-gray-400 group-focus-within:text-emerald-500'
                        }`} />
                </span>

                {as === 'select' ? (
                    <select
                        id={name}
                        {...register(name)}
                        className={`
              w-full pl-12 pr-4 py-3 border-2 rounded-xl transition-all duration-200
              focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 focus:outline-none
              bg-white shadow-sm hover:shadow-md
              ${hasError
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                                : 'border-gray-200 hover:border-gray-300'
                            }
            `}
                        {...props}
                    >
                        {children}
                    </select>
                ) : (
                    <input
                        id={name}
                        type={type}
                        placeholder={placeholder}
                        {...register(name)}
                        className={`
              w-full pl-12 pr-4 py-3 border-2 rounded-xl transition-all duration-200
              focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 focus:outline-none
              bg-white shadow-sm hover:shadow-md placeholder-gray-400
              ${hasError
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                                : 'border-gray-200 hover:border-gray-300'
                            }
            `}
                        {...props}
                    />
                )}
            </div>

            <AnimatePresence>
                {hasError && (
                    <motion.p
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        className="text-red-500 text-sm mt-2 flex items-center"
                    >
                        <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                        {hasError.message}
                    </motion.p>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default FormField;
