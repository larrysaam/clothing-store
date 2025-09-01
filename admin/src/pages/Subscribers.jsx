
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { backendUrl } from '../App';

const Subscribers = () => {
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchSubscribers = async () => {
            try {
                const response = await axios.get(`${backendUrl}/api/newsletter`, {
                    headers: { token }
                });
                if (response.data) {
                    setSubscribers(response.data);
                }
            } catch (error) {
                toast.error('Failed to fetch subscribers');
            }
            setLoading(false);
        };

        fetchSubscribers();
    }, [token]);

    if (loading) {
        return <p>Loading subscribers...</p>;
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-semibold mb-4">Newsletter Subscribers</h1>
            <div className="bg-white shadow-md rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium">Total Subscribers: {subscribers.length}</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Email</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Subscription Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscribers.map((subscriber) => (
                                <tr key={subscriber._id} className="border-b">
                                    <td className="py-3 px-4">{subscriber.email}</td>
                                    <td className="py-3 px-4">{new Date(subscriber.subscribedAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {subscribers.length === 0 && !loading && (
                    <p className="text-center text-gray-500 mt-4">No subscribers yet.</p>
                )}
            </div>
        </div>
    );
};

export default Subscribers;
