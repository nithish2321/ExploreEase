import React, { useState, useRef } from 'react';
import axios from 'axios';
import './CreateTourForm.css';

const CreateTourForm = () => {
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
    const fileInputRef = useRef(null); // Ref for file input

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8080/api/createtour', formData);
            alert("Tour created successfully!");
            setFormData({ // Clear form data after successful submission
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
            setImagePreview(null); // Clear image preview after submission
        } catch (error) {
            console.error('Error:', error);
            alert("Failed to create tour. Please try again.");
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
        fileInputRef.current.click();
    };

    return (
        <div className="create-tour-form-container">
            <h2>Create a New Tour</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" name="title" placeholder="Title" value={formData.title} onChange={handleChange} required />
                <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} required />
                <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
                <input type="number" name="distance" placeholder="Distance" value={formData.distance} onChange={handleChange} required />
                <div className="file-input-container">
                    <input type="file" accept="image/*,.jpeg,.jpg,.png,.gif" onChange={handleImageUpload} ref={fileInputRef} style={{ display: 'none' }} />
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
                <button type="submit">Create Tour</button>
            </form>
        </div>
    );
};

export default CreateTourForm;
