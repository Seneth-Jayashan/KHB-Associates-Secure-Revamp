import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);

  // Fetch authenticated user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/api/users/me",
          {
            withCredentials: true
          }
        );

        setUserData(response.data);

      } catch (error) {
        console.error(
          "Error fetching user data:",
          error
        );

        if (error.response?.status === 401) {
          alert("Session expired. Please log in again.");
          window.location.href = "/logout";
        } else {
          setError(
            "API Error: " +
            (error.response?.status || "Unknown")
          );
        }

      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Fetch notifications
  useEffect(() => {
    if (!userData) return;

    const fetchNotifications = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/api/notifications/user/${userData.user_id}`,
          {
            withCredentials: true
          }
        );

        setNotifications(response.data);

      } catch (err) {
        console.error(
          'Error fetching notifications:',
          err
        );
      }
    };

    fetchNotifications();
  }, [userData]);

  // Clear all notifications
  const handleClearNotifications = () => {
    axios.delete(
      `http://localhost:3001/api/notifications/user/${userData.user_id}`,
      {
        withCredentials: true
      }
    )
      .then(() => {
        setNotifications([]);
      })
      .catch(() => {
        setError(
          'Error clearing notifications'
        );
      });
  };

  // Delete single notification
  const handleDeleteNotification = (id) => {
    axios.delete(
      `http://localhost:3001/api/notifications/${id}`,
      {
        withCredentials: true
      }
    )
      .then(() => {
        setNotifications((prev) =>
          prev.filter(
            (notification) =>
              notification._id !== id
          )
        );
      })
      .catch(() => {
        setError(
          'Error deleting notification'
        );
      });
  };

  if (isLoading) {
    return <div>Loading notifications...</div>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (
    !notifications ||
    notifications.length === 0
  ) {
    return (
      <div className="flex flex-col items-center">
        <p className="text-center text-gray-500 text-lg font-semibold mt-4">
          You have no notifications
        </p>
      </div>
    );
  }

  return (
    <div className="p-10 bg-gray-100 min-h-screen flex flex-col">

      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Your Notifications
      </h2>

      <div className="flex flex-col space-y-6">

        {notifications.map(
          (notification) => (
            <div
              key={notification._id}
              className="flex items-center bg-white p-4 rounded-xl shadow-md"
            >

              <div className="flex-1">

                <p className="text-lg text-gray-900">
                  {notification.message}
                </p>

                <p className="text-sm text-gray-500">
                  {new Date(
                    notification.created_at
                  ).toLocaleString()}
                </p>

              </div>

              <button
                className="ml-4 px-4 py-2 bg-red-500 text-white rounded-lg"
                onClick={() =>
                  handleDeleteNotification(
                    notification._id
                  )
                }
              >
                Delete
              </button>

            </div>
          )
        )}

      </div>

      <div className="mt-auto flex justify-between items-center">

        <button
          className="px-6 py-3 bg-red-500 text-white rounded-lg"
          onClick={handleClearNotifications}
        >
          Clear All Notifications
        </button>

      </div>

    </div>
  );
}