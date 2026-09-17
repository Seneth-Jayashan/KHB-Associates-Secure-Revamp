import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaRegCopy, FaTrashAlt } from "react-icons/fa";

export default function Promotions() {
  const [promoCode, setPromoCode] = useState(null);
  const [promoList, setPromoList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("token");

  // Fetch user info
  useEffect(() => {
    if (token) {
      axios
        .get("http://localhost:3001/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setUser(res.data))
        .catch((err) => {
          toast.error("Unauthorized or session expired");
          localStorage.removeItem("token");
        });
    }
  }, [token]);

  // Fetch all promo codes
  const fetchPromos = () => {
    axios
      .get("http://localhost:3001/api/promo/get", { 
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setPromoList(res.data))
      .catch((err) => {
        toast.error("Failed to fetch promo codes");
        console.error(err);
      });
  }


  useEffect(() => {
    if (token) fetchPromos();
  }, [token]);

  // Generate new promo code
  const generatePromoCode = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:3001/api/promo/auto-generate", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPromoCode(response.data.code);
      toast.success("Promo code generated successfully!");
      fetchPromos(); // refresh the list
    } catch (err) {
      toast.error("Failed to generate promo code");
    } finally {
      setLoading(false);
    }
  };

  // Delete a promo code
  const handleDelete = async (code, expiresAt) => {
    const isExpired = new Date() > new Date(expiresAt);
    if (isExpired) {
      toast.info("Promo code already expired.");
      return;
    }

    try {
      await axios.delete(`http://localhost:3001/api/promo/delete/${code}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Promo code deleted successfully!");
      fetchPromos(); // refresh the list
    } catch (err) {
      toast.error("Failed to delete promo code");
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-center">Promo Code Management</h1>

      {user?.role === "admin" ? (
        <div className="space-y-6">
          <div className="flex justify-center">
            <button
              onClick={generatePromoCode}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Promo Code"}
            </button>
          </div>

          {promoCode && (
            <div className="flex justify-center gap-2 text-xl font-semibold">
              Promo Code: <span className="text-green-600">{promoCode}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(promoCode);
                  toast.info("Promo code copied to clipboard!");
                }}
                className="text-blue-600"
              >
                <FaRegCopy />
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg">
              <thead className="bg-gray-200 text-gray-700 text-left">
                <tr>
                  <th className="px-4 py-2">Code</th>
                  <th className="px-4 py-2">Expires At</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {promoList.map((promo) => {
                  const isExpired = new Date() > new Date(promo.expiresAt);
                  return (
                    <tr key={promo._id} className="border-t">
                      <td className="px-4 py-2 font-mono">{promo.code}</td>
                      <td className="px-4 py-2">{new Date(promo.expiresAt).toLocaleString()}</td>
                      <td className={`px-4 py-2 ${isExpired ? "text-red-500" : "text-green-600"}`}>
                        {isExpired ? "Expired" : "Active"}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={() => handleDelete(promo.code, promo.expiresAt)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTrashAlt />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-center text-red-600">Only admins can access this page.</p>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
