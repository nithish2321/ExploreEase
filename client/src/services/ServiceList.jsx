import React from "react";
import ServiceCard from "./ServiceCard";
import { Col } from "reactstrap";

import weatherImg from "../assets/images/weather.png";
import guideImg from "../assets/images/guide.png";
import customizationImg from "../assets/images/customization.png";


const servicesData = [
    {
    imgUrl: weatherImg,
    title: "Calculate weather",
    desc: "Calculate weather for informed travels.",
    },
    {
        imgUrl: guideImg,
        title: "Best Tour Guide",
        desc: "find the best tour guide for memorable adventures.",
    },
    {
        imgUrl: customizationImg,
        title: "Customization",
        desc: "customize your journey for a truly personalized experience.",
    },
];

const ServiceList = () => {
  return ( <>
  {
    servicesData.map((item,index)=> ( 
    <Col lg="3" key={index}>
        <ServiceCard item={item} />
    </Col>
    ))}
  </>
  );
};

export default ServiceList;