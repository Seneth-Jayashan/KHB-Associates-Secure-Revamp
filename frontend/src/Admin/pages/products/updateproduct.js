import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function UpdateProduct({ updateProduct }) {
  const [productData, setProductData] = useState({
    product_name: "",
    product_description: "",
    product_price: "",
    stock_count: "",
    product_status: 'active',
    product_brand_id: '',
    product_category_id: '',
  });

  const [imagePreview, setImagePreview] = useState('');
  const [productImage, setProductImage] = useState(null);
  const [brandData, setBrandData] = useState({});
  const [categoryData, setCategoryData] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  const productDataFromLocation = location.state?.productData;

  useEffect(() => {
    if (productDataFromLocation) {
      setProductData({
        product_id: productDataFromLocation.product_id || '',
        product_name: productDataFromLocation.product_name || '',
        product_description: productDataFromLocation.product_description || '',
        product_price: productDataFromLocation.product_price || '',
        stock_count: productDataFromLocation.stock_count || '',
        product_status: productDataFromLocation.product_status || 'active',
        product_image: productDataFromLocation.product_image || '',
        product_brand_id: productDataFromLocation.product_brand_id || '', 
        product_category_id: productDataFromLocation.product_category_id || '',
      });
      setImagePreview(`http://localhost:3001${productDataFromLocation.product_image}`);
    } else {
      navigate('/products'); 
    }
  }, [productDataFromLocation, navigate]);

  const getBrandData = async () => {
    if (!productData.product_brand_id) return;     
    try {
      const response = await axios.get(
        `http://localhost:3001/api/brands/brand?id=${productData.product_brand_id}`
      );
      setBrandData(response.data || {});
    } catch (error) {
      console.error('Error fetching brand data:', error);
    }
  };

  const getCategoryData = async () => {
    if (!productData.product_category_id) return;     
    try {
      const response = await axios.get(
        `http://localhost:3001/api/categories/category?id=${productData.product_category_id}`
      );
      setCategoryData(response.data || {});
    } catch (error) {
      console.error('Error fetching category data:', error);
    }
  };

  useEffect(() => {
    getBrandData();
  }, [productData.product_brand_id]); 

  useEffect(() => {
    getCategoryData();
  }, [productData.product_category_id]); 

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setProductImage(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setErrorMessage('Please select a valid image file.');
      setProductImage(null);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
  
    if (!productData.product_name || !productData.product_description) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }
  
    const formDataToSend = new FormData();
    formDataToSend.append('product_id', productData.product_id);
    formDataToSend.append('product_name', productData.product_name);
    formDataToSend.append('product_description', productData.product_description);
    formDataToSend.append('product_price', productData.product_price);
    formDataToSend.append('stock_count', productData.stock_count);
    formDataToSend.append('product_status', productData.product_status);
    formDataToSend.append('product_brand_id', productData.product_brand_id);
    if (productImage) formDataToSend.append('product_image', productImage);
  
    try {
      const response = await axios.put(
        'http://localhost:3001/api/products/updateproduct',
        formDataToSend,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
  
      const oldStock = Number(productDataFromLocation.stock_count);
      const newStock = Number(productData.stock_count);
  
      if (newStock !== oldStock) {
        const quantityChange = Math.abs(newStock - oldStock);
        const type = newStock > oldStock ? "add" : "remove";
  
        const stockChange = await axios.post("http://localhost:3001/api/stocks/addstock", {
          product_id: productData.product_id,
          product_name: productData.product_name,
          brand_id: productData.product_brand_id,
          category_id: productData.product_category_id,
          quantity: quantityChange,
          type
        });
  
        if (stockChange.status !== 200) {
          setErrorMessage("Product updated, but stock change failed.");
          return;
        }
      }
  
      if (response.status === 200) {
        setSuccessMessage('Product updated successfully!');
        setTimeout(() => {
          navigate('/admin-dashboard/products/');
        }, 2000);
      }
  
    } catch (err) {
      console.error('Axios Error:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to update product');
    }
  };
  

  if (!productDataFromLocation) {
    return <div className="text-center text-gray-500">Redirecting...</div>;
  }

  return (
    <div className="container bg-white rounded-2xl p-4 mt-6 min-h-[75vh]">
      <form
        className="w-full mx-auto bg-white p-6 rounded-lg shadow-md"
        onSubmit={handleUpdateProduct}
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Update Product</h2>

        {successMessage && <p className="mb-4 text-green-500 font-medium">{successMessage}</p>}
        {errorMessage && <p className="mb-4 text-red-500 font-medium">{errorMessage}</p>}

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Brand Name</label>
          <input
            type="text"
            name="brand_name"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            value={brandData.brand_name || 'N/A'}
            readOnly
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Category Name</label>
          <input
            type="text"
            name="brand_name"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            value={categoryData.category_name || 'N/A'}
            readOnly
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Product Name</label>
          <input
            type="text"
            name="product_name"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            value={productData.product_name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Product Description</label>
          <textarea
            name="product_description"
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            value={productData.product_description}
            onChange={handleInputChange}
            required
          ></textarea>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Product Price</label>
          <input
            type="number"
            name="product_price"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            value={productData.product_price}
            onChange={handleInputChange}
            required
          />
        </div>

        {imagePreview && (
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Product Image</label>
            <img src={imagePreview} alt={productData.product_name} className="rounded-md" height="100" width="100" />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Upload New Image</label>
          <input
            type="file"
            name="product_image"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Stock Count</label>
          <input
            type="number"
            name="stock_count"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            value={productData.stock_count}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Status</label>
          <select
            name="product_status"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            value={productData.product_status}
            onChange={handleInputChange}
            required
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded-md">
          Update Product
        </button>
      </form>
    </div>
  );
}
