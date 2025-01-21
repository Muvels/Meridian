import React, { useState } from 'react';

import { Input } from './ui/input';

const AddressBar = ({
  url,
  changeUrl
}: {
  url: string;
  changeUrl: (url: string) => void;
}): JSX.Element => {
  const [inputValue, setInputValue] = useState(url);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      changeUrl(inputValue); // Call changeUrl when Enter is pressed
    }
  };

  return (
    <nav className="text-white border-b-dark w-full h-full" id="drag">
      <div className="flex justify-center items-center w-full">
        <Input
          type="url"
          className="text-black w-1/3 text-center bg-white"
          id="no-drag"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)} // Update the input value locally
          onKeyDown={handleKeyDown} // Listen for Enter key
        />
      </div>
    </nav>
  );
};

export default AddressBar;
