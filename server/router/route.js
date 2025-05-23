import { Router } from "express";
import Booking from "../model/Booking.js"
const router = Router();

/** import all controllers */
import * as controller from '../controllers/appController.js';
import { registerMail } from '../controllers/mailer.js'
import Auth, { localVariables } from '../middleware/auth.js';


/** POST Methods */
router.route('/register').post(controller.register); // register user
router.route('/registerMail').post(registerMail); // send the email
router.route('/authenticate').post(controller.verifyUser, (req, res) => res.end()); // authenticate user
router.route('/login').post(controller.verifyUser,controller.login); // login in app

/** GET Methods */
router.route('/user/:username').get(controller.getUser) // user with username
router.route('/generateOTP').get(controller.verifyUser, localVariables, controller.generateOTP) // generate random OTP
router.route('/verifyOTP').get(controller.verifyUser, controller.verifyOTP) // verify generated OTP
router.route('/createResetSession').get(controller.createResetSession) // reset all the variables


/** PUT Methods */
router.route('/updateuser').put(Auth, controller.updateUser); // is use to update the user profile
router.route('/resetPassword').put(controller.verifyUser, controller.resetPassword); // use to reset password

/**Booking */
router.route('/createbooking/:tourId').post(Auth, controller.createBooking); //
//router.route('/getbooking/:id').get(controller.getBooking); //
router.get('/users/:userId/bookings', Auth, controller.getUserBookings);
router.delete('/users/:userId/bookings/:bookingId',Auth,controller.cancelBooking);
router.delete('/deletebookings',controller.DeleteBookings);
router.put('/updatebooking/:bookingId',controller.updateBooking);
router.route('/getallbookings').get(controller.getAllBookingsWithUsers); //

// Backend route setup using Express
router.route('/createtour').post(controller.createTour);
router.route('/updatetour/:id').put(controller.updateTour);

router.route('/deletetour/:id').delete(controller.deleteTour);

router.route('/getsingletour/:id').get(controller.getSingleTour);

router.route('/getalltour').get(controller.getAllTours);

router.route('/gettourbysearch').get(controller.getTourBySearch);  

router.route('/getfeaturedtour').get(controller.getFeaturedTour);
router.route('/gettourcount').get(controller.getTourCount);

router.post('/createreview/:id', controller.createReview);
  

export default router;

