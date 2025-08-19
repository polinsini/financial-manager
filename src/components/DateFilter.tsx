import React from "react";
import { Button } from "./Button";
import { DATE_FILTER_OPTIONS, type DateFilterValue } from "./constants";

type DateFilterProps = {
  value: DateFilterValue;
  onChange: (val: DateFilterValue) => void;
};

export const DateFilter: React.FC<DateFilterProps> = ({ value, onChange }) => {
  return (
    <div className="flex gap-2 mb-6">
      {DATE_FILTER_OPTIONS.map(({ value: option, label }) => (
        <Button
          key={option}
          bgColor={value === option ? "bg-lime-600" : "bg-gray-800"}
          hoverBgColor={
            value === option ? "hover:bg-lime-700" : "hover:bg-gray-700"
          }
          textColor={value === option ? "text-black" : "text-white"}
          className="px-4 py-2 font-semibold"
          onClick={() => onChange(option)}
        >
          {label}
        </Button>
      ))}
    </div>
  );
};
