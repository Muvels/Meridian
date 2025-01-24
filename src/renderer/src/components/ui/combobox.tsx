'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const frameworks = [
  { value: '!g', label: 'Google' },
  { value: '!bing', label: 'Bing' },
  { value: '!ec', label: 'Ecosia' },
  { value: '', label: 'DuckDuckGo' },
  { value: '!yt', label: 'Youtube' },
  { value: '!gh', label: 'Github' },
  { value: '!twitch', label: 'Twitch' },
  { value: '!r', label: 'Reddit' }
];

interface ComboboxProps {
  bang: string;
  onBangChange: (bang: string) => void; // Callback function to notify parent of bang changes
}

const extractPrefix = (input: string): string | null => {
  const match = input.match(/^!\w+/); // Matches any word-like prefix starting with "!"
  return match ? match[0] : null; // Returns the matched prefix or null if no match
};

export const Combobox = ({ bang, onBangChange }: ComboboxProps): JSX.Element => {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(extractPrefix(bang) ?? '!g');

  // Synchronize value state with bang prop
  React.useEffect(() => {
    const extractedValue = extractPrefix(bang) ?? '!g'; // Default to '!g' if no valid bang
    if (extractedValue !== value) {
      setValue(extractedValue);
    }
  }, [bang, value]);

  React.useEffect(() => {
    onBangChange(value); // Call the callback with the updated value
  }, [value, onBangChange]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" role="combobox" aria-expanded={open} className="justify-between">
          {frameworks.find((framework) => framework.value === value)?.label ?? 'other'}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="text-white p-0 bg-gray-600 backdrop-blur-2xl border-none outline-none">
        <Command>
          <CommandInput placeholder="Search bang..." className="h-9" />
          <CommandList>
            <CommandEmpty>No bang found.</CommandEmpty>
            <CommandGroup>
              {frameworks.map((framework) => (
                <CommandItem
                  key={framework.value}
                  value={framework.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? '' : currentValue);
                    setOpen(false);
                  }}
                >
                  {framework.label}
                  <Check
                    className={cn(
                      'ml-auto',
                      value === framework.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
