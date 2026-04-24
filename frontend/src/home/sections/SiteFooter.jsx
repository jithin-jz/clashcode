import React from "react";
import { Github, Linkedin, Twitter, Youtube } from "lucide-react";

const legalLinks = [
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
  { label: "Contact", href: "#" },
];

const socialLinks = [
  { label: "GitHub", href: "https://github.com/jithin-jz", Icon: Github },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/jithin-kr/",
    Icon: Linkedin,
  },
  { label: "Twitter", href: "https://x.com/jithin_jz", Icon: Twitter },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@jithinjz",
    Icon: Youtube,
  },
];

const SiteFooter = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-white/20 bg-black relative z-10">
      <div className="w-full px-7 sm:px-10 lg:px-14 py-3 flex items-center justify-between gap-4 overflow-x-auto">
        {/* Left: Brand & Socials */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="font-['Geist_Mono'] text-[10px] font-bold tracking-widest text-white uppercase whitespace-nowrap">
            <span className="hidden sm:inline">CLASHCODE</span>
            <span className="sm:hidden">COC</span>
          </span>

          <div className="h-3 w-px bg-white/20" />

          <div className="flex items-center gap-3.5">
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="text-white/40 hover:text-white transition-colors"
              >
                {React.createElement(s.Icon, { size: 13, strokeWidth: 1.5 })}
              </a>
            ))}
          </div>
        </div>

        {/* Right: Copyright & Legal */}
        <div className="flex items-center gap-4 shrink-0">
          <span className="font-['Geist_Mono'] text-[9px] font-medium text-white/30 uppercase">
            © {year}
          </span>
          <div className="flex items-center gap-3.5">
            {legalLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-['Geist_Mono'] text-[9px] font-bold tracking-tighter text-white/60 hover:text-white transition-colors uppercase whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
