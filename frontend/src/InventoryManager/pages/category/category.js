import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText } from '@mui/material';
import axios from 'axios';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Categorybuttons from './categorybuttons';
import Allcategory from './allcategory';
import Addcategory from './addcategory';
import Updatecategory from './updatecategory';

export default function Category() {
  const [selectedCat, setSelectedCat] = useState({});
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteData, setDeleteData] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (selectedCat?.id && selectedCat?.name) {
      getCategoryById();
    }
  }, [selectedCat]);

  const handleClickOpen = (category) => {
    setDeleteData(category);
    setDialogOpen(true);
  };

  const handleClickClose = () => {
    setDialogOpen(false);
    setDeleteData(null);
  };

  const getCategoryById = async () => {
    if (!selectedCat?.id) {
      console.error("Error: No category selected.");
      return;
    }
  
    try {
      const response = await axios.get(`http://localhost:3001/api/categories/category?id=${selectedCat.id}`);
      if (response.status !== 200) {
        throw new Error("Failed to fetch category data");
      }  
      navigate("/inventory-dashboard/category/updatecategory", { state: { categoryData: response.data } });
    } catch (error) {
      console.error("Axios Error:", error.response?.data || error.message);
    }
  };

  const deleteCategory = async () => {
    if (!deleteData) return;

    try {
      const response = await axios.delete(`http://localhost:3001/api/categories/deletecategory?id=${deleteData.id}`);
      if (response.status === 200) {
        handleClickClose();
        Swal.fire({
          title: "Success!",
          text: "Category Deleted successfully!",
          icon: "success",
        });
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
              <ToastContainer position="top-center" autoClose={3000} />

      <div className="flex flex-row justify-center">
        <Categorybuttons />
      </div>

      {loading && <div>Loading...</div>}

      <div className="shadow-gray-700 shadow-md rounded-2xl">
        <Routes>
          <Route
            path="/"
            element={
              <Allcategory
                onCategorySelect={(categoryData) => setSelectedCat(categoryData)}
                onCategoryDelete={(category) => handleClickOpen(category)}
              />
            }
          />
          <Route path="/addcategory" element={<Addcategory />} />
          <Route path="/updatecategory" element={<Updatecategory />} />
        </Routes>
      </div>

      <Dialog
        open={dialogOpen}
        onClose={handleClickClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Delete {deleteData?.name || 'this'} Category</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete {deleteData?.name || 'this'} Category?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClickClose}>Cancel</Button>
          <Button onClick={deleteCategory} autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
