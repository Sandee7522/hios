"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "lucide-react";

export default function ApplyCoursePage() {
  const { id } = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState({
    // Personal
    fullName: "",
    email: "",
    phone: "",
    city: "",
    country: "",

    // Education
    qualification: "",
    fieldOfStudy: "",
    college: "",

    // Technical
    skillLevel: "",
    technologies: "",
    github: "",
    linkedin: "",

    // Motivation
    message: "",
    careerGoals: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise((res) => setTimeout(res, 1000));

      console.log("Submitted Data:", formData);

      alert("Application submitted successfully ✅");
      router.push("/dashboard/courses");
    } catch (error) {
      alert("Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center bg-slate-950 p-6">
      <Card className="w-full max-w-4xl shadow-xl border border-slate-800">
        {" "}
        <CardHeader>
          <CardTitle>Apply for Course</CardTitle>
          <CardDescription>
            Fill the form below to apply for course ID: {id}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">📌 Personal Info</h3>

              <Input
                placeholder="Full Name *"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />

              <Input
                type="email"
                placeholder="Email Address *"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <Input
                type="tel"
                placeholder="Phone Number *"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />

              <Input
                placeholder="City *"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />

              <Input
                placeholder="Country *"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
              />
            </div>

            {/* Education */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">🎓 Educational Info</h3>

              <Input
                placeholder="Highest Qualification *"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                required
              />

              <Input
                placeholder="Field of Study *"
                name="fieldOfStudy"
                value={formData.fieldOfStudy}
                onChange={handleChange}
                required
              />

              <Input
                placeholder="College / University "
                name="college"
                value={formData.college}
                onChange={handleChange}
              />
            </div>

            {/* Technical */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">💻 Technical Info</h3>

              <Input
                placeholder="Current Skill Level (Beginner / Intermediate / Advanced"
                name="skillLevel"
                value={formData.skillLevel}
                onChange={handleChange}
                required
              />

              <Textarea
                placeholder="Technologies Known"
                name="technologies"
                value={formData.technologies}
                onChange={handleChange}
                rows={3}
                required
              />

              <Input
                placeholder="GitHub Profile"
                name="github"
                value={formData.github}
                onChange={handleChange}
              />

              <Input
                placeholder="LinkedIn Profile"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
              />
            </div>

            {/* Motivation */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">🔥 Motivation</h3>

              <Textarea
                placeholder="Why do you want to join this course?"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                required
              />

              <Textarea
                placeholder="What are your career goals?"
                name="careerGoals"
                value={formData.careerGoals}
                onChange={handleChange}
                rows={3}
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader className="mr-2 animate-spin" size={16} />
                  Submitting...
                </>
              ) : (
                "Apply Now"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
