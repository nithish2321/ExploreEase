import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './BookingManagement.css';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [editFormData, setEditFormData] = useState({
    guestSize: '',
    bookAt: '',
    status: ''
  });

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/getallbookings');
        setBookings(response.data.bookings);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setError('Failed to fetch bookings. Please try again later.');
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleSelectUser = useCallback(
    (userId) => {
      if (selectedUsers.includes(userId)) {
        setSelectedUsers(selectedUsers.filter((id) => id !== userId));
      } else {
        setSelectedUsers([...selectedUsers, userId]);
      }
    },
    [selectedUsers]
  );

  const handleDeleteSelected = useCallback(async () => {
    try {
      await axios.delete('http://localhost:8080/api/deletebookings', {
        data: { bookingIds: selectedUsers }
      });
      
      setBookings(bookings.filter(booking => !selectedUsers.includes(booking._id)));
      setSelectedUsers([]);
    } catch (error) {
      console.error('Error deleting bookings:', error);
      setError('Failed to delete bookings. Please try again later.');
    }
  }, [selectedUsers, bookings]);

  const handleEditBooking = useCallback((bookingId) => {
    const booking = bookings.find(booking => booking._id === bookingId);
    setEditingBooking(booking);
    setEditFormData({
      guestSize: booking.guestSize,
      bookAt: booking.bookAt,
      status: booking.status
    });
    setIsEditing(true);
  }, [bookings]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditingBooking(null);
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  }, [editFormData]);

  const handleUpdateBooking = useCallback(async () => {
    try {
      const { guestSize, bookAt, status } = editFormData;
      const updatedBookingData = {
        guestSize,
        bookAt,
        status
      };

      const existingGuestSize = editingBooking.guestSize;
      const existingTotalAmount = editingBooking.totalAmount;
      const newTotalAmount = (existingTotalAmount / existingGuestSize) - 10;
      updatedBookingData.totalAmount = newTotalAmount * guestSize + 10;

      await axios.put(`http://localhost:8080/api/updatebooking/${editingBooking._id}`, updatedBookingData);

      setBookings(bookings.map(booking => {
        if (booking._id === editingBooking._id) {
          return { ...booking, ...updatedBookingData };
        }
        return booking;
      }));

      setIsEditing(false);
      setEditingBooking(null);
    } catch (error) {
      console.error('Error updating booking:', error);
      setError('Failed to update booking. Please try again later.');
    }
  }, [editFormData, editingBooking, bookings]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="booking-management-container">
      {isEditing && editingBooking && (
        <div className="edit-form">
          <h2>Edit Booking</h2>
          <input
            type="number"
            name="guestSize"
            value={editFormData.guestSize}
            onChange={handleInputChange}
            placeholder="Guest Size"
          />
          <input
            type="date"
            name="bookAt"
            value={editFormData.bookAt}
            onChange={handleInputChange}
            placeholder="Book Date"
          />
          <select
            name="status"
            value={editFormData.status}
            onChange={handleInputChange}
          >
            <option value="Active">Active</option>
            <option value="Canceled">Canceled</option>
          </select>
          <div>
            <button className="edit-button" onClick={handleUpdateBooking}>Update</button>
            <button onClick={handleCancelEdit} className="delete-button1">Cancel</button>
          </div>
        </div>
      )}
      <div>
        <button className="delete-button" onClick={handleDeleteSelected} disabled={selectedUsers.length === 0}>
          Delete Selected
        </button>
      </div>
      {bookings.length === 0 ? (
        <p>No bookings found</p>
      ) : (
        <table className="booking-management-table">
          <thead>
            <tr>
              <th>Select</th>
              <th>Full Name</th>
              <th>User</th>
              <th>Tour</th>
              <th>Guest Size</th>
              <th>Phone</th>
              <th>Booked At</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking._id}>
                <td>
                  <input
                    className="checkbox"
                    type="checkbox"
                    checked={selectedUsers.includes(booking._id)}
                    onChange={() => handleSelectUser(booking._id)}
                  />
                </td>
                <td>{booking.fullName}</td>
                <td>{booking.user?.username || 'N/A'}</td>
                <td>{booking.tour?.title || 'N/A'}</td>
                <td>{booking.guestSize}</td>
                <td>{booking.phone}</td>
                <td>{new Date(booking.bookAt).toLocaleDateString()}</td>
                <td>
                  {typeof booking.totalAmount === 'number'
                    ? `$${booking.totalAmount.toFixed(2)}`
                    : 'N/A'}
                </td>
                <td>{booking.status}</td>
                <td>
                  <button className="edit-button" onClick={() => handleEditBooking(booking._id)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BookingManagement;