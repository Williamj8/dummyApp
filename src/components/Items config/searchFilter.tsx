import React, { useState, useRef, useEffect } from 'react';
import { Input, Button } from 'antd';
import { SearchOutlined, CloseOutlined } from '@ant-design/icons';

interface SearchInputProps {
    onSearch: (value: string) => void;
    onReset: () => void;
    placeholder?: string;
  }

const SearchInput: React.FC<SearchInputProps> = ({ 
  onSearch, 
  onReset, 
  placeholder = 'Search' 
}) => {
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const inputRef = useRef<HTMLDivElement>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch(value);
  };

  const handleReset = () => {
    setSearchValue('');
    setSearchVisible(false);
    onReset();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        handleReset();
      }
    };

    if (searchVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchVisible]);

  return (
    <div ref={inputRef}>
      {searchVisible ? (
        <Input
          placeholder={placeholder}
          value={searchValue}
          onChange={handleSearchChange}
          style={{ width: 200 }}
          suffix={
            <CloseOutlined 
              onClick={handleReset} 
              style={{ cursor: 'pointer' }}
            />
          }
          autoFocus
        />
      ) : (
        <Button 
          type="text" 
          icon={<SearchOutlined />} 
          onClick={() => setSearchVisible(true)}
        />
      )}
    </div>
  );
};

export default SearchInput;