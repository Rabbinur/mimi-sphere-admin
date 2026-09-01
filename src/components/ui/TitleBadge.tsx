const TitleBadge = ({ title }: { title: string }) => {
    return (
        <div className="flex items-center gap-1.5">
            <div className="relative">

                {/* subtle ping */}
                <div className="absolute -top-0.5 -left-0.5 w-5 h-5 md:w-6 md:h-6 bg-primary rounded-full animate-ping opacity-10"></div>

                {/* badge */}
                <div
                    className="relative 
                     bg-primary/10 text-primary 
                     px-2 py-0.5 md:px-2.5 md:py-1
                 
                     text-[10px] md:text-xs lg:text-sm
                     font-medium"
                >
                    {title}
                </div>

            </div>
        </div>
    );
};

export default TitleBadge;