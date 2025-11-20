export const fetchForgotPassword = async (email) => {
  const response = await fetch('/api/auth/forgot-password', { // Your backend endpoint
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) throw new Error('Failed to send reset link');
  return response.json();
};