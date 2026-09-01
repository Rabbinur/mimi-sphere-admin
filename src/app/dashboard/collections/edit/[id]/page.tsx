"use client";

import React from "react";
import CollectionForm from "../../_components/CollectionForm";

interface EditCollectionPageProps {
    params: Promise<{ id: string }>;
}

export default function EditCollectionPage({ params }: EditCollectionPageProps) {
    const resolvedParams = React.use(params);
    return <CollectionForm mode="edit" collectionId={resolvedParams.id} />;
}
