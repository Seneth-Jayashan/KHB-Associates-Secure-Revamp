import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const logout = async () => {
      try {
        await axios.post(
          "http://localhost:3001/api/users/logout",
          {},
          {
            withCredentials: true
          }
        );
      } catch (error) {
        console.error("Logout error:", error);
      } finally {
        Swal.fire({
          title: "Success!!",
          text: "Logout from your account",
          icon: "success",
        });

        navigate("/signin");
      }
    };

    logout();
  }, [navigate]);

  return (
    <div className="logout-container">
      <h2>Logging out...</h2>
    </div>
  );
};

export default Logout;