import { useMutation, useQueryClient } from '@tanstack/react-query';
import React from 'react'
import toast from 'react-hot-toast';

const useUpdateProfileImg = () => {
    const queryClient = useQueryClient();
    const {mutate: updateProfileImg, isPending} = useMutation({
        mutationFn: async (profileImg) => {
            try {
                const res = await fetch('/api/user/update', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ profileImg: profileImg })
                })
                const data = await res.json();
                console.log(data);
                if (!res.ok) {
                    throw new Error(data.error || "Something went wrong!")
                }
                return data;
            } catch (error) {
                throw new Error(error.message)
            }
        },
        onSuccess: () => {
            toast.success("Profile image updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["authUser"] })
    }});

    return {updateProfileImg, isPending}
}

export default useUpdateProfileImg
