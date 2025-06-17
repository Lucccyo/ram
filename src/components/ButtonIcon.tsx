import React from "react";
import { twMerge } from "tailwind-merge";

interface ButtonIconProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  className?: string;
}

export const ButtonIcon: React.FC<ButtonIconProps> = ({ icon, className, ...props }) => {
  const baseClasses = "flex justify-center items-center rounded-md cursor-pointer w-[36px] h-[36px]";
  return (
    <button
      {...props}
      className={twMerge(baseClasses, className)}
    >
      {icon}
    </button>
  );
};