import GradientFrame from "./GradientFrame";

const links = ["Projects", "Expertise", "About", "Contact", "Resume"];

export default function Nav() {
  return (
    <div className="fixed bottom-6 left-1/2 z-50 max-w-[94vw] -translate-x-1/2 md:bottom-12">
      <GradientFrame className="tag-shadow" padding="1px" radius="9999px">
        <nav className="flex items-center gap-0.5 overflow-x-auto px-1.5 py-1.5 sm:gap-1 md:px-2 md:py-2">
          {links.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="whitespace-nowrap rounded-full px-2 py-2 text-[12px] font-medium text-[#1c1833] transition hover:bg-black/5 sm:px-4 sm:text-sm md:px-5 md:py-2.5 md:text-[15px]"
            >
              {link}
            </a>
          ))}
        </nav>
      </GradientFrame>
    </div>
  );
}
