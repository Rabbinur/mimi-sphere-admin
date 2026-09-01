"use client"

import dynamic from "next/dynamic";
const VerifyOtpModal = dynamic(() => import("@/components/Authentication/VerifyOtpModal"), { ssr: false });
const GoogleLogin = dynamic(() => import("@/components/custom/GoogleLogin"), { ssr: false });

import { userLogin } from "@/components/Authentication/userLogin";
import { setToken, setUserInfo } from "@/components/Redux/Slice/authSlice";
import { useAppDispatch } from "@/components/Redux/hooks";

import { setTokens } from "@/utils/authCookie";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface LoginFormInputs {
  email: string
  password: string
}

const LoginPage = () => {
  const [staySignedIn, setStaySignedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false)
  const [isVerifyModal, setVerifyModal] = useState(false)
  const closeModal = () => setVerifyModal(false)
  const [loading, setLoading] = useState(false)
  const [loginData, setLoginData] = useState<{
    email: string
    password: string
  } | null>(null)
  const [hasRedirect, setHasRedirect] = useState(false)

  const dispatch = useAppDispatch()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormInputs>()

  useEffect(() => {
    const redirectRoute = sessionStorage.getItem("redirect_to")
    setHasRedirect(!!redirectRoute)
  }, [])

  const onSubmit = async (data: LoginFormInputs) => {
    setLoading(true)
    const toastId = toast.loading("Login Processing !")
    setLoginData({
      email: data.email,
      password: data.password,
    })

    try {
      const res = await userLogin(data)
      console.log(res)
      if (res?.data?.data?.isVerified === false) {
        toast.success("OTP sent! Please verify.", { id: toastId })
        reset()
        setLoading(false)
        setVerifyModal(true)
      } else if (res?.data?.data?.isVerified === true) {
        const user = res.data.data;
        const accessToken = res.data.access_token;
        const refreshToken = res.data.refresh_token;

        // Set Tokens FIRST
        if (accessToken && refreshToken) {
          setTokens(accessToken, refreshToken);
          dispatch(setToken({ accessToken }));
        }

        // Then set User Info
        dispatch(
          setUserInfo({
            _id: user._id,
            email: user.email,
            name: user.name,
            isVerified: user.isVerified,
            role: user.role,
            phone: user.phone,
            photo: user.photo,
            addresses: user.addresses || [],
          }),
        )
        reset()
        toast.success("Login Successfully", { id: toastId, duration: 2000 })
        const redirectRoute = sessionStorage.getItem("redirect_to")
        if (redirectRoute) {
          try {
            // Try to parse if it's a JSON string
            router.push(JSON.parse(redirectRoute))
          } catch (e) {
            // Fallback to raw string if parsing fails
            router.push(redirectRoute)
          }
          sessionStorage.removeItem("redirect_to")
          return
        }

        setLoading(false)
        if (user.role === "ADMIN") {
          window.location.href = "/dashboard"
          return
        }
        window.location.href = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/user-account` || "/user-account"
      } else {
        toast.error(res?.message || "Valid Information Provide!", {
          id: toastId,
          duration: 2000,
        })
        setLoading(false)
      }
    } catch (err) {
      console.error("Error:", "Something went wrong")
      setLoading(false)
      toast.error("Something went wrong", { id: toastId, duration: 2000 }) // Add error toast
    }
  }

  return (
    <div className="relative md:min-h-screen w-full bg-gray-50">
      <div className="relative z-10 md:min-h-screen flex items-center justify-center container mx-auto px-2">
        <VerifyOtpModal
          isOpen={isVerifyModal}
          onClose={closeModal}
          loginData={loginData}
        />

        <div className="max-w-md w-full bg-white rounded-lg shadow-none p-2 md:p-8 transform transition-all duration-500 ease-out opacity-100 translate-y-0">
          <div className="text-center my-2">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
              Login
            </h1>

            <p className="text-gray-600 text-base">
              Sign in to manage your account
            </p>
          </div>

          {/* ❌ Removed "New here? Create Account" from here */}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  {...register("email", {
                    required: "Please enter your email address.",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Please enter a valid email address.",
                    },
                  })}
                  type="email"
                  id="email"
                  className={`w-full pl-10 pr-4 py-2 md:py-3 border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-primary focus:border-primary transition-all placeholder:text-gray-400 ${errors.email ? "border-red-500" : "hover:border-gray-400"
                    }`}
                  placeholder="name@example.com"
                />
              </div>
              {errors.email && (
                <div className="flex items-center mt-2 text-red-600 text-sm">
                  <span className="mr-2">⚠️</span>
                  <p>{errors.email.message}</p>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters long",
                    },
                  })}
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className={`w-full pl-10 pr-12 py-2 md:py-3 border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-primary focus:border-primary transition-all placeholder:text-gray-400 ${errors.password ? "border-red-500" : "hover:border-gray-400"
                    }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center mt-2 text-red-600 text-sm">
                  <span className="mr-2">⚠️</span>
                  <p>{errors.password.message}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={staySignedIn}
                  onChange={(e) => setStaySignedIn(e.target.checked)}
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-primary"
                />
                <span className="ml-2 text-sm text-gray-600">Stay signed in</span>
              </label>

              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:text-primary/80 transition-colors duration-200 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 text-lg font-bold rounded-lg transition-all shadow-md shadow-primary/20 mt-8"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>





        </div>
      </div>
    </div>


  )
}

export default LoginPage

