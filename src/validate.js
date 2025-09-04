// Simple client-side validation for the job request form

export function validateForm(data) {
  const errors = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push("Please enter your full name.");
  }

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push("Please enter a valid email address.");
  }

  if (!data.description || data.description.trim().length < 5) {
    errors.push("Please provide a job description (at least 5 characters).");
  }

  return errors;
}
