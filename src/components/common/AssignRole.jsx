"use client";

import { useEffect, useState } from "react";

import MyLoader from "@/components/landing/MyLoder";
import { ASSIGN_ROLE, GET_ALL_ROLE } from "@/app/dashboard/utils/api";
import styles from "@/app/dashboard/dashboard.module.css";
import { requestWithAuth } from "@/app/dashboard/utils/apiClient";
import { FiUsers } from "react-icons/fi";
export default function AssignRole({ user, onClose, onSuccess }) {
  console.log("::::::::::::::::::", user.id);
  const [roles, setRoles] = useState([]);
  const [roleId, setRoleId] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchRoles = async () => {
    try {
      setLoading(true);

      const result = await requestWithAuth(GET_ALL_ROLE, {
        method: "GET",
        allowedRoles: ["admin"],
      });
      console.log("API result:", JSON.stringify(result));

      if (result?.data) {
        setRoles(result.data);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleAssign = async () => {
    try {
      if (!roleId) return;

      setLoading(true);

      const payload = {
        user_id: user.id,
        role_id: roleId,
      };
      console.log("::::::::::::::::::::PAYLOAD:::::::::::::::::", payload);
      const result = await requestWithAuth(ASSIGN_ROLE, {
        method: "POST",
        body: payload,
        allowedRoles: ["admin"],
      });

      console.log("API result:", JSON.stringify(result));

      if (result?.status === 200) {
        onSuccess("Role assigned successfully");
        onClose();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black/45 flex justify-center items-center z-2000">
      <div className="bg-gray-800 p-8 rounded-lg w-90 shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
        {" "}
        <h3 style={{ marginBottom: "10px", display: "flex", gap: "1rem" }}>
          <FiUsers size={23} color="blue" /> Assign Role
        </h3>
        <p className="mb-10 text-sm">
          Are you sure you want to assign role to User <b>{user?.name}</b>?
        </p>
        {loading ? (
          <MyLoader />
        ) : (
          <select
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            className={styles.formInput}
          >
            <option value="">Select Role</option>

            {roles.map((role) => (
              <option key={role._id} value={role._id}>
                {role.user_type}
              </option>
            ))}
          </select>
        )}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "20px",
            justifyContent: "space-between",
          }}
        >
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={handleAssign}
          >
            Assign
          </button>

          <button
            className="ml-3 border-2 p-2 rounded-lg  text-red-600 hover:text-red-800"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
