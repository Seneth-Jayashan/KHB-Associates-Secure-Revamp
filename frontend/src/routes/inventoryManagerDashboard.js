import React from 'react';
import Sidebar from "../InventoryManager/components/sidebar";
import Header from '../InventoryManager/components/header';
import { Route, Routes } from 'react-router-dom';
import Dashboard from '../InventoryManager/pages/dashboard';
import Analytics from '../InventoryManager/pages/analytics';
import Settings from '../InventoryManager/pages/settings';
import Products from '../InventoryManager/pages/products/products';
import AddProduct from '../InventoryManager/pages/products/addProduct'
import Account from '../InventoryManager/pages/account';
import Brands from '../InventoryManager/pages/brands/brands';
import Category from '../InventoryManager/pages/category/category';

export default function InventoryManagerDashboard() {
  return (
      <div className="flex bg-gray-100  min-h-screen">

        <div className='bg-white'>
          <Sidebar />
        </div>


        <div className="flex-1 flex flex-col">

          <div className="flex-1 p-4 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/addproduct" element={<AddProduct />} />
              <Route path="/products/*" element={<Products />} />
              
              
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/account" element={<Account />} />

              <Route path="/brands/*" element={<Brands />} />
              <Route path="/category/*" element={<Category />} />
            </Routes>
          </div>
        </div>
      </div>
  );
}
