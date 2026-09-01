'use client';

import { getAccessToken } from '@/utils/authCookie';
import { ReactNode, useEffect, useMemo } from 'react';
import { useAppDispatch } from '../Redux/hooks';
import { useAuthCheckQuery } from '../Redux/RTK/authApi';
import { setToken, setUserInfo } from '../Redux/Slice/authSlice';

type Props = {
    children: ReactNode;
};

export default function AuthProvider({ children }: Props) {
    const dispatch = useAppDispatch();

    // ✅ make token stable
    const accessToken = useMemo(() => getAccessToken(), []);

    // ✅ skip if no token
    const { data, isSuccess } = useAuthCheckQuery(undefined, {
        skip: !accessToken,
    });

    // ✅ run once
    useEffect(() => {
        if (accessToken) {
            dispatch(setToken({ accessToken }));
        }
    }, [accessToken]);

    // ✅ only when API success
    useEffect(() => {
        if (isSuccess && data?.success && data?.data) {
            const user = data.data;

            dispatch(
                setUserInfo({
                    _id: user._id,
                    email: user.email,
                    name: user.name,
                    isVerified: user.isVerified,
                    role: user.role,
                    phone: user.phone_number || user.phone,
                    photo: user.photo,
                    addresses: user.addresses || [],
                })
            );
        }
    }, [isSuccess, data]);

    return <>{children}</>;
}