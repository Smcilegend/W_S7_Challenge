import React, { useState } from 'react';
import * as Yup from 'yup';

// 👇 Validation error messages
const validationErrors = {
  fullNameTooShort: 'full name must be at least 3 characters',
  fullNameTooLong: 'full name must be at most 20 characters',
  sizeIncorrect: 'size must be S or M or L',
};

// 👇 Validation schema using Yup
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

// 👇 Array for generating checkboxes dynamically
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
  const [successMessage, setSuccessMessage] = useState(''); // Added successMessage state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 👇 Function to validate the form
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

  // 👇 Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = await validateForm();
    if (isValid) {
      setIsSubmitting(true);
      setTimeout(() => {
        setSuccessMessage(
          `Order placed successfully! Full Name: ${formValues.fullName}, Size: ${formValues.size}, Toppings: ${
            formValues.toppings.length > 0
              ? formValues.toppings.join(', ')
              : 'None'
          }`
        );
        setIsSubmitting(false);
        setFormValues({ fullName: '', size: '', toppings: [] }); // Reset form values
      }, 1000);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Order Your Pizza</h2>
      {/* Success Message */}
      {successMessage && <div className="success">{successMessage}</div>}
      {errors.submit && <div className="failure">{errors.submit}</div>}

      {/* Full Name Field */}
      <div className="input-group">
        <div>
          <label htmlFor="fullName">Full Name</label>
          <br />
          <input
            placeholder="Type full name"
            id="fullName"
            type="text"
            value={formValues.fullName}
            onChange={(e) =>
              setFormValues({ ...formValues, fullName: e.target.value })
            }
          />
        </div>
        {errors.fullName && <div className="error">{errors.fullName}</div>}
      </div>

      {/* Size Dropdown */}
      <div className="input-group">
        <div>
          <label htmlFor="size">Size</label>
          <br />
          <select
            id="size"
            value={formValues.size}
            onChange={(e) =>
              setFormValues({ ...formValues, size: e.target.value })
            }
          >
            <option value="">----Choose Size----</option>
            <option value="S">Small (S)</option>
            <option value="M">Medium (M)</option>
            <option value="L">Large (L)</option>
          </select>
        </div>
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
        disabled={isSubmitting || Object.keys(errors).length > 0}
        value={isSubmitting ? 'Submitting...' : 'Submit'}
      />
    </form>
  );
}
