import { UserRoles, Users } from "@/models/schemaModal";
import jwt from "jsonwebtoken";


const AUTH = process.env.JWT_SECRET;

export async function AdminAuthentication(req) {
    // Extract token

    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new Error("Authorization token missing");
    }

    // Extract token
    const token = authHeader.split(" ")[1];
    console.log("==============token ================== ", token);

    // Verify token
    let decoded;
    try {
        decoded = jwt.verify(token, AUTH);
    } catch (err) {
        throw new Error("Invalid or expired token");
    }

    const admin_id = decoded.userId || decoded.id;

    // Check if user exists in MongoDB
   
    const adminData =await Users.findById(admin_id);
    if (!adminData) {
        return {
            message :'token invalid',
            status : false,
            data: {}
        }
    }
    console.log("adminData ===========>>>>>>>>>>> ", adminData);
    const roleId = adminData?.role_id;
    const role =await UserRoles.findById(roleId);
    console.log("role is ============ ", role);

    if (!role) {
        return {
            message :'role not found',
            status : false ,
            data: {}
        }
    }
    const userType = role?.user_type;
    if (userType == 'admin') {
        return {
            message : 'admin authenticated',
            status : true,
            data : {adminData}
        }
    } else {
        return {
            message : 'admin authentication failed',
            status : false,
            data : {}
        }
    }

} 