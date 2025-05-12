import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Card, Row, Col, Select, Tag, Button, message, Form } from 'antd';
import axios from 'axios';
import InputComponent from './input';
import StoreTable from './storeTable';
import FieldCard from './DisplayDaysCard';

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

interface TextFieldConfig {
  textName: string;
  textViewName: string;
  textLevel: string;
  textType: string;
  min?: number;
  max?: number;
}

interface ApiResponse {
  div: Array<{ value: string; viewValue: string }>;
  flags: Array<{ flagName: string; flagViewName: string; flagLevel: string }>;
  textField: TextFieldConfig[];
}


const DropdownInputCard: React.FC = () => {
  const [form] = Form.useForm();
  const [dropdownData, setDropdownData] = useState<DivType[]>([]);
  const [selectedDiv, setSelectedDiv] = useState<DivType | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [idList, setIdList] = useState<number[]>([]);
  const [flags, setFlags] = useState<FlagType[]>([]);
  const [flagMap, setFlagMap] = useState<Record<string, boolean | null>>({});
  const [loading, setLoading] = useState(false);
  const initialFlagValues = useRef<Record<string, boolean | null>>({});
  const [modalValues, setModalValues] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [values, setValues] = useState({
    displayDays: undefined as number | undefined,
    largeCap: undefined as number | undefined,
    largeThreshold: undefined as number | undefined
  });

  // Initialize data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/storeGet.json');
        setDropdownData(response.data.div);
        setFlags(response.data.flags);

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

  // Memoized validation function
  const validateForm = useCallback((currentFlagMap: Record<string, boolean | null>, currentModalValues: Record<string, any>) => {
    const errors: Record<string, boolean> = {};
    
    if (currentFlagMap['isGF2agEnabled'] === true) {
      errors['isGF2agEnabled'] = !currentModalValues['isGF2agEnabled']?.tpl?.length;
    }
    
    if (currentFlagMap['is3PFlagEnabled'] === true) {
      errors['is3PFlagEnabled'] = !currentModalValues['is3PFlagEnabled']?.tplP?.length;
    }
    
    if (currentFlagMap['isWfcFlagEnabled'] === true) {
      errors['isWfcFlagEnabled'] = !currentModalValues['isWfcFlagEnabled']?.wfcId;
    }
    
    if (currentFlagMap['isOAmandaFlagEnabled'] === true) {
      errors['isOAmandaFlagEnabled'] = !currentModalValues['isOAmandaFlagEnabled']?.editLevel;
    }
    
    if (currentFlagMap['isPipSpFlagEnabled'] === true) {
      errors['isPipSpFlagEnabled'] = !(
        currentModalValues['isPipSpFlagEnabled']?.intraConfig?.hours &&
        currentModalValues['isPipSpFlagEnabled']?.intraConfig?.perc &&
        currentModalValues['isPipSpFlagEnabled']?.intraConfig?.items
      );
    } 

    if (currentFlagMap['isInterFlagEnabled'] === true) {
      errors['isInterFlagEnabled'] = !(
        currentModalValues['isInterFlagEnabled']?.intraConfig?.hours !== null &&
        currentModalValues['isInterFlagEnabled']?.intraConfig?.perc !== null &&
        currentModalValues['isInterFlagEnabled']?.intraConfig?.items !== null
      );
    }

    return errors;
  }, []);

  // Check for changes and update form state
  const updateFormState = useCallback(() => {
    // Check flag changes
    const flagChanges = Object.keys(flagMap).some(
      key => flagMap[key] !== initialFlagValues.current[key]
    );
    
    // Check other changes
    const otherChanges = !!selectedDiv || idList.length > 0;
    
    // Check modal values for active flags
    const modalChanges = Object.keys(flagMap).some(key => {
      if (flagMap[key] === true && [
        'isGF2agEnabled',
        'is3PFlagEnabled',
        'isWfcFlagEnabled',
        'isOAmandaFlagEnabled',
        'isPipSpFlagEnabled',
        'isInterFlagEnabled'
      ].includes(key)) {
        return !modalValues[key];
      }
      return false;
    });

    // Update hasChanges
    setHasChanges(flagChanges || otherChanges || modalChanges);

    // Update form errors
    const newErrors = validateForm(flagMap, modalValues);
    setFormErrors(newErrors);
  }, [flagMap, selectedDiv, idList, modalValues, validateForm]);

  // Update form state when relevant state changes
  useEffect(() => {
    updateFormState();
  }, [flagMap, selectedDiv, idList, modalValues, updateFormState]);

  const handleSelectDiv = (value: string) => {
    const selected = dropdownData.find(item => item.value === value);
    if (selected) {
      setSelectedDiv(selected);
      setIdList([]);
      setInputValue('');
    }
  };

  const handleClearDiv = () => {
    setSelectedDiv(null);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && inputValue.trim()) {
      e.preventDefault();
      const num = parseInt(inputValue.trim(), 10);
      if (!isNaN(num)) {
        if (!idList.includes(num)) {
          setIdList([...idList, num]);
          setSelectedDiv(null);
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
  };

  const handleFlagChange = (flagName: string, value: string) => {
    const parsedValue = value === 'on' ? true : value === 'off' ? false : null;
    setFlagMap(prev => {
      const newFlagMap = { ...prev, [flagName]: parsedValue };
      return newFlagMap;
    });
    
    if (parsedValue !== true) {
      setModalValues(prev => ({ ...prev, [flagName]: undefined }));
    }
  };


  // below cards input
  // const handleSettingChange = (name: string, value: number | undefined) => {
  //   setSettings(prev => ({ ...prev, [name]: value }));
  // };

  const handleModalSubmit = (flagName: string, values: any) => {
    setModalValues(prev => ({ ...prev, [flagName]: values }));
  };

  const handleUpdate = () => {
    const currentErrors = validateForm(flagMap, modalValues);
    setFormErrors(currentErrors);
  
    if (Object.values(currentErrors).some(error => error)) {
      message.error('Please complete all required fields');
      return;
    }
  
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
      ...modalValues,
      ...(flagMap['isInterFlagEnabled'] === true && { 
        isInterFlagEnabled: true,
        intraConfig: modalValues['isInterFlagEnabled']?.intraConfig || {
          hours: null,
          perc: null,
          items: null
        }
      })
    };
  
    axios.post('/api/storePayload.json', payload)
      .then(() => {
        message.success('Updated successfully');
        initialFlagValues.current = { ...flagMap };
        setHasChanges(false);
      })
      .catch(() => message.error('Failed to update'));
  };

  const isUpdateDisabled = !hasChanges || Object.values(formErrors).some(error => error);

  return (
    <Form form={form}>
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
        disabled={isUpdateDisabled}
      >
        Update
      </Button>

      <StoreTable
        flags={flags}
        flagMap={flagMap}
        onFlagChange={handleFlagChange}
        onModalSubmit={handleModalSubmit}
        formErrors={formErrors}
      />

<FieldCard
        title="Display Settings"
        fields={[
          { name: 'displayDays', label: 'Display Days (1-15)', min: 1, max: 15 }
        ]}
        values={values}
        onChange={(name, value) => setValues(prev => ({ ...prev, [name]: value }))}
      />
      
      <FieldCard
        title="B2B Settings"
        fields={[
          { name: 'largeCap', label: 'Large Cap (0-100)', min: 0, max: 100 },
          { name: 'largeThreshold', label: 'Large Threshold (1-999)', min: 1, max: 999 }
        ]}
        values={values}
        onChange={(name, value) => setValues(prev => ({ ...prev, [name]: value }))}
      />

    </Form>
  );
};

export default DropdownInputCard;