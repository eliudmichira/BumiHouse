import React, { useEffect } from 'react'
import { propertiesAPI } from '../lib/firebaseAPI'
import {useQuery} from "@tanstack/react-query";

export const useProperties = () => {
    const { data, isLoading, isError, refetch} = useQuery({
       queryKey: ["allProperties"], 
       queryFn:  () => propertiesAPI.getAll(), 
       //  refetchOnWindowFocus: true,
    });
    //  console.log(data)
    return {
        data,
        isLoading,
        isError,
        refetch
    }
}

export const useProperty = (id) => {
    const { data, isLoading, isError, refetch} = useQuery({
      queryKey: ['property', id], 
      queryFn:  () => propertiesAPI.getById(id), 
      //  enabled: !!id,
      refetchOnWindowsFocus: false,
    });
// console.log(data)
    return {
        data,
        isLoading,
        isError,
        refetch
    }
}

// New hook for featured properties
export const useFeaturedProperties = (limit = 6) => {
    const { data, isLoading, isError, refetch} = useQuery({
      queryKey: ['featuredProperties', limit], 
      queryFn:  () => propertiesAPI.getFeatured(limit), 
      refetchOnWindowsFocus: false,
    });

    return {
        data,
        isLoading,
        isError,
        refetch
    }
}
 
        
// export default useProperties;