import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import loginImg from "../assets/login.png";
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../redux/slices/authSlice';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('https://tableware-dweeb-estate.ngrok-free.dev/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      const userData = await response.json();
      if (!response.ok) throw new Error(userData.error || 'Login failed');

      dispatch(loginSuccess(userData));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');

    setForgotLoading(true);

    if (!forgotEmail) {
      setForgotError('Please enter your email.');
      setForgotLoading(false);
      return;
    }

    try {
      const response = await fetch('https://tableware-dweeb-estate.ngrok-free.dev/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send reset link');

      navigate(`/reset-password/${data?.token}`);
      setForgotEmail('');
    } catch (err) {
      setForgotError(err.message || 'Failed to send reset link');
    } finally {
      setForgotLoading(false);
    }
  };

  console.log(forgotError)

  return (
    <div className="flex h-screen w-full bg-[#f6f9fc]">
      {/* Left Side */}
      <div className="w-1/2 bg-[#3478f6] text-white flex flex-col justify-center items-center p-10">
        <div className="flex items-center gap-2 mb-10">
          <img src="https://img.icons8.com/ios-filled/50/ffffff/task.png" alt="Logo" className="w-8 h-8" />
          <h1 className="text-2xl font-semibold">Woorkroom</h1>
        </div>
        <h2 className="text-3xl font-bold mb-4">Your place to work</h2>
        <p className="text-lg">Plan. Create. Control.</p>
        <img src={loginImg} alt="Task Board" className="w-2/3 mt-10" />
      </div>

      {/* Right Side */}
      <div className="w-1/2 flex flex-col justify-center items-center px-16">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Sign In to Woorkroom</h2>

        <form className="w-full max-w-sm" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="youremail@gmail.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
              <span
                className="absolute right-3 top-3 text-gray-400 cursor-pointer"
                onClick={() => setShowPassword(prev => !prev)}
              >
                {showPassword ? '🙈' : '👁️'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <label className="inline-flex items-center">
              <input type="checkbox" className="form-checkbox text-blue-500" />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => {
                setShowForgotModal(true);
                setForgotError('');

                setForgotEmail('');
              }}
              className="text-sm text-blue-500 hover:underline focus:outline-none"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition duration-200"
          >
            Sign In →
          </button>

          {error && (
            <p className="text-red-500 text-sm mt-3 text-center">{error}</p>
          )}

          <p className="text-center text-sm text-gray-600 mt-4">
            Don’t have an account? <a href="#" className="text-blue-500 hover:underline">Sign up</a>
          </p>
        </form>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setShowForgotModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 w-96 relative"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4">Reset Your Password</h3>

            <form onSubmit={handleForgotSubmit}>
              <label className="block text-gray-700 mb-2">Enter your email address:</label>
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="youremail@gmail.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
                required
              />
            

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
                  onClick={() => setShowForgotModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className={`px-4 py-2 text-white rounded transition ${
                    forgotLoading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
