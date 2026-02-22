import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // or react-router depending on your setup
import { GET_COURSE_BY_SLUG } from "../api";

export default function GetCourseBySlug() {
  const { slug } = useParams(); // ✅ get slug from URL

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;
    fetchCourse();
  }, [slug]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(GET_COURSE_BY_SLUG(slug));
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.message || "Course not found");
        return;
      }

      setCourse(json.data);
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- LOADING ---------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg animate-pulse">Loading course...</p>
      </div>
    );
  }

  /* ---------- ERROR ---------- */
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  /* ---------- RENDER ---------- */
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      {/* Thumbnail */}
      {course.thumbnail && (
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-72 object-cover rounded-xl mb-6"
        />
      )}

      {/* Title & Meta */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
        <p className="text-gray-500 text-sm mb-1">
          By <span className="font-medium text-gray-700">{course.instructorId?.name}</span>
          {" · "}
          <span>{course.categoryId?.name}</span>
          {" · "}
          <span className="capitalize">{course.level}</span>
          {" · "}
          <span className="capitalize">{course.courseLanguage}</span>
        </p>

        {/* Tags */}
        {course.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {course.tags.map((tag, i) => (
              <span
                key={i}
                className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Description */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">About this Course</h2>
        <p className="text-gray-600 leading-relaxed">{course.description}</p>
      </div>

      {/* What You'll Learn */}
      {course.whatYouWillLearn?.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">What You'll Learn</h2>
          <ul className="list-disc list-inside space-y-1">
            {course.whatYouWillLearn.map((item, i) => (
              <li key={i} className="text-gray-600">{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Requirements */}
      {course.requirements?.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Requirements</h2>
          <ul className="list-disc list-inside space-y-1">
            {course.requirements.map((req, i) => (
              <li key={i} className="text-gray-600">{req}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Duration */}
      {course.duration && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Duration</h2>
          <p className="text-gray-600">
            {course.duration.hours}h {course.duration.minutes}m
          </p>
        </div>
      )}

      {/* Pricing */}
      <div className="bg-gray-50 border rounded-xl p-6 mb-6">
        <h2 className="text-xl font-semibold mb-3">Pricing</h2>
        <div className="flex items-center gap-4">
          <span className="text-3xl font-bold text-green-600">
            ₹{course.price}
          </span>
          {course.discount > 0 && (
            <span className="text-gray-400 line-through text-lg">
              ₹{course.totalFee}
            </span>
          )}
          {course.discount > 0 && (
            <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full">
              ₹{course.discount} off
            </span>
          )}
        </div>

        {course.partialPaymentEnabled && (
          <p className="text-sm text-gray-500 mt-2">
            Partial payment available. Minimum: ₹{course.minimumPayment}
          </p>
        )}

        <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition">
          Enroll Now
        </button>
      </div>

    </div>
  );
}