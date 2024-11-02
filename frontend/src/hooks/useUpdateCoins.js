import { useMutation, useQueryClient } from "@tanstack/react-query"

const useUpdateCoins = ()=>{

    const queryClient=useQueryClient();
    const {mutate: joinGame, isPending}=useMutation({
        mutationFn: async(val) =>{
            try {
                const res=await fetch('/api/game/joined',{
                    method: 'POST',
                    headers:{
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({val: val})
                });
                const data=await res.json();
                if(!res.ok){
                    throw new Error(data.error || "Something went wrong!")
                }
                return data;
            } catch (error) {
                throw new Error(error.message)
            }
            
        },
        onSuccess:()=>{
            queryClient.invalidateQueries({queryKey: ["gamedata"]})
        }
    });

    const {mutate: gameWon, isPending: gameWonPending}=useMutation({
        mutationFn: async(val) =>{
            try {
                const res=await fetch('/api/game/won',{
                    method: 'POST',
                    headers:{
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({val: val})
                });
                const data=await res.json();
                if(!res.ok){
                    throw new Error(data.error || "Something went wrong!")
                }
                return data;
            } catch (error) {
                throw new Error(error.message)
            }
            
        },
        onSuccess:()=>{
            queryClient.invalidateQueries({queryKey: ["gamedata"]})
        }
    });

    const {mutate: gameLost, isPending: gameLostPending}=useMutation({
        mutationFn: async(val) =>{
            try {
                const res=await fetch('/api/game/lost',{
                    method: 'POST',
                    headers:{
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({val: val})
                });
                const data=await res.json();
                if(!res.ok){
                    throw new Error(data.error || "Something went wrong!")
                }
                return data;
            } catch (error) {
                throw new Error(error.message)
            }
            
        },
        onSuccess:()=>{
            queryClient.invalidateQueries({queryKey: ["gamedata"]})
        }
    });


    return {joinGame, gameLost,gameWon,gameWonPending,gameLostPending,isPending}
}

export default useUpdateCoins;