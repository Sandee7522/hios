import { Sessions, Users } from "@/models/schemaModal.js";
import roleService from "./roleService.js";
// import {
//   generateAccessToken,
//   generateTokens,
//   verifyToken,
// } from "@/utils/jwt.js";
import {
  comparePassword,
  generateRandomToken,
  hashPassword,
} from "@/utils/password.js";
import { generateTokens, VerifyToken } from "@/utils/jwt.js";

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

  /**
   * Logout user
   */
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

  /**
   * Assign role to user
   * This is used by admin to change user's role
   */
  async assignRole(userId, roleType) {
    try {
      if (!userId || !roleType) {
        throw new Error("User ID and role type are required");
      }

      // Get role
      const roleResult = await roleService.getRoleByType(roleType);

      if (!roleResult.success) {
        throw new Error(roleResult.message);
      }

      // Update user's role
      const user = await Users.findByIdAndUpdate(
        userId,
        { role_id: roleResult.data._id },
        { new: true },
      ).populate("role_id");

      if (!user) {
        throw new Error("User not found");
      }

      return {
        success: true,
        data: {
          user: this.sanitizeUser(user),
        },
        message: "Role assigned successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    try {
      const user = await Users.findById(userId)
        .populate("role_id")
        .select(
          "-password -refreshTokens -resetPasswordToken -emailVerificationToken",
        );

      if (!user) {
        throw new Error("User not found");
      }

      return {
        success: true,
        data: {
          user: this.sanitizeUser(user),
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, updateData) {
    try {
      // Remove protected fields
      delete updateData.password;
      delete updateData.email;
      delete updateData.role_id;
      delete updateData.refreshTokens;
      delete updateData.resetPasswordToken;
      delete updateData.emailVerificationToken;

      const user = await Users.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true },
      ).populate("role_id");

      if (!user) {
        throw new Error("User not found");
      }

      return {
        success: true,
        data: {
          user: this.sanitizeUser(user),
        },
        message: "Profile updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
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

  /**
   * Terminate specific session
   */
  async terminateSession(userId, sessionId) {
    try {
      const session = await Sessions.findOneAndUpdate(
        { _id: sessionId, userId: userId },
        { isActive: false },
        { new: true },
      );

      if (!session) {
        throw new Error("Session not found");
      }

      return {
        success: true,
        message: "Session terminated successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(filters = {}, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      const users = await Users.find(filters)
        .populate("role_id")
        .select(
          "-password -refreshTokens -resetPasswordToken -emailVerificationToken",
        )
        .sort({ created_at: -1 })
        .limit(limit)
        .skip(skip);

      const total = await Users.countDocuments(filters);

      return {
        success: true,
        data: {
          users: users.map((user) => this.sanitizeUser(user)),
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
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
