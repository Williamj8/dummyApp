import React, { useEffect, useState, useRef } from 'react';
import { Card, Row, Col, Select, Tag, Button, message } from 'antd';
import axios from 'axios';
import InputComponent from './input';
import StoreTable from './storeTable';

const { Option } = Select;

interface DivType {
  value: string;
  viewValue: string;
}

interface FlagType {
  flagName: string;
  flagViewName: string;
  flagLevel: string;
  flagValue?: boolean | null;
}

const DropdownInputCard: React.FC = () => {
  const [dropdownData, setDropdownData] = useState<DivType[]>([]);
  const [selectedDiv, setSelectedDiv] = useState<DivType | null>(null);
  const [hasFlagChanges, setHasFlagChanges] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [idList, setIdList] = useState<number[]>([]);
  const [flags, setFlags] = useState<FlagType[]>([]);
  const [flagMap, setFlagMap] = useState<Record<string, boolean | null>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(false);
  const initialFlagValues = useRef<Record<string, boolean | null>>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/storeGet.json');
        setDropdownData(response.data.div);
        setFlags(response.data.flags);

        // Initialize flag map
        const initialMap: Record<string, boolean | null> = {};
        response.data.flags.forEach((flag: FlagType) => {
          initialMap[flag.flagName] = flag.flagValue ?? null;
        });
        setFlagMap(initialMap);
        initialFlagValues.current = { ...initialMap };
      } catch (error) {
        message.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // New effect to check for flag changes
  useEffect(() => {
    const changesExist = Object.keys(flagMap).some(
      key => flagMap[key] !== initialFlagValues.current[key]
    );
    setHasFlagChanges(changesExist);
  }, [flagMap]);

  const handleSelectDiv = (value: string) => {
    const selected = dropdownData.find(item => item.value === value);
    if (selected) {
      setSelectedDiv(selected);
      setIdList([]); // Clear any existing IDs when selecting from dropdown
      setInputValue(''); // Clear input field
      setHasChanges(true);
    }
  };

  const handleClearDiv = () => {
    setSelectedDiv(null);
    checkForChanges();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && inputValue.trim()) {
      e.preventDefault();
      const num = parseInt(inputValue.trim(), 10);
      if (!isNaN(num)) {
        if (!idList.includes(num)) {
          setIdList([...idList, num]);
          setSelectedDiv(null)
          setHasChanges(true);
        } else {
          message.warning('Only unique numbers are allowed');
        }
      } else {
        message.warning('Only numbers are allowed');
      }
      setInputValue('');
    }
  };

  const removeId = (id: number) => {
    setIdList(idList.filter(i => i !== id));
    checkForChanges();
  };

  const handleFlagChange = (flagName: string, value: string) => {
    const parsedValue = value === 'on' ? true : value === 'off' ? false : null;
    setFlagMap(prev => ({ ...prev, [flagName]: parsedValue }));
    checkForChanges();
  };

  const checkForChanges = () => {
    const flagChanges = Object.keys(flagMap).some(
      key => flagMap[key] !== initialFlagValues.current[key]
    );
    const otherChanges = !!selectedDiv || idList.length > 0;
    setHasChanges(flagChanges || otherChanges);
  };

  const handleUpdate = () => {
    const changedFlags = flags
      .filter(flag => flagMap[flag.flagName] !== initialFlagValues.current[flag.flagName])
      .map(flag => ({
        ...flag,
        flagValue: flagMap[flag.flagName] ?? null,
      }));

    const payload = {
      selectAll: false,
      divCode: selectedDiv?.value || null,
      divName: selectedDiv?.viewValue || null,
      idList: idList.map(String),
      flags: changedFlags,
      // ... other payload fields
    };

    axios.post('/api/storePayload.json', payload)
      .then(() => {
        message.success('Updated successfully');
        initialFlagValues.current = { ...flagMap };
        setHasChanges(false);
      })
      .catch(() => message.error('Failed to update'));
  };

  return (
    <>
      <Card style={{ width: '100%' }}>
        <Row gutter={16}>
          <Col span={10}>
            {selectedDiv ? (
              <Tag closable onClose={handleClearDiv}>
                {selectedDiv.viewValue}
              </Tag>
            ) : (
              <Select
                style={{ width: '100%' }}
                placeholder={loading ? 'Loading...' : 'Select division'}
                loading={loading}
                onChange={handleSelectDiv}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                }
                disabled={idList.length > 0}
              >
                {dropdownData.map(item => (
                  <Option key={item.value} value={item.value}>
                    {item.viewValue}
                  </Option>
                ))}
              </Select>
            )}
          </Col>
          <Col span={14}>
            <InputComponent
              placeholder="Enter numeric IDs"
              value={inputValue}
              idList={idList}
              onChange={setInputValue}
              onKeyDown={handleInputKeyDown}
              onRemoveId={removeId}
              disabled={!!selectedDiv}
            />
          </Col>
        </Row>
      </Card>

      <Button
        type="primary"
        onClick={handleUpdate}
        style={{ margin: '16px 0' }}
        disabled={!hasFlagChanges}
      >
        Update
      </Button>

      <StoreTable
        flags={flags}
        flagMap={flagMap}
        onFlagChange={handleFlagChange}
      />
    </>
  );
};

export default DropdownInputCard;