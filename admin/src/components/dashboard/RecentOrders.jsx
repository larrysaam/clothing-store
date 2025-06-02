import React from 'react'
import { format } from 'date-fns'

const RecentOrders = ({ orders }) => {

  const options = { month: 'short', day: '2-digit', year: 'numeric' };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
      <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left pb-3">Order ID</th>
              <th className="text-left pb-3">Customer</th>
              <th className="text-left pb-3">Amount</th>
              <th className="text-left pb-3">Status</th>
              <th className="text-left pb-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id} className="border-b">
                <td className="py-2">{order._id.slice(-6)}</td>
                <td className="py-2">{order.address.firstName}</td>
                <td className="py-2">${order.amount}</td>
                <td className="py-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-2">{new Date(order.date).toLocaleDateString('en-US', options)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default RecentOrders