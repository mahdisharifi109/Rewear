"use client";

import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface SelectOrInputProps {
  options: string[];
  value?: string;
  onChange: (value: string) => void; // Sintaxe corrigida aqui
  placeholder?: string;
}

const OTHER_VALUE = "---outro---";

export function SelectOrInput({ options, value, onChange, placeholder }: SelectOrInputProps) {
  // Determina se o valor atual é uma das opções ou um valor personalizado
  const isCustomValue = value && !options.includes(value);
  
  // O estado interno controla o que o <Select> mostra
  const [selectedValue, setSelectedValue] = useState(isCustomValue ? OTHER_VALUE : value);

  // Sincroniza o estado interno se o valor externo mudar
  useEffect(() => {
    const isValueInOptions = value && options.includes(value);
    setSelectedValue(isValueInOptions ? value : (value ? OTHER_VALUE : ""));
  }, [value, options]);

  const handleSelectChange = (newValue: string) => {
    setSelectedValue(newValue);
    if (newValue !== OTHER_VALUE) {
      onChange(newValue); // Se for uma opção normal, passa o valor
    } else {
      onChange(''); // Se for "Outro", limpa o valor para o utilizador escrever
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value); // Atualiza o valor conforme o utilizador escreve
  };

  return (
    <div className="space-y-2">
      <Select onValueChange={handleSelectChange} value={selectedValue}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map(option => (
            <SelectItem key={option} value={option}>{option}</SelectItem>
          ))}
          <SelectItem value={OTHER_VALUE}>Outro...</SelectItem>
        </SelectContent>
      </Select>

      {/* A caixa de texto só aparece se "Outro..." estiver selecionado */}
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