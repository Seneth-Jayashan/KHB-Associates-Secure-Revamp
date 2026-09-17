import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function UpdateBrand() {
  const [brandData, setBrandData] = useState({
    brand_id: '',
    brand_name: '',
    brand_description: '',
    brand_status: 'active',
    brand_image: ''
  });
  const [imagePreview, setImagePreview] = useState('');
  const [brandImage, setBrandImage] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  const brandDataFromLocation = location.state?.brandData;

  useEffect(() => {
    if (brandDataFromLocation) {
      setBrandData({
        brand_id: brandDataFromLocation.brand_id || '',
        brand_name: brandDataFromLocation.brand_name || '',
        brand_description: brandDataFromLocation.brand_description || '',
        brand_status: brandDataFromLocation.brand_status || 'active',
        brand_image: brandDataFromLocation.brand_image || ''
      });
      setImagePreview(`http://localhost:3001${brandDataFromLocation.brand_image}`);
    } else {
      navigate('admin-dashboard/brands'); // Redirect if no data is found
    }
  }, [brandDataFromLocation, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBrandData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setBrandImage(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setErrorMessage('Please select a valid image file.');
      setBrandImage(null);
    }
  };

  const handleUpdateBrand = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!brandData.brand_name || !brandData.brand_description) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('brand_id', brandData.brand_id);
    formDataToSend.append('brand_name', brandData.brand_name);
    formDataToSend.append('brand_description', brandData.brand_description);
    formDataToSend.append('brand_status', brandData.brand_status);
    if (brandImage) formDataToSend.append('brand_image', brandImage);

    try {
      const response = await axios.put(
        'http://localhost:3001/api/brands/updatebrand',
        formDataToSend,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      if (response.status === 200) {
        setSuccessMessage('Brand updated successfully!');
        setBrandData({
          brand_id: '',
          brand_name: '',
          brand_description: '',
          brand_status: 'active',
          brand_image: ''
        });
        setImagePreview('');
        setBrandImage(null);
        setTimeout(() => {
          window.location.href="/admin-dashboard/brands";
        });
      }
    } catch (err) {
      console.log(err);
      console.error('Axios Error:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to update brand');
    }
  };

  if (!brandDataFromLocation) {
    return <div className="text-center text-gray-500">Redirecting...</div>;
  }

  return (
    <div className="container bg-white rounded-2xl p-4 mt-6 min-h-[75vh]">
      <form
        className="w-full mx-auto bg-white p-6 rounded-lg shadow-md"
        onSubmit={handleUpdateBrand}
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Update Brand</h2>

        {successMessage && <p className="mb-4 text-green-500 font-medium">{successMessage}</p>}
        {errorMessage && <p className="mb-4 text-red-500 font-medium">{errorMessage}</p>}

        <div className="mb-4">
          <label htmlFor="brand-name" className="block text-gray-700 font-medium mb-2">
            Brand Name
          </label>
          <input
            type="text"
            id="brand-name"
            name="brand_name"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            value={brandData.brand_name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="brand-description" className="block text-gray-700 font-medium mb-2">
            Brand Description
          </label>
          <textarea
            id="brand-description"
            name="brand_description"
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            value={brandData.brand_description}
            onChange={handleInputChange}
            required
          ></textarea>
        </div>

        {imagePreview && (
          <div className="mb-4">
            <label htmlFor="brand-image" className="block text-gray-700 font-medium mb-2">
              Brand Image
            </label>
            <img
              src={imagePreview}
              alt={brandData.brand_name}
              className="rounded-md"
              height="100"
              width="100"
            />
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="brand-image" className="block text-gray-700 font-medium mb-2">
            Brand Image
          </label>
          <input
            type="file"
            id="brand-image"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="brand-status" className="block text-gray-700 font-medium mb-2">
            Status
          </label>
          <select
            id="brand-status"
            name="brand_status"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            value={brandData.brand_status}
            onChange={handleInputChange}
            required
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-custom-gradient text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
        >
          Update Brand
        </button>

        <button
          type="button"
          onClick={() => navigate('/admin-dashboard/brands')}
          className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition duration-300 mt-4"
        >
          Cancel
        </button>
      </form>
    </div>
  );
}
