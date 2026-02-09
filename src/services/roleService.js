import { UserRoles, Users } from "@/models/schemaModal";

class RoleService {
  constructor() {
    this.defaultRoles = {
      user: {
        user_type: "user",
        description: "Default user role - Basic access to platform",
        permissions: [
          "view_courses",
          "enroll_courses",
          "access_content",
          "view_profile",
        ],
      },
      student: {
        user_type: "student",
        description: "Student role - Can enroll and learn",
        permissions: [
          "view_courses",
          "enroll_courses",
          "access_lessons",
          "submit_assignments",
          "take_quizzes",
          "post_questions",
          "write_reviews",
        ],
      },
      instructor: {
        user_type: "instructor",
        description: "Instructor role - Can create and manage courses",
        permissions: [
          "create_courses",
          "edit_courses",
          "delete_courses",
          "create_lessons",
          "edit_lessons",
          "delete_lessons",
          "view_students",
          "answer_questions",
          "view_analytics",
          "view_earnings",
        ],
      },
      admin: {
        user_type: "admin",
        description: "Admin role - Full system access",
        permissions: [
          "manage_users",
          "manage_roles",
          "approve_instructors",
          "approve_courses",
          "manage_categories",
          "view_all_courses",
          "view_all_users",
          "view_payments",
          "generate_reports",
          "manage_settings",
          "block_users",
          "refund_payments",
        ],
      },
    };
  }

  async initializeDefaultRoles() {
    try {
      const existingRolesCount = await UserRoles.countDocuments();

      if (existingRolesCount === 0) {
        const rolesToCreate = Object.values(this.defaultRoles);
        await UserRoles.insertMany(rolesToCreate);
        return {
          success: true,
          message: `Initialized ${rolesToCreate.length} default roles`,
        };
      }

      return {
        success: true,
        message: "Roles already initialized",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Create a new role
   */
  async createRole(roleData) {
    try {
      const { user_type, description, permissions = [] } = roleData;

      // Validate required fields
      if (!user_type) {
        throw new Error("Role type is required");
      }

      // Check if role already exists
      const existingRole = await UserRoles.findOne({ user_type });
      if (existingRole) {
        throw new Error(`Role '${user_type}' already exists`);
      }

      // Create new role
      const role = await UserRoles.create({
        user_type,
        description: description || `${user_type} role`,
        permissions,
      });

      return {
        success: true,
        data: role,
        message: "Role created successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Get all roles
   */
  async getAllRoles(filters = {}) {
    try {
      const roles = await UserRoles.find(filters).sort({ created_at: -1 });

      return {
        success: true,
        data: roles,
        total: roles.length,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Get role by ID
   */
  async getRoleById(roleId) {
    try {
      const role = await UserRoles.findById(roleId);

      if (!role) {
        throw new Error("Role not found");
      }

      return {
        success: true,
        data: role,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Get role by user_type
   */
  async getRoleByType(userType) {
    try {
      const role = await UserRoles.findOne({ user_type: userType });

      if (!role) {
        throw new Error(`Role '${userType}' not found`);
      }

      return {
        success: true,
        data: role,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Get or create role (used during registration)
   * If role doesn't exist, create it with default permissions
   */
  async getOrCreateRole(userType = "user") {
    try {
      // Try to find existing role
      let role = await UserRoles.findOne({ user_type: userType });

      // If not found, create it
      if (!role) {
        const defaultRole =
          this.defaultRoles[userType] || this.defaultRoles.user;
        role = await UserRoles.create(defaultRole);
      }

      return {
        success: true,
        data: role,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Update role
   */
  async updateRole(roleId, updateData) {
    try {
      const role = await UserRoles.findByIdAndUpdate(
        roleId,
        { $set: updateData },
        { new: true, runValidators: true },
      );

      if (!role) {
        throw new Error("Role not found");
      }

      return {
        success: true,
        data: role,
        message: "Role updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Delete role
   */
  async deleteRole(roleId) {
    try {
      // Check if any users have this role
      const usersWithRole = await Users.countDocuments({ role_id: roleId });

      if (usersWithRole > 0) {
        throw new Error(
          `Cannot delete role. ${usersWithRole} users are assigned to this role`,
        );
      }

      const role = await UserRoles.findByIdAndDelete(roleId);

      if (!role) {
        throw new Error("Role not found");
      }

      return {
        success: true,
        message: "Role deleted successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Add permission to role
   */
  async addPermission(roleId, permission) {
    try {
      const role = await UserRoles.findById(roleId);

      if (!role) {
        throw new Error("Role not found");
      }

      if (role.permissions.includes(permission)) {
        throw new Error("Permission already exists in this role");
      }

      role.permissions.push(permission);
      await role.save();

      return {
        success: true,
        data: role,
        message: "Permission added successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Remove permission from role
   */
  async removePermission(roleId, permission) {
    try {
      const role = await UserRoles.findById(roleId);

      if (!role) {
        throw new Error("Role not found");
      }

      role.permissions = role.permissions.filter((p) => p !== permission);
      await role.save();

      return {
        success: true,
        data: role,
        message: "Permission removed successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Check if role has specific permission
   */
  async hasPermission(roleId, permission) {
    try {
      const role = await UserRoles.findById(roleId);

      if (!role) {
        return {
          success: false,
          hasPermission: false,
          message: "Role not found",
        };
      }

      const hasPermission = role.permissions.includes(permission);

      return {
        success: true,
        hasPermission,
      };
    } catch (error) {
      return {
        success: false,
        hasPermission: false,
        message: error.message,
      };
    }
  }

  /**
   * Get users count by role
   */
  async getRoleStats(roleId) {
    try {
      const role = await UserRoles.findById(roleId);

      if (!role) {
        throw new Error("Role not found");
      }

      const userCount = await Users.countDocuments({ role_id: roleId });

      return {
        success: true,
        data: {
          role: role,
          userCount: userCount,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}

const roleService = new RoleService();
export default roleService;
