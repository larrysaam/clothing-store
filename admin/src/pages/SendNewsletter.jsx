import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { backendUrl } from '../App';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Mail, Users, MailOpen, Sparkles, Loader2 } from 'lucide-react';

const SendNewsletter = ({ token }) => {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await axios.post(`${backendUrl}/api/newsletter/send`, 
                { subject, message },
                { headers: { token } }
            );
            if (response.data.message) {
                toast.success(response.data.message);
                setSubject('');
                setMessage('');
            }
        } catch (error) {
            console.error('Failed to send newsletter:', error);
            toast.error(error.response?.data?.message || 'Failed to send newsletter');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Header Section */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 py-8">
                    <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-lg">
                            <MailOpen className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                Send Newsletter
                            </h1>
                            <p className="text-gray-600 mt-1">Create and send newsletters to your subscribers</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Newsletter Tool</p>
                                    <p className="text-lg font-bold text-indigo-600">Ready to Send</p>
                                </div>
                                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-full">
                                    <Mail className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Subscribers</p>
                                    <p className="text-lg font-bold text-green-600">All Active</p>
                                </div>
                                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-full">
                                    <Users className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Status</p>
                                    <p className="text-lg font-bold text-yellow-600">
                                        {isLoading ? 'Sending...' : 'Draft'}
                                    </p>
                                </div>
                                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-3 rounded-full">
                                    <Sparkles className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Newsletter Form */}
                <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                    <CardHeader className="pb-6">
                        <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg mr-3">
                                <Mail className="h-6 w-6 text-white" />
                            </div>
                            Compose Newsletter
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                            Create your newsletter content and send it to all subscribers
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Subject Field */}
                            <div className="space-y-3">
                                <Label htmlFor="subject" className="text-base font-semibold text-gray-700 flex items-center">
                                    <Send className="h-4 w-4 mr-2 text-indigo-600" />
                                    Email Subject
                                </Label>
                                <Input
                                    id="subject"
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Enter a compelling subject line..."
                                    required
                                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-base py-3"
                                />
                                <p className="text-sm text-gray-500">
                                    💡 Tip: Keep your subject line under 50 characters for best results
                                </p>
                            </div>

                            {/* Message Field */}
                            <div className="space-y-3">
                                <Label htmlFor="message" className="text-base font-semibold text-gray-700 flex items-center">
                                    <MailOpen className="h-4 w-4 mr-2 text-indigo-600" />
                                    Newsletter Content
                                </Label>
                                <textarea
                                    id="message"
                                    rows="12"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Write your newsletter content here... You can include updates, promotions, news, and more!"
                                    required
                                    className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-base p-4 resize-y min-h-[200px] shadow-sm"
                                />
                                <p className="text-sm text-gray-500">
                                    ✨ You can use HTML formatting, links, and styling in your message
                                </p>
                            </div>

                            {/* Send Button */}
                            <div className="flex justify-center pt-6 border-t border-gray-200">
                                <Button
                                    type="submit"
                                    disabled={isLoading || !subject.trim() || !message.trim()}
                                    className={`px-8 py-3 text-base font-semibold transition-all duration-300 ${
                                        isLoading 
                                            ? 'bg-gray-400 cursor-not-allowed' 
                                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                                    } text-white`}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center">
                                            <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                            Sending Newsletter...
                                        </span>
                                    ) : (
                                        <span className="flex items-center">
                                            <Send className="h-5 w-5 mr-2" />
                                            Send Newsletter
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Help Section */}
                <Card className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                            <Sparkles className="h-5 w-5 mr-2" />
                            Newsletter Tips
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                            <div className="flex items-start space-x-2">
                                <span className="text-blue-600">•</span>
                                <span>Use a clear and engaging subject line</span>
                            </div>
                            <div className="flex items-start space-x-2">
                                <span className="text-blue-600">•</span>
                                <span>Include valuable content for your subscribers</span>
                            </div>
                            <div className="flex items-start space-x-2">
                                <span className="text-blue-600">•</span>
                                <span>Add links to your website and products</span>
                            </div>
                            <div className="flex items-start space-x-2">
                                <span className="text-blue-600">•</span>
                                <span>Keep your message concise and scannable</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default SendNewsletter;
