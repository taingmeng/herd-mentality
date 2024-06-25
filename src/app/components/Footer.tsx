import Link from "next/link";

const SUB_LINKS = [
  { 
    title:"Privacy",
    href: "/privacy"
  },
  { title:"Terms",
    href:"/terms"
  }
];
const CURRENT_YEAR = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="px-8">
      <div className="container mx-auto">
        <div className="mt-16 flex flex-wrap items-center justify-center gap-y-4 gap-x-8 border-t !border-gray-700 py-6 md:justify-between">
          <span className="text-center font-normal !text-gray-700">
            &copy; {CURRENT_YEAR} Made by{" "}
            <a href="https://www.creative-tim.com" target="_blank">
              Meng Taing
            </a>
          </span>

          <ul className="flex items-center">
            {SUB_LINKS.map((sub, idx) => (
              <li key={sub.title}>
                <Link
                  href={sub.href}
                  className={`py-1 font-normal !text-gray-700 transition-colors hover:!text-gray-500 ${
                    idx === SUB_LINKS.length - 1 ? "pl-2" : "px-2"
                  }`}
                >
                  {sub.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
