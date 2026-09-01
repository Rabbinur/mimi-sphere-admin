"use client";

import React from "react";
import BrandForm from "../../_components/BrandForm";

interface EditBrandPageProps {
    params: Promise<{ id: string }>;
}

export default function EditBrandPage({ params }: EditBrandPageProps) {
    const resolvedParams = React.use(params);
    return <BrandForm mode="edit" brandId={resolvedParams.id} />;
}
