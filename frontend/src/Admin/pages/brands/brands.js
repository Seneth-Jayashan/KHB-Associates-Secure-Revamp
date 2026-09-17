import React, { useCallback, useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText } from '@mui/material';
import axios from 'axios';

import Brandsbuttons from './brandsbuttons';
import Allbrands from './allbrands';
import Addbrand from './addbrand';
import Updatebrand from './updatebrand';


export default function Brand() {
  const [selectedBrand, setSelectedBrand] = useState({});
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteData, setDeleteData] = useState(null);

  const navigate = useNavigate();


  useEffect(() => {
    if (selectedBrand?.id && selectedBrand?.name) {
      getBrandById();
    }
  }, [selectedBrand]);

  const handleClickOpen = (brand) => {
    setDeleteData(brand);
    setDialogOpen(true);
  };

  const handleClickClose = () => {
    setDialogOpen(false);
    setDeleteData(null);
  };

  const getBrandById = async () => {
    if (!selectedBrand?.id) {
      console.error("Error: No brand selected.");
      return;
    }
  
    try {
      const response = await axios.get(`http://localhost:3001/api/brands/brand?id=${selectedBrand.id}`);
      if (response.status !== 200) {
        throw new Error("Failed to fetch brand data");
      }  
      navigate("/admin-dashboard/brands/updatebrand", { state: { brandData: response.data } });
    } catch (error) {
      console.error("Axios Error:", error.response?.data || error.message);
    }
  };

  const deleteBrand = async () => {
    if (!deleteData) return;

    try{
      const response = await axios.delete(`http://localhost:3001/api/brands/deletebrand?id=${deleteData.id}`);
      const catResponse = await axios.delete(`http://localhost:3001/api/categories/deletebrandscategory?id=${deleteData.id}`);
      const proResponse = await axios.delete(`http://localhost:3001/api/products/deleteproductbrand?id=${deleteData.id}`)
      if (response.status === 200 && catResponse.status === 200 && proResponse.status === 200) {
        handleClickClose();
        setTimeout(() => {
          window.location.reload();
        })
      }
    }catch (error) {
      handleClickClose();
      console.error('Axios Error:', error);
      throw error;
    }
  };

  return (
    <div className="container">
      <div className="flex flex-row justify-center">
        <Brandsbuttons />
      </div>

      {loading && <div>Loading...</div>}

      <div className="shadow-gray-700 shadow-md rounded-2xl">
        <Routes>
          <Route
            path="/"
            element={
              <Allbrands
                onBrandSelect={(brandData) => setSelectedBrand(brandData)}
                onBrandDelete={(brand) => handleClickOpen(brand)}
              />
            }
          />
          <Route path="/addbrand" element={<Addbrand/>} />
          <Route path="/updatebrand" element={<Updatebrand/>} />
        </Routes>
      </div>

      <Dialog
        open={dialogOpen}
        onClose={handleClickClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Delete {deleteData?.name || 'this'} Brand</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete {deleteData?.name || 'this'} Brand?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClickClose}>Cancel</Button>
          <Button onClick={deleteBrand} autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
