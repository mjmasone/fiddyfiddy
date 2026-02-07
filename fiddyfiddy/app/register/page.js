'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    venmo_handle: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          venmo_handle: formData.venmo_handle.replace(/^@/, ''),
          phone: formData.phone,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch (e) {
      setError('Registration failed. Please try again.');
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="card">
            <span className="text-6xl block mb-4">✅</span>
            <h1 className="text-2xl font-bold mb-2">Registration Complete!</h1>
            <p className="text-gray-400 mb-6">
              Your account is ready. You can now log in and start creating raffles.
            </p>
            <Link href="/login" className="btn btn-primary w-full">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/lobby" className="inline-flex items-center gap-2">
            <span className="text-4xl">🎟️</span>
            <span className="text-3xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
              Fiddyfiddy
            </span>
          </Link>
          <p className="text-gray-400 mt-2">Organizer Registration</p>
        </div>

        {/* Registration Form */}
        <div className="card">
          {error && (
            <div className="error-box mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Full Name</label>
              <input
                type="text"
                className="input"
                placeholder="John Smith"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <input
                type="email"
                className="input"
                placeholder="your@email.com"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Venmo Handle</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                <input
                  type="text"
                  className="input pl-8"
                  placeholder="YourVenmoHandle"
                  required
                  value={formData.venmo_handle}
                  onChange={(e) => setFormData({ ...formData, venmo_handle: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Phone (optional)</label>
              <input
                type="tel"
                className="input"
                placeholder="555-123-4567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Password</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Confirm Password</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>

            <div className="warning-box text-sm">
              <p>
                <strong>📋 Note:</strong> New accounts require approval before you can execute drawings. 
                You can still create raffles and sell tickets while pending.
              </p>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="spinner" />
                  Registering...
                </span>
              ) : (
                'Register'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>

        <p className="text-center text-gray-500 text-sm mt-2">
          <Link href="/lobby" className="hover:text-white">
            ← Back to raffles
          </Link>
        </p>
      </div>
    </div>
  );
}
