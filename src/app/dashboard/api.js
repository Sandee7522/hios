/**
 * API base URL used by the frontend.
 *
 * In this repo you are using Next.js App Router route handlers under `src/app/api/**`.
 * That means the safest default is calling same-origin endpoints like `/api/auth/login`.
 *
 * If you later deploy a separate backend, set `NEXT_PUBLIC_API_URL` to something like:
 * - `https://your-backend.com/api`
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

// **********************************            *************************************
//                                   USERS API'S
// **********************************            *************************************

// user auth api's
export const REGISTER = `${API_URL}/auth/register`;
export const LOGIN = `${API_URL}/auth/login`;
export const LOGOUT = `${API_URL}/auth/logout`;
export const FORGET_PASSWORD = `${API_URL}/auth/forgetPassword`;
export const RESET_PASSWORD = `${API_URL}/auth/resetPassword`;
export const CREATE_PROFILE = `${API_URL}/auth/profile/createProfile`;
export const UPDATE_PROFILE = `${API_URL}/auth/profile/updateProfile`;
export const GET_POFILE_BY_ID = `${API_URL}/post/getProfileById`;
export const GET_ALL_CATEGORY = `${API_URL}/category/getAllCategory`;
export const GET_ALL_COURSES = `${API_URL}/courses/getAllCourse`;
export const GET_COURSE_BY_SLUG = (slug) => `${API_URL}/courses/${slug}`;
export const GET_ALL_MODULES_BYID = `${API_URL}/admin/module/getAllModules`;
export const MODULE_BY_COURSEID = `${API_URL}/admin/module/getModuleById`;
export const GET_LESSON = `${API}/admin/lesson/getLesson`;

// **********************************            *************************************
//                                   ADMIN API'S
// **********************************            *************************************

export const GET_ALL_USERS = `${API_URL}/auth/getAllUsers`;
export const CREATE_ROLE = `${API_URL}/roleAssign/roles`;
export const GET_ALL_ROLES = `${API_URL}/roleAssign/roles`;
export const ASSIGN_ROLE = `${API_URL}/auth/assignRole`;

// not integrated thes API
export const GET_ALL_COURSES_ADMIN = `${API_URL}/admin/course/getAllCourse`;
export const GET_COURSE_BY_ID_ADMIN = `${API_URL}/admin/course/getCourseById`;
export const UPDATE_COURSE_ADMIN = `${API_URL}/admin/course/updateCourse`;
export const DELETE_COURSE_ADMIN = `${API_URL}/admin/course/deleteCourse`;
export const CREATE_MODULE_ADMIN = `${API_URL}/admin/module/createModule`;
export const UPDATE_MODULE_ADMIN = `${API_URL}/admin/module/updateModule`;
export const DELETE_MODULE_ADMIN = `${API_URL}/admin/module/deleteModule`;
export const GET_ALL_MODULES_BYID_ADMIN = `${API_URL}/admin/module/getAllModules`;
export const MODULE_BY_COURSEID_ADMIN = `${API_URL}/admin/module/getModuleById`;
export const RECODER_MODULE_ADMIN = `${API_URL}/admin/module/recodeModule`;
export const CREATE_LESSON_ADMIN = `${API_URL}/admin/lesson/createLesson`;
export const DELETE_LESSON_ADMIN = `${API_URL}/admin/lesson/deleteLesson`;
export const GET_LESSON_ADMIN = `${API}/admin/lesson/getLesson`;
export const RE_ORDER_LESSON = `${API_URL}/admin/lesson/reOrderLesson`;
export const UPDATE_LESSON = `${API_URL}/admin/lesson/updateLesson`;

// **********************************            *************************************
//                                   INSTRUCTOR API'S
// **********************************            *************************************

// instructor course api's
// NOTE: These paths map to Next.js route handlers under `src/app/api/instructor/course/**`
export const GET_INSTRUCTOR_COURSES = `${API_URL}/instructor/course/getAllCourse`;
export const CREATE_COURSE = `${API_URL}/instructor/course/createCourse`;
export const UPDATE_COURSE = `${API_URL}/instructor/course/updateCourse`;
export const GET_INSTRUCTOR_COURSE_BY_ID = `${API_URL}/instructor/course/getCourseById`;

// instructor student api's
export const GET_COURSE_STUDENTS = `${API_URL}/instructor/students`;
export const GET_STUDENT_PROGRESS = `${API_URL}/instructor/students/progress`;

// instructor assignment api's
export const CREATE_ASSIGNMENT = `${API_URL}/instructor/assignments/create`;
export const GET_ASSIGNMENTS = `${API_URL}/instructor/assignments`;
export const GRADE_ASSIGNMENT = `${API_URL}/instructor/assignments/grade`;
