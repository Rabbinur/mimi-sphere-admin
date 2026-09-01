import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cmsData } from "@/constants/cms";
import {
  Globe,
  Mail,
  PhoneCall,
  Send
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import NewsletterForm from "./NewsletterForm";


const Footer = () => {

  const features = [
    { icon: "https://cdn-icons-png.flaticon.com/512/2500/2500508.png", title: "SAFE PAYMENT" },
    { icon: "https://cdn-icons-png.flaticon.com/512/879/879767.png", title: "ONLINE DISCOUNT" },
    { icon: "https://cdn-icons-png.flaticon.com/512/1067/1067566.png", title: "HELP CENTER" },
    { icon: "https://cdn-icons-png.flaticon.com/512/2854/2854580.png", title: "CURATED ITEMS" },
  ];

  const usefulLinks = [
    { name: "Track Order", href: "/track-order" },
    { name: "Blogs & News", href: "/blogs" },
    { name: "Categories", href: "/categories" },
    { name: "Contact Us", href: "/contact" },
    { name: "About Us", href: "/about" },
  ];

  const policyLinks = [
    { name: "Shipping Policy", href: "/shipping-policy" },
    { name: "Return Policy", href: "/return-policy" },
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms & Conditions", href: "/terms" },
  ];

  return (
    <footer className="bg-[#fcfcfd] text-slate-600 border-t border-gray-100">

      {/* 1. Trust Badge / Features Bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-6 md:py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-4">
            {features.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 group">
                <div className="bg-blue-50 p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Image src={item.icon} alt={item.title} width={30} height={30} className="grayscale group-hover:grayscale-0 transition-all" />
                </div>
                <div>
                  <h3 className="text-[11px] font-black tracking-widest text-gray-700 leading-none mb-1 uppercase">{item.title}</h3>
                  <p className="text-[10px] text-slate-400 font-medium tracking-tight">Verified Services</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Content */}
      <div className="container mx-auto  px-2 md:px-4 py-4 md:py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-8">

          {/* Brand Info */}
          <div className="lg:col-span-4 space-y-2 md:space-y-3">
            <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
              <Image
                src={"/logo.png"}
                alt="Brand Logo"
                width={200} height={100}
                className="object-contain"
                style={{ width: 'auto', height: 'auto' }}
              />
            </Link>
            <div className="space-y-4">
              <p className="text-sm leading-relaxed max-w-sm text-slate-500 font-medium">
                {cmsData?.company?.name || "Shopping Cart BD"} - Your one-stop destination for premium curated items and exclusive web deals.
              </p>
              <div className="space-y-3">
                {/* <div className="flex items-start gap-3 group">
                  <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-500 group-hover:text-slate-800 transition-colors">
                    {cmsData?.company?.address || "Dhaka, Bangladesh"}
                  </span>
                </div> */}
                <div className="flex items-center gap-3 group">
                  <Mail size={18} className="text-primary shrink-0" />
                  <a href={`mailto:${cmsData?.company?.email}`} className="text-sm text-slate-500 hover:text-primary transition-colors">
                    {cmsData?.company?.email || "info@shoppingcart.bd"}
                  </a>
                </div>
                <div className="flex items-center gap-3 group">
                  <PhoneCall size={18} className="text-primary shrink-0" />
                  <span className="text-sm text-slate-500">{cmsData?.company?.phone || "+8801722597565"}</span>
                </div>
              </div>

              {/* Social Icons */}
              <div className="flex items-center gap-4 pt-2">
                {cmsData?.social?.links?.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:scale-110 transition-transform duration-200"
                    title={link.platform}
                    aria-label={`Follow us on ${link.platform}`}
                  >
                    {link.icon ? (
                      <Image
                        width={20}
                        height={20}
                        src={link.icon}
                        alt={link.platform}
                        className="w-5 h-5 object-contain  transition-all opacity-70 hover:opacity-100"
                      />
                    ) : (
                      <Globe className="w-5 h-5 text-gray-400 hover:text-primary transition-colors" />
                    )}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Links */}
          <div className="hidden lg:block lg:col-span-2">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-6">Quick Guide</h2>
            <ul className="space-y-4">
              {usefulLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-[13px] font-semibold text-slate-400 hover:text-primary transition-all hover:pl-1">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden lg:block lg:col-span-2">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-6">Policies</h2>
            <ul className="space-y-4">
              {policyLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-[13px] font-semibold text-slate-400 hover:text-primary transition-all hover:pl-1">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Mobile View Accordions */}
          <div className="lg:hidden">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="links">
                <AccordionTrigger className="text-xs font-black uppercase tracking-widest">Helpful Links</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-y-3 py-2">
                    {usefulLinks.map((l) => (
                      <Link key={l.name} href={l.href} className="text-xs text-slate-500">{l.name}</Link>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="policy">
                <AccordionTrigger className="text-xs font-black uppercase tracking-widest">Our Policies</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-y-3 py-2">
                    {policyLinks.map((l) => (
                      <Link key={l.name} href={l.href} className="text-xs text-slate-500">{l.name}</Link>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Newsletter Section */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-4 md:p-6 xl:p-8 md:rounded-[2rem] rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Send size={80} className="-rotate-12" />
              </div>
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                Newsletter
              </h2>
              <p className="text-xs leading-relaxed text-slate-500 mb-6">
                Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
              </p>
              <NewsletterForm />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Credits Bar */}
      <div className="bg-white border-t border-gray-100 py-4 md:py-6">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row justify-between items-center gap-8">
          <div className="text-center lg:text-left">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
              © {new Date().getFullYear()} <span className="text-primary">{cmsData?.company?.name || "EBSPLATFORM"}</span>. Crafted with ❤️ for better shopping.
            </p>
          </div>

          {/* <div className="flex flex-col items-center lg:items-end gap-3">
            <Image
              src="https://www.southern.ac.bd/wp-content/uploads/2019/05/SSLCommerz-footer.png"
              alt="SSLCommerz Verified"
              width={450} height={70}
              className="object-contain max-w-[280px] sm:max-w-[350px] md:max-w-md grayscale hover:grayscale-0 transition-all duration-500"
            />
            <p className="text-[9px] text-slate-300 font-medium uppercase tracking-widest">Secure 256-bit SSL Encrypted Payment</p>
          </div> */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;