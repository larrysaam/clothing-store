
import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const Newsletter = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error('Please enter your email');
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post(`${backendUrl}/api/newsletter/subscribe`, { email });
            toast.success(response.data.message);
            setEmail('');
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Subscription failed. Please try again later.');
            }
        }
        setLoading(false);
    };

    return (
        <div className="text-center bg-gray-100 py-16">
            <h3 className="text-lg font-semibold mb-2">Subscribe to our Newsletter</h3>
            <p className="text-sm text-gray-600 mb-4">Get the latest updates on new products and upcoming sales</p>
            <form onSubmit={handleSubmit} className="flex justify-center items-center max-w-md mx-auto">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-gray-800"
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-gray-800 text-white font-semibold rounded-r-md hover:bg-gray-900 disabled:bg-gray-400 transition-colors"
                >
                    {loading ? 'Subscribing...' : 'Subscribe'}
                </button>
            </form>
        </div>
    );
};

export default Newsletter;
