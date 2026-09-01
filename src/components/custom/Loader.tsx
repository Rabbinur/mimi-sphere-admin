import { LoaderCircle } from "lucide-react";

const Loader = () => {
    return (
        <div className="flex items-center justify-center h-screen">
            <LoaderCircle className="w-12 h-12 animate-spin text-primary" />
        </div>
    );
};

export default Loader;
