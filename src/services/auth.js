import {
  Sessions,
  UserDetails,
  UserRoles,
  Users,
} from "@/models/schemaModal.js";
import roleService from "./roleService.js";
import {
  comparePassword,
  generateRandomToken,
  hashPassword,
} from "@/utils/password.js";
import {
  generateAccessToken,
  generateTokens,
  VerifyToken,
} from "@/utils/jwt.js";
import { notFound, validationError } from "@/utils/apiResponse.js";
import mongoose from "mongoose";

export default class AuthService {
  async register({ name, email, password, role_type = "user" }) {
    try {
      // check user
      const existingUser = await Users.findOne({ email });
      if (existingUser) {
        throw new Error("User already exists with this email");
      }

      // role
      const roleResult = await roleService.getOrCreateRole(role_type);
      if (!roleResult.success) {
        throw new Error(roleResult.message);
      }

      // password
      const hashedPassword = await hashPassword(password);

      // create user
      const user = await Users.create({
        name,
        email,
        password: hashedPassword,
        role_id: roleResult.data._id,
        emailVerificationToken: generateRandomToken(),
        emailVerificationExpires: new Date(Date.now() + 86400000),
      });

      const { accessToken, refreshToken } = generateTokens({
        id: user._id.toString(),
        email: user.email,
        role: roleResult.data.name,
      });

      user.refreshTokens.push(refreshToken);
      await user.save();
      await user.populate("role_id");

      return {
        success: true,
        data: {
          user: this.sanitizeUser(user),
          accessToken,
          refreshToken,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Registration failed",
      };
    }
  }
  async login({ email, password }, deviceInfo = {}) {
    try {
      const user = await Users.findOne({ email }).populate("role_id");
      if (!user) {
        throw new Error("Invalid email or password");
      }

      const isValid = await comparePassword(password, user.password);
      if (!isValid) {
        throw new Error("Invalid email or password");
      }

      const { accessToken, refreshToken } = generateTokens({
        id: user._id.toString(),
        email: user.email,
        role: user.role_id?.name,
      });

      user.refreshTokens.push(refreshToken);
      await user.save();

      await Sessions.create({
        userId: user._id,
        token: refreshToken,
        deviceInfo,
        ipAddress: deviceInfo.ipAddress || "Unknown",
        isActive: true,
      });

      return {
        success: true,
        data: {
          user: this.sanitizeUser(user),
          accessToken,
          refreshToken,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Login failed",
      };
    }
  }
  y;

  async logout(refreshToken) {
    try {
      if (!refreshToken) throw new Error("Refresh token required");

      const { valid, decoded } = VerifyToken(refreshToken);
      if (!valid) throw new Error("Invalid token");

      await Users.updateOne(
        { _id: decoded.userId },
        { $pull: { refreshTokens: refreshToken } },
      );

      await Sessions.updateMany(
        { userId: decoded.userId, token: refreshToken },
        { isActive: false },
      );

      return true;
    } catch (error) {
      throw error;
    }
  }

  //==================================== Refresh access token =========================
  async refreshToken(refreshToken) {
    try {
      if (!refreshToken) {
        throw new Error("Refresh token is required");
      }

      // Verify refresh token
      const { valid, decoded } = VerifyToken(refreshToken);

      if (!valid) {
        throw new Error("Invalid or expired refresh token");
      }
      // Find user
      const user = await Users.findById(decoded.userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Check if refresh token exists in user's tokens
      if (!user.refreshTokens.includes(refreshToken)) {
        throw new Error("Refresh token is invalid or revoked");
      }

      // Generate new access token
      const payload = {
        userId: user._id.toString(),
        email: user.email,
        roleId: user.role_id.toString(),
      };

      const newAccessToken = generateAccessToken(payload);

      return {
        success: true,
        data: {
          accessToken: newAccessToken,
        },
        message: "Token refreshed successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // ==================================== Assign role =========================
  async assignRole(payload) {
    try {
      const { user_id, role_id } = payload;

      // Validate role exists
      const role = await UserRoles.findById(role_id);

      if (!role) {
        return {
          status: 404,
          message: "Role not found",
          data: {},
        };
      }

      // Update user role
      const user = await Users.findByIdAndUpdate(
        user_id,
        { role_id: role._id },
        { new: true },
      ).populate("role_id");

      if (!user) {
        return {
          status: 404,
          message: "User not found",
          data: {},
        };
      }

      return {
        status: 200,
        message: "Role assigned successfully",
        data: {
          user: this.sanitizeUser(user),
        },
      };
    } catch (error) {
      console.log("Assign role error:", error);
      throw error;
    }
  }

  //==================================== Create user profile =========================
  async createProfile(payload) {
    try {
      const {
        user_id,
        username,
        bio,
        phone,
        dateOfBirth,
        address,
        socialLinks,
      } = payload;

      const existingProfile = await UserDetails.findOne({ user_id });
      if (existingProfile) {
        return {
          status: 409,
          message: "Profile already exists",
        };
      }

      const profile = await UserDetails.create({
        user_id,
        username,
        bio,
        phone,
        dateOfBirth,
        address,
        socialLinks,
      });

      console.log("Profile created::::::::::::::::::: ", profile);

      return {
        status: 201,
        message: "Profile created successfully",
        data: profile,
      };
    } catch (error) {
      console.log("Create profile error: ", error);
      throw error;
    }
  }

  // ==================================== Get user by ID =========================

  async getProfileById(payload) {
    try {
      const { user_id } = payload;

      const profile = await UserDetails.findOne({ user_id })
        .populate("user_id", "name email")
        .lean();

      if (!profile) {
        return notFound("Profile not found");
      }

      return {
        status: 200,
        message: "Profile fetched successfully",
        data: profile,
      };
    } catch (error) {
      console.log("Get profile error:", error);
      throw error;
    }
  }

  // ==================================== update profile with user id =========================

  async updateProfile(payload) {
    try {
      const {
        user_id,
        username,
        bio,
        phone,
        dateOfBirth,
        address,
        socialLinks,
      } = payload;

      console.log("Update profile :::::::::::", payload);

      const updatedProfile = await UserDetails.findOneAndUpdate(
        { user_id },
        {
          username,
          bio,
          phone,
          dateOfBirth,
          address,
          socialLinks,
        },
        { new: true },
      );

      if (!updatedProfile) {
        return notFound("Profile not found");
      }

      return {
        status: 200,
        message: "Profile updated successfully",
        data: updatedProfile,
      };
    } catch (error) {
      console.log("Update profile error:", error);
      throw error;
    }
  }

  /**
   * Get user sessions
   */
  async getUserSessions(userId) {
    try {
      const sessions = await Sessions.find({
        userId: userId,
        isActive: true,
      })
        .sort({ lastActivity: -1 })
        .select("-token");

      return {
        success: true,
        data: {
          sessions: sessions,
          total: sessions.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // ====================== Get all users ======================
  async getAllUsers(payload) {
    try {
      const {
        search = "",
        role_id,
        created_from,
        created_to,
        updated_from,
        updated_to,
        page = 1,
        pageSize = 10,
        sort = "desc",
      } = payload;

      const skip = (page - 1) * pageSize;

      // 🔍 Search Query
      const searchQuery = search
        ? {
            $or: [
              { username: { $regex: search, $options: "i" } },
              { email: { $regex: search, $options: "i" } },
              { phone: { $regex: search, $options: "i" } },
            ],
          }
        : {};

      // 🎯 Filters
      const filterQuery = {
        ...searchQuery,
      };

      if (role_id) {
        filterQuery.role_id = role_id;
      }

      if (created_from || created_to) {
        filterQuery.created_at = {};
        if (created_from) filterQuery.created_at.$gte = new Date(created_from);
        if (created_to) filterQuery.created_at.$lte = new Date(created_to);
      }

      if (updated_from || updated_to) {
        filterQuery.updated_at = {};
        if (updated_from) filterQuery.updated_at.$gte = new Date(updated_from);
        if (updated_to) filterQuery.updated_at.$lte = new Date(updated_to);
      }

      // 📄 Data Query
      const users = await Users.find(filterQuery)
        .populate("role_id")
        .select(
          "-password -refreshTokens -resetPasswordToken -emailVerificationToken",
        )
        .sort({ created_at: sort === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(pageSize);

      // 🔢 Total Count
      const total = await Users.countDocuments(filterQuery);

      return {
        success: true,
        data: {
          users: users.map((user) => this.sanitizeUser(user)),
          pagination: {
            total,
            page,
            pageSize,
            pages: Math.ceil(total / pageSize),
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // ====================== forgePasswort ======================
  async forgetPassword(payload) {
    try {
      const { email } = payload;

      const user = await Users.findOne({ email });
      if (!user) {
        return notFound("User not found");
      }

      const resetToken = generateRandomToken();

      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 min
      await user.save();
      return {
        success: true,
        message: "Password reset link sent to email",
        data: { resetToken }, // ⚠️ remove in production
      };
    } catch (error) {
      console.error("ForgetPassword Error:", error);
      return {
        success: false,
        message: error.message || "Something went wrong in forgetPassword",
        data: {},
      };
    }
  }
  // ==================== Reset Password ==================
  async resetPassword(payload) {
    try {
      const { token, newPassword } = payload;

      const user = await Users.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        return notFound("Invalid or expired reset token");
      }

      user.password = await hashPassword(newPassword);
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;

      await user.save();

      return {
        success: true,
        message: "Password reset successfully",
        data: {},
      };
    } catch (error) {
      console.error("ResetPassword Error:", error);
      return {
        success: false,
        message: error.message || "Something went wrong in resetPassword",
        data: {},
      };
    }
  }

  /**
   * Sanitize user object (remove sensitive data)
   */
  sanitizeUser(user) {
    const userObj = user.toObject ? user.toObject() : user;

    return {
      id: userObj._id,
      name: userObj.name,
      email: userObj.email,
      role: userObj.role_id
        ? {
            id: userObj.role_id._id,
            user_type: userObj.role_id.user_type,
            description: userObj.role_id.description,
            permissions: userObj.role_id.permissions,
          }
        : null,
      isEmailVerified: userObj.isEmailVerified,
      profileImage: userObj.profileImage,
      bio: userObj.bio,
      phone: userObj.phone,
      dateOfBirth: userObj.dateOfBirth,
      address: userObj.address,
      socialLinks: userObj.socialLinks,
      instructorStatus: userObj.instructorStatus,
      created_at: userObj.created_at,
      updated_at: userObj.updated_at,
    };
  }
}
