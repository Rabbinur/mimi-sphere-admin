import { useGoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { userLogin } from '../Authentication/userLogin';
import { useAppDispatch } from '../Redux/hooks';
import { setToken, setUserInfo } from '../Redux/Slice/authSlice';
import { setTokens } from '@/utils/authCookie';

const GoogleLogin = () => {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const dispatch = useAppDispatch();

    const googleLoginBtn = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsLoading(true);
            const toastId = toast.loading('Logging in...', { position: 'top-center' });
            try {
                const { access_token } = tokenResponse;
                const res = await userLogin({ access_token });

                if (res?.data?.data?.isVerified) {
                    toast.success('Login successful!', { id: toastId });

                    const user = res.data.data;
                    const accessToken = res.data.access_token;
                    const refreshToken = res.data.refresh_token;

                    if (accessToken && refreshToken) {
                        setTokens(accessToken, refreshToken);
                        dispatch(setToken({ accessToken }));
                    }

                    dispatch(setUserInfo({
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        isVerified: user.isVerified,
                        phone: user.phone || "",
                        photo: user.photo || "",
                        role: user.role,
                        addresses: user.addresses || [],
                    }));

                    // Check for redirect URL in session storage
                    const redirectRoute = sessionStorage.getItem("redirect_to");
                    if (redirectRoute) {
                        try {
                            router.push(JSON.parse(redirectRoute));
                        } catch {
                            router.push(redirectRoute);
                        }
                        sessionStorage.removeItem("redirect_to");
                        setIsLoading(false);
                        return;
                    }

                    // Role-based redirection
                    if (user.role === "ADMIN") {
                        window.location.href = "/dashboard";
                    } else {
                        window.location.href = "/user-account";
                    }
                } else if (res?.data?.data && !res.data.data.isVerified) {
                    toast.error('Account not verified. Please contact support.', { id: toastId });
                } else {
                    toast.error(res?.message || 'Login failed. Please try again.', { id: toastId });
                }
            } catch (error: any) {
                toast.error(error?.message || 'Login failed. Please try again.', { id: toastId });
                console.error('Google login error:', error);
            } finally {
                setIsLoading(false);
            }
        },
        onError: () => {
            setIsLoading(false);
            toast.error('Google Login failed. Please try again.');
        }
    });

    return (
        <button
            disabled={isLoading}
            onClick={() => {
                if (!isLoading) googleLoginBtn();
            }}
            type="button"
            className={`w-full flex items-center justify-center py-2.5 px-4 border border-gray-200 bg-white text-gray-700 rounded-xl transition-all duration-200 shadow-sm font-medium ${isLoading ? 'opacity-70 cursor-not-allowed bg-gray-50' : 'hover:bg-gray-50 hover:border-gray-300 hover:scale-[1.01] active:scale-[0.99]'}`}
        >
            {isLoading ? (
                <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                </div>
            ) : (
                <>
                    <img
                        src="https://cdn-icons-png.flaticon.com/128/300/300221.png"
                        alt="Google"
                        className="w-5 h-5 mr-3"
                    />
                    Sign in with Google
                </>
            )}
        </button>

    );
};

export default GoogleLogin;
