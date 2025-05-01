import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Select, Input, Tag } from 'antd';
import axios from 'axios';

const { Option } = Select;

interface DropdownItem {
  value: string;
  viewValue: string;
}

interface DropdownInputProps {
  dropdownApiUrl: string;
  dropdownApiDataPath?: string;
  dropdownPlaceholder?: string;
  inputPlaceholder?: string;
  inputDisabled?: boolean;
  onDropdownSelect?: (value: string) => void;
  onInputChange?: (value: string) => void;
  onInputKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onRemoveId?: (id: number) => void;
  selectedItem?: DropdownItem | null;
  inputValue?: string;
  idList?: number[];
}

const DropdownInput: React.FC<DropdownInputProps> = ({
  dropdownApiUrl,
  dropdownApiDataPath = 'div',
  dropdownPlaceholder = 'Select option',
  inputPlaceholder = 'Enter numeric IDs',
  inputDisabled = false,
  onDropdownSelect,
  onInputChange,
  onInputKeyDown,
  onRemoveId,
  selectedItem,
  inputValue = '',
  idList = [],
}) => {
  const [dropdownData, setDropdownData] = useState<DropdownItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDropdownData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(dropdownApiUrl);
        
        // Debugging: Log the full response
        console.log('API Response:', response.data);
        
        // Safely navigate the response data
        let data = response.data;
        if (dropdownApiDataPath) {
          const paths = dropdownApiDataPath.split('.');
          for (const path of paths) {
            if (data && data[path] !== undefined) {
              data = data[path];
            } else {
              console.error(`Path '${dropdownApiDataPath}' not found in response`);
              data = null;
              break;
            }
          }
        }
        
        if (Array.isArray(data)) {
          setDropdownData(data);
        } else {
          console.error('Dropdown data is not an array:', data);
          setError('Invalid data format received');
        }
      } catch (err) {
        console.error('API Error:', err);
        setError('Failed to load dropdown data');
      } finally {
        setLoading(false);
      }
    };

    fetchDropdownData();
  }, [dropdownApiUrl, dropdownApiDataPath]);

  return (
    <Card style={{ width: '100%' }}>
      <Row gutter={16}>
        <Col span={10}>
          {!selectedItem ? (
            <Select
              style={{ width: '100%' }}
              showSearch
              placeholder={loading ? 'Loading...' : error || dropdownPlaceholder}
              optionFilterProp="children"
              onChange={onDropdownSelect}
              filterOption={(input, option) =>
                ((option as any).children as string).toLowerCase().includes(input.toLowerCase())
              }
              loading={loading}
              disabled={loading || !!error}
            >
              {dropdownData.map(item => (
                <Option key={item.value} value={item.viewValue}>
                  {item.viewValue}
                </Option>
              ))}
            </Select>
          ) : (
            <Tag closable onClose={() => onDropdownSelect?.('')}>
              {selectedItem.viewValue}
            </Tag>
          )}
        </Col>

        <Col span={14}>
          <Input
            placeholder={inputPlaceholder}
            value={inputValue}
            onChange={(e) => onInputChange?.(e.target.value)}
            onKeyDown={onInputKeyDown}
            disabled={inputDisabled}
          />
          <div style={{ marginTop: 8 }}>
            {idList.map(id => (
              <Tag key={id} closable onClose={() => onRemoveId?.(id)}>
                {id}
              </Tag>
            ))}
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default DropdownInput;