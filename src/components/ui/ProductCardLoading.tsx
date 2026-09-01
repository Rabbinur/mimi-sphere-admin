const ProductCardLoading = () => {
    return (
        <div className="border border-gray-300 w-full relative rounded-md overflow-hidden flex flex-col animate-pulse">

            {/* Image Skeleton */}
            <div className="relative mb-2">
                <div className="h-[200px] md:h-[300px] w-full bg-gray-200" />
            </div>

            {/* Content */}
            <div className="p-1.5 md:p-2 pt-0 flex flex-col flex-grow">

                {/* Title */}
                <div className="h-4 md:h-5 bg-gray-200 rounded w-4/5 mt-2 mb-2" />

                {/* Variant selector skeleton */}
                <div className="mb-2">
                    <div className="h-3 bg-gray-200 rounded w-1/3 mb-1" />
                    <div className="h-9 bg-gray-200 rounded-md w-full" />
                </div>

                {/* Price row */}
                <div className="flex items-center gap-3 flex-wrap mb-2">
                    <div className="h-6 w-20 bg-gray-200 rounded" />
                    <div className="h-4 w-16 bg-gray-200 rounded" />
                    <div className="h-4 w-14 bg-gray-200 rounded-full" />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-2 md:gap-[15px] border-gray-300 border-t mt-auto pt-2">
                    <div className="h-9 md:h-[42px] w-full bg-gray-200 rounded-md md:rounded-xl" />
                    <div className="h-10 w-10 bg-gray-200 rounded-full hidden md:block" />
                </div>
            </div>
        </div>
    );
};

export default ProductCardLoading;
