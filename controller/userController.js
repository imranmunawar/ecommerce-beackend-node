const { generateToken } = require("../config/jwtToken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const { validateMongoId } = require("../utils/validateMongoId");
const { generateRefreshToken } = require("../config/refreshToken");

const createUser = asyncHandler(async(req, res) => {
    const email = req.body.email;
    const findUser =  await User.findOne( { email: email} );

    if(!findUser){
        const newUser = await User.create(req.body);
        res.json(newUser);
    }else{
        throw new Error("User Already Exist");
    }
});

const loginUser = asyncHandler(async(req, res) => {
    const {email, password} = req.body;
    const findUser = await User.findOne({email});
    if(findUser && await findUser.isPasswordMatched(password)){
        const refreshToken = await generateRefreshToken(findUser?._id);
        const updateUser = await User.findByIdAndUpdate(findUser?._id,{
            refreshToken:refreshToken,
        }, {new:true});
        res.cookie('refreshToken',refreshToken,{
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 100,
        });

        res.json({
            _id: findUser?._id,
            firstname: findUser?.firstname,
            lastname: findUser?.lastname,
            email: findUser?.email,
            mobile: findUser?.mobile,
            token: generateToken(findUser?._id)
        });
    }else{
        throw new Error("Invalid Credentials");
    }
});

const getListUsers = asyncHandler(async(req, res) => {
    try{
        const users = await User.find();
        res.json(users);
    } catch(error){
        throw new Error(error);
    }
});

const getUser = asyncHandler(async(req, res) => {
    try{
        const { id } = req.params;
        validateMongoId(id);
        const user = await User.findById(id);
        res.json(user);
    } catch(error){
        throw new Error(error);
    }
});

const deleteUser = asyncHandler(async(req, res) => {
    try{
        const { id } = req.params;
        validateMongoId(id);
        const user = await User.findByIdAndDelete(id);
        res.json(user);
    } catch(error){
        throw new Error(error);
    }
});

const updateUser = asyncHandler(async(req, res) => {
    //const { id } = req.params;
    const { _id } = req.user;
    validateMongoId(_id);
    try{
        const { firstname, lastname, email, mobile } = req.body;
        const user = await User.findByIdAndUpdate(_id,{
            firstname: firstname,
            lastname: lastname,
            email: email,
            mobile: mobile
        },{
            new: true
        });
        res.json(user);
    } catch(error){
        throw new Error(error);
    }
});

const blockUser = asyncHandler(async(req, res) => {
    const { id } = req.params;
    validateMongoId(id);
    try{
        const user = await User.findByIdAndUpdate(id,{
            isBlocked: true,
        },{
            new: true
        });
        res.json({
            message: "User Blocked"
        });
    } catch(error){
        throw new Error(error);
    }
});
const unBlockUser = asyncHandler(async(req, res) => {
    const { id } = req.params;
    validateMongoId(id);
    try{
        const user = await User.findByIdAndUpdate(id,{
            isBlocked: false,
        },{
            new: true
        });
        res.json({
            message: "User Unblocked"
        });
    } catch(error){
        throw new Error(error);
    }
});

module.exports = { createUser, loginUser, getListUsers, getUser, deleteUser, updateUser, blockUser, unBlockUser };