import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Box, Typography, Paper, Button } from "@mui/material";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
} from "recharts";
import { useLocation } from "react-router-dom";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA00FF", "#FF4081"];

const DeliveryAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const location = useLocation();
  const userData = location.state?.data;
  const deliverId = userData?.user_id;

  useEffect(() => {
    if (deliverId) {
      // Fetch delivery analytics data for the logged-in deliverer
      const fetchAnalytics = async () => {
        try {
          const response = await axios.get(`http://localhost:3001/api/delivers/analytics?id=${deliverId}`);
          setAnalytics(response.data);
        } catch (error) {
          console.error("Error fetching delivery analytics:", error);
        }
      };

      fetchAnalytics(); // Call the function to fetch the data
    }
  }, [deliverId]); // Depend on deliverId so it fetches again if the ID changes

  // Function to export as PDF
  const handleExportPDF = async () => {
    const content = document.getElementById("delivery-analytics-content");
    if (content) {
      const canvas = await html2canvas(content);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("delivery-analytics-report.pdf");
    }
  };

  if (!analytics) {
    return (
      <Box className="p-6">
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  // Format data for Pie charts
  const deliveryStatusData = Object.entries(analytics.deliveryStatusCounts).map(([status, count]) => ({
    name: status,
    value: count,
  }));

  return (
    <Box className="p-6 space-y-8" id="delivery-analytics-content">
      {/* Export PDF Button */}
      <Box className="flex justify-end mb-4">
        <Button variant="contained" color="primary" onClick={handleExportPDF}>
          Export as PDF
        </Button>
      </Box>

      {/* Key Metrics */}
      <Paper className="p-6 shadow-md rounded-xl">
        <Typography variant="h6" className="mb-2">📊 Delivery Key Metrics</Typography>
        <Typography>Total Deliveries: {analytics.totalDeliveries}</Typography>
        <Typography>Total Revenue from Deliveries: Rs. {(analytics.totalDeliveries * 500).toFixed(2)}</Typography>
      </Paper>

      {/* Pie Charts Section */}
      <Box className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Paper className="p-4">
          <Typography variant="h6" className="mb-2">🚚 Delivery Status</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={deliveryStatusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {deliveryStatusData.map((entry, index) => (
                  <Cell key={`status-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      
    </Box>
  );
};

export default DeliveryAnalytics;
