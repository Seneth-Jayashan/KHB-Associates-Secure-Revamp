import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function Salary() {
  const [totalDeliveries, setTotalDeliveries] = useState(0);
  const [totalSalary, setTotalSalary] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Accessing logged-in deliver data passed through state
  const location = useLocation();
  const userData = location.state?.data;
  const deliverId = userData?.user_id;

  const BASIC_SALARY = 25000;
  const PAYMENT_PER_DELIVERY = 500;

  useEffect(() => {
    const fetchDeliveredCount = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/delivers/deliverycount?id=${deliverId}`);
        const deliveredCount = response.data.delivery_count;
        setTotalDeliveries(deliveredCount);
        setTotalSalary(BASIC_SALARY + deliveredCount * PAYMENT_PER_DELIVERY);
        setLoading(false);
      } catch (err) {
        setError('No delivey completed yet');
        setLoading(false);
      }
    };

    if (deliverId) {
      fetchDeliveredCount();
    } else {
      setError('No deliver ID found');
      setLoading(false);
    }
  }, [deliverId]);

  const deleteStat = async() =>{
    try{
      await axios.delete(`http://localhost:3001/api/delivers/deletecount?id=${deliverId}`);
      alert('Delivery Count Delete Successfully');
      window.location.reload();
    }catch(error){
      alert('Error in deleting delivery count');
    }
  }

  if (loading) return <div>Loading salary details...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center flex-col">
      {/* Increased Width: max-w-3xl and reduced padding */}
      <div className="max-w-3xl w-full bg-gradient-to-r from-blue-400 to-purple-600 rounded-lg shadow-xl p-6">
        <h2 className="text-3xl font-extrabold text-white mb-6 text-center">
          <span className="text-yellow-400">Salary</span> Details
        </h2>

        <div className="space-y-4">
          {/* Total Deliveries Card */}
          <div className="flex items-center justify-between bg-gradient-to-r from-green-400 to-green-600 text-white p-4 rounded-xl shadow-lg">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Total Deliveries</h3>
              <p className="text-3xl font-bold">{totalDeliveries}</p>
            </div>
            <div className="p-4 bg-white rounded-full shadow-md">
              <i className="fas fa-truck text-4xl text-green-500"></i>
            </div>
          </div>

          {/* Payment per Delivery Card */}
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-400 to-blue-600 text-white p-4 rounded-xl shadow-lg">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Payment Per Delivery</h3>
              <p className="text-3xl font-bold">LKR {PAYMENT_PER_DELIVERY}</p>
            </div>
            <div className="p-4 bg-white rounded-full shadow-md">
              <i className="fas fa-dollar-sign text-4xl text-blue-500"></i>
            </div>
          </div>

          {/* Basic Salary Card */}
          <div className="flex items-center justify-between bg-gradient-to-r from-purple-400 to-purple-600 text-white p-4 rounded-xl shadow-lg">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Basic Salary</h3>
              <p className="text-3xl font-bold">LKR {BASIC_SALARY}</p>
            </div>
            <div className="p-4 bg-white rounded-full shadow-md">
              <i className="fas fa-coins text-4xl text-purple-500"></i>
            </div>
          </div>

          {/* Total Salary Card */}
          <div className="flex items-center justify-between bg-gradient-to-r from-indigo-400 to-indigo-600 text-white p-4 rounded-xl shadow-lg">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Total Salary</h3>
              <p className="text-3xl font-bold">LKR {totalSalary}</p>
            </div>
            <div className="p-4 bg-white rounded-full shadow-md">
              <i className="fas fa-wallet text-4xl text-indigo-500"></i>
            </div>
          </div>
        </div>
      </div>

      <button
          className="bg-custom-gradient text-white font-semibold p-4 rounded-lg shadow-md hover:shadow-lg transition duration-300 my-10"
          onClick={() => deleteStat()}
        >
          Reset Count
        </button>
    </div>
  );
}
