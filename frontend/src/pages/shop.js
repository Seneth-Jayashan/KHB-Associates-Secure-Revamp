import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Nav from '../components/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [searchQuery, setSearchQuery] = useState('');
  
  const token = localStorage.getItem('token');


  useEffect(() => {
    axios.get('http://localhost:3001/api/products')
      .then(response => {
        setProducts(response.data);
        setFilteredProducts(response.data);
      })
      .catch(error => console.error('Error fetching products:', error));

    axios.get('http://localhost:3001/api/categories')
      .then(response => setCategories(response.data))
      .catch(error => console.error('Error fetching categories:', error));

    axios.get('http://localhost:3001/api/brands')
      .then(response => setBrands(response.data))
      .catch(error => console.error('Error fetching brands:', error));
  }, []);

  useEffect(() => {
    let filtered = products;

    if (selectedCategory) {
      filtered = filtered.filter(product => product.product_category_id === Number(selectedCategory));
    }
    if (selectedBrand) {
      filtered = filtered.filter(product => product.product_brand_id === Number(selectedBrand));
    }
    filtered = filtered.filter(product => product.product_price <= maxPrice);

    if (searchQuery) {
      filtered = filtered.filter(product => 
        product.product_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [selectedCategory, selectedBrand, maxPrice, searchQuery, products]);

  const handleAddToCart = (product_id) => {
    axios.post(
      'http://localhost:3001/api/cart/addtocart',
      { product_id, quantity: 1 },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then(() => {
      toast.success('Product added to cart');
    })
    .catch((err) => {
      toast.error('Error adding to cart');
      console.error('Error adding to cart:', err);
    });
  };

  return (
    <div>
      <Nav/>
      <div className="p-10 bg-gray-100 min-h-screen flex">
        {/* Centered Toast Message */}
        <ToastContainer position="top-center" autoClose={3000} />


        {/* Sidebar Filters */}
        <div className="w-1/4 p-6 bg-white rounded-xl shadow-lg fixed h-4/5 overflow-y-auto my-20 mx-6  left-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Filters</h2>

          {/* Search Functionality */}
          <div className="mb-6">
            <label className="block text-lg font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name"
              className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2"
            />
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <label className="block text-lg font-medium text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.category_id} value={category.category_id}>
                  {category.category_name}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Filter */}
          <div className="mb-6">
            <label className="block text-lg font-medium text-gray-700 mb-2">Brand</label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2"
            >
              <option value="">All Brands</option>
              {brands.map(brand => (
                <option key={brand.brand_id} value={brand.brand_id}>
                  {brand.brand_name}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div className="mb-6">
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Max Price: LKR {maxPrice}
            </label>
            <input
              type="range"
              min="0"
              max="1000000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full appearance-none bg-gray-300 rounded-lg h-2 cursor-pointer"
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="w-3/4 ml-auto pl-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 my-20">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div
                key={product.product_id}
                className="bg-white p-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden"
              >
                <div className="relative group overflow-hidden">
                  <img
                    src={`http://localhost:3001${product.product_image}`}
                    alt={product.product_name}
                    className="w-full h-56 object-cover rounded-lg transition-transform duration-500 group-hover:scale-110"
                  />
                  <span className="absolute top-2 left-2 bg-blue-500 text-white px-3 py-1 text-sm rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300">
                    New
                  </span>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mt-6">{product.product_name}</h3>
                <p className="text-lg text-gray-700 mt-2 font-medium">LKR {product.product_price}</p>
                <div className="mt-4 space-y-4">
                  <button
                    className="w-full py-3 text-white rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 transition duration-300 flex items-center justify-center"
                    onClick={() => handleAddToCart(product.product_id)}
                  >
                    Add to Cart
                  </button>

                  {/* View Product Link */}
                  <Link
                    to={`/product/${product.product_id}`}
                    className="w-full mt-2 py-3 text-gray-900 bg-transparent border-2 border-blue-500 hover:bg-blue-500 hover:text-white rounded-lg transition duration-300 flex items-center justify-center"
                  >
                    View Product
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center col-span-full">No products found</p>
          )}
        </div>
      </div>
    </div>
  );
}
