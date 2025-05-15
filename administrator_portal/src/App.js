import React, { useState } from 'react';
import './App.css';
import { Container, Button } from "reactstrap";
import BookingManagement from './components/BookingManagement';
import CreateTourForm from './components/CreateTourForm';
import UpdateTourForm from './components/UpdateTourForm';

function App() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  const openCreateForm = () => {
    setShowCreateForm(true);
    setShowUpdateForm(false);
  };

  const openUpdateForm = () => {
    setShowUpdateForm(true);
    setShowCreateForm(false);
  };

  return (
    <Container>
      <div>
        <h1>Tour Package Management</h1>
        <div className="button-container">
          <Button onClick={openCreateForm}>Create Tour</Button>
          <Button onClick={openUpdateForm}>Update Tour</Button>
        </div>
        {showCreateForm && <CreateTourForm onClose={() => setShowCreateForm(false)} />}
        {showUpdateForm && <UpdateTourForm onClose={() => setShowUpdateForm(false)} />}
        <hr />
        <h1>Booking Management</h1>
        <BookingManagement />
      </div>
    </Container>
  );
}

export default App;
