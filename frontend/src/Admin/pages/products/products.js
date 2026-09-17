import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText } from '@mui/material';
import axios from 'axios';

import Allproduct from './allproducts';
import Updateproduct from './updateproduct';

export default function Product() {
  const [selectedCat, setSelectedCat] = useState({});
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteData, setDeleteData] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (selectedCat?.id && selectedCat?.name) {
      getProductById();
    }
  }, [selectedCat]);

  const handleClickOpen = (product) => {
    setDeleteData(product);
    setDialogOpen(true);
  };

  const handleClickClose = () => {
    setDialogOpen(false);
    setDeleteData(null);
  };

  const getProductById = async () => {
    if (!selectedCat?.id) {
      console.error("Error: No product selected.");
      return;
    }
  
    try {
      const response = await axios.get(`http://localhost:3001/api/products/product?id=${selectedCat.id}`);
      if (response.status !== 200) {
        throw new Error("Failed to fetch product data");
      }  
      navigate("/admin-dashboard/products/updateproduct", { state: { productData: response.data } });
    } catch (error) {
      console.error("Axios Error:", error.response?.data || error.message);
    }
  };

  const deleteProduct = async () => {
    if (!deleteData) return;

    try {
        const deleteProductData = await axios.get(`http://localhost:3001/api/products/product?id=${deleteData.id}`);
        const response = await axios.delete(`http://localhost:3001/api/products/deleteproduct?id=${deleteData.id}`);
        const stockChange = await axios.post("http://localhost:3001/api/stocks/addstock", {
          product_id : deleteProductData.data.product_id,
          product_name: deleteProductData.data.product_name,
          brand_id: deleteProductData.data.brand_id,
          category_id: deleteProductData.data.category_id,
          quantity: deleteProductData.data.stock_count,
          type:"remove"});

      if (response.status === 200 && stockChange.status === 200) {
        
            handleClickClose();
            setTimeout(() => {
            window.location.reload();
        });
      }
    } catch (error) {
      handleClickClose();
      console.error('Axios Error:', error);
      throw error;
    }
  };

  return (
    <div className="container">

      {loading && <div>Loading...</div>}

      <div className="shadow-gray-700 shadow-md rounded-2xl">
        <Routes>
          <Route
            path="/"
            element={
              <Allproduct
                onProductSelect={(productData) => setSelectedCat(productData)}
                onProductDelete={(product) => handleClickOpen(product)}
              />
            }
          />
          <Route path="/updateproduct" element={<Updateproduct />} />
        </Routes>
      </div>

      <Dialog
        open={dialogOpen}
        onClose={handleClickClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Delete {deleteData?.name || 'this'} Product</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete {deleteData?.name || 'this'} Product?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClickClose}>Cancel</Button>
          <Button onClick={deleteProduct} autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
