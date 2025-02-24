import React from "react";
import {Routes, Route, Navigate} from "react-router-dom";

/** Pages Components */
import Home from "../components/Pages/Home";
import ChatBot from "../components/Pages/ChatBot";
import Tours from "../components/Pages/Tours";
import TourDetails from "../components/Pages/TourDetails";
import ThankYou from "../components/Pages/ThankYou";
import SearchResultList from "../components/Pages/SearchResultList";
import Gallery from "../components/Pages/Gallary"
/* Authentication commponents */
import Username from '../components/Username';
import Password from '../components/Password';
import Register from '../components/Register';
import Profile from '../components/Profile';
import Recovery from '../components/Recovery';
import Reset from '../components/Reset';
import PageNotFound from '../components/PageNotFound';
import BookingHistory from "../components/BookingHistory";

/** auth middleware */
import { AuthorizeUser, ProtectRoute } from '../middleware/auth'


const Router = () => {
  return (
    <Routes>
        <Route path="/" element={<Navigate to="/home"/>}/>
        <Route path="/home" element={<Home/>} />
        <Route path="/chatbot" element={<ChatBot/>} />
        <Route path="/tours" element={<Tours/>} />
        <Route path="/tours/:id" element={<TourDetails/>} />
        <Route path="/login" element={<Username/>} />
        <Route path= "/register" element={<Register/>}/>
        <Route path= "/password" element={<ProtectRoute><Password /></ProtectRoute>}/>
        <Route path= "/profile" element={<AuthorizeUser><Profile /></AuthorizeUser>}/>
        <Route path= "/recovery" element={<Recovery/>}/>
        <Route path= "/reset" element={<Reset/>}/>
        <Route path="/thank-you" element={<ThankYou/>} />
        <Route path="/tours/search" element={<SearchResultList/>} />
        <Route path="/gallery" element={<Gallery/>} />
        <Route path="/bookinghistory"  element={<BookingHistory/>}/>

        <Route path= "/*" element={<PageNotFound />}/>
    </Routes>
  );
};

export default Router;