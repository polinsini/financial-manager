import React from "react";

type InputProps = {
  label?: string;
  value: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
};

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  disabled,
  className = "",
  required,
}) => {
  return (
    <>
      {label && <label className="block mb-2 text-white">{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full p-2 mb-4 rounded bg-gray-800 border border-gray-700 focus:border-lime-600 focus:outline-none text-white ${className}`}
        required={required}
        disabled={disabled}
      />
    </>
  );
};
