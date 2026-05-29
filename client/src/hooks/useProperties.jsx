import React, { useEffect } from 'react'
import { propertiesAPI } from '../lib/firebaseAPI'
import { useQuery } from "@tanstack/react-query";

export const useProperties = (params = {}) => {
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["allProperties", params],
        queryFn: () => propertiesAPI.getAll(params),
        retry: 3,
        retryDelay: 1000,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: false,
    });

    // Enhanced error logging
    if (isError && import.meta.env.DEV) {
        console.error('🚨 useProperties error:', isError);
    }

    if (data && import.meta.env.DEV) {
        console.log('📊 Properties data loaded:', {
            hasData: !!data,
            propertiesCount: data.properties?.length || 0,
            pagination: data.pagination
        });
    }

    return {
        data,
        isLoading,
        isError,
        refetch
    }
}

export const useProperty = (id) => {
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['property', id],
        queryFn: () => propertiesAPI.getById(id),
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
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['featuredProperties', limit],
        queryFn: () => propertiesAPI.getFeatured(limit),
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