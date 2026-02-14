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
