import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button } from '@mui/material';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Analytics() {
  const [reportData, setReportData] = useState([]);

  // Fetch stock report data
  useEffect(() => {
    axios.get('http://localhost:3001/api/reports/report')
      .then((res) => setReportData(res.data))
      .catch((err) => console.error("Error fetching report data", err));
  }, []);

  // Generate PDF report
  const generateStockPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Stock Change Report', 14, 22);

    const tableColumn = [
      "Product ID",
      "Product Name",
      "Brand ID",
      "Category ID",
      "Date",
      "Quantity (Added)",
      "Quantity (Removed)",
      "Quantity (Sold)"
    ];
    const tableRows = [];

    reportData.forEach((item) => {
      const rowData = [
        item._id,
        item.product_name,
        item.brand_id,
        item.category_id,
        new Date(item.lastUpdated || Date.now()).toLocaleDateString(), // fallback if no date
        item.totalAdded || 0,
        item.totalRemoved || 0,
        item.totalSold || 0
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      startY: 30,
      head: [tableColumn],
      body: tableRows,
    });

    doc.save('stock_report.pdf');
  };

  // Chart data setup
  const chartData = {
    labels: reportData.map(item => item.product_name),
    datasets: [
      {
        label: 'Added',
        data: reportData.map(item => item.totalAdded),
        backgroundColor: '#A2D5AB'
      },
      {
        label: 'Removed',
        data: reportData.map(item => item.totalRemoved),
        backgroundColor: '#FFB347'
      },
      {
        label: 'Sold',
        data: reportData.map(item => item.totalSold),
        backgroundColor: '#FF6961'
      }
    ]
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>📊 Stock Report & Analysis</h2>

      <Bar 
        data={chartData} 
        options={{ 
          responsive: true, 
          plugins: { 
            legend: { position: "bottom" } 
          } 
        }} 
      />

      <Button
        variant="contained"
        color="primary"
        style={{ marginTop: "20px", backgroundColor: "#00b894" }}
        onClick={generateStockPDF}
      >
        Export PDF Report
      </Button>
    </div>
  );
}
