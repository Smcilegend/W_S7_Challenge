import React, { useState, useEffect } from 'react';
import * as Yup from 'yup';

const validationErrors = {
  fullNameTooShort: 'Full name must be at least 3 characters',
  fullNameTooLong: 'Full name must be at most 20 characters',
  sizeIncorrect: 'Size must be S, M, or L',
};

const schema = Yup.object().shape({
  fullName: Yup.string()
    .trim() // trim whitespace padding
    .min(3, validationErrors.fullNameTooShort)
    .max(20, validationErrors.fullNameTooLong)
    .required('Full name is required'),
  size: Yup.string()
    .oneOf(['S', 'M', 'L'], validationErrors.sizeIncorrect)
    .required('Size is required'),
  toppings: Yup.array().of(Yup.string()),
});

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
  const [isDisabled, setDisabled] = useState(true);

  const validateForm = async () => {
    try {
      await schema.validate(formValues, { abortEarly: false });
      setErrors({});
      setDisabled(false);
    } catch (err) {
      const errorMessages = {};
      err.inner.forEach((error) => {
        errorMessages[error.path] = error.message;
      });
      setErrors(errorMessages);
      setDisabled(true);
    }
  };

  useEffect(() => {
    validateForm();
  }, [formValues]);

  const inputChange = (field, value) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleToppingsChange = (toppingId) => {
    setFormValues((prev) => ({
      ...prev,
      toppings: prev.toppings.includes(toppingId)
        ? prev.toppings.filter((t) => t !== toppingId)
        : [...prev.toppings, toppingId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await schema.validate(formValues, { abortEarly: false });
      setIsSubmitting(true);
      const response = await fetch('http://localhost:9009/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formValues),
      });
      const result = await response.json();

      if (response.ok) {
        const toppingsText = formValues.toppings.length > 0 ? formValues.toppings
            .map(id => toppings.find(t => t.topping_id === id).text)
            .join(', ') : 'no toppings';
        const sizeText = formValues.size.toUpperCase();

        setSuccessMessage(`Thank you for your order, ${formValues.fullName}! Your ${sizeText} pizza with ${toppingsText} is on the way.`);
        setFormValues({ fullName: '', size: '', toppings: [] });
        setErrors({});
      } else {
        setErrors({ submit: result.message || 'Failed to place order' });
      }
    } catch (error) {
      setErrors({ submit: 'Failed to place order. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-label="Pizza Order Form">
      <h2>Order Your Pizza</h2>
      {successMessage && (
        <div className="success" role="alert">
          {successMessage}
        </div>
      )}
      <div className="input-group">
        <label htmlFor="fullName">Full Name</label>
        <input
          id="fullName"
          type="text"
          value={formValues.fullName}
          onChange={(e) => inputChange('fullName', e.target.value)}
          aria-required="true"
        />
        {errors.fullName && (
          <div className="error" role="alert">
            {errors.fullName}
          </div>
        )}
      </div>
      <div className="input-group">
        <label htmlFor="size">Size</label>
        <select
          id="size"
          value={formValues.size}
          onChange={(e) => inputChange('size', e.target.value)}
          aria-required="true"
        >
          <option value="">-- Choose Size --</option>
          <option value="S">Small</option>
          <option value="M">Medium</option>
          <option value="L">Large</option>
        </select>
        {errors.size && (
          <div className="error" role="alert">
            {errors.size}
          </div>
        )}
      </div>
      <div className="input-group">
        <label>Toppings:</label>
        {toppings.map((topping) => (
          <label key={topping.topping_id}>
            <input
              type="checkbox"
              value={topping.topping_id}
              checked={formValues.toppings.includes(topping.topping_id)}
              onChange={() => handleToppingsChange(topping.topping_id)}
            />
            {topping.text}
          </label>
        ))}
      </div>
      {errors.submit && (
        <div className="error" role="alert">
          {errors.submit}
        </div>
      )}
      <button type="submit" disabled={isSubmitting || isDisabled}>
        Submit
      </button>
    </form>
  );
}
