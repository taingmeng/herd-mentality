"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { RxHamburgerMenu, RxCross1 } from 'react-icons/rx';

interface NavItemProps {
  children: React.ReactNode;
  href?: string;
  target?: string;
  onClick?: () => void;
  afterClick?: () => void;
}

function NavItem({ children, href, target, onClick, afterClick }: NavItemProps) {
  return (
    <li>
      {onClick ? <div className="flex items-center gap-2 font-medium h-8 cursor-pointer" onClick={() => {
        onClick();
        afterClick && afterClick();
      }}>
        {children}
        </div> :
      <Link
        href={href || "#"}
        target={target || "_self"}
        className="flex items-center gap-2 font-medium h-8"
        onClick={afterClick}
      >
        {children}
      </Link>
}
    </li>
  );
}

export interface NavMenu {
  name: string;
  icon: string;
  href?: string;
  target?: string;
  onClick?: () => void;
}

interface NavbarProps {
  title?: string;
  menus?: NavMenu[];
  iconFilePath?: string;
}

export function Navbar({ title, menus = [], iconFilePath }: NavbarProps) {
  const [open, setOpen] = React.useState(false);

  function handleOpen() {
    setOpen((cur) => !cur);
  }

  const menuHeight = `h-${menus.length * 14}`;

  return (
    <div className={`fixed w-screen px-4 border-0 z-40 top-0 transition-colors duration-300 ${open ? 'bg-neutral-800 bg-opacity-75' : ''}`}>
      <div className="mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {menus.length > 0 && (
            <div onClick={handleOpen} className="flex items-center justify-center cursor-pointer">
              {open ? (
                <RxCross1 className="h-6 w-6" />
              ) : (
                <RxHamburgerMenu className="h-6 w-6" />
              )}
            </div>
          )}
          <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
            <Image src={iconFilePath || "/party.svg"} width="36" height="36" alt="Just Words" className="fill-cyan-500" />
            <h2 className="text-lg font-bold my-4">
              {title || "Partyz"}
            </h2>
          </Link>
        </div>
      </div>
      <div
        className={`${open ? menuHeight : 'h-0'
          } data-twe-collapse-item transition-all delay-150 duration-300 overflow-hidden w-full`}
      >
        <div className="container mx-auto my-3 border-t border-gray-200 px-2 pt-4">
          <ul className="flex flex-col gap-4">
            {menus.map(({ name, icon, href, target, onClick }) => (
              <NavItem key={name} href={href} target={target} onClick={onClick} afterClick={handleOpen}>
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
