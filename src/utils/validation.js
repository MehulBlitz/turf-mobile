/**
 * Email validation
 */
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Phone number validation (Indian format)
 */
export const validatePhone = (phone) => {
  const re = /^[0-9]{10}$/;
  return re.test(phone.replace(/\D/g, ''));
};

/**
 * Password validation (min 6 chars)
 */
export const validatePassword = (password) => {
  return password && password.length >= 6;
};

/**
 * Full name validation
 */
export const validateFullName = (name) => {
  return name && name.trim().length >= 2;
};

/**
 * Address validation
 */
export const validateAddress = (address) => {
  return address && address.trim().length >= 5;
};

/**
 * Price validation
 */
export const validatePrice = (price) => {
  const num = parseFloat(price);
  return !isNaN(num) && num > 0 && num <= 10000;
};

/**
 * Time slot validation - check for overlaps
 */
export const validateTimeSlots = (slots) => {
  if (!slots || slots.length === 0) {
    return { valid: false, error: 'At least one time slot is required' };
  }

  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];

    // Check if times are valid
    if (!slot.start || !slot.end) {
      return { valid: false, error: `Slot ${i + 1}: Start and end times are required` };
    }

    // Check if end time is after start time
    const [startHour, startMin] = slot.start.split(':').map(Number);
    const [endHour, endMin] = slot.end.split(':').map(Number);
    const startTotalMin = startHour * 60 + startMin;
    const endTotalMin = endHour * 60 + endMin;

    if (endTotalMin <= startTotalMin) {
      return { valid: false, error: `Slot ${i + 1}: End time must be after start time` };
    }

    // Check for price
    if (!slot.price || parseFloat(slot.price) <= 0) {
      return { valid: false, error: `Slot ${i + 1}: Price must be greater than 0` };
    }

    // Check for overlaps with other slots
    for (let j = i + 1; j < slots.length; j++) {
      const otherSlot = slots[j];
      if (!otherSlot.start || !otherSlot.end) continue;

      const [otherStartHour, otherStartMin] = otherSlot.start.split(':').map(Number);
      const [otherEndHour, otherEndMin] = otherSlot.end.split(':').map(Number);
      const otherStartTotalMin = otherStartHour * 60 + otherStartMin;
      const otherEndTotalMin = otherEndHour * 60 + otherEndMin;

      // Check if overlapping
      if (startTotalMin < otherEndTotalMin && endTotalMin > otherStartTotalMin) {
        return { valid: false, error: `Slot ${i + 1} overlaps with Slot ${j + 1}` };
      }
    }
  }

  return { valid: true };
};

/**
 * Form validation helper
 */
export const validateForm = (formData, schema) => {
  const errors = {};

  Object.keys(schema).forEach(field => {
    const validator = schema[field];
    const value = formData[field];

    if (validator.required && (!value || !value.toString().trim())) {
      errors[field] = validator.requiredMessage || 'This field is required';
    } else if (value && validator.validate && !validator.validate(value)) {
      errors[field] = validator.errorMessage || 'Invalid value';
    }
  });

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';

  // Supabase specific errors
  if (error.message?.includes('Email not confirmed')) {
    return 'Please verify your email before logging in';
  }
  if (error.message?.includes('Invalid login credentials')) {
    return 'Invalid email or password';
  }
  if (error.message?.includes('User already registered')) {
    return 'This email is already registered';
  }
  if (error.message?.includes('row-level security')) {
    return 'You do not have permission to perform this action';
  }
  if (error.message?.includes('Failed to fetch')) {
    return 'Network error. Please check your connection';
  }

  // Return original message if no match
  return error.message || 'An error occurred. Please try again.';
};
