import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createProfile, updateProfile, getProfileById } from "../services/profile.service";
import { toast } from "react-hot-toast";

// Hook to create a profile
export const useCreateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createProfile,
        onSuccess: (data) => {
            toast.success("Profile created successfully!");
            // Invalidate queries to refresh data
            queryClient.invalidateQueries(["profile"]);
        },
        onError: (error) => {
            toast.error(error.message || "Failed to create profile");
        },
    });
};

// Hook to update a profile
export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateProfile,
        onSuccess: (data) => {
            toast.success("Profile updated successfully!");
            queryClient.invalidateQueries(["profile"]);
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update profile");
        },
    });
};

// Hook to get profile by ID
export const useGetProfile = (userId) => {
    return useQuery({
        queryKey: ["profile", userId],
        queryFn: () => getProfileById(userId),
        enabled: !!userId, // Only run if userId is provided
        retry: 1, // Retry once on failure
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
        onError: (error) => {
            toast.error(error.message || "Failed to fetch profile");
        }
    });
};
