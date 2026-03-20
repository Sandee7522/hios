"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../component/DashboardLayout";
import { GET_PROFILE_BY_ID, CREATE_PROFILE, UPDATE_PROFILE } from "../utils/api";
import { requestWithAuth } from "../utils/apiClient";
import { getUserProfile, getAuthToken } from "../utils/auth";
import MyLoader from "@/components/landing/MyLoder";
import SuccessBox from "@/components/common/SuccessBox";
import ErrorBox from "@/components/common/ErrorBox";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    username: "",
    bio: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: { street: "", city: "", state: "", country: "", zipCode: "" },
    socialLinks: { linkedin: "", twitter: "", website: "" },
  });

  /* ---- Fetch profile ---- */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const cookieUser = getUserProfile();
        console.log("[Profile] Cookie user:", cookieUser);
        if (!cookieUser?._id) {
          console.warn("[Profile] No user _id in cookies");
          setLoading(false);
          return;
        }
        setUser(cookieUser);

        console.log("[Profile] Fetching profile for userId:", cookieUser._id);
        const res = await requestWithAuth(GET_PROFILE_BY_ID(cookieUser._id), {
          method: "GET",
          allowedRoles: ["user", "student", "instructor", "admin"],
        });
        console.log("[Profile] API response:", res);

        if (res?.status === 200 && res?.data) {
          const data = res.data;
          console.log("[Profile] Profile data loaded:", data);

          // Profile not created yet — just set user info from Users table
          if (data.profileNotCreated) {
            console.log("[Profile] No profile yet, user info:", data.user_id);
            setUser({ _id: cookieUser._id, name: data.user_id?.name, email: data.user_id?.email });
          } else {
            // Full profile exists
            setProfile(data);
            setUser({ _id: cookieUser._id, name: data.user_id?.name || cookieUser.name, email: data.user_id?.email || cookieUser.email });
            setForm({
              username: data.username || "",
              bio: data.bio || "",
              phone: data.phone || "",
              dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split("T")[0] : "",
              gender: data.gender || "",
              address: {
                street: data.address?.street || "",
                city: data.address?.city || "",
                state: data.address?.state || "",
                country: data.address?.country || "",
                zipCode: data.address?.zipCode || "",
              },
              socialLinks: {
                linkedin: data.socialLinks?.linkedin || "",
                twitter: data.socialLinks?.twitter || "",
                website: data.socialLinks?.website || "",
              },
            });
          }
        } else {
          console.warn("[Profile] Unexpected response:", res);
        }
      } catch (err) {
        console.error("[Profile] Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  /* ---- Handle form change ---- */
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  };

  const handleSocialChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [field]: value },
    }));
  };

  /* ---- Image preview ---- */
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  /* ---- Save profile ---- */
  const handleSave = async () => {
    setSaving(true);
    try {
      const token = getAuthToken();
      const isUpdate = !!profile;
      const url = isUpdate ? UPDATE_PROFILE : CREATE_PROFILE;

      console.log("[Profile] Save mode:", isUpdate ? "UPDATE" : "CREATE");
      console.log("[Profile] Form data:", form);
      console.log("[Profile] API URL:", url);

      const formData = new FormData();
      formData.append("username", form.username);
      formData.append("bio", form.bio);
      formData.append("phone", form.phone);
      formData.append("dateOfBirth", form.dateOfBirth);
      formData.append("gender", form.gender);
      formData.append("address", JSON.stringify(form.address));
      formData.append("socialLinks", JSON.stringify(form.socialLinks));

      // Send existing Cloudinary public_id so old image can be replaced
      if (profile?.profileImageId) {
        formData.append("oldProfilePublicId", profile.profileImageId);
      }

      const file = fileRef.current?.files?.[0];
      if (file) {
        console.log("[Profile] Uploading image:", file.name, file.size, "bytes");
        formData.append("profileImage", file);
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      console.log("[Profile] Save response:", res.status, data);

      if (res.ok) {
        setSuccessMsg(isUpdate ? "Profile updated!" : "Profile created!");
        setErrorMsg("");
        setEditing(false);
        setImagePreview(null);

        // Re-fetch full profile from DB (with populated user name/email)
        const freshRes = await requestWithAuth(GET_PROFILE_BY_ID(user._id), {
          method: "GET",
          allowedRoles: ["user", "student", "instructor", "admin"],
        });
        console.log("[Profile] Re-fetched after save:", freshRes);

        if (freshRes?.status === 200 && freshRes?.data && !freshRes.data.profileNotCreated) {
          setProfile(freshRes.data);
          setUser({ _id: user._id, name: freshRes.data.user_id?.name || user.name, email: freshRes.data.user_id?.email || user.email });
          setForm({
            username: freshRes.data.username || "",
            bio: freshRes.data.bio || "",
            phone: freshRes.data.phone || "",
            dateOfBirth: freshRes.data.dateOfBirth ? freshRes.data.dateOfBirth.split("T")[0] : "",
            gender: freshRes.data.gender || "",
            address: {
              street: freshRes.data.address?.street || "",
              city: freshRes.data.address?.city || "",
              state: freshRes.data.address?.state || "",
              country: freshRes.data.address?.country || "",
              zipCode: freshRes.data.address?.zipCode || "",
            },
            socialLinks: {
              linkedin: freshRes.data.socialLinks?.linkedin || "",
              twitter: freshRes.data.socialLinks?.twitter || "",
              website: freshRes.data.socialLinks?.website || "",
            },
          });
        }
      } else {
        setErrorMsg(data.message || "Failed to save profile");
        setSuccessMsg("");
      }
    } catch (err) {
      setErrorMsg(err.message || "Something went wrong");
      setSuccessMsg("");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="user">
        <MyLoader />
      </DashboardLayout>
    );
  }

  const profileImage = imagePreview || profile?.profileImage;
  const userName = user?.name || profile?.user_id?.name || "User";
  const userEmail = user?.email || profile?.user_id?.email || "";
  console.log("[Profile] Render — userName:", userName, "userEmail:", userEmail, "profile:", !!profile, "user:", user);

  return (
    <DashboardLayout role="user">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Notification Bars */}
        <SuccessBox message={successMsg} key={successMsg} />
        <ErrorBox message={errorMsg} key={errorMsg} />

        {/* ===== PROFILE HEADER CARD ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-800/50 to-blue-900/20 overflow-hidden"
        >
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-blue-600/30 via-purple-600/20 to-blue-600/30" />

          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="relative -mt-16 mb-4 flex items-end gap-5">
              <div
                className="relative w-28 h-28 rounded-2xl border-4 border-slate-900 overflow-hidden bg-slate-800 cursor-pointer group"
                onClick={() => editing && fileRef.current?.click()}
              >
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-blue-400 bg-blue-500/10">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
                {editing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>

              <div className="pb-1 flex-1">
                <h1 className="text-2xl font-bold text-white">{userName}</h1>
                <p className="text-sm text-slate-400">{userEmail}</p>
                {profile?.username && (
                  <p className="text-xs text-slate-500 mt-0.5">@{profile.username}</p>
                )}
              </div>

              {/* Edit / Save button */}
              <div className="pb-1">
                {!editing ? (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setEditing(true)}
                    className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 hover:bg-white/10 transition"
                  >
                    {profile ? "Edit Profile" : "Create Profile"}
                  </motion.button>
                ) : (
                  <div className="flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { setEditing(false); setImagePreview(null); }}
                      className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-400 hover:bg-white/10 transition"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleSave}
                      disabled={saving}
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm text-white font-medium transition disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save"}
                    </motion.button>
                  </div>
                )}
              </div>
            </div>

            {/* Bio (view mode) */}
            {!editing && profile?.bio && (
              <p className="text-sm text-slate-400 leading-relaxed">{profile.bio}</p>
            )}
          </div>
        </motion.div>

        {/* ===== EDIT FORM ===== */}
        <AnimatePresence>
          {editing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6 overflow-hidden"
            >
              {/* Personal Info */}
              <Section title="Personal Information">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Username" value={form.username} onChange={(v) => handleChange("username", v)} placeholder="johndoe" />
                  <Field label="Phone" value={form.phone} onChange={(v) => handleChange("phone", v)} placeholder="+91 98765 43210" />
                  <Field label="Date of Birth" value={form.dateOfBirth} onChange={(v) => handleChange("dateOfBirth", v)} type="date" />
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Gender</label>
                    <select
                      value={form.gender}
                      onChange={(e) => handleChange("gender", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:border-blue-500 focus:outline-none transition"
                    >
                      <option value="" className="bg-slate-900">Select</option>
                      <option value="male" className="bg-slate-900">Male</option>
                      <option value="female" className="bg-slate-900">Female</option>
                      <option value="other" className="bg-slate-900">Other</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <Field label="Bio" value={form.bio} onChange={(v) => handleChange("bio", v)} placeholder="Tell us about yourself..." textarea />
                </div>
              </Section>

              {/* Address */}
              <Section title="Address">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Street" value={form.address.street} onChange={(v) => handleAddressChange("street", v)} placeholder="123 Main St" />
                  <Field label="City" value={form.address.city} onChange={(v) => handleAddressChange("city", v)} placeholder="Mumbai" />
                  <Field label="State" value={form.address.state} onChange={(v) => handleAddressChange("state", v)} placeholder="Maharashtra" />
                  <Field label="Country" value={form.address.country} onChange={(v) => handleAddressChange("country", v)} placeholder="India" />
                  <Field label="Zip Code" value={form.address.zipCode} onChange={(v) => handleAddressChange("zipCode", v)} placeholder="400001" />
                </div>
              </Section>

              {/* Social Links */}
              <Section title="Social Links">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Field label="LinkedIn" value={form.socialLinks.linkedin} onChange={(v) => handleSocialChange("linkedin", v)} placeholder="https://linkedin.com/in/..." />
                  <Field label="Twitter" value={form.socialLinks.twitter} onChange={(v) => handleSocialChange("twitter", v)} placeholder="https://twitter.com/..." />
                  <Field label="Website" value={form.socialLinks.website} onChange={(v) => handleSocialChange("website", v)} placeholder="https://..." />
                </div>
              </Section>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== VIEW MODE — Info Cards ===== */}
        {!editing && profile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-5"
          >
            {/* Personal Details */}
            <InfoCard title="Personal Details" items={[
              { label: "Username", value: profile.username },
              { label: "Phone", value: profile.phone },
              { label: "Date of Birth", value: profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : null },
              { label: "Gender", value: profile.gender },
            ]} />

            {/* Address */}
            <InfoCard title="Address" items={[
              { label: "Street", value: profile.address?.street },
              { label: "City", value: profile.address?.city },
              { label: "State", value: profile.address?.state },
              { label: "Country", value: profile.address?.country },
              { label: "Zip", value: profile.address?.zipCode },
            ]} />

            {/* Social Links */}
            {(profile.socialLinks?.linkedin || profile.socialLinks?.twitter || profile.socialLinks?.website) && (
              <div className="sm:col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <h3 className="text-sm font-semibold text-white mb-4">Social Links</h3>
                <div className="flex flex-wrap gap-3">
                  {profile.socialLinks.linkedin && (
                    <SocialBadge label="LinkedIn" href={profile.socialLinks.linkedin} color="blue" />
                  )}
                  {profile.socialLinks.twitter && (
                    <SocialBadge label="Twitter" href={profile.socialLinks.twitter} color="sky" />
                  )}
                  {profile.socialLinks.website && (
                    <SocialBadge label="Website" href={profile.socialLinks.website} color="emerald" />
                  )}
                </div>
              </div>
            )}

            {/* Account Info */}
            <div className="sm:col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="text-sm font-semibold text-white mb-3">Account</h3>
              <div className="flex flex-wrap gap-6 text-sm">
                <div>
                  <span className="text-slate-500">Member since </span>
                  <span className="text-slate-300">
                    {profile.created_at
                      ? new Date(profile.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
                      : "N/A"}
                  </span>
                </div>
                {profile.instructorStatus && profile.instructorStatus !== "none" && (
                  <div>
                    <span className="text-slate-500">Instructor Status </span>
                    <span className={`capitalize font-medium ${
                      profile.instructorStatus === "approved" ? "text-emerald-400" :
                      profile.instructorStatus === "pending" ? "text-amber-400" : "text-red-400"
                    }`}>
                      {profile.instructorStatus}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* No profile yet */}
        {!editing && !profile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-slate-500"
          >
            <p className="text-lg mb-2">No profile created yet</p>
            <p className="text-sm">Click "Create Profile" above to get started.</p>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

function Section({ title, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", textarea = false }) {
  const cls = "w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none transition";
  return (
    <div>
      <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={`${cls} resize-none`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls}
        />
      )}
    </div>
  );
}

function InfoCard({ title, items }) {
  const filtered = items.filter((i) => i.value);
  if (filtered.length === 0) return null;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>
      <div className="space-y-3">
        {filtered.map((item, i) => (
          <div key={i} className="flex justify-between items-center">
            <span className="text-xs text-slate-500 uppercase tracking-wider">{item.label}</span>
            <span className="text-sm text-slate-300 capitalize">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SocialBadge({ label, href, color }) {
  const colorMap = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20",
    sky: "bg-sky-500/10 text-sky-400 border-sky-500/20 hover:bg-sky-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20",
  };
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${colorMap[color]}`}
    >
      {label}
    </a>
  );
}
