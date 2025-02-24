import UserModel from '../model/User.model.js'
import Booking from "../model/Booking.js"
import Tour from "../model/Tours.js"
import Review from "../model/Review.js"
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import ENV from '../config.js'
import otpGenerator from 'otp-generator';

/** middleware for verify user */
export async function verifyUser(req, res, next){
    try {
        
        const { username } = req.method == "GET" ? req.query : req.body;

        // check the user existance
        let exist = await UserModel.findOne({ username });
        if(!exist) return res.status(404).send({ error : "Can't find User!"});
        next();

    } catch (error) {
        return res.status(404).send({ error: "Authentication Error"});
    }
}


/** POST: http://localhost:8080/api/register 
 * @param : {
  "username" : "example123",
  "password" : "admin123",
  "email": "example@gmail.com",
  "firstName" : "bill",
  "lastName": "william",
  "mobile": 8009860560,
  "address" : "Apt. 556, Kulas Light, Gwenborough",
  "profile": ""
}
*/
export async function register(req,res){

    try {
        const { username, password, profile, email } = req.body;        

        // check the existing user
        const existUsername = new Promise((resolve, reject) => {
            UserModel.findOne({ username }, function(err, user){
                if(err) reject(new Error(err))
                if(user) reject({ error : "Please use unique username"});

                resolve();
            })
        });

        // check for existing email
        const existEmail = new Promise((resolve, reject) => {
            UserModel.findOne({ email }, function(err, email){
                if(err) reject(new Error(err))
                if(email) reject({ error : "Please use unique Email"});

                resolve();
            })
        });


        Promise.all([existUsername, existEmail])
            .then(() => {
                if(password){
                    bcrypt.hash(password, 10)
                        .then( hashedPassword => {
                            
                            const user = new UserModel({
                                username,
                                password: hashedPassword,
                                profile: profile || '',
                                email
                            });

                            // return save result as a response
                            user.save()
                                .then(result => res.status(201).send({ msg: "User Register Successfully"}))
                                .catch(error => res.status(500).send({error}))

                        }).catch(error => {
                            return res.status(500).send({
                                error : "Enable to hashed password"
                            })
                        })
                }
            }).catch(error => {
                return res.status(500).send({ error })
            })


    } catch (error) {
        return res.status(500).send(error);
    }

}


/** POST: http://localhost:8080/api/login 
 * @param: {
  "username" : "example123",
  "password" : "admin123"
}
*/
export async function login(req,res){
   
    const { username, password } = req.body;

    try {
        
        UserModel.findOne({ username })
            .then(user => {
                bcrypt.compare(password, user.password)
                    .then(passwordCheck => {

                        if(!passwordCheck) return res.status(400).send({ error: "Don't have Password"});

                        // create jwt token
                        const token = jwt.sign({
                                        userId: user._id,
                                        username : user.username
                                    }, ENV.JWT_SECRET , { expiresIn : "24h"});

                        return res.status(200).send({
                            msg: "Login Successful...!",
                            username: user.username,
                            token
                        });                                    

                    })
                    .catch(error =>{
                        return res.status(400).send({ error: "Password does not Match"})
                    })
            })
            .catch( error => {
                return res.status(404).send({ error : "Username not Found"});
            })

    } catch (error) {
        return res.status(500).send({ error});
    }
}


/** GET: http://localhost:8080/api/user/example123 */
export async function getUser(req,res){
    
    const { username } = req.params;

    try {
        
        if(!username) return res.status(501).send({ error: "Invalid Username"});

        UserModel.findOne({ username }, function(err, user){
            if(err) return res.status(500).send({ err });
            if(!user) return res.status(501).send({ error : "Couldn't Find the User"});

            /** remove password from user */
            // mongoose return unnecessary data with object so convert it into json
            const { password, ...rest } = Object.assign({}, user.toJSON());

            return res.status(201).send(rest);
        })

    } catch (error) {
        return res.status(404).send({ error : "Cannot Find User Data"});
    }

}


/** PUT: http://localhost:8080/api/updateuser 
 * @param: {
  "header" : "<token>"
}
body: {
    firstName: '',
    address : '',
    profile : ''
}
*/
export async function updateUser(req,res){
    try {
        
        // const id = req.query.id;
        const { userId } = req.user;

        if(userId){
            const body = req.body;

            // update the data
            UserModel.updateOne({ _id : userId }, body, function(err, data){
                if(err) throw err;

                return res.status(201).send({ msg : "Record Updated...!"});
            })

        }else{
            return res.status(401).send({ error : "User Not Found...!"});
        }

    } catch (error) {
        return res.status(401).send({ error });
    }
}


/** GET: http://localhost:8080/api/generateOTP */
export async function generateOTP(req,res){
    req.app.locals.OTP = await otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false})
    res.status(201).send({ code: req.app.locals.OTP })
}


/** GET: http://localhost:8080/api/verifyOTP */
export async function verifyOTP(req,res){
    const { code } = req.query;
    if(parseInt(req.app.locals.OTP) === parseInt(code)){
        req.app.locals.OTP = null; // reset the OTP value
        req.app.locals.resetSession = true; // start session for reset password
        return res.status(201).send({ msg: 'Verify Successsfully!'})
    }
    return res.status(400).send({ error: "Invalid OTP"});
}


// successfully redirect user when OTP is valid
/** GET: http://localhost:8080/api/createResetSession */
export async function createResetSession(req,res){
   if(req.app.locals.resetSession){
        return res.status(201).send({ flag : req.app.locals.resetSession})
   }
   return res.status(440).send({error : "Session expired!"})
}


// update the password when we have valid session
/** PUT: http://localhost:8080/api/resetPassword */
export async function resetPassword(req,res){
    try {
        
        if(!req.app.locals.resetSession) return res.status(440).send({error : "Session expired!"});

        const { username, password } = req.body;

        try {
            
            UserModel.findOne({ username})
                .then(user => {
                    bcrypt.hash(password, 10)
                        .then(hashedPassword => {
                            UserModel.updateOne({ username : user.username },
                            { password: hashedPassword}, function(err, data){
                                if(err) throw err;
                                req.app.locals.resetSession = false; // reset session
                                return res.status(201).send({ msg : "Record Updated...!"})
                            });
                        })
                        .catch( e => {
                            return res.status(500).send({
                                error : "Enable to hashed password"
                            })
                        })
                })
                .catch(error => {
                    return res.status(404).send({ error : "Username not Found"});
                })

        } catch (error) {
            return res.status(500).send({ error })
        }

    } catch (error) {
        return res.status(401).send({ error })
    }
};

export async function createBooking(req, res) {
    const { userId } = req.user; // Assuming the user ID is available in the request

    const { fullName, phone, guestSize, bookAt, totalAmount } = req.body; // Add totalAmount here
    const { tourId } = req.params; // Extract tourId from request params

    try {
        const newBooking = new Booking({
            user: userId,
            tour: tourId,
            fullName,
            phone,
            guestSize,
            bookAt,
            totalAmount, // Add totalAmount to the booking object
        });

        const savedBooking = await newBooking.save();

        res.status(201).json({
            success: true,
            message: "Your tour is booked",
            data: savedBooking,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}
/** 
export async function getBooking(req,res){
    const id = req.params.id;

    try{
        const book = await Booking.findById(id);
        res
        .status(200)
        .json({
            success:true,
            message: "successful",
            data:book,
        });

    } catch(err){
        res
        .status(404)
        .json({
            success:true,
            message: "not found",
        });
    }

};*/
//Asuming you have a route to fetch user's bookings by userId

export async function getUserBookings(req, res) {
    try {
        const userId = req.params.userId; // Assuming userId is passed in the request parameters

        // Retrieve bookings for the specified user
        const userBookings = await Booking.find({ user: userId })
            .populate('tour', 'title photo price -_id')
            .populate({
                path: 'reviews',
                select: 'text rating -_id'
            });

        if (!userBookings || userBookings.length === 0) {
            return res.status(404).json({ success: false, message: 'No bookings found for the user' });
        }

        res.status(200).json({ success: true, bookings: userBookings });
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
}

// Assume you have the user ID available in the request
export async function cancelBooking(req, res) {
    const { userId, bookingId } = req.params;

    try {
        // Find the booking by ID
        const booking = await Booking.findOne({ _id: bookingId, user: userId });

        // Check if booking exists and belongs to the user
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found for the user' });
        }

        // Perform cancellation logic here (e.g., delete the booking from the database)

        // For demonstration purposes, let's assume we just mark the booking as canceled
        booking.status = 'Canceled';
        await booking.save();

        // Return success response
        res.status(200).json({ success: true, message: 'Booking canceled successfully' });
    } catch (error) {
        // Log the error
        console.error('Error canceling booking:', error);
        // Send internal server error response
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
}

export async function DeleteBookings (req, res)  {
    try {
      // Get the array of booking IDs to delete from the request body
      const { bookingIds } = req.body;
  
      // Delete bookings matching the provided IDs
      const result = await Booking.deleteMany({ _id: { $in: bookingIds } });
  
      // Respond with success message or deleted count
      res.json({ message: 'Bookings deleted successfully', deletedCount: result.deletedCount });
    } catch (error) {
      // Handle errors
      console.error('Error deleting bookings:', error);
      res.status(500).json({ error: 'Failed to delete bookings. Please try again later.' });
    }
  }
  

export async function getAllBookingsWithUsers(req, res) {
    try {
        const bookingsWithUsers = await Booking.find({})
            .populate({
                path: 'user',
                select: '-password' // Exclude password field from user details
            })
            .populate('tour', 'title photo price -_id') // Include 'photo' field for tours
            .populate({
                path: 'reviews',
                select: 'text rating -_id' // Include only necessary fields from reviews
            });

        if (!bookingsWithUsers || bookingsWithUsers.length === 0) {
            return res.status(404).json({ success: false, message: 'No bookings found' });
        }

        res.status(200).json({ success: true, bookings: bookingsWithUsers });
    } catch (error) {
        console.error('Error fetching bookings with users:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
}

export async function updateBooking(req, res) {
    try {
      const { bookingId } = req.params;
      const updatedBookingData = req.body;
  
      // Find the booking by ID and update its details
      const updatedBooking = await Booking.findByIdAndUpdate(bookingId, updatedBookingData, { new: true });
  
      res.status(200).json({ success: true, booking: updatedBooking });
    } catch (error) {
      console.error('Error updating booking:', error);
      res.status(500).json({ success: false, message: 'Failed to update booking. Please try again later.' });
    }
  }


// Backend controller function to create a new tour
export async function createTour(req, res) {
    const newTour = new Tour(req.body);

    try {
        const savedTour = await newTour.save();

        res.status(200).json({
            success: true,
            message: "Successfully created",
            data: savedTour,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
            message: "Failed to Create. Try again"
        });
    }
}



export async function updateTour(req, res) {
    const id = req.params.id;

    try {
        const updateTour = await Tour.findByIdAndUpdate(id, {
            $set: req.body
        }, { new: true });

        if (!updateTour) {
            return res.status(404).json({
                success: false,
                message: "Tour not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Successfully updated",
            data: updateTour,
        });
    } catch (err) {
        console.error(err); // Log the error for debugging
        res.status(500).json({
            success: false,
            message: "Failed to update",
            error: err.message // Include error message in the response
        });
    }
};

export async function deleteTour(req, res) {
    const id = req.params.id;

try{

    await Tour.findByIdAndDelete(id);

    res
    .status(200)
    .json({
        success:true, 
        message:"Successfully deleted"
    });
} catch(err){
    res
    .status(500)
    .json({
        success:false, 
        message:"failed to delete it",
    });
}

}

export async function getSingleTour(req, res) {
    const id = req.params.id;

    try{
    
        const tour = await Tour.findById(id).populate("reviews");
    
        res
        .status(200)
        .json({
            success:true, 
            message:"Successful",
            data:tour,
        });
    } catch(err){
        res
        .status(404)
        .json({
            success:false, 
            message:"not found",
        });
    }
    
};

export async function getAllTours(req, res) {
    const page = parseInt(req.query.page);

    console.log(page);

    try{
        const tours = await Tour.find({}).populate("reviews");

        res.status(200).json({success:true,
            count: tours.length,
            message:"Successful",
            data:tours,
        });
    } catch(err){
        res
        .status(404)
        .json({
            success:false, 
            message:"not found",
        });
    }
}

export async function getTourBySearch(req,res){
    const city = new RegExp(req.query.city, "i");
    const distance = parseInt(req.query.distance);
    const maxGroupSize = parseInt(req.query.maxGroupSize);

    try{
        const tours = await Tour.find({city, distance:{$gte:distance},
        maxGroupSize:{$gte:maxGroupSize},
    }).populate("reviews");

        res.status(200).json({
            success:true,
            message:"Successful",
            data:tours,
        });

    } catch(err){
        res
        .status(404)
        .json({
            success:false, 
            message:"not found",
        });
    }
}

export async function getFeaturedTour(req,res){
    try{
        const tours = await Tour.find({featured:true}).populate("reviews").limit(8);

        res.status(200).json({
            success:true,
            message:"Successful",
            data:tours,
        });
    } catch(err){
        res
        .status(404)
        .json({
            success:false, 
            message:"not found",
        });
    }
}

export async function getTourCount(req,res){
    try{
        const tourCount = await Tour.estimatedDocumentCount();

        res
        .status(200)
        .json({
            success:true, 
            data:tourCount
        });

    } catch(err){
        res
        .status(500)
        .json({
            success: false, 
            message:"failed to fetch"
        });
    }
};

// Controller code to create review
export async function createReview(req, res) {
    const tourId = req.params.tourId;
    const newReview = new Review({ ...req.body }); // Create a new instance of Review
  
    try {
      const savedReview = await newReview.save();
  
      // Update the Tour document by pushing the review's ObjectId into the reviews array
      await Tour.findByIdAndUpdate(tourId, { $push: { reviews: savedReview._id } });
  
      res.status(200).json({
        success: true,
        message: "Review submitted",
        data: savedReview
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Failed to submit review"
      });
    }
  }
  

  