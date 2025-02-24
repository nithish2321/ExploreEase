import React from "react";
import Slider from "react-slick";
import ava01 from "../../assets/avatar_2.jpg";
import ava02 from "../../assets/avatar_3.jpg";
import ava03 from "../../assets/avatar_4.jpg";
import ava04 from "../../assets/avatar_5.jpg";



const Testimonials = () => {

  const settings= {
    dots:true,
    infinite:true,
    autoplay:true,
    speed:1000,
    swipeToSlide:true,
    autoplaySpeed:2000,
    slidesToShow:3,

    responsive:[
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ]
  }
  return (
    <Slider {...settings}>
      <div className="testimonial py-4 py-3">
        <p>My journey with ExploreEase to Ayodhya was beyond my expectations. The arrangements were impeccable, and our guide provided deep insights into the city's historical significance. I highly recommend ExploreEase for a spiritually enriching experience.</p>
        <div className="d-flex align-items-center gap-4 mt-3">
          <img src={ava01} className="w-25 h-25 rounded-2" alt="" />
          <div>
            <h6 className="mb-0 mt-3">Nithish</h6>
            <p>Customer</p>
          </div>
        </div>
      </div>
      <div className="testimonial py-4 py-3">
        <p>My journey to the Kashmir Valley with ExploreEase was nothing short of magical. The breathtaking landscapes, serene lakes, and warm hospitality left me spellbound. It was a journey that touched my soul and will remain etched in my memory forever.</p>

        <div className="d-flex align-items-center gap-4 mt-3">
          <img src={ava02} className="w-25 h-25 rounded-2" alt="" />
          <div>
            <h6 className="mb-0 mt-3">Yokesh</h6>
            <p>Customer</p>
          </div>
        </div>
      </div>
      <div className="testimonial py-4 py-3">
        <p>Exploring the Taj Mahal with ExploreEase was a dream come true! Their attention to detail and seamless arrangements made the experience truly memorable. From the majestic architecture to the fascinating history, every moment was enriching. Kudos to the team for their excellent service!</p>

        <div className="d-flex align-items-center gap-4 mt-3">
          <img src={ava03} className="w-25 h-25 rounded-2" alt="" />
          <div>
            <h6 className="mb-0 mt-3">Subash Kish</h6>
            <p>Customer</p>
          </div>
        </div>
      </div>

      <div className="testimonial py-4 py-3">
        <p>Exploring the beaches of Goa with ExploreEase was a dream come true. From pristine sands to thrilling water sports, every moment was filled with excitement. Thanks to their knowledgeable guides, I discovered hidden gems along the coastline that made my trip unforgettable.</p>

        <div className="d-flex align-items-center gap-4 mt-3">
          <img src={ava04} className="w-25 h-25 rounded-2" alt="" />
          <div>
            <h6 className="mb-0 mt-3">Praveen</h6>
            <p>Customer</p>
          </div>
        </div>
      </div>
    </Slider>
  );
};

export default Testimonials;