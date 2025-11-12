"use client";

import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface SelectOrInputProps {
  options: string[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string; // Propriedade id adicionada
}

const OTHER_VALUE = "---outro---";

export function SelectOrInput({ options, value, onChange, placeholder, id }: SelectOrInputProps) {
  const isCustomValue = value && !options.includes(value);
  const [selectedValue, setSelectedValue] = useState(isCustomValue ? OTHER_VALUE : value);

  useEffect(() => {
    const isValueInOptions = value && options.includes(value);
    setSelectedValue(isValueInOptions ? value : (value ? OTHER_VALUE : ""));
  }, [value, options]);

  const handleSelectChange = (newValue: string) => {
    setSelectedValue(newValue);
    if (newValue !== OTHER_VALUE) {
      onChange(newValue);
    } else {
      onChange('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
  <div className="space-y-2 bg-accent/20 rounded-md p-2">
      <Select onValueChange={handleSelectChange} value={selectedValue}>
        {/* O id é passado para o SelectTrigger para se conectar à Label */}
        <SelectTrigger id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map(option => (
            <SelectItem key={option} value={option}>{option}</SelectItem>
          ))}
          <SelectItem value={OTHER_VALUE}>Outro...</SelectItem>
        </SelectContent>
      </Select>

      {selectedValue === OTHER_VALUE && (
        <Input
          placeholder="Escreva a sua opção aqui..."
          value={value}
          onChange={handleInputChange}
          className="mt-2"
        />
      )}
    </div>
  );
}