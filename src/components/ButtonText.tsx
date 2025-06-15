import React from "react";

interface ButtonTextProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  title: string;
  className?: string;
}

export const ButtonText: React.FC<ButtonTextProps> = ({ title, className, ...props }) => {
  return (
    <button
      {...props}
      className={`${className} flex justify-center items-center rounded-md cursor-pointer transition-all duration-200 mr-2 py-2 px-4`}
    >
      {title}
    </button>
  );
};