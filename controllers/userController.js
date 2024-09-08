import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import bcrypt from "bcrypt";

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const accessToken = jwt.sign(
      {
        userInfo: {
          id: user._id,
          name: user.name,  
          isAdmin: user.isAdmin,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      {
        userInfo: {
          id: user._id,
          name: user.name,  
          isAdmin: user.isAdmin,
        },
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // Set JWT as an HTTP-Only cookie
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      accessToken,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  // Validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "Email already exists" });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create a new user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  // Generate JWT (payload, secret key, expiration time)
  const accessToken = jwt.sign(
    {
      userInfo: {
        id: user._id,
        name: user.name, 
        isAdmin: user.isAdmin,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    {
      userInfo: {
        id: user._id,
        name: user.name, 
        isAdmin: user.isAdmin,
      },
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    }
  );
  // Set JWT as an HTTP-Only cookie
  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    accessToken,
  });
};

export const refresh = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.status(401).send({ msg: "Unauthorized" });

  const refreshToken = cookies.jwt;

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decode) => {
      if (err) return res.status(403).send({ msg: "Forbidden" });

      const user = await User.findById(decode.userInfo.id);
      if (!user) return res.status(404).send({ msg: "Unauthorized" });

      // Create a new access token including the isAdmin property and name
      const accessToken = jwt.sign(
        {
          userInfo: {
            id: user._id,
            name: user.name,  
            isAdmin: user.isAdmin,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      res.json({
        accessToken,
      });
    }
  );
};


export const logout = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.status(401).send({ msg: "Unauthorized" });
  res.clearCookie({
    name: "jwt",
    httpOnly: true,
    secure: true,
    sameSite: "None",
    expires: new Date(0),
  });
  res.send({ msg: "LoggedOut Successfully" });
};

//description: Get User Profile
//route: Get api/users/profile
//access: private
export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
};

//description: Update User Profile
//route: PUT api/users/profile
//access: private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;

      if (req.body.password) {
        // Hash the new password before saving it
        user.password = await bcrypt.hash(req.body.password, 12);
      }

      const updatedUser = await user.save();

      // Optionally generate a new access token if email or critical info is changed
      const accessToken = jwt.sign(
        {
          userInfo: {
            id: updatedUser._id,
            isAdmin: updatedUser.isAdmin,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        accessToken, // Return the new access token
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

//description: Get Users
//route: GET api/users
//access: private/Admin
export const getUsers = async (req, res) => {
  const users = await User.find({});
  res.status(200).json({ users });
};

//description: Get User by Id
//route: GET api/users/:id
//access: private/Admin
export const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
};

//description: Delete User
//route: DELETE api/users/:id
//access: private/Admin
export const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    if (user.isAdmin) {
      res.status(400).json({ message: "Can not delete admin user" });
    } else {
      await user.deleteOne({ _id: user._id });
      res.json({ message: "User deleted successfully" });
    }
  } else {
    res.status(404).json({ message: "User not found" });
  }
};

//description: Update User
//route: PUT api/users/:id
//access: private/Admin
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.isAdmin = Boolean(req.body.isAdmin);

      const updatedUser = await user.save();
      return res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
      });
    }
    // If user not found
    return res.status(404).json({ message: "User not found" });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};
