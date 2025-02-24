import React, { useState, useEffect } from "react";
import axios from "axios";
import "./BookingHistory.css";
import { Container, Row, Col, Button } from "reactstrap";
import GooglePayButton from "@google-pay/button-react";

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);

  useEffect(() => {
    const fetchBookingHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found");
        }

        const decodedToken = decodeToken(token);
        const userId = decodedToken.userId;

        const response = await axios.get(
          `http://localhost:8080/api/users/${userId}/bookings`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          setBookings(response.data.bookings);
          setLoading(false);
        } else {
          throw new Error("Failed to fetch bookings");
        }
      } catch (error) {
        console.error("Error fetching booking history:", error.message);
        setError("Failed to fetch booking history");
        setLoading(false);
      }
    };

    fetchBookingHistory();
  }, []);

  const handleCancelBooking = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      const decodedToken = decodeToken(token);
      const userId = decodedToken.userId;

      const response = await axios.delete(
        `http://localhost:8080/api/users/${userId}/bookings/${bookingToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setShowConfirmation(false);
        window.location.reload(); // Refresh the page to reflect the updated booking status
      } else {
        throw new Error("Failed to cancel booking");
      }
    } catch (error) {
      console.error("Error cancelling booking:", error.message);
      setError("Failed to cancel booking");
    }
  };

  const decodeToken = (token) => {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  };

  return (
    <Container>
      <Row>
        <h2>Your Booking History</h2>
      </Row>
      <div>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : bookings.length === 0 ? (
          <p>No bookings found.</p>
        ) : (
          <div className="booking-container">
            {bookings
              .slice()
              .reverse()
              .map((booking) => (
                <div key={booking._id} className="booking-item">
                  <img
                    src={booking.tour.photo}
                    alt={booking.tour.title}
                    className="tour-photo"
                  />
                  <div className="booking-details">
                    <p>
                      <b>Booking ID:</b> {booking._id}
                    </p>
                    <p>
                      <b>Tour Name:</b> {booking.tour.title}
                    </p>
                    <p>
                      <b>Full Name:</b> {booking.fullName}
                    </p>
                    <p>
                      <b>Phone:</b>
                      {booking.phone}
                    </p>
                    <p>
                      <b>Guest Size:</b> {booking.guestSize}
                    </p>
                    <p>
                      <b>Total Price:</b> {booking.totalAmount}
                    </p>
                    <p>
                      Booked At: {new Date(booking.bookAt).toLocaleString()}
                    </p>
                    <p>Status: {booking.status}</p>

                    <GooglePayButton
                      environment="TEST"
                      paymentRequest={{
                        apiVersion: 2,
                        apiVersionMinor: 0,
                        allowedPaymentMethods: [
                          {
                            type: "CARD",
                            parameters: {
                              allowedAuthMethods: [
                                "PAN_ONLY",
                                "CRYPTOGRAM_3DS",
                              ],
                              allowedCardNetworks: ["MASTERCARD", "VISA"],
                            },
                            tokenizationSpecification: {
                              type: "PAYMENT_GATEWAY",
                              parameters: {
                                gateway: "example",
                                gatewayMerchantId: "exampleGatewayMerchantId",
                              },
                            },
                          },
                        ],
                        merchantInfo: {
                          merchantId: "12345678901234567890",
                          merchantName: "Demo Merchant",
                        },
                        transactionInfo: {
                          totalPriceStatus: "FINAL",
                          totalPriceLabel: "Total",
                          totalPrice:booking.totalAmount.toString(),
                          currencyCode: "INR", 
                          countryCode: "IN", 
                        },
                        shippingAddressRequired: true,
                        callbackIntents: ["PAYMENT_AUTHORIZATION"],
                      }}
                      onLoadPaymentData={(paymentRequest) => {
                        console.log(paymentRequest);
                      }}
                      onPaymentAuthorized={(paymentData) => {
                        console.log("paymentData " + paymentData);
                        return { transactionState: "SUCCESS" };
                      }}
                      existingPaymentMethodRequired="false"
                      buttonColor="black"
                      buttonType="pay"
                    ></GooglePayButton>

                    {booking.status !== "Canceled" && (
                      <Button
                        onClick={() => {
                          setBookingToDelete(booking._id);
                          setShowConfirmation(true);
                        }}
                        className="btn primary1__Rbtn w-100 mt-4"
                      >
                        Cancel Booking
                      </Button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
        {showConfirmation && (
          <div className="popup-container">
            <p>Are you sure you want to cancel this booking?</p>
            <Button
              color="danger"
              className="btn primary__btn w-100 mt-4"
              onClick={handleCancelBooking}
            >
              Confirm Cancel
            </Button>
            <Button
              color="secondary"
              className="btn primary1__Rbtn w-100 mt-4"
              onClick={() => setShowConfirmation(false)}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </Container>
  );
};

export default BookingHistory;