import React, { useState } from 'react';
import * as Yup from 'yup';

// Validation error messages
const validationErrors = {
  fullNameTooShort: 'Full name must be at least 3 characters',
  fullNameTooLong: 'Full name must be at most 20 characters',
  sizeIncorrect: 'Size must be S, M, or L',
};

// Validation schema using Yup
const schema = Yup.object().shape({
  fullName: Yup.string()
    .min(3, validationErrors.fullNameTooShort)
    .max(20, validationErrors.fullNameTooLong)
    .required('Full name is required'),
  size: Yup.string()
    .oneOf(['S', 'M', 'L'], validationErrors.sizeIncorrect)
    .required('Size is required'),
  toppings: Yup.array().of(Yup.string()),
});

// Toppings array
const toppings = [
  { topping_id: '1', text: 'Pepperoni' },
  { topping_id: '2', text: 'Green Peppers' },
  { topping_id: '3', text: 'Pineapple' },
  { topping_id: '4', text: 'Mushrooms' },
  { topping_id: '5', text: 'Ham' },
];

export default function Form() {
  const [formValues, setFormValues] = useState({
    fullName: '',
    size: '',
    toppings: [],
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to validate the form
  const validateForm = async () => {
    try {
      await schema.validate(formValues, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      const validationErrors = {};
      err.inner.forEach((error) => {
        validationErrors[error.path] = error.message;
      });
      setErrors(validationErrors);
      return false;
    }
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
  
    const isValid = await validateForm(); // Validate the form
    if (isValid) {
      setIsSubmitting(true); // Set submission status to true
  
      // Log the request payload for debugging
      console.log('Submitting payload:', {
        fullName: formValues.fullName,
        size: formValues.size,
        toppings: formValues.toppings,
      });
  
      // Make the POST request
      try {
        const response = await fetch('http://localhost:9009/api/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: formValues.fullName,
            size: formValues.size,
            toppings: formValues.toppings,
          }),
        });
  
        // Parse the response
        const result = await response.json();
        console.log('Response from server:', result);
  
        if (response.ok) {
          setSuccessMessage(
            `Thank you for your order, ${formValues.fullName}! Your ${formValues.size.toUpperCase()} pizza with ${
              formValues.toppings.length > 0
                ? formValues.toppings
                    .map((id) => toppings.find((t) => t.topping_id === id).text)
                    .join(', ')
                : 'no toppings'
            } is on the way.`
          );
          setFormValues({ fullName: '', size: '', toppings: [] }); // Reset the form values
          setErrors({});
        } else {
          throw new Error(result.message || 'Failed to place order');
        }
      } catch (error) {
        console.error('Error placing order:', error);
        setFormValues({ fullName: '', size: '', toppings: [] });
        setErrors({});
        setIsSubmitting(false);
      }, 750);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Order Your Pizza</h2>

      {/* Success Message */}
      {successMessage && <div className="success">{successMessage}</div>}

      {/* Full Name Field */}
      <div className="input-group">
        <label htmlFor="fullName">Full Name</label>
        <input
          id="fullName"
          type="text"
          value={formValues.fullName}
          onChange={(e) => setFormValues({ ...formValues, fullName: e.target.value })}
        />
        {errors.fullName && <div className="error">{errors.fullName}</div>}
      </div>

      {/* Size Dropdown */}
      <div className="input-group">
        <label htmlFor="size">Size</label>
        <select
          id="size"
          value={formValues.size}
          onChange={(e) => setFormValues({ ...formValues, size: e.target.value })}
        >
          <option value="">-- Choose Size --</option>
          <option value="S">Small</option>
          <option value="M">Medium</option>
          <option value="L">Large</option>
        </select>
        {errors.size && <div className="error">{errors.size}</div>}
      </div>

      {/* Toppings Checkboxes */}
      <div className="input-group">
        <label>Toppings:</label>
        {toppings.map((topping) => (
          <label key={topping.topping_id}>
            <input
              type="checkbox"
              value={topping.topping_id}
              checked={formValues.toppings.includes(topping.topping_id)}
              onChange={(e) => {
                const value = e.target.value;
                setFormValues((prev) => ({
                  ...prev,
                  toppings: prev.toppings.includes(value)
                    ? prev.toppings.filter((t) => t !== value) 
                    : [...prev.toppings, value], 
                }));
              }}
            />
            {topping.text}
          </label>
        ))}
      </div>

      {/* Submit Button */}
      <input
        type="submit"
        value="Submit"
        disabled={
          isSubmitting || 
          !formValues.fullName || 
          !formValues.size ||
          Object.keys(errors).length > 0 
        }
      />
    </form>
  );
}
