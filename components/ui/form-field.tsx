'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Label } from './label'

interface FormFieldProps {
  children: React.ReactNode
  label?: string
  description?: string
  error?: string
  required?: boolean
  className?: string
  id?: string
}

export function FormField({ 
  children, 
  label, 
  description, 
  error, 
  required, 
  className,
  id 
}: FormFieldProps) {
  const fieldId = id || React.useId()
  const errorId = error ? `${fieldId}-error` : undefined
  const descriptionId = description ? `${fieldId}-description` : undefined

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label 
          htmlFor={fieldId}
          className={cn(
            'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            required && "after:content-['*'] after:ml-0.5 after:text-red-500"
          )}
        >
          {label}
        </Label>
      )}
      
      <div className="relative">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
              id: fieldId,
              'aria-invalid': error ? 'true' : 'false',
              'aria-describedby': cn(descriptionId, errorId),
              className: cn(
                child.props.className,
                error && 'border-red-500 focus-visible:ring-red-500'
              ),
            })
          }
          return child
        })}
      </div>
      
      {description && !error && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
      
      {error && (
        <div className="flex items-start gap-2">
          <svg
            className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p id={errorId} className="text-sm text-red-600" role="alert">
            {error}
          </p>
        </div>
      )}
    </div>
  )
}

// Form validation helpers
export interface ValidationRule {
  validate: (value: any) => boolean
  message: string
}

export function createValidationRules() {
  return {
    required: (message = 'This field is required'): ValidationRule => ({
      validate: (value) => value != null && value !== '' && value !== undefined,
      message
    }),
    
    email: (message = 'Please enter a valid email address'): ValidationRule => ({
      validate: (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message
    }),
    
    minLength: (min: number, message?: string): ValidationRule => ({
      validate: (value) => !value || value.length >= min,
      message: message || `Must be at least ${min} characters`
    }),
    
    maxLength: (max: number, message?: string): ValidationRule => ({
      validate: (value) => !value || value.length <= max,
      message: message || `Must be no more than ${max} characters`
    }),
    
    pattern: (regex: RegExp, message: string): ValidationRule => ({
      validate: (value) => !value || regex.test(value),
      message
    }),
    
    custom: (validator: (value: any) => boolean, message: string): ValidationRule => ({
      validate: validator,
      message
    })
  }
}

// Hook for form validation
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationSchema: Record<keyof T, ValidationRule[]>
) {
  const [values, setValues] = React.useState<T>(initialValues)
  const [errors, setErrors] = React.useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouched] = React.useState<Partial<Record<keyof T, boolean>>>({})

  const validateField = (name: keyof T, value: any): string | null => {
    const rules = validationSchema[name] || []
    for (const rule of rules) {
      if (!rule.validate(value)) {
        return rule.message
      }
    }
    return null
  }

  const validateAll = (): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {}
    let isValid = true

    Object.keys(validationSchema).forEach((fieldName) => {
      const error = validateField(fieldName as keyof T, values[fieldName as keyof T])
      if (error) {
        newErrors[fieldName as keyof T] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const setValue = (name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }))
    
    // Validate field if it has been touched
    if (touched[name]) {
      const error = validateField(name, value)
      setErrors(prev => ({ ...prev, [name]: error || undefined }))
    }
  }

  const setTouched = (name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }))
    
    // Validate field when touched
    const error = validateField(name, values[name])
    setErrors(prev => ({ ...prev, [name]: error || undefined }))
  }

  const reset = () => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }

  return {
    values,
    errors,
    touched,
    setValue,
    setTouched,
    validateAll,
    reset,
    isValid: Object.keys(errors).length === 0
  }
}