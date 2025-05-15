import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UpdateTourForm.css';

const UpdateTourForm = () => {
    const [tourId, setTourId] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        city: '',
        address: '',
        distance: 0,
        photo: '',
        desc: '',
        price: 0,
        maxGroupSize: 0,
        featured: false
    });
    const [imagePreview, setImagePreview] = useState(null); // State to store image preview URL
    const [tourIds, setTourIds] = useState([]);

    useEffect(() => {
        // Fetch all tour IDs
        const fetchAllTourIds = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/getalltour');
                const allTours = response.data.data; // Assuming data structure from backend
                const allTourIds = allTours.map(tour => tour._id); // Assuming tour ID is stored as '_id'
                setTourIds(allTourIds);
            } catch (error) {
                console.error('Error fetching tour IDs:', error);
            }
        };

        fetchAllTourIds();
    }, []);

    useEffect(() => {
        if (tourId) {
            // Fetch tour details based on selected tourId
            const fetchTourDetails = async () => {
                try {
                    const response = await axios.get(`http://localhost:8080/api/getsingletour/${tourId}`);
                    const tourData = response.data.data; // Assuming data structure from backend
                    setFormData(tourData);
                    setImagePreview(tourData.photo); // Set image preview
                } catch (error) {
                    console.error('Error fetching tour details:', error);
                }
            };

            fetchTourDetails();
        }
    }, [tourId]);

    const handleTourSelect = (e) => {
        setTourId(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:8080/api/updatetour/${tourId}`, formData);
            alert("Tour updated successfully!");
        } catch (error) {
            console.error('Error:', error);
            alert("Failed to update tour. Please try again.");
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:8080/api/deletetour/${tourId}`);
            alert("Tour deleted successfully!");
            // After deletion, clear form data and tour ID
            setFormData({
                title: '',
                city: '',
                address: '',
                distance: 0,
                photo: '',
                desc: '',
                price: 0,
                maxGroupSize: 0,
                featured: false
            });
            setTourId('');
        } catch (error) {
            console.error('Error:', error);
            alert("Failed to delete tour. Please try again.");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
            const photoString = event.target.result;
            setFormData({ ...formData, photo: photoString });
            setImagePreview(photoString); // Set image preview URL
        };

        reader.readAsDataURL(file);
    };

    const handleButtonClick = () => {
        // Trigger file input when custom button is clicked
        document.getElementById('fileInput').click();
    };

    return (
        <div className="update-tour-form-container">
            <h2>Update Tour Details</h2>
            <select value={tourId} onChange={handleTourSelect}>
                <option value="">Select Tour ID</option>
                {/* Fetch and map all tour IDs here */}
                {tourIds.map(id => (
                    <option key={id} value={id}>{id}</option>
                ))}
            </select>
            <form onSubmit={handleSubmit}>
                <input type="text" name="title" placeholder="Title" value={formData.title} onChange={handleChange} required />
                <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} required />
                <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
                <input type="number" name="distance" placeholder="Distance" value={formData.distance} onChange={handleChange} required />
                <div className="file-input-container">
                    <input type="file" accept="image/*,.jpeg,.jpg,.png,.gif" onChange={handleImageUpload} id="fileInput" style={{ display: 'none' }} />
                    <button type="button" className="custom-file-button" onClick={handleButtonClick}>Choose Image</button>
                </div>
                {imagePreview && <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', marginBottom: '10px' }} />}
                <textarea name="desc" placeholder="Description" value={formData.desc} onChange={handleChange} required />
                <input type="number" name="price" placeholder="Price" value={formData.price} onChange={handleChange} required />
                <input type="number" name="maxGroupSize" placeholder="Max Group Size" value={formData.maxGroupSize} onChange={handleChange} required />
                <label className="checkbox-label">
                    <input type="checkbox" name="featured" checked={formData.featured} onChange={() => setFormData({ ...formData, featured: !formData.featured })} />
                    Featured
                </label>
                <button type="submit">Update Tour</button>
                {tourId && <button type="button" onClick={handleDelete}>Delete Tour</button>}
            </form>
        </div>
    );
};

export default UpdateTourForm;
