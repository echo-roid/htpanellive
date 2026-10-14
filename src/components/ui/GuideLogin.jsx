import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, Lock, User, AlertCircle } from 'lucide-react';

const TOKEN_KEY = 'travel_guide_token';
const GUIDE_KEY = 'travel_guide_info';

const GuideLogin = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Clear any old token on mount
    useEffect(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(GUIDE_KEY);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data } = await axios.post(
                'https://hrbklive.vercel.app/api/travel-guides/login',
                form
            );

            if (data.success && data.token && data.guide?.id) {
                // Save token + guide info
                localStorage.setItem(TOKEN_KEY, data.token);
                localStorage.setItem(GUIDE_KEY, JSON.stringify(data.guide));

                console.log('✅ Login OK. Guide id:', data.guide.id);

                navigate('/guide-panel');
            } else {
                setError(data.message || 'Login failed — invalid response');
                console.error('Login response shape wrong:', data);
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
                <div className="flex flex-col items-center mb-6">
                    <div className="p-3 bg-blue-100 rounded-full mb-3">
                        <Users size={32} className="text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Guide Panel Login</h1>
                    <p className="text-sm text-gray-500 mt-1">Sign in to manage your assigned guests</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-sm text-red-700">
                        <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <div className="relative">
                            <User size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={form.username}
                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                                className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your username"
                                required
                                autoFocus
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Signing in...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <p className="text-xs text-gray-400 text-center mt-6">
                    Contact your administrator if you don't have login credentials.
                </p>
            </div>
        </div>
    );
};

export default GuideLogin;