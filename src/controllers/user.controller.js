import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/api_error.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiRespose } from "../utils/api_response.js"

const registerUser = asyncHandler(async (req, res) => {
    // get user details from the frontend

    const { fullName, email, username, password } = req.body

    // validation - not empty

    if (fullName === "") {
        throw new ApiError(400, "fullname is required")
    }

    if (email === "") {
        throw new ApiError(400, "email is required")
    }

    if (username === "") {
        throw new ApiError(400, "username is required")
    }

    if (password === "") {
        throw new ApiError(400, "password is required")
    }

    // check if user already exist: username, email

    const existedUser = User.findOne({
        $or: [
            { username }, { email }
        ]
    })

    if (existedUser) {
        throw new ApiError(409, "user with email or username already exists")
    }

    // check for images, check for avatar

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar file is required")
    }

    // upload them to cloudinary, avatar

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "avatar file is required")
    }

    // create user object - create entry in database

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    // remove password and refresh token field from response

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // check user for user creation 

    if (!createdUser) {
        throw new ApiError(500, "Somethig went wrong while registering the user")
    }

    // return response

    return res.status(201).json(
        new ApiRespose(200, createdUser, "user registed successfully")
    )

})

export { registerUser }