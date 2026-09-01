"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useSubscribeNewsletterMutation } from "../Redux/RTK/newsletterApi";

const NewsletterForm = () => {
    const [email, setEmail] = useState("");
    const [subscribe, { isLoading }] = useSubscribeNewsletterMutation();

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        try {
            await subscribe({ email }).unwrap();
            toast.success("Welcome to the community!");
            setEmail("");
        } catch (err: any) {
            toast.error(err?.data?.message || "Something went wrong");
        }
    };

    return (
        <form onSubmit={handleSubscribe} className="relative group">
            <input
                type="email"
                required
                placeholder="Enter your email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email address for newsletter"
                className="w-full pl-5 pr-32 py-4 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all bg-white shadow-sm"
            />
            <button
                type="submit"
                disabled={isLoading}
                aria-label="Subscribe to newsletter"
                className="absolute right-1.5 top-1.5 px-6 py-2.5 bg-primary text-white text-[10px] font-bold rounded-full hover:bg-primary/80 active:scale-95 transition-all uppercase tracking-widest disabled:opacity-50"
            >
                {isLoading ? "Wait..." : "Join Now"}
            </button>
        </form>
    );
};

export default NewsletterForm;
