import React from 'react';
import { Input, Tag } from 'antd';

interface InputComponentProps {
  placeholder?: string;
  disabled?: boolean;
  value?: string;
  idList?: number[];
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onChange?: (value: string) => void;
  onRemoveId?: (id: number) => void;
}

const InputComponent: React.FC<InputComponentProps> = ({
  placeholder = 'Enter numeric IDs',
  disabled = false,
  value = '',
  idList = [],
  onKeyDown,
  onChange,
  onRemoveId,
}) => {
  return (
    <div>
    <Input
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      onKeyDown={onKeyDown}
      disabled={disabled}
      style={{ padding: "10px" }}  // Minimal inline style remains
    />
    <div className="tag-container">
      {idList.map(id => (
        <Tag key={id} closable onClose={() => onRemoveId?.(id)}>
          {id}
        </Tag>
      ))}
    </div>
  </div>
  );
};

export default InputComponent;