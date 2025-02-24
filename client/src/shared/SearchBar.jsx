import React, { useRef, useEffect } from "react";
import "./search-bar.css";
import { Col, Form, FormGroup } from "reactstrap";
import { BASE_URL } from "./../utils/config";
import { useNavigate } from "react-router-dom";
import { useCity } from "../CityContext";

const SearchBar = () => {
    const { selectedCity } = useCity();
    const locationRef = useRef("");
    const distanceRef = useRef(0);
    const maxGroupSizeRef = useRef(0);
    const navigate = useNavigate();

  useEffect(() => {
    // Update location input field value when selected city changes
    if (selectedCity) {
      locationRef.current.value = selectedCity;

      // If selected city is "Rajasthan", update Distance and Max People values
      if (selectedCity.toLowerCase() === "mysuru, karnataka") {
        distanceRef.current.value = 480;
        maxGroupSizeRef.current.value = 7;
      }else if (selectedCity.toLowerCase() === "kochi, kerala") {
        distanceRef.current.value = 750;
        maxGroupSizeRef.current.value = 10;
      }else if (selectedCity.toLowerCase() === "manali, himachal pradesh") {
        distanceRef.current.value = 2200;
        maxGroupSizeRef.current.value = 6;
      }else if (selectedCity.toLowerCase() === "visakhapatnam, andhra pradesh") {
        distanceRef.current.value = 800;
        maxGroupSizeRef.current.value = 6;
      }else if (selectedCity.toLowerCase() === "srinagar, jammu and kashmir") {
        distanceRef.current.value = 2400;
        maxGroupSizeRef.current.value = 10;
      }else if (selectedCity.toLowerCase() === "khajuraho, madhya pradesh") {
        distanceRef.current.value = 1400;
        maxGroupSizeRef.current.value = 7;
      }else if (selectedCity.toLowerCase() === "agra, uttar pradesh") {
        distanceRef.current.value =  1700;
        maxGroupSizeRef.current.value = 8;
      }else if (selectedCity.toLowerCase() === "jaipur, rajasthan") {
        distanceRef.current.value =   1700;
        maxGroupSizeRef.current.value = 5;
      }else if (selectedCity.toLowerCase() === "amritsar, punjab") {
          distanceRef.current.value =   2150;
          maxGroupSizeRef.current.value = 5;
      }else {
        distanceRef.current.value = 0;
        maxGroupSizeRef.current.value = 0;
      }
    }
  }, [selectedCity]);

    const searchHandler = async () => {
        const location = locationRef.current.value;
        const distance = distanceRef.current.value;
        const maxGroupSize = maxGroupSizeRef.current.value;

        if (location === "" || distance === "" || maxGroupSize === "") {
            return alert("All fields are required!");
        }

        const res = await fetch(`${BASE_URL}/api/gettourbysearch?city=${location}&distance=${distance}&maxGroupSize=${maxGroupSize}`);

        if (!res.ok) alert("Something went wrong");

        const result = await res.json();

        navigate('/tours/search', { state: result.data });
    };

    return (
        <Col lg='12'>
            <div className="search__bar">
                <Form className="d-flex align-items-center gap-4">
                    <FormGroup className="d-flex gap-3 form__group form__group-fast">
                        <span><i class="ri-map-pin-line"></i></span>
                        <div>
                            <h6>
                                Location
                            </h6>
                            <input type="text" placeholder="Where are you going?" ref={locationRef} />
                        </div>
                    </FormGroup>
                    <FormGroup className="d-flex gap-3 form__group form__group-fast">
                        <span><i class="ri-map-pin-time-line"></i></span>
                        <div>
                            <h6>
                                Distance
                            </h6>
                            <input type="number" placeholder="Distance k/m" ref={distanceRef} />
                        </div>
                    </FormGroup>
                    <FormGroup className="d-flex gap-3 form__group form__group-last">
                        <span><i class="ri-group-line"></i></span>
                        <div>
                            <h6>
                                Max People
                            </h6>
                            <input type="number" placeholder="0" ref={maxGroupSizeRef} />
                        </div>
                    </FormGroup>

                    <span className="search__icon" type="submit" onClick={searchHandler}>
                        <i class="ri-search-line"></i>
                    </span>
                </Form>
            </div>
        </Col>
    );
};

export default SearchBar;
