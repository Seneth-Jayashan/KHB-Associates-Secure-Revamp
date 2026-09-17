import React from 'react';
import Sidebar from "../Deliver/components/sidebar";
import Header from '../Deliver/components/header';
import { Route, Routes } from 'react-router-dom';
import Dashboard from '../Deliver/pages/dashboard';
import Analytics from '../Deliver/pages/analytics';
import Settings from '../Deliver/pages/settings';
import Salary from '../Deliver/pages/salary';
import Orders from '../Deliver/pages/orders';
import DeliveryForm from '../Deliver/pages/delivery';
import ViewOrder from '../Deliver/pages/vieworder';

export default function DeliverDashboard() {
  return (
      <div className="flex bg-gray-100  min-h-screen">

        <div className='bg-white'>
          <Sidebar />
        </div>


        <div className="flex-1 flex flex-col">


          <div className="flex-1 p-4 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/orders" element={<Orders/>}/>
              <Route path="/delivery" element={<DeliveryForm />} />
              <Route path="/salary" element={<Salary/>}/>
              <Route path="/analytics" element={<Analytics/>}/>
              <Route path="/settings" element={<Settings />} />
              <Route path='/vieworder/:orderId' element={<ViewOrder/>} />
            </Routes>
          </div>
        </div>
      </div>
  );
}
