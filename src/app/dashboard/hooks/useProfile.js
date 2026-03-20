import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createProfile, updateProfile, getProfileById } from "../services/profile.service";

// Hook to create a profile
export const useCreateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createProfile,
        onSuccess: () => {
            queryClient.invalidateQueries(["profile"]);
        },
    });
};

// Hook to update a profile
export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateProfile,
        onSuccess: () => {
            queryClient.invalidateQueries(["profile"]);
        },
    });
};

// Hook to get profile by ID
export const useGetProfile = (userId) => {
    return useQuery({
        queryKey: ["profile", userId],
        queryFn: () => getProfileById(userId),
        enabled: !!userId,
        retry: 1,
        staleTime: 1000 * 60 * 5,
    });
};
