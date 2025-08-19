import React from "react";

type ButtonProps = {
  onClick?: () => void;
  children: React.ReactNode;
  bgColor?: string;
  hoverBgColor?: string;
  textColor?: string;
  outlineColor?: string;
  disabled?: boolean;
  className?: string;
};

export const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  bgColor = "bg-black",
  hoverBgColor = "hover:bg-gray-800",
  textColor = "text-white",
  outlineColor,
  disabled = false,
  className = "",
}) => {
  const outlineClass = outlineColor
    ? `outline outline-${outlineColor} outline-4`
    : "";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full ${bgColor} ${textColor} py-2 px-4 ${hoverBgColor} rounded ${outlineClass} transition duration-200 mb-5 ${className}`}
    >
      {children}
    </button>
  );
};
