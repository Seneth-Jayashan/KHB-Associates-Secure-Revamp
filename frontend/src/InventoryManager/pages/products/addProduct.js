import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Addproduct() {
  const [formData, setFormData] = useState({
    product_name: "",
    product_description: "",
    product_price: "",
    stock_count: "",
    product_status: "",
  });

  const [brandId,setBrandId] = useState();
  const [catId, setCatId] = useState();
  const [productImage,setProductImage] = useState();
  const [preview, setPreview] = useState(null);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    if (!brandId) {
      toast.error("Please select a brand first!");
      return;
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBrandId = (e) => {
    setBrandId(e.target.value);
    setErrorMessage(""); 
  }

  const handleCategoryId = (e) => {
    setCatId(e.target.value);
    setErrorMessage(""); 
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setProductImage(file);
      setPreview(URL.createObjectURL(file));
    } else {
      toast.error("Please select a valid image file.");
    }
  };

  const getBrands = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/brands/`);
      if (!response.data || response.data.length === 0) {
        toast.error("No brands found, A brand must be added before adding products");
        window.location.href = "/inventory-dashboard/brands";
        return;
      }
      setBrands(response.data);
    } catch (error) {
      toast.error("Error fetching brands");
      console.error("Error fetching brands:", error);
    }
  };

  const getCategories = async () => {

    try {
      const response = await axios.get(`http://localhost:3001/api/categories/categorybybrand?brandId=${brandId}`);
      if (!response.data || response.data.length === 0) {
        toast.error("No categories found, A category must be added before adding products");
        window.location.href = "/inventory-dashboard/category";
        return;
      }
      setCategories(response.data);
    } catch (error) {
      toast.error("Error fetching categories");
      console.error("Error fetching categories:", error);
    }
  };
  
  useEffect(() => {
    getBrands();
  }, []);

  useEffect(() => {
    if(brandId){
      getCategories();
    }
  }, [brandId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Check if brandId is selected
    if (!brandId) {
      toast.error("Please select a brand before submitting.");
      return;
    }

    if (!catId) {
      toast.error("Please select a category before submitting.");
      return;
    }
    
    if(formData.stock_count < 100){
      toast.error("Stock count must be more than 100");
      return;
    }
  
    // Prepare form data
    const formDataToSend = new FormData();
    formDataToSend.append("product_name", formData.product_name);
    formDataToSend.append("product_description", formData.product_description);
    formDataToSend.append("product_status", formData.product_status);
    formDataToSend.append("product_price", formData.product_price);
    formDataToSend.append("stock_count", formData.stock_count);
    formDataToSend.append("product_brand_id", brandId);
    formDataToSend.append("product_category_id", catId);
  
    if (productImage) {
      formDataToSend.append("product_image", productImage);
    }
  
    try {
      const response = await axios.post("http://localhost:3001/api/products/addproduct", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const catCount = await axios.put(`http://localhost:3001/api/categories/updateprocount?id=${catId}`);
  
      if (response.status === 200 && catCount.status === 200) {
        try {

          const product = await axios.get(`http://localhost:3001/api/products/productid?product_name=${formData.product_name}&brandId=${brandId}&catId=${catId}`);
           
          const stockChange = await axios.post("http://localhost:3001/api/stocks/addstock", {
            product_id : product.data.product_id,
            product_name: product.data.product_name,
            brand_id: product.data.product_brand_id,
            category_id: product.data.product_category_id,
            quantity: formData.stock_count,
            type:"add"})
  
          if (catCount.status === 200 && stockChange.status === 200) {
            Swal.fire({
              title: "Success!",
              text: "Product Added Successfully!",
              icon: "success",
            });
            setSuccessMessage("Process complete. Redirecting....");
  
            // Reset form fields
            setFormData({
              product_name: "",
              product_description: "",
              product_status: "",
            });
            setBrandId("");
            setProductImage(null);
            setPreview(null);
            
            // Redirect after a short delay
            setTimeout(() => {
              window.location.href = "/inventory-dashboard/products";
            }, 1500);
          } else {
            toast.error("Failed to update product count.");
          }
        } catch (error) {
          toast.error(error.response?.data?.error || "Error updating product count.");
        }
      } else {
        toast.error(response.data.error || "An error occurred while adding product.");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Error adding product.");
    }
  };
  



  return (
    <div className="container bg-white  rounded-2xl p-4 mt-6 min-h-[75vh]">
              <ToastContainer position="top-center" autoClose={3000} />

      <form
        className="w-full mx-auto bg-white p-6 rounded-lg shadow-md"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Product</h2>

        {/* Success/Error Messages */}
        {successMessage && (
          <p className="mb-4 text-green-500 font-medium">{successMessage}</p>
        )}
        {errorMessage && (
          <p className="mb-4 text-red-500 font-medium">{errorMessage}</p>
        )}

        {/* Brand */}
        <div className="mb-4">
          <label htmlFor="product-brand" className="block text-gray-700 font-medium mb-2">
            Brand
          </label>
          <select
            id="product-brand"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={handleBrandId}
            name="brand_id"
            required
          >
            <option value="" selected disabled>Select Brand</option>
            {brands.map((brand) => (
              <option key={brand.brand_id} value={brand.brand_id}>
                {brand.brand_name}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div className="mb-4">
          <label htmlFor="product-category" className="block text-gray-700 font-medium mb-2">
            Category
          </label>
          <select
            id="product_category"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={handleCategoryId}
            name="category_id"
            disabled={!brandId}
            required
          >
            <option value="" selected disabled>Select Category</option>
            {categories.map((category) => (
              <option key={category.category_id} value={category.category_id}>
                {category.category_name}
              </option>
            ))}
          </select>
        </div>

        {/* Product Name */}
        <div className="mb-4">
          <label htmlFor="product-name" className="block text-gray-700 font-medium mb-2">
            Product Name
          </label>
          <input
            type="text"
            name="product_name"
            value={formData.product_name}
            onChange={handleChange}
            required
            placeholder="Enter a Product Name"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
          />
        </div>

        {/* Product Description */}
        <div className="mb-4">
          <label htmlFor="product-description" className="block text-gray-700 font-medium mb-2">
            Product Description
          </label>
          <textarea
            rows={4}
            name="product_description"
            value={formData.product_description}
            onChange={handleChange}
            required
            placeholder="Enter a brief description"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
          />
        </div>

        {/* Product Price */}
        <div className="mb-4">
          <label htmlFor="product-price" className="block text-gray-700 font-medium mb-2">
            Product Price (LKR)
          </label>
          <input
            type="number"
            id="product-price" 
            name="product_price"
            value={formData.product_price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            placeholder="Enter a Product Price"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
          />
        </div>

        {/* Product Image */}
        <div className="mb-4">
          <label htmlFor="product-image" className="block text-gray-700 font-medium mb-2">
            Product Image
          </label>
          <input
            type="file"
            id="product_image"
            accept="image/*"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            onChange={handleImageChange}
            required
          />
          {preview && (
            <img src={preview} alt="Brand Preview" className="mt-2 w-32 h-32 object-cover rounded-md" />
          )}
        </div>

        {/* Stock Count */}
        <div className="mb-4">
          <label htmlFor="stock-count" className="block text-gray-700 font-medium mb-2">
            Stock Count
          </label>
          <input
            type="number"
            id="stock-count" 
            name="stock_count"
            value={formData.stock_count} 
            onChange={handleChange}
            required
            min="0"
            step="1" 
            placeholder="Enter the Stock Count"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
          />
        </div>

        {/* Product Status */}
        <div className="mb-4">
          <label htmlFor="product_status" className="block text-gray-700 font-medium mb-2">
            Status
          </label>
          <select
            id="product_status"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.product_status || ""}
            onChange={handleChange}
            name="product_status"
            required
          >
            <option value="" disabled>Select Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-custom-gradient text-white py-2 px-4 rounded-md hover:bg-[#6610f2] transition duration-300"
        >
          Add Product
        </button>
      </form>
    </div>
  );
}
