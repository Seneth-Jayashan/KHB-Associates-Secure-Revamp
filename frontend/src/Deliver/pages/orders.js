import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

export default function DeliverOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Accessing logged-in deliver data passed through state
  const location = useLocation();
  const userData = location.state?.data;
  const deliverId = userData?.user_id;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/delivers/deliveries?id=${deliverId}`);
        setOrders(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch orders');
        setLoading(false);
      }
    };

    if (deliverId) {
      fetchOrders();
    } else {
      setError('No deliver ID found');
      setLoading(false);
    }
  }, [deliverId]);

  // Mark the order as delivered
  const handleDelivered = async (orderId) => {
    try {
      await axios.put(`http://localhost:3001/api/delivers/updateorderstatus/${orderId}`);
      setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId));
      alert('Order marked as delivered!');
      window.location.reload();
    } catch (err) {
      alert('Failed to mark as delivered');
    }
  };

  // View order details (navigate to a separate page or modal)
  const viewOrderDetails = (orderId) => {
    navigate(`/deliver-dashboard/vieworder/${orderId}`);
  };

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">My Assigned Orders</h2>
      {orders.length === 0 ? (
        <p className="text-gray-600">No orders assigned yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse bg-white shadow-md rounded-lg">
            <thead>
              <tr className="bg-gradient-to-r from-purple-400 to-purple-600 text-white">
                <th className="p-4 border">Order ID</th>
                <th className="p-4 border">Address</th>
                <th className="p-4 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-100">
                  <td className="p-4 border">{order.order_id}</td>
                  <td className="p-4 border">{order.address}</td>
                  <td className="p-4 border space-x-2">
                    <button
                      onClick={() => viewOrderDetails(order.order_id)}
                      className="px-3 py-1 rounded-md text-white bg-blue-500 hover:bg-blue-600 transition"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleDelivered(order.order_id)}
                      className="px-3 py-1 rounded-md text-white bg-green-500 hover:bg-green-600 transition"
                    >
                      Delivered
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
