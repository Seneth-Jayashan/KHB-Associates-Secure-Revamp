import axios from 'axios';
import React, { useEffect, useState } from 'react';


export default function Addcategory() {
  const [formData, setFormData] = useState({
    category_name: "",
    category_description: "",
    category_status: "",
  });

  const [brandId,setBrandId] = useState();
  const [catIcon,setCatIcon] = useState();
  const [preview, setPreview] = useState(null);
  const [brands, setBrands] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    if (!brandId) {
      setErrorMessage("Please select a brand first!");
      return;
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBrandId = (e) => {
    setBrandId(e.target.value);
    setErrorMessage(""); 
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setCatIcon(file);
      setPreview(URL.createObjectURL(file));
    } else {
      setErrorMessage("Please select a valid image file.");
    }
  };

  const getBrands = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/brands/`);
      if (!response.data || response.data.length === 0) {
        setErrorMessage("No brands found");
        alert("A brand must be added before adding categories"); 
        window.location.href = "/admin-dashboard/brands";
        return;
      }
      setBrands(response.data);
    } catch (error) {
      setErrorMessage("Error fetching brands");
      console.error("Error fetching brands:", error);
    }
  };
  
  useEffect(() => {
    getBrands();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Check if brandId is selected
    if (!brandId) {
      setErrorMessage("Please select a brand before submitting.");
      return;
    }
  
    // Prepare form data
    const formDataToSend = new FormData();
    formDataToSend.append("category_name", formData.category_name);
    formDataToSend.append("category_description", formData.category_description);
    formDataToSend.append("category_status", formData.category_status);
    formDataToSend.append("category_brand_id", brandId); // Ensure this matches backend
  
    if (catIcon) {
      formDataToSend.append("category_image", catIcon);
    }
  
    try {
      const response = await axios.post("http://localhost:3001/api/categories/addcategory", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      if (response.status === 200) {
        try {
          const catCount = await axios.put(
            "http://localhost:3001/api/brands/updatecatcount",
            { brand_id: brandId }
          );
  
          if (catCount.status === 200) {
            alert("Category Added Successfully");
            setSuccessMessage("Process complete. Redirecting....");
  
            // Reset form fields
            setFormData({
              category_name: "",
              category_description: "",
              category_status: "",
            });
            setBrandId("");
            setCatIcon(null);
            setPreview(null);
            
            // Redirect after a short delay
            setTimeout(() => {
              window.location.href = "/admin-dashboard/category";
            }, 1500);
          } else {
            setErrorMessage("Failed to update category count.");
          }
        } catch (error) {
          setErrorMessage(error.response?.data?.error || "Error updating category count.");
        }
      } else {
        setErrorMessage(response.data.error || "An error occurred while adding category.");
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.error || "Error adding category.");
    }
  };
  



  return (
    <div className="container bg-white  rounded-2xl p-4 mt-6 min-h-[75vh]">
      <form
        className="w-full mx-auto bg-white p-6 rounded-lg shadow-md"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Category</h2>

        {/* Success/Error Messages */}
        {successMessage && (
          <p className="mb-4 text-green-500 font-medium">{successMessage}</p>
        )}
        {errorMessage && (
          <p className="mb-4 text-red-500 font-medium">{errorMessage}</p>
        )}

        {/* Brand */}
        <div className="mb-4">
          <label htmlFor="category-brand" className="block text-gray-700 font-medium mb-2">
            Brand
          </label>
          <select
            id="category-brand"
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

        {/* Category Name */}
        <div className="mb-4">
          <label htmlFor="category-name" className="block text-gray-700 font-medium mb-2">
            Category Name
          </label>
          <input
            type="text"
            name="category_name"
            value={formData.category_name}
            onChange={handleChange}
            required
            placeholder="Enter a Category Name"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
          />
        </div>

        {/* Category Description */}
        <div className="mb-4">
          <label htmlFor="category-description" className="block text-gray-700 font-medium mb-2">
            Category Description
          </label>
          <textarea
            rows={4}
            name="category_description"
            value={formData.category_description}
            onChange={handleChange}
            required
            placeholder="Enter a brief description"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
          />
        </div>

        {/* Category Image */}
        <div className="mb-4">
          <label htmlFor="category-image" className="block text-gray-700 font-medium mb-2">
            Category Image
          </label>
          <input
            type="file"
            id="category_image"
            accept="image/*"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            onChange={handleImageChange}
            required
          />
          {preview && (
            <img src={preview} alt="Brand Preview" className="mt-2 w-32 h-32 object-cover rounded-md" />
          )}
        </div>

        {/* Category Status */}
        <div className="mb-4">
          <label htmlFor="category_status" className="block text-gray-700 font-medium mb-2">
            Status
          </label>
          <select
            id="category_status"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.category_status || ""}
            onChange={handleChange}
            name="category_status"
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
          Add Category
        </button>
      </form>
    </div>
  );
}
