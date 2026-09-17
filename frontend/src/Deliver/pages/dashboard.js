import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA00FF", "#FF4081"];


export default function Dashboard() {
  const [deliveryData, setDeliveryData] = useState({
    totalDeliveredCount: 0,
    totalAssignedCount: 0,
    monthlySalaryCount: 0,
  });

   const [analytics, setAnalytics] = useState(null);
  

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

      const [token] = useState(localStorage.getItem("token"));
      const [userData, setUserData] = useState(null);

      const fetchUserData = async () => {
        try {
          const res = await axios.get("http://localhost:3001/api/users/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUserData(res.data);
        } catch (error) {
          console.error("Error fetching user:", error);
          if (error.response?.status === 401) {
            alert("Session expired. Please log in again.");
            localStorage.removeItem("token");
            window.location.href = "/logout";
          }
        }
      };

      useEffect(() => {
        if (token) {
          fetchUserData();
        }
      }, [token]);
  

  // Fetch the data when the component is mounted
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error state on new request

        // Fetch the necessary data
        const total = await axios.get(`http://localhost:3001/api/delivers/alldeliveries?id=${userData.user_id}`);
        const assigned = await axios.get(`http://localhost:3001/api/delivers/deliveries?id=${userData.user_id}`);
        const delivered = await axios.get(`http://localhost:3001/api/delivers/deliverycount?id=${userData.user_id}`);

        // Set the state with the data from the backend
        setDeliveryData({
          totalDeliveredCount: total.data.length,
          totalAssignedCount: assigned.data.length,
          monthlySalaryCount: (delivered.data.delivery_count * 500) + 25000,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Please complete your assigned delivery to get reports.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userData]);

  useEffect(() => {
    if (userData) {
      // Fetch delivery analytics data for the logged-in deliverer
      const fetchAnalytics = async () => {
        try {
          const response = await axios.get(`http://localhost:3001/api/delivers/analytics?id=${userData.user_id}`);
          setAnalytics(response.data);
        } catch (error) {
          console.error("Error fetching delivery analytics:", error);
        }
      };

      fetchAnalytics(); // Call the function to fetch the data
    }
  }, [userData]);

  // Safely map the data for Pie charts
  const deliveryStatusData = analytics?.deliveryStatusCounts 
    ? Object.entries(analytics.deliveryStatusCounts).map(([status, count]) => ({
        name: status,
        value: count,
      }))
    : [];


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen ">
        <span className="text-2xl">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="text-xl">{error}</span>
      </div>
    );
  }

  return (
    <div className=" min-h-screen p-8 space-y-6">
              <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={deliveryStatusData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              innerRadius={60}
              fill="#8884d8"
              paddingAngle={5}
              labelLine={false}
              isAnimationActive={true}
            >
              {deliveryStatusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>


        
      {/* Cards Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Total Delivered Count Card */}
        <div className="card p-6 bg-gray-200 shadow-lg rounded-xl hover:scale-105 transition-all duration-300 ease-in-out transform">
          <h3 className="text-2xl font-semibold text-purple-900 mb-3">Total Delivered Count</h3>
          <p className="text-4xl font-bold text-purple-500">{deliveryData.totalDeliveredCount}</p>
        </div>

        {/* Total Assigned Count Card */}
        <div className="card p-6 bg-gray-200 shadow-lg rounded-xl hover:scale-105 transition-all duration-300 ease-in-out transform">
          <h3 className="text-2xl font-semibold text-purple-900 mb-3">Total Assigned Count</h3>
          <p className="text-4xl font-bold text-purple-500">{deliveryData.totalAssignedCount}</p>
        </div>

        {/* Monthly Salary Count Card */}
        <div className="card p-6 bg-gray-200 shadow-lg rounded-xl hover:scale-105 transition-all duration-300 ease-in-out transform">
          <h3 className="text-2xl font-semibold text-purple-900 mb-3">Monthly Salary Count</h3>
          <p className="text-4xl font-bold text-purple-500">Rs. {deliveryData.monthlySalaryCount.toFixed(2)}</p>
        </div>





      </div>
    </div>
  );
}
