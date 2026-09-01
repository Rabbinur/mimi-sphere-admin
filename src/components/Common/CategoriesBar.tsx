import { Suspense } from "react";
import CategoriesBarClient from "./CategoriesBarClient";

const INITIAL_CATEGORIES = [
    {
        "_id": "69e3742be07a7991b701ddce",
        "name": "New Collection",
        "slug": "new-collection",
        "description": "New Collection",
        "imageUrl": "https://softwebsys.s3.us-east-1.amazonaws.com/uploads/1776514086117-new-collection-banner-speech-bubble-icon-business-concept-advertising-offer-symbol-vector.webp",
        "isActive": true,
        "order": 1,
        "createdAt": "2026-04-18T12:08:11.699Z"
    },
    {
        "_id": "69e452a2dd4ebaf3eae010ae",
        "name": "Accessories",
        "slug": "accessories",
        "description": "accessories",
        "imageUrl": "https://softwebsys.s3.us-east-1.amazonaws.com/uploads/1776571036919-top-view-of-fashion-female-accessories-for-woman.webp",
        "isActive": true,
        "order": 2,
        "createdAt": "2026-04-19T03:57:22.952Z"
    },
    {
        "_id": "69e37546595ecbbccd76c8c8",
        "name": "Girls Fashion",
        "slug": "fashion",
        "description": "Fashion",
        "imageUrl": "https://softwebsys.s3.us-east-1.amazonaws.com/uploads/1776514369053-girls-Fashion.webp",
        "isActive": true,
        "order": 3,
        "createdAt": "2026-04-18T12:12:54.964Z"
    },
    {
        "_id": "69e377a358383f76b7172d4d",
        "name": "Bag & Shoes",
        "slug": "bag-shoes",
        "description": "Bag & Shoes",
        "imageUrl": "https://softwebsys.s3.us-east-1.amazonaws.com/uploads/1776514973898-S24182d301b6b4b289186cd48237c478db.webp",
        "isActive": true,
        "order": 4,
        "createdAt": "2026-04-18T12:22:59.017Z"
    },
    {
        "_id": "69e50717ccf9f7ba5084f9d8",
        "name": "Personal care",
        "slug": "personal-care",
        "description": "Personal care",
        "imageUrl": "https://softwebsys.s3.us-east-1.amazonaws.com/uploads/1776617232498-circle-label-hygienic-supplies-cosmetics-department-grocery-store-personal-care-goods_172149-457.webp",
        "isActive": true,
        "order": 5,
        "createdAt": "2026-04-19T16:47:19.263Z"
    },
    {
        "_id": "69e5076bccf9f7ba5084f9e0",
        "name": "Mom & Baby",
        "slug": "mom-baby",
        "description": "Mom & Baby",
        "imageUrl": "https://softwebsys.s3.us-east-1.amazonaws.com/uploads/1776617317901-Mom-&-Baby.webp",
        "isActive": true,
        "order": 6,
        "createdAt": "2026-04-19T16:48:43.773Z"
    },
    {
        "_id": "69e506a9ccf9f7ba5084f9cc",
        "name": "Dress & clothing",
        "slug": "dress-clothing",
        "description": "Dress & clothing",
        "imageUrl": "https://softwebsys.s3.us-east-1.amazonaws.com/uploads/1776617124144-pngtree-elegant-red-gown-with-a-flowing-design-perfect-for-special-occasions-png-image_14586645.webp",
        "isActive": true,
        "order": 7,
        "createdAt": "2026-04-19T16:45:29.699Z"
    },
    {
        "_id": "69e507d6aa249d0ac2ea5387",
        "name": "Mens Fashion",
        "slug": "mens-fashion",
        "description": "Mens Fashion",
        "imageUrl": "https://softwebsys.s3.us-east-1.amazonaws.com/uploads/1776617424608-summer-collection-men-clothes-set-with-checkered-shirt-jeans-shoes-belt-isolated-white-background_142957-1103.webp",
        "isActive": true,
        "order": 8,
        "createdAt": "2026-04-19T16:50:30.731Z"
    },
    {
        "_id": "69e50841aa249d0ac2ea538f",
        "name": "Digital Accessories",
        "slug": "digital-accessories",
        "description": "digital accessories",
        "imageUrl": "https://softwebsys.s3.us-east-1.amazonaws.com/uploads/1776617532448-Girl-and-Boy-Kids-Digital-Photo-Camera-with-Portable-Mini-Thermal-Printer-Instant-Print-Video-Recording-Birthday-Gift.jpg_300x300.webp",
        "isActive": true,
        "order": 9,
        "createdAt": "2026-04-19T16:52:17.246Z"
    }
];

async function getCategories() {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        if (!baseUrl) return INITIAL_CATEGORIES;

        const res = await fetch(`${baseUrl}/categories?sub_categories=false`, {
            next: { revalidate: 3600 }
        });

        if (!res.ok) return INITIAL_CATEGORIES;
        const data = await res.json();
        return (data?.data && data.data.length > 0) ? data.data : INITIAL_CATEGORIES;
    } catch (error) {
        console.error("Error fetching categories for SSR:", error);
        return INITIAL_CATEGORIES;
    }
}

const CategoriesBarSkeleton = () => (
    <div className="w-full border-b border-gray-100 bg-white shadow-sm">
        <div className="container mx-auto px-4 h-12 flex items-center gap-4">
            <div className="h-9 w-32 bg-gray-100 rounded-full animate-pulse" />
            <div className="flex gap-6 flex-1 overflow-hidden">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-4 w-20 bg-gray-100 rounded animate-pulse shrink-0" />
                ))}
            </div>
        </div>
    </div>
);

const CategoriesBarContent = async () => {
    const categories = await getCategories();
    return <CategoriesBarClient categories={categories} />;
}

const CategoriesBar = () => {
    return (
        <Suspense fallback={<CategoriesBarSkeleton />}>
            <CategoriesBarContent />
        </Suspense>
    );
};

export default CategoriesBar;