import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [productCount, setProductCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [brandCount, setBrandCount] = useState(0);
  const [recentStocks, setRecentStocks] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [productRes, categoryRes, brandRes, stockRes] = await Promise.all([
          axios.get('http://localhost:3001/api/products/'),
          axios.get('http://localhost:3001/api/categories/'),
          axios.get('http://localhost:3001/api/brands/'),
          axios.get('http://localhost:3001/api/stocks/'),
        ]);
        setProductCount(productRes.data.length);
        setCategoryCount(categoryRes.data.length);
        setBrandCount(brandRes.data.length);
        setRecentStocks(stockRes.data.response);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      
      {/* Stats Section */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {[{ label: 'Total Products', value: productCount }, { label: 'Total Categories', value: categoryCount }, { label: 'Total Brands', value: brandCount }].map((item, index) => (
          <div key={index} className="bg-white shadow-xl rounded-2xl p-6 text-center hover:shadow-2xl transition-shadow duration-300">
            <h2 className="text-lg font-medium text-gray-600">{item.label}</h2>
            <p className="text-4xl font-bold text-blue-600">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Feed Section */}
      <div className="mt-8 bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-2xl font-medium text-gray-700 mb-4">Recent Stock Changes</h2>
        <div className="space-y-4">
          {recentStocks.slice(-5).map((stock, index) => (
            <div key={index} className="p-4 border-b last:border-none hover:bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-700">{stock.product_name}</h3>
                <span className={`text-sm font-medium ${
                  stock.type === 'add' ? 'text-green-500' : 
                  stock.type === 'sold' ? 'text-blue-500' : 
                  'text-red-500'
                }`}>
                  {stock.type === 'add' ? 'Added' : stock.type === 'sold' ? 'Sold' : 'Removed'}: {stock.quantity}
                </span>

              </div>
              <p className="text-sm text-gray-500 mt-2">{new Date(stock.change_date).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
