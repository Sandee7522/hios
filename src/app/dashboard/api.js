export const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

// **********************************            *************************************
//                                   ADMIN API'S
// **********************************            *************************************

export const GET_ALL_USERS = `${API_URL}/auth/getAllUsers`;
export const CREATE_ROLE = `${API_URL}/roleAssign/roles`;
export const GET_ALL_ROLES = `${API_URL}/roleAssign/roles`;
export const ASSIGN_ROLE = `${API_URL}/auth/assignRole`;


// **********************************            *************************************
//                                   INSTRUCTOR API'S
// **********************************            *************************************

// instructor course api's
export const GET_INSTRUCTOR_COURSES = `${API_URL}/instructor/courses`;
export const CREATE_COURSE = `${API_URL}/instructor/courses/create`;
export const UPDATE_COURSE = `${API_URL}/instructor/courses/update`;
export const DELETE_COURSE = `${API_URL}/instructor/courses/delete`;

// instructor student api's
export const GET_COURSE_STUDENTS = `${API_URL}/instructor/students`;
export const GET_STUDENT_PROGRESS = `${API_URL}/instructor/students/progress`;

// instructor assignment api's
export const CREATE_ASSIGNMENT = `${API_URL}/instructor/assignments/create`;
export const GET_ASSIGNMENTS = `${API_URL}/instructor/assignments`;
export const GRADE_ASSIGNMENT = `${API_URL}/instructor/assignments/grade`;
