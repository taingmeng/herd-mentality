//@ts-nocheck
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { RxHamburgerMenu, RxCross1 } from 'react-icons/rx';

interface NavItemProps {
  children: React.ReactNode;
  href?: string;
}

function NavItem({ children, href }: NavItemProps) {
  return (
    <li>
      <Link
        href={href || "#"}
        className="flex items-center gap-2 font-medium h-8"
      >
        {children}
      </Link>
    </li>
  );
}

export interface NavMenu {
  name: string;
  icon: string;
  href: string;
}

interface NavbarProps {
  title?: string;
  menus?: NavMenu[];
}

export function Navbar({ title, menus = [] }: NavbarProps) {
  const [open, setOpen] = React.useState(false);

  function handleOpen() {
    setOpen((cur) => !cur);
  }

  React.useEffect(() => {
    window.addEventListener(
      "resize",
      () => window.innerWidth >= 960 && setOpen(false)
    );
  }, []);

  const menuHeight = `h-${menus.length * 14}`;

  return (
    <div className="p-4 border-0 z-50 sticky top-0 m-0 bg-neutral-100 dark:bg-neutral-800">
      <div className="mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <Image src="/edit-dark.svg" width="36" height="36" alt="Just Words" className="fill-cyan-500" />
          <h2 className="text-lg font-bold">
            {title || "Party Paper Pen"}
          </h2>
        </Link>

        <ul className="ml-10 hidden items-center gap-8 lg:flex">
          {menus.map(({ name, icon, href }) => (
            <NavItem key={name} href={href}>
              <Image src={icon} width="24" height="24" alt={name} className="tint" />
              <span>{name}</span>
            </NavItem>
          ))}
        </ul>
        {menus.length > 0 && <div
          onClick={handleOpen}
          className="ml-auto inline-block lg:hidden flex items-center justify-center"
        >
          {open ? (
            <RxCross1 className="h-6 w-6" />
          ) : (
            <RxHamburgerMenu className="h-6 w-6" />
          )}
        </div>
        }
      </div>
      <div
        className={`${open ? menuHeight : 'h-0'
          } data-twe-collapse-item transition-all delay-150 duration-300 overflow-hidden w-full`}
      >
        <div className="container mx-auto mt-3 border-t border-gray-200 px-2 pt-4">
          <ul className="flex flex-col gap-4">
            {menus.map(({ name, icon, href }) => (
              <NavItem key={name} href={href} className="h-16 text-grey-100 dark:text-grey-100">
                <Image src={icon} width="24" height="24" alt={name} className="tint" />
                <span>{name}</span>
              </NavItem>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}

export default Navbar;
