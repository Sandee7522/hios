import { UserRoles, Users } from "@/models/schemaModal";
import jwt, { decode } from "jsonwebtoken";

const {
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN = "15d",
  JWT_REFRESH_EXPIRES_IN = "7d",
} = process.env;

export const generateAccessToken = (payload) => {
  if (typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("JWT payload must be a plain object");
  }

  return jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRES_IN,
  });
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });
};

export const generateTokens = (payload) => ({
  accessToken: generateAccessToken(payload),
  refreshToken: generateRefreshToken(payload),
});

export const VerifyToken = async (req) => {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        status: false,
        code: 401,
        message: "Authorization token missing",
      };
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_ACCESS_SECRET);
    } catch (error) {
      return {
        status: false,
        code: 401,
        message: "Invalid or expired token",
      };
    }

    const userId = decoded.userId || decoded.id;

    const user = await Users.findById(userId);
    if (!user) {
      return {
        status: false,
        code: 401,
        message: "User not found",
      };
    }

    // optional attach
    req.user = user;

    return {
      status: true,
      code: 200,
      message: "Token verified",
      data: { user, decoded },
    };
  } catch (error) {
    return {
      status: false,
      code: 500,
      message: error.message,
    };
  }
};

export async function AdminAuthentication(req) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        status: false,
        code: 401,
        message: "Admin token missing",
      };
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_ACCESS_SECRET);
    } catch (error) {
      return {
        status: false,
        code: 401,
        message: "Invalid or expired token",
      };
    }

    const admin_id = decoded.userId || decoded.id;

    const adminData = await Users.findById(admin_id);
    if (!adminData) {
      return {
        status: false,
        code: 401,
        message: "User not found",
      };
    }

    const role = await UserRoles.findById(adminData.role_id);
    if (!role) {
      return {
        status: false,
        code: 403,
        message: "Role not found",
      };
    }

    if (role.user_type !== "admin") {
      return {
        status: false,
        code: 403,
        message: "Admin authentication failed",
      };
    }

    return {
      status: true,
      code: 200,
      message: "Admin authenticated",
      data: { adminData },
    };
  } catch (error) {
    return {
      status: false,
      code: 500,
      message: error.message,
    };
  }
}

export const InstructorAuthentication = async (req) => {
  try {
    const authHeader = req.headers.get("authentication");
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return {
        status: false,
        code: 401,
        message: "Token is Missing",
      };
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
     const decode = jwt.verify(token, JWT_ACCESS_SECRET);
    } catch (error) {
      return {
        status: false,
        code: 401,
        message: "Invalid or expired token",
      };
    }

    const instructor_id = decoded.userId || decoded.id;

    const instructorData = await Users.findById(instructor_id);
    if (!instructorData) {
      return {
        status: false,
        code: 401,
        message: "User not found",
      };
    }

    const role = await UserRoles.findById(instructorData.role_id);
    if (!role) {
      return {
        status: false,
        code: 403,
        message: "Role not found",
      };
    }

    if (role.user_type !== "instructor") {
      return {
        status: false,
        code: 403,
        message: "Instructor authentication failed",
      };
    }

    return {
      status: true,
      code: 200,
      message: "Instructor authenticated",
      data: { instructorData },
    };
  } catch (error) {
    return {
      status: false,
      code: 500,
      message: error.message,
    };
  }
};
