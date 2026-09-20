"use client";

import { useGetCmsQuery, useUpdateCmsMutation } from "@/components/Redux/RTK/cmsApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MediaLibrary } from "@/components/ui/media-manager";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TCMS, THeroFeature, THeroSlide } from "@/types";
import { Gift, MoveDown, MoveUp, Plus, Sparkles, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
    const { data: cmsResponse, isLoading, isError } = useGetCmsQuery();
    const [updateCms, { isLoading: isUpdating }] = useUpdateCmsMutation();
    const [formData, setFormData] = useState<TCMS | null>(null);

    useEffect(() => {
        if (cmsResponse?.data) {
            setFormData(cmsResponse.data);
        }
    }, [cmsResponse]);

    const handleSave = async () => {
        if (!formData) return;
        try {
            await updateCms(formData).unwrap();
            toast.success("Settings updated successfully");
        } catch (error) {
            toast.error("Failed to update settings");
        }
    };

    if (isError) return <div className="p-6 text-red-500">Error loading settings. Please check if the server is running.</div>;
    if (isLoading) return <div className="p-6">Loading site settings...</div>;
    if (!formData) return <div className="p-6">No settings data available.</div>;

    const popupData = formData.exitIntentPopup || {
        isEnabled: true,
        title: "WAIT! GET 5% OFF NOW",
        subtitle: "Complete your order now and save instantly!",
        voucherCode: "SAVE05",
        discountText: "5% OFF",
        expiryMinutes: 5,
        ctaText: "CLAIM DISCOUNT",
        declineText: "I'll pay full price",
    };

    return (
        <div className="p-4 md:p-8 bg-white min-h-screen space-y-6">

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Site Settings</h1>
                    <p className="text-xs text-slate-500 mt-1">Manage site branding, sliders, features & offer popups</p>
                </div>
                <Button onClick={handleSave} disabled={isUpdating}>
                    {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
            </div>

            <Tabs defaultValue="company" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="company">Company & Social</TabsTrigger>
                    <TabsTrigger value="slider">Hero Slider</TabsTrigger>
                    <TabsTrigger value="features">Hero Features</TabsTrigger>
                    <TabsTrigger value="popup">Offer Popup (Exit Intent)</TabsTrigger>
                </TabsList>


                <TabsContent value="company">
                    <Card>
                        <CardHeader>
                            <CardTitle>Company Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Company Name</Label>
                                    <Input
                                        value={formData.company.name}
                                        onChange={(e) => setFormData({ ...formData, company: { ...formData.company, name: e.target.value } })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input
                                        value={formData.company.email}
                                        onChange={(e) => setFormData({ ...formData, company: { ...formData.company, email: e.target.value } })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone</Label>
                                    <Input
                                        value={formData.company.phone}
                                        onChange={(e) => setFormData({ ...formData, company: { ...formData.company, phone: e.target.value } })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Address</Label>
                                    <Input
                                        value={formData.company.address}
                                        onChange={(e) => setFormData({ ...formData, company: { ...formData.company, address: e.target.value } })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Social Links</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {formData.social.links.map((link, idx) => (
                                <div key={idx} className="flex gap-4 items-end border-b pb-4 last:border-0">
                                    <div className="flex-1 space-y-2">
                                        <Label>Platform</Label>
                                        <Input
                                            value={link.platform}
                                            onChange={(e) => {
                                                const newLinks = [...formData.social.links];
                                                newLinks[idx].platform = e.target.value;
                                                setFormData({ ...formData, social: { links: newLinks } });
                                            }}
                                        />
                                    </div>
                                    <div className="flex-[2] space-y-2">
                                        <Label>URL</Label>
                                        <Input
                                            value={link.url}
                                            onChange={(e) => {
                                                const newLinks = [...formData.social.links];
                                                newLinks[idx].url = e.target.value;
                                                setFormData({ ...formData, social: { links: newLinks } });
                                            }}
                                        />
                                    </div>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => {
                                            const newLinks = formData.social.links.filter((_, i) => i !== idx);
                                            setFormData({ ...formData, social: { links: newLinks } });
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setFormData({ ...formData, social: { links: [...formData.social.links, { platform: "", url: "" }] } });
                                }}
                            >
                                <Plus className="w-4 h-4 mr-2" /> Add Social Link
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="slider">
                    <Tabs defaultValue="desktop" className="w-full">
                        <div className="flex justify-between items-center mb-4">
                            <TabsList>
                                <TabsTrigger value="desktop">Desktop Slider</TabsTrigger>
                                <TabsTrigger value="mobile">Mobile Slider</TabsTrigger>
                            </TabsList>
                            <div className="text-xs text-muted-foreground bg-muted p-2 rounded border">
                                <strong>Ratios:</strong> Desktop: 850x450px (17:9) | Mobile: 450x200px (9:4)
                            </div>
                        </div>

                        <TabsContent value="desktop">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Desktop Hero Slider</CardTitle>
                                        <CardDescription>Manage images for large screens. Recommended: 850x450px.</CardDescription>
                                    </div>
                                    <Button onClick={() => {
                                        const newSlides = [...(formData.heroSliderDesktop || [])];
                                        newSlides.push({ image: "", link: "", alt: "" });
                                        setFormData({ ...formData, heroSliderDesktop: newSlides });
                                    }}>
                                        <Plus className="w-4 h-4 mr-2" /> Add Desktop Slide
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {(formData.heroSliderDesktop || []).map((slide, idx) => (
                                        <div key={idx} className="p-4 border rounded-lg space-y-4 bg-muted/30 relative">
                                            <div className="absolute top-2 right-2 flex gap-1">
                                                <Button variant="ghost" size="icon" disabled={idx === 0} onClick={() => moveSlide("desktop", idx, -1)}>
                                                    <MoveUp className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" disabled={idx === (formData.heroSliderDesktop?.length || 0) - 1} onClick={() => moveSlide("desktop", idx, 1)}>
                                                    <MoveDown className="w-4 h-4" />
                                                </Button>
                                                <Button variant="destructive" size="icon" onClick={() => removeSlide("desktop", idx)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 pt-6">
                                                <div className="space-y-2">
                                                    <Label>Slide Image</Label>
                                                    <ImageSelector
                                                        value={slide.image}
                                                        onSelect={(val) => updateSlide("desktop", idx, { image: val })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Link URL</Label>
                                                    <Input
                                                        value={slide.link}
                                                        placeholder="/shop"
                                                        onChange={(e) => updateSlide("desktop", idx, { link: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Alt Text</Label>
                                                    <Input
                                                        value={slide.alt}
                                                        placeholder="Summer Collection"
                                                        onChange={(e) => updateSlide("desktop", idx, { alt: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="mobile">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Mobile Hero Slider</CardTitle>
                                        <CardDescription>Manage images for mobile devices. Recommended: 450x200px.</CardDescription>
                                    </div>
                                    <Button onClick={() => {
                                        const newSlides = [...(formData.heroSliderMobile || [])];
                                        newSlides.push({ image: "", link: "", alt: "" });
                                        setFormData({ ...formData, heroSliderMobile: newSlides });
                                    }}>
                                        <Plus className="w-4 h-4 mr-2" /> Add Mobile Slide
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {(formData.heroSliderMobile || []).map((slide, idx) => (
                                        <div key={idx} className="p-4 border rounded-lg space-y-4 bg-muted/30 relative">
                                            <div className="absolute top-2 right-2 flex gap-1">
                                                <Button variant="ghost" size="icon" disabled={idx === 0} onClick={() => moveSlide("mobile", idx, -1)}>
                                                    <MoveUp className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" disabled={idx === (formData.heroSliderMobile?.length || 0) - 1} onClick={() => moveSlide("mobile", idx, 1)}>
                                                    <MoveDown className="w-4 h-4" />
                                                </Button>
                                                <Button variant="destructive" size="icon" onClick={() => removeSlide("mobile", idx)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 pt-6">
                                                <div className="space-y-2">
                                                    <Label>Slide Image</Label>
                                                    <ImageSelector
                                                        value={slide.image}
                                                        onSelect={(val) => updateSlide("mobile", idx, { image: val })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Link URL</Label>
                                                    <Input
                                                        value={slide.link}
                                                        placeholder="/shop"
                                                        onChange={(e) => updateSlide("mobile", idx, { link: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Alt Text</Label>
                                                    <Input
                                                        value={slide.alt}
                                                        placeholder="Summer Collection"
                                                        onChange={(e) => updateSlide("mobile", idx, { alt: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </TabsContent>

                <TabsContent value="features">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Hero Features</CardTitle>
                                <CardDescription>Manage the side cards next to the slider. Recommended: 410x215px.</CardDescription>
                            </div>
                            <Button
                                disabled={(formData.heroFeatures?.length || 0) >= 2}
                                onClick={() => {
                                    const newFeatures = [...(formData.heroFeatures || [])];
                                    newFeatures.push({ title: "", subtitle: "", image: "", link: "" });
                                    setFormData({ ...formData, heroFeatures: newFeatures });
                                }}
                            >
                                <Plus className="w-4 h-4 mr-2" /> Add Feature (Max 2)
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {(formData.heroFeatures || []).map((feature, idx) => (
                                <div key={idx} className="p-4 border rounded-lg space-y-4 bg-muted/30 relative">
                                    <div className="absolute top-2 right-2">
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            onClick={() => {
                                                const newFeatures = formData.heroFeatures.filter((_, i) => i !== idx);
                                                setFormData({ ...formData, heroFeatures: newFeatures });
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-6">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Title</Label>
                                                <Input
                                                    value={feature.title}
                                                    onChange={(e) => updateFeature(idx, { title: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Subtitle</Label>
                                                <Input
                                                    value={feature.subtitle}
                                                    onChange={(e) => updateFeature(idx, { subtitle: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Link</Label>
                                                <Input
                                                    value={feature.link}
                                                    onChange={(e) => updateFeature(idx, { link: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Image (410x215px)</Label>
                                            <ImageSelector
                                                value={feature.image}
                                                onSelect={(val) => updateFeature(idx, { image: val })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="popup">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Settings Form (2 cols) */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-xl flex items-center gap-2">
                                                <Gift className="w-5 h-5 text-amber-500" />
                                                Exit-Intent Discount Popup
                                            </CardTitle>
                                            <CardDescription className="mt-1">
                                                Show a high-converting offer popup when customers try to leave the checkout page or browser tab.
                                            </CardDescription>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Label htmlFor="popup-enable" className="font-bold text-sm">
                                                {popupData.isEnabled ? "Enabled" : "Disabled"}
                                            </Label>
                                            <Switch
                                                id="popup-enable"
                                                checked={popupData.isEnabled}
                                                onCheckedChange={(checked) =>
                                                    setFormData({
                                                        ...formData,
                                                        exitIntentPopup: { ...popupData, isEnabled: checked },
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Headline / Title</Label>
                                            <Input
                                                value={popupData.title}
                                                placeholder="e.g., WAIT! GET 5% OFF NOW"
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        exitIntentPopup: { ...popupData, title: e.target.value },
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Discount Badge / Highlight</Label>
                                            <Input
                                                value={popupData.discountText}
                                                placeholder="e.g., 5% OFF or ৳100 OFF"
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        exitIntentPopup: { ...popupData, discountText: e.target.value },
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Subtitle / Description</Label>
                                        <Input
                                            value={popupData.subtitle}
                                            placeholder="e.g., Complete your order now and save instantly!"
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    exitIntentPopup: { ...popupData, subtitle: e.target.value },
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Voucher / Coupon Code</Label>
                                            <Input
                                                value={popupData.voucherCode}
                                                placeholder="e.g., SAVE05"
                                                className="uppercase font-mono font-bold"
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        exitIntentPopup: { ...popupData, voucherCode: e.target.value.toUpperCase() },
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Countdown Duration (Minutes)</Label>
                                            <Input
                                                type="number"
                                                min={1}
                                                max={60}
                                                value={popupData.expiryMinutes}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        exitIntentPopup: { ...popupData, expiryMinutes: Number(e.target.value) || 5 },
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>CTA Button Text</Label>
                                            <Input
                                                value={popupData.ctaText}
                                                placeholder="e.g., CLAIM DISCOUNT"
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        exitIntentPopup: { ...popupData, ctaText: e.target.value },
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Decline / Close Link Text</Label>
                                            <Input
                                                value={popupData.declineText}
                                                placeholder="e.g., I'll pay full price"
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        exitIntentPopup: { ...popupData, declineText: e.target.value },
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Live Preview (1 col) */}
                        <div className="lg:col-span-1">
                            <Card className="bg-slate-950 text-white border-slate-800 sticky top-4">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Live Preview</span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${popupData.isEnabled ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                                            {popupData.isEnabled ? "Active" : "Inactive"}
                                        </span>
                                    </div>
                                    <CardTitle className="text-sm text-slate-400">Checkout Modal</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-2">
                                    <div className="bg-gradient-to-b from-[#001f3f] to-[#001020] rounded-2xl p-5 border border-amber-500/30 text-center space-y-3 shadow-xl">
                                        <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 shadow-md">
                                            <Gift className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-base font-black text-white leading-tight">
                                                {popupData.title || "WAIT! GET 5% OFF"}
                                            </h4>
                                            <p className="text-[11px] text-slate-300 mt-1">
                                                {popupData.subtitle || "Complete order & save"}
                                            </p>
                                        </div>
                                        <div className="bg-white/10 border border-dashed border-amber-400/50 rounded-xl p-2.5 flex items-center justify-between px-3">
                                            <span className="font-mono font-black text-amber-400 text-sm tracking-wider">
                                                {popupData.voucherCode || "SAVE05"}
                                            </span>
                                            <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded">
                                                {popupData.expiryMinutes || 5}:00
                                            </span>
                                        </div>
                                        <button className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all">
                                            {popupData.ctaText || "CLAIM DISCOUNT"}
                                        </button>
                                        <p className="text-[9px] text-slate-400 uppercase tracking-wider">
                                            {popupData.declineText || "I'll pay full price"}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );

    // --- Helpers ---

    function updateSlide(type: "desktop" | "mobile", idx: number, updates: Partial<THeroSlide>) {
        const field = type === "desktop" ? "heroSliderDesktop" : "heroSliderMobile";
        const newSlides = [...(formData![field] || [])];
        newSlides[idx] = { ...newSlides[idx], ...updates };
        setFormData({ ...formData!, [field]: newSlides });
    }

    function removeSlide(type: "desktop" | "mobile", idx: number) {
        const field = type === "desktop" ? "heroSliderDesktop" : "heroSliderMobile";
        const newSlides = formData![field]?.filter((_, i) => i !== idx);
        setFormData({ ...formData!, [field]: newSlides || [] });
    }

    function moveSlide(type: "desktop" | "mobile", idx: number, direction: number) {
        const field = type === "desktop" ? "heroSliderDesktop" : "heroSliderMobile";
        const newSlides = [...(formData![field] || [])];
        const targetIdx = idx + direction;
        if (targetIdx < 0 || targetIdx >= newSlides.length) return;
        [newSlides[idx], newSlides[targetIdx]] = [newSlides[targetIdx], newSlides[idx]];
        setFormData({ ...formData!, [field]: newSlides });
    }

    function updateFeature(idx: number, updates: Partial<THeroFeature>) {
        const newFeatures = [...(formData?.heroFeatures || [])];
        newFeatures[idx] = { ...newFeatures[idx], ...updates };
        setFormData({ ...formData!, heroFeatures: newFeatures });
    }
}


function ImageSelector({ value, onSelect }: { value: string, onSelect: (val: string) => void }) {
    return (
        <div className="flex gap-3 items-start">
            <div className="flex-1">
                <Input value={value} onChange={(e) => onSelect(e.target.value)} placeholder="Image URL" />
            </div>
            <div className="w-20 h-10 relative border rounded overflow-hidden flex-shrink-0 bg-muted">
                {value && <Image src={value} alt="Preview" fill className="object-cover" unoptimized />}
            </div>
            <MediaLibrary
                onSelect={(files) => onSelect(files[0].url)}
                multiple={false}
                title="Select Image"
            />
        </div>
    );
}