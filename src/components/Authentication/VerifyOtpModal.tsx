"use client";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useResendVerifyOTPMutation,
  useVerifyOTPMutation,
} from "../Redux/RTK/authApi";
import { setToken, setUserInfo } from "../Redux/Slice/authSlice";
import { useAppDispatch } from "../Redux/hooks";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { setTokens } from "@/utils/authCookie";

interface VerifyOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  loginData: { email: string; password: string } | null;
}

const VerifyOtpModal: React.FC<VerifyOtpModalProps> = ({
  isOpen,
  onClose,
  loginData,
}) => {
  const [value, setValue] = useState("");
  const [timer, setTimer] = useState(0);
  const [resendVerifyAuthOtp, { isLoading: resending }] =
    useResendVerifyOTPMutation();
  const [verifyAuthOtp, { isLoading }] = useVerifyOTPMutation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [otpLoading, setLoading] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleResendOtp = async () => {
    const toastId = toast.loading("Resending OTP...");
    setValue("");
    setTimer(15);
    const resendData = {
      email: loginData?.email,
    };
    try {
      const response = await resendVerifyAuthOtp(resendData).unwrap();
      console.log("OTP Responsive", response);
      if (response?.statusCode === 200) {
        toast.success(response?.message, {
          id: toastId,
          duration: 1000,
        });
      } else {
        toast.error(
          response?.message || "OTP verification failed.",
          {
            id: toastId,
            duration: 1000,
          }
        );
      }
    } catch (err) {
      toast.error("Failed to verify OTP.", { id: toastId });
    }
  };
  const handleOtpChange = (otp: string) => {
    setValue(otp);
  };
  // console.log(loginData);
  const handleVerifyOtp = async () => {
    const toastId = toast.loading("Verification Processing...");
    setLoading(true);

    if (!loginData?.email) {
      setLoading(false);
      toast.error("User email is missing.", { id: toastId });
      return;
    }

    if (!loginData) {
      setLoading(false);
      toast.error("Login data is missing.", { id: toastId });
      return;
    }

    const verifyData = {
      email: loginData.email,
      otp: value,
    };

    try {
      const response = await verifyAuthOtp(verifyData).unwrap();
      if (response?.statusCode === 200) {
        toast.success(response?.message, {
          id: toastId,
          duration: 1000,
        });

        // Use the data directly from the verification response
        const user = response.data.data;
        const accessToken = response.data.access_token;
        const refreshToken = response.data.refresh_token;

        if (user?.isVerified === true) {
          if (accessToken && refreshToken) {
            setTokens(accessToken, refreshToken);
            dispatch(setToken({ accessToken }));
          }
          dispatch(
            setUserInfo({
              _id: user._id,
              email: user.email,
              name: user.name,
              isVerified: user.isVerified,
              phone: user.phone,
              photo: user.photo,
              role: user.role,
              addresses: user.addresses || [],
            })
          );

          toast.success("Login Successfully", { id: toastId, duration: 2000 });

          const redirectRoute = sessionStorage.getItem("redirect_to");
          if (redirectRoute) {
            try {
              router.push(JSON.parse(redirectRoute));
            } catch (e) {
              router.push(redirectRoute);
            }
            sessionStorage.removeItem("redirect_to");
            return;
          }

          if (user.role === "ADMIN") {
            router.push("/dashboard");
          } else {
            router.push("/user-account");
          }
          onClose();
          setLoading(false);
        } else {
          setLoading(false);
          toast.error("Account verification incomplete.", { id: toastId, duration: 2000 });
        }
      } else {
        // Handle error case properly
        let errorMsg = "Something went wrong.";

        if (response?.data?.error?.status === 400 && response?.data?.error?.data?.message === "User already verified") {
          errorMsg = "User already verified";
        } else if (response?.data?.error?.data?.message) {
          errorMsg = response?.data?.error?.data?.message;
        }
        toast.error(errorMsg, { id: toastId, duration: 2000 });
        setLoading(false);
      }
    } catch (err) {
      console.error("Error during OTP verification:", err);
      toast.error("Failed to verify OTP.", { id: toastId });
      setLoading(false);
    }
  };
  return (
    <Dialog open={isOpen}>
      <DialogContent
        className="sm:max-w-[425px] opt-x bg-white"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}

      // hideCloseButton
      >


        <DialogTitle className="sr-only">OTP Verification</DialogTitle>
        <DialogDescription className="sr-only">
          Verify your email by entering the OTP sent to you.
        </DialogDescription>


        <div className=" flex flex-col justify-center items-center ">
          {timer > 0 ? (
            <div className="flex flex-col justify-center items-center">
              <Image
                src={"https://cdn-icons-png.flaticon.com/128/9731/9731748.png"}
                alt="Timer Icon"
                width={100}
                height={100}
                className="object-contain"
                style={{ width: '56px', height: '56px' }}
              />
              <h1 className="text-center text-dark text-base font-medium">
                Wait {timer}s to resend.
              </h1>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center">
              <Image
                src={"https://cdn-icons-png.flaticon.com/128/9731/9731748.png"}
                alt="Enter OTP Icon"
                width={100}
                height={100}
                className="object-contain"
                style={{ width: '56px', height: '56px' }}
              />
              <h1 className="text-center text-dark text-base font-medium">
                Enter OTP Code
              </h1>
            </div>
          )}
        </div>
        <div className="w-full h-16 flex flex-col justify-center items-center">
          <InputOTP
            maxLength={6}
            pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
            onChange={handleOtpChange}
            value={value}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          {timer === 0 && (
            <h1
              onClick={handleResendOtp}
              className="text-center text-base font-medium underline cursor-pointer"
            >
              Resend Code
            </h1>
          )}
        </div>

        <button
          disabled={isLoading || resending || otpLoading}
          onClick={handleVerifyOtp}
          className=" w-[60%] mx-auto bg-yellow-700 text-white text-sm py-2 px-6 rounded-full"
        >
          {isLoading || otpLoading ? "Verifying..." : "Verify Code"}
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default VerifyOtpModal;
