import asyncHandler from "express-async-handler";
import { prisma } from "../config/prismaConfig.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import nodemailer from "nodemailer";
import crypto from "crypto";


// Function to create new user without Auth0
export const registerNewUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (!validator.isStrongPassword(password, { minLength: 6 })) {
    return res.status(400).json({
      message:
        "Password should be at least 6 characters and include numbers and symbols",
    });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: username,
        email,
        password: hashedPassword,
        isVerified: false,
      },
    });

    // generate verification token
    const verificationToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const verificationLink = `http://localhost:5173/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify your email",
      html: `
      <h2>Welcome, ${username}!</h2>
      <p>Click the link below to verify your email:</p>
      <a href="${verificationLink}">Verify Email</a>
    `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Registration failed. Please try again" });
  }
});

// function to verify email after registration

export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: "verification token missing." });
  }

  try {
    // verify jwt token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const userId = decoded.userId;
    // check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    if (user.isVerified) {
      return res.status(200).json({ message: "Email already verified" });
    }

    // update user to show verified
    await prisma.user.update({
      where: { id: userId },
      data: { isVerified: true },
    });

    res
      .status(200)
      .json({ message: "Email successfully verified. Proceed to log in" });
  } catch (error) {
    console.log(error);
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Verification token expired!" });
    }
    res.status(400).json({ message: "Inavlid verification token." });
  }
});

// function used to login
export const loginUser = asyncHandler(async (req, res) => {
  let { email, password, rememberMe } = req.body;
  console.log(rememberMe);
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials!" });
    }
    if (!user.isVerified) {
      return res
        .status(401)
        .json({ message: "Please verify your email to continue." });
    }

    //  check if password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials!" });
    }
    //    generate token and send to the user
    const age = rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60; // in seconds

    // const age = rememberMe ? 1000 * 60 * 60 * 24 * 7 : 1000 * 60 * 60 * 24;
    const token = jwt.sign(
      {
        id: user.id,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: age * 1000,
      }
    );

    const { password: userPassword, resetToken, resetTokenExpiry,  ...userInfo } = user;
//  console.log(mail)
    res
      .cookie("token", token, {
        httpOnly: true,
        maxAge: age,
      })
      .status(200)
      .json(userInfo);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Login failed! Please Try again." });
  }
});

export const logOut = (req, res) => {
  res.clearCookie("token").status(200).json({ message: "Logout successful" });
};


// function for forgot password

export const forgotPassword = asyncHandler(async(req, res) =>{
  const {email} = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: {email}
    });
    if (!user) {
      return res.status(404).json({message: "user nnot found"});
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 1000*60*60; //1hr
    await prisma.user.update({
      where: {email},
      data: {
        resetToken,
        resetTokenExpiry: new Date(resetTokenExpiry)
      }
    });

    // const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`; 
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password reset",
      text: `click this link to rest your password: ${resetUrl}`,

     
    };

    await transporter.sendMail(mailOptions);

    // await sendMail({
    //     to: email,
    //     subject: "password Reset",
    //     text: `click this link to rest your password: ${resetUrl}`,
    // });
    res.json({message: "Password reset email sent"});
  } catch (error) {
    console.log(error);
    res.status(500).json({message: "server error"});
    
  }
})

// function to rest email

export const resetPassword =  asyncHandler(async(req, res)=>{
  const {token} = req.params;
  const {password} = req.body;

  if (!validator.isStrongPassword(password, { minLength: 6 })) {
    return res.status(400).json({
      message:
        "Password should be at least 6 characters and include numbers and symbols and a capital letter",
    });
  }


  try {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {gte: new Date()},
      },
    });

    if (!user) {
      return res.status(400).json({message: "Inavlid or expired token."});      
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id},
      data: {
        password:hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
    res.json({message: "Password reset successful."})
    
  } catch (error) {
    console.error(error);
    res.status(500).json({message: "server error"});
    
  }
})