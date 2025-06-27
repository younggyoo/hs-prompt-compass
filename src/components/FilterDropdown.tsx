
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FilterDropdownProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  isRole?: boolean;
}

const FilterDropdown = ({ label, options, value, onChange, isRole = false }: FilterDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={`flex items-center gap-2 justify-between border-gray-300 dark:border-gray-600 ${
            isRole 
              ? "min-w-[200px] rounded-2xl px-6 py-2" 
              : "min-w-[100px]"
          }`}
        >
          <span className="text-sm font-medium">{label}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {value}
          </span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {options.map((option) => (
          <DropdownMenuItem
            key={option}
            onClick={() => onChange(option)}
            className={`cursor-pointer ${
              value === option 
                ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300" 
                : ""
            }`}
          >
            {option}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FilterDropdown;
