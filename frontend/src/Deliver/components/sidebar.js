import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Logo from "../assets/deliverylogo.png";
import { Logout, Copyright  } from "@mui/icons-material";
import DashboardIcon from "@mui/icons-material/DashboardCustomizeOutlined";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCartOutlined";
import AnalyticsIcon from "@mui/icons-material/AnalyticsOutlined";
import SettingsIcon from "@mui/icons-material/SettingsOutlined";
import MoneyIcon from '@mui/icons-material/Money';
import { DeliveryDiningOutlined } from "@mui/icons-material";
import axios from "axios";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


export default function Sidebar() {

    {/* fetching user data */}
    const [userData, setUserData] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token")); 
    const [isLoading, setIsLoading] = useState(true); 
  
    const navigate = useNavigate();
  
    const fetchUserData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
  
        if (error.response?.status === 401) {
          alert("Session expired. Please log in again.");
          localStorage.removeItem("token");
          setToken(null);
          window.location.href = "/logout";
        } else if (error.response) {
          console.error("API Error:", error.response.status, error.response.data);
        } else if (error.request) {
          console.error("No response from server:", error.request);
        } else {
          console.error("Error setting up request:", error.message);
        }
      } finally {
        setIsLoading(false); 
      }
    };
  
    useEffect(() => {
      if (token) {
        fetchUserData();
      } else {
        console.warn("No token found, skipping API call.");
        setIsLoading(false);
      }
    }, [token]); 
  
    


    {/* Added */}

    const [formData, setFormData] = useState({
      orderId: '',
      customerId: '',
      status: 'Pending',
      assignedDriver: '',
      address: '',
    });
  
    // Add validation errors state
    const [errors, setErrors] = useState({
      orderId: '',
      customerId: '',
      status: '',
      assignedDriver: '',
      address: ''
    });
  
    const [activeSidebarItem, setActiveSidebarItem] = useState('deliveryOrder');
    const [deliveryOrders, setDeliveryOrders] = useState([]);
    const [isUpdateMode, setIsUpdateMode] = useState(false);
    const [updateOrderId, setUpdateOrderId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
  
    // Refs for chart components
    const lineChartRef = useRef(null);
    const pieChartRef = useRef(null);
    const barChartRef = useRef(null);
  
    const [chartData, setChartData] = useState([]);
    const [pieData, setPieData] = useState([]);
  
    useEffect(() => {
      const fetchChartData = async () => {
        try {
          const response = await fetch("http://localhost:3001/api/chart-data");
          if (response.ok) {
            const data = await response.json();
            setChartData(data.chartData);
            setPieData(data.pieData);
          } else {
            console.error("Failed to fetch chart data");
          }
        } catch (error) {
          console.error("Error fetching chart data:", error);
        }
      };
  
      fetchChartData();
    }, []);
  
    const COLORS = ['#0088FE', '#FFBB28', '#FF8042'];
  
    // Validation functions
    const validateOrderId = (value) => {
      if (!value) return 'Order ID is required';
      if (!/^ORD-\d{4}$/.test(value)) return 'Order ID must be in format ORD-XXXX';
      return '';
    };
  
    const validateCustomerId = (value) => {
      if (!value) return 'Customer ID is required';
      if (!/^CUS-\d{4}$/.test(value)) return 'Customer ID must be in format CUS-XXXX';
      return '';
    };
  
    const validateAssignedDriver = (value) => {
      if (!value) return 'Driver ID is required';
      if (!/^DRV-\d{4}$/.test(value)) return 'Driver ID must be in format DRV-XXXX';
      return '';
    };
  
    const validateAddress = (value) => {
      if (!value) return 'Address is required';
      if (value.length < 10) return 'Address must be at least 10 characters long';
      return '';
    };
  
    // Update handleChange with validation
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
  
      // Validate field based on name
      let errorMessage = '';
      switch (name) {
        case 'orderId':
          errorMessage = validateOrderId(value);
          break;
        case 'customerId':
          errorMessage = validateCustomerId(value);
          break;
        case 'assignedDriver':
          errorMessage = validateAssignedDriver(value);
          break;
        case 'address':
          errorMessage = validateAddress(value);
          break;
        default:
          break;
      }
  
      setErrors(prev => ({
        ...prev,
        [name]: errorMessage
      }));
    };
  
    const handleUpdateClick = (order) => {
      setFormData({
        orderId: order.orderId,
        customerId: order.customerId,
        status: order.status,
        assignedDriver: order.assignedDriver,
        address: order.address,
      });
      setUpdateOrderId(order._id);
      setIsUpdateMode(true);
      setActiveSidebarItem("deliveryOrder");
    };
  
    // Update handleSubmit with validation checks
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      // Validate all fields
      const newErrors = {
        orderId: validateOrderId(formData.orderId),
        customerId: validateCustomerId(formData.customerId),
        assignedDriver: validateAssignedDriver(formData.assignedDriver),
        address: validateAddress(formData.address)
      };
  
      // Check if there are any errors
      const hasErrors = Object.values(newErrors).some(error => error !== '');
      if (hasErrors) {
        setErrors(newErrors);
        Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          text: 'Please check all fields and try again.',
        });
        return;
      }
  
      try {
        const url = isUpdateMode
          ? `http://localhost:3001/api/delivery/${updateOrderId}`
          : "http://localhost:3001/api/delivery/sub";
        const method = isUpdateMode ? "PUT" : "POST";
        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
  
        if (response.ok) {
          const data = await response.json();
          Swal.fire({
            icon: 'success',
            title: isUpdateMode ? 'Order updated successfully!' : 'Order details submitted successfully!',
            text: `Order ID: ${data.orderId}`,
          });
          handleClear();
          fetchDeliveryOrders();
          setIsUpdateMode(false);
        } else {
          const errorData = await response.json();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorData.message,
          });
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred while submitting the form.',
        });
      }
    };
  
    const handleClear = () => {
      setFormData({
        orderId: '',
        customerId: '',
        status: 'Pending',
        assignedDriver: '',
        address: '',
      });
      setIsUpdateMode(false);
      setUpdateOrderId(null);
    };
  
    const fetchAssignedDriverDetails = async (driverId) => {
      try {
        const response = await fetch(`http://localhost:3001/api/drivers/${driverId}`);
        if (response.ok) {
          const data = await response.json();
          return data.name || driverId; // Return name if available, otherwise return ID
        } else {
          return driverId; // Return just the ID on error
        }
      } catch (error) {
        return driverId; // Return just the ID on error
      }
    };
  
    const fetchDeliveryOrders = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/delivery/");
        if (response.ok) {
          const data = await response.json();
          const updatedData = await Promise.all(
            data.map(async (order) => {
              const driverName = await fetchAssignedDriverDetails(order.assignedDriver);
              return { ...order, driverName };
            })
          );
          setDeliveryOrders(updatedData);
        } else {
          alert("Failed to fetch delivery orders.");
        }
      } catch (error) {
        alert("An error occurred while fetching delivery orders.");
      }
    };
  
    const handleDelete = async (orderId) => {
      const confirmResult = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
      });
      if (!confirmResult.isConfirmed) return;
  
      try {
        const response = await fetch(`http://localhost:3001/api/delivery/${orderId}`, {
          method: "DELETE",
        });
  
        if (response.ok) {
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Order has been deleted.',
          });
          fetchDeliveryOrders();
        } else {
          const errorData = await response.json();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorData.message,
          });
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred while deleting the order.',
        });
      }
    };
  
  
    //filter the order search bar
    useEffect(() => {
      if (activeSidebarItem === "orderDetails") {
        fetchDeliveryOrders();
      }
    }, [activeSidebarItem]);
  
    const filteredOrders = deliveryOrders.filter((order) =>
      order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.assignedDriver.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
    const generateOrderDetailsPDF = () => {
      const doc = new jsPDF();
      doc.text("Order Details", 14, 10);
      const tableColumn = ["Order ID", "Customer ID", "Status", "Assigned Driver", "Address"];
      const tableRows = deliveryOrders.map((order) => [
        order.orderId || "N/A",
        order.customerId || "N/A",
        order.status || "N/A",
        order.driverName || "N/A",
        order.address || "N/A",
      ]);
      
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
      });
      doc.save("Order_Details.pdf");
    };
  
    const generateDetailedReport = async () => {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(18);
      doc.text("Delivery Order Detailed Report", 14, 20);
      doc.setFontSize(11);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
  
      // Order Statistics
      const totalOrders = deliveryOrders.length;
      const statusCount = {
        Pending: deliveryOrders.filter(o => o.status === 'Pending').length,
        'In Transit': deliveryOrders.filter(o => o.status === 'In Transit').length,
        Delivered: deliveryOrders.filter(o => o.status === 'Delivered').length,
        Cancelled: deliveryOrders.filter(o => o.status === 'Cancelled').length,
      };
  
      doc.setFontSize(14);
      doc.text("Order Statistics", 14, 45);
      doc.setFontSize(11);
      autoTable(doc, {
        startY: 50,
        head: [['Statistic', 'Value']],
        body: [
          ['Total Orders', totalOrders],
          ['Pending Orders', statusCount.Pending],
          ['In Transit Orders', statusCount['In Transit']],
          ['Delivered Orders', statusCount.Delivered],
          ['Cancelled Orders', statusCount.Cancelled], 
        ],
        theme: 'grid',
      });
  
      // Detailed Order List
      doc.addPage();
      doc.setFontSize(14);
      doc.text("Detailed Order List", 14, 20);
      doc.setFontSize(11);
      const tableColumn = ["Order ID", "Customer ID", "Status", "Driver", "Address"];
      const tableRows = deliveryOrders.map((order) => [
        order.orderId || "N/A",
        order.customerId || "N/A",
        order.status || "N/A",
        order.driverName || "N/A",
        order.address || "N/A",
      ]);
      
      autoTable(doc, {
        startY: 25,
        head: [tableColumn],
        body: tableRows,
        theme: 'striped',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [44, 62, 80] },
      });
  
      // Footer with page numbers
      doc.setFontSize(10);
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(`Page ${i} of ${pageCount}`, 180, 285);
      }
  
      doc.save("Detailed_Delivery_Report.pdf");
    };
    if (isLoading) {
      return <div>Loading user data...</div>;
    }

  
  return (
    <div className="min-h-screen w-64 bg-white text-blue-950 flex flex-col">

      <div className="w-full h-16 p-4 ">
          <img src={Logo} alt="logo" className="w-44" />
      </div>
      <hr className="mb-5"/>
      <nav className="flex-1">
        <ul>
          {/* Dashboard Link*/  }
          <li className="py-2 px-4 text-md">
            <NavLink
              to="/deliver-dashboard"
              state={{data: userData}}
              end
              className={({ isActive }) =>
                `block py-[5px] px-4 rounded-md ${
                  isActive
                    ? "text-white bg-custom-gradient "
                    : "hover:bg-gray-100 transition-all"
                }`
              }
            >
              <span className="mr-2">
                <DashboardIcon />
              </span>
              Dashboard
            </NavLink>
          </li>

          {/* Orders Link */}
          <li className="py-2 px-4 text-md">
            <NavLink
              to="/deliver-dashboard/orders"
              state={{data: userData}}
              className={({ isActive }) =>
                `block py-[5px] px-4 rounded-md ${
                  isActive
                    ? "text-white bg-custom-gradient "
                    : "hover:bg-gray-100 transition-all"
                }`
              }
            >
              <span className="mr-2">
                <ShoppingCartIcon />
              </span>
              Orders
            </NavLink>
          </li>

          {/* Delivery Link */}
          <li className="py-2 px-4 text-md">
            <NavLink
              to="/deliver-dashboard/delivery"
              state={{data: userData}}
              className={({ isActive }) =>
                `block py-[5px] px-4 rounded-md ${
                  isActive
                    ? "text-white bg-custom-gradient "
                    : "hover:bg-gray-100 transition-all"
                }`
              }
            >
              <span className="mr-2">
                <DeliveryDiningOutlined />
              </span>
              Delivery
            </NavLink>
          </li>

          {/* Salary Link*/  }
          <li className="py-2 px-4 text-md">
            <NavLink
              to="/deliver-dashboard/salary"
              state={{data: userData}}
              className={({ isActive }) =>
                `block py-[5px] px-4 rounded-md ${
                  isActive
                  ? "text-white bg-custom-gradient "
                  : "hover:bg-gray-100 transition-all"
                }`
              }
            >
              <span className="mr-2">
                <MoneyIcon />
              </span>
              Salary
            </NavLink>
          </li>

          {/* Analytics Link*/  }
          <li className="py-2 px-4 text-md">
            <NavLink
              to="/deliver-dashboard/analytics"
              state={{data: userData}}
              className={({ isActive }) =>
                `block py-[5px] px-4 rounded-md ${
                  isActive
                  ? "text-white bg-custom-gradient "
                  : "hover:bg-gray-100 transition-all"
                }`
              }
            >
              <span className="mr-2">
                <AnalyticsIcon />
              </span>
              Analytics
            </NavLink>
          </li>

          <hr className="m-5"/>

          {/* Setting Link*/  }
          <li className="py-2 px-4 text-md">
            <NavLink
              to="/deliver-dashboard/settings"
              state={{data: userData}}
              className={({ isActive }) =>
                `block py-[5px] px-4 rounded-md ${
                  isActive
                  ? "text-white bg-custom-gradient "
                  : "hover:bg-gray-100 transition-all"
                }`
              }
            >
              <span className="mr-2">
                <SettingsIcon />
              </span>
              Settings
            </NavLink>
          </li>
        </ul>

      </nav>


      <div className="py-2 px-4 my-2">
        <button className="bg-[#ff4c51] text-white w-full py-3 rounded-xl hover:bg-[#ff0000]  flex items-center justify-center transition-all duration-300"
        onClick={() => { navigate('/logout')}} >
          <Logout className="mr-2" />
          Logout
        </button>
      </div>

        <footer className="py-3 text-sm text-center">
            <div>
                2025 <Copyright aria-label="Copyright" /> All Rights Reserved.
            </div>
            <div>S JAY Web Solutions (Pvt) Ltd.</div>
        </footer>
    </div>
  );
}
