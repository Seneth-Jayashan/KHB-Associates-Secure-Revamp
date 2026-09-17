import React, { useState } from "react";
import axios from "axios";
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Addbrand() {
  const [formData, setFormData] = useState({
    brand_name: "",
    brand_description: "",
    brand_status: "active",
  });

  const [brandImage, setBrandImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errorMessage, setError] = useState("");
  const [successMessage, setSuccess] = useState("");

  // Handle text input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle image file change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setBrandImage(file);
      setPreview(URL.createObjectURL(file));
    } else {
      toast.error("Please select a valid image file.");
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.brand_name || !formData.brand_description || !brandImage) {
        toast.error("All fields are required!");
        return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("brand_name", formData.brand_name);
    formDataToSend.append("brand_description", formData.brand_description);
    formDataToSend.append("brand_status", formData.brand_status || "active");
    if (brandImage) {
        formDataToSend.append("brand_image", brandImage);
    }

    console.log("Sending formData:");
    for (let pair of formDataToSend.entries()) {
        console.log(pair[0], pair[1]);
    }

    try {
        const response = await axios.post(
            "http://localhost:3001/api/brands/addbrand",
            formDataToSend,
            {
                headers: { "Content-Type": "multipart/form-data" },
            }
        );

        if (response.status === 200) {
            setSuccess("Brand added successfully!");
            Swal.fire({
              title: "Success!",
              text: "Brand Added Successfully!",
              icon: "success",
            });
            setFormData({
                brand_name: "",
                brand_description: "",
                brand_status: "active",
            });
            setBrandImage(null);
            setTimeout(() => {
                window.location.href = "/inventory-dashboard/brands";
            }, 2000);
        }
    } catch (err) {
        console.error("Axios Error:", err);
        toast.error(err.response?.data?.message || "Failed to add brand");
    }
};

  return (
    <div className="container bg-white rounded-2xl p-4 mt-6 min-h-[75vh]">
      <ToastContainer position="top-center" autoClose={3000} />
    
      <form
        className="w-full mx-auto bg-white p-6 rounded-lg shadow-md"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Brand</h2>


        {/* Brand Name */}
        <div className="mb-4">
          <label htmlFor="brand-name" className="block text-gray-700 font-medium mb-2">
            Brand Name
          </label>
          <input
            type="text"
            id="brand-name"
            name="brand_name"
            value={formData.brand_name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Enter Brand name"
            required
          />
        </div>

        {/* Brand Description */}
        <div className="mb-4">
          <label htmlFor="brand-description" className="block text-gray-700 font-medium mb-2">
            Brand Description
          </label>
          <textarea
            id="brand-description"
            rows="4"
            name="brand_description"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Enter a brief description"
            value={formData.brand_description}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        {/* Brand Image */}
        <div className="mb-4">
          <label htmlFor="brand-image" className="block text-gray-700 font-medium mb-2">
            Brand Image
          </label>
          <input
            type="file"
            id="brand-image"
            accept="image/*"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            onChange={handleImageChange}
            required
          />
          {preview && (
            <img src={preview} alt="Brand Preview" className="mt-2 w-32 h-32 object-cover rounded-md" />
          )}
        </div>

        {/* Brand Status */}
        <div className="mb-4">
          <label htmlFor="brand-status" className="block text-gray-700 font-medium mb-2">
            Status
          </label>
          <select
            id="brand-status"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            value={formData.brand_status}
            onChange={handleChange}
            required
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-custom-gradient text-white py-2 px-4 rounded-md hover:bg-[#6610f2] transition duration-300"
        >
          Add Brand
        </button>
      </form>
    </div>
  );
}
