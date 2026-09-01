import { AlertCircle, Home } from "lucide-react";
import Link from "next/link";

const NotFound = () => {
    return (
        <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-900 px-6 py-24 sm:py-32 lg:px-8">
            {/* Background Decorative Element */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute left-[50%] top-0 h-[64rem] w-[128rem] -translate-x-[50%] stroke-gray-200 dark:stroke-gray-800 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)]">
                    <svg aria-hidden="true" className="h-full w-full">
                        <defs>
                            <pattern
                                id="grid"
                                width="80"
                                height="80"
                                x="50%"
                                y="-1"
                                patternUnits="userSpaceOnUse"
                            >
                                <path d="M.5 200V.5H200" fill="none" />
                            </pattern>
                        </defs>
                        <rect
                            width="100%"
                            height="100%"
                            strokeWidth="0"
                            fill="url(#grid)"
                        />
                    </svg>
                </div>
            </div>

            <div className="text-center">
                {/* Icon and Error Code */}
                <div className="flex justify-center mb-6">
                    <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                        <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-500" />
                    </div>
                </div>

                <p className="text-base font-semibold text-primary">404 Error</p>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
                    Page not found
                </h1>
                <p className="mt-6 text-base leading-7 text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    Sorry, we couldn’t find the page you’re looking for. It might have
                    been moved or the URL was mistyped.
                </p>

                <div className="mt-10 flex items-center justify-center gap-x-6">
                    <Link
                        href="/"
                        className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all duration-200 hover:-translate-y-0.5"
                    >
                        <Home size={18} />
                        Back to homepage
                    </Link>

                    <Link
                        href="/contact"
                        className="text-sm font-semibold text-gray-900 dark:text-gray-300 hover:text-primary transition-colors"
                    >
                        Contact support <span aria-hidden="true">&rarr;</span>
                    </Link>
                </div>
            </div>
        </main>
    );
};

export default NotFound;
