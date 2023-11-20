const User = require("../models/userModel");
const jwt = require('jsonwebtoken');
const asyncHandler = require("express-async-handler");

const authMiddleware = asyncHandler(async(req, res, next) => {
    let token;
    if(req?.headers?.authorization?.startsWith("Bearer")){
        token = req?.headers?.authorization?.split(" ")[1];
        try{
            if(token){
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded?.id);
                req.user = user;
                next();
            }
        }catch(error){
            throw new Error("Not Authorized token expired, Please login again");
        }
    }else{
        throw new Error("There is no token attached to header");
    }
});

const isAdmin = asyncHandler(async(req, res, next) => {
    const {email} = req.user;
    const findUser = await User.findOne({email});
    if(findUser.role !== "admin"){
        throw new Error("You can't access this, beacuse you are not admin");
    }else{
        next();
    }
});

module.exports = {authMiddleware, isAdmin}
