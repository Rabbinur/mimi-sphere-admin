import { TCMS } from "@/types";

export const cmsData: TCMS = {
  company: {
    name: "Shopping Cart BD",
    email: "info@shoppingcart.bd",
    phone: "+8801722597565",
    address: "Dhaka, Bangladesh",
  },
  social: {
    links: [
      {
        platform: "facebook",
        url: "https://www.facebook.com/shoppingcartbd.official",
        icon: "/icons/facebook.png",
      },
      {
        platform: "instagram",
        url: "https://www.instagram.com/shoppingcart.bd/",
        icon: "/icons/instagram.png",
      },
      {
        platform: "whatsapp",
        url: "https://wa.link/fabxoj",
        icon: "/icons/whatsapp.png",
      },
      {
        platform: "tiktok",
        url: "https://www.tiktok.com/@shoppingcartbd",
        icon: "/icons/tik-tok.png",
      },
    ],
  },
  heroSliderDesktop: [
    {
      image: "/hero/desktop-1.png",
      link: "/shop",
      alt: "Hero Slide 1",
    },
    {
      image: "/hero/desktop-2.png",
      link: "/shop",
      alt: "Hero Slide 2",
    },
  ],
  heroSliderMobile: [
    {
      image: "/hero/mobile-1.png",
      link: "/shop",
      alt: "Hero Slide 1",
    },
    {
      image: "/hero/mobile-2.png",
      link: "/shop",
      alt: "Hero Slide 2",
    },
  ],
  heroFeatures: [
    {
      title: "New summer Fashion",
      subtitle: "Handbag",
      image: "/hero/right-1.png",
      link: "/shop",
    },
    {
      title: "Vibrant Avocado Hand Cream",
      subtitle: "Cream",
      image: "/hero/right-2.png",
      link: "/shop",
    },
  ],
};
