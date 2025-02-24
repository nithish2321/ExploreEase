import React, { useState, useEffect } from "react";
import "./booking.css";
import { Form, FormGroup, ListGroup, ListGroupItem, Button } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify"; // Import toast library
import "react-toastify/dist/ReactToastify.css"; // Import toast styles
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { faBook } from '@fortawesome/free-solid-svg-icons';
import useFetch from "../../hooks/fetch.hook";
import { generateOTPForBooking, verifyOTP } from "../../helper/helper"; // Import OTP functions

const Booking = ({ tour, avgRating }) => {
  const [credentials, setCredentials] = useState({
    fullName: "",
    phone: "",
    guestSize: 2,
    bookAt: "",
  });

  const [user, setUser] = useState(null);
  const [OTP, setOTP] = useState("");
  const [verificationStatus, setVerificationStatus] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const navigate = useNavigate();
  const [{ isLoading, apiData, serverError }, fetchUserData] = useFetch();

  useEffect(() => {
    fetchUserData("http://localhost:8080/api/user");
  }, [fetchUserData]);

  useEffect(() => {
    if (apiData) {
      setUser(apiData);
      setCredentials((prevCredentials) => ({
        ...prevCredentials,
        fullName: apiData.firstName + " " + apiData.lastName,
        phone: apiData.mobile,
      }));
    }
  }, [apiData]);

  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const serviceFee = 10;
  const totalAmount =
    Number(tour.price) * Number(credentials.guestSize) + Number(serviceFee);

  const handleClick = async (e) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const confirmBooking = async () => {
    try {
      const verificationResponse = await verifyOTP({
        username: user.username,
        code: OTP,
      });
      if (verificationResponse.status === 201) {
        try {
          const response = await fetch(
            `http://localhost:8080/api/createbooking/${tour._id}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({
                ...credentials,
                totalAmount: totalAmount,
              }),
            }
          );

          if (response.ok) {
            navigate("/thank-you");
            toast.success("Booking successful!");
          } else {
            console.error("Failed to book:", response.statusText);
            alert("Failed to book, please login to the system");
          }
        } catch (error) {
          console.error("Network error:", error.message);
        }
      } else {
        alert("Failed to verify OTP, please check your OTP and try again.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert("Failed to verify OTP, please try again.");
    }
  };

  const handleGenerateOTP = async () => {
    try {
      const generatedOTP = await generateOTPForBooking(user.username);
      console.log("Generated OTP:", generatedOTP);
      toast.success("OTP generated successfully!"); // Show success toast for OTP generation
    } catch (error) {
      console.error("Error generating OTP:", error);
      alert("Failed to generate OTP, please try again.");
    }
  };

  return (
    <div className="booking">
      <ToastContainer />

      <div className="booking__top d-flex-align-items-center justify-content-between">
        <h3>
          ₹{tour.price} <span>/per person</span>
        </h3>
        <span className="tour__rating d-flex align-items-center">
          <i className="ri-star-s-fill"></i>
          {avgRating === 0 ? null : avgRating} ({tour.reviews?.length})
        </span>
      </div>

      <div className="booking__form">
        <h5>
          <FontAwesomeIcon icon={faInfoCircle} /> Provide Information About Your Travel
        </h5>
        <Form className="booking__info-form" onSubmit={handleClick}>
          <FormGroup>
            <input
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                color: "#495057",
                fontSize: "1rem",
                border: "1px solid #ced4da",
                transition:
                  "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
                outline: "none",
              }}
              type="text"
              placeholder="Full Name"
              id="fullName"
              value={credentials.fullName}
              readOnly
              required
            />
          </FormGroup>
          <FormGroup>
          <input
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                color: "#495057",
                fontSize: "1rem",
                border: "1px solid #ced4da",
                transition:
                  "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
                outline: "none",
              }}
              type="text"
              placeholder="Mobile"
              id="fullName"
              value={credentials.phone}
              readOnly
              required
            />
          </FormGroup>
          <FormGroup className="d-flex align-items-center gap-3">
            <input
              type="date"
              placeholder=""
              id="bookAt"
              required
              onChange={handleChange}
            />
            <input
              type="number"
              placeholder="Guest"
              id="guestSize"
              required
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <input
              type="text"
              placeholder="Enter OTP"
              value={OTP}
              onChange={(e) => setOTP(e.target.value)}
            />
            <Button
              className="btn primary1__Rbtn w-100 mt-4"
              onClick={handleGenerateOTP}
            >
              Generate OTP
            </Button>
          </FormGroup>
        </Form>
      </div>

      <div className="booking__bottom">
        <ListGroup>
          <ListGroupItem className="border-0 px-0">
            <h5 className="d-flex align-items-center gap-1">
              ₹{tour.price}
              <i className="ri-close-line">1 person</i>
            </h5>
            <span> ₹{tour.price}</span>
          </ListGroupItem>
          <ListGroupItem className="border-0 px-0">
            <h5>Service Charge</h5>
            <span>₹{serviceFee}</span>
          </ListGroupItem>
          <ListGroupItem className="border-0 px-0 total">
            <h5>Total</h5>
            <span>₹{totalAmount}</span>
          </ListGroupItem>
        </ListGroup>

        <Button
          className="btn primary__btn w-100 mt-4"
          onClick={() => setShowConfirmation(true)}
        >
          <FontAwesomeIcon icon={faBook} /> Book Now
        </Button>
      </div>

      {showConfirmation && (
        <div className="confirmation-dialog">
          <p>Are you sure you want to book?</p>
          <Button
            className="btn primary__btn w-100 mt-4"
            onClick={confirmBooking}
          >
            Confirm
          </Button>
          <Button
            className="btn primary1__Rbtn w-100 mt-4"
            onClick={() => setShowConfirmation(false)}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};

export default Booking;
