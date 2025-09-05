import React from 'react';
import { Link } from 'react-router-dom';

const Delivery = () => {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">Delivery Information</h1>

      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-6 text-gray-700">Ordering Process</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold mb-4 text-indigo-600">1. Browse and Select</h3>
            <p className="text-gray-600 leading-relaxed">
              Explore our wide range of products. Click on any item to view detailed descriptions, images, and available sizes/colors. Add your desired items to your shopping cart. You can always review your cart before proceeding to checkout.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold mb-4 text-indigo-600">2. Secure Checkout</h3>
            <p className="text-gray-600 leading-relaxed">
              Once you're ready, proceed to our secure checkout. Here, you'll provide your shipping address, select your preferred shipping method, and enter your payment details. We accept various payment options for your convenience.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold mb-4 text-indigo-600">3. Order Confirmation</h3>
            <p className="text-gray-600 leading-relaxed">
              After successful payment, you'll receive an order confirmation email with all the details of your purchase, including your order number and a summary of items. Please keep this email for your records.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold mb-4 text-indigo-600">4. Order Processing</h3>
            <p className="text-gray-600 leading-relaxed">
              Our team immediately begins processing your order. This includes picking, packing, and quality checking your items to ensure they meet our high standards before dispatch.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-6 text-gray-700">Delivery Process</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold mb-4 text-green-600">1. Dispatch Notification</h3>
            <p className="text-gray-600 leading-relaxed">
              Once your order is dispatched from our warehouse, you will receive a shipping confirmation email. This email will include a tracking number and a link to track your package's journey.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold mb-4 text-green-600">2. Real-time Tracking</h3>
            <p className="text-gray-600 leading-relaxed">
              Use the provided tracking number to monitor the status of your delivery in real-time. You'll get updates on its location and estimated delivery date.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold mb-4 text-green-600">3. Delivery Attempt</h3>
            <p className="text-gray-600 leading-relaxed">
              Our delivery partners will attempt to deliver your package to the address provided. If you're not available, they may leave a notification with instructions for redelivery or pickup.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold mb-4 text-green-600">4. Receive Your Order</h3>
            <p className="text-gray-600 leading-relaxed">
              Enjoy your new items! We recommend inspecting your package upon arrival. If you have any concerns, please refer to our <Link to="/contact" className="text-blue-600 hover:underline">contact page</Link> for assistance.
            </p>
          </div>
        </div>
      </section>

      <section className="text-center mt-12">
        <h2 className="text-3xl font-semibold mb-4 text-gray-700">Estimated Delivery Times</h2>
        <p className="text-gray-600 text-lg mb-4">
          Delivery times vary based on your location and the shipping method selected during checkout.
        </p>
        <ul className="list-disc list-inside text-gray-600 text-left inline-block">
          <li>Standard Shipping: 5-7 business days</li>
          <li>Express Shipping: 2-3 business days</li>
          <li>International Shipping: 10-20 business days (subject to customs clearance)</li>
        </ul>
        <p className="text-gray-600 text-lg mt-6">
          For more detailed information or specific inquiries, please don't hesitate to <Link to="/contact" className="text-blue-600 hover:underline">contact our customer support</Link>.
        </p>
      </section>
    </div>
  );
};

export default Delivery;
