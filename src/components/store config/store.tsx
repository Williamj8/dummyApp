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
  const [textFields, setTextFields] = useState<TextFieldConfig[]>([]);
  // const [values, setValues] = useState({
  //   displayDays: undefined as number | undefined,
  //   largeCap: undefined as number | undefined,
  //   largeThreshold: undefined as number | undefined
  // });
  const [values, setValues] = useState<Record<string, number | undefined>>({});

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
        setTextFields(response.data.textField);
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
  
    const specialFlags = [
      'isGF2agEnabled',
      'is3PFlagEnabled',
      'isWfcFlagEnabled',
      'isOAmandaFlagEnabled',
      'isPipSpFlagEnabled',
      'isInterFlagEnabled'
    ];
  
    specialFlags.forEach(flagName => {
      if (currentFlagMap[flagName] === true) {
        // Only set error if the flag is on AND modal values are invalid
        switch (flagName) {
          case 'isGF2agEnabled':
            errors[flagName] = !currentModalValues[flagName]?.tpl?.[0]?.seqId;
            break;
          case 'is3PFlagEnabled':
            errors[flagName] = !currentModalValues[flagName]?.tplP?.length;
            break;
          case 'isWfcFlagEnabled':
            errors[flagName] = !currentModalValues[flagName]?.wfcId;
            break;
          case 'isOAmandaFlagEnabled':
            errors[flagName] = !currentModalValues[flagName]?.editLevel;
            break;
          case 'isPipSpFlagEnabled':
            errors[flagName] = !(
              currentModalValues[flagName]?.slow?.risk &&
              currentModalValues[flagName]?.slow?.highrisk &&
              currentModalValues[flagName]?.slow?.lowrisk
            );
            break;
          case 'isInterFlagEnabled':
            errors[flagName] = !(
              currentModalValues[flagName]?.intraConfig?.hours !== null &&
              currentModalValues[flagName]?.intraConfig?.perc !== null &&
              currentModalValues[flagName]?.intraConfig?.items !== null
            );
            break;
          default:
            errors[flagName] = false;
        }
      } else {
        // If flag is not on, no error
        errors[flagName] = false;
      }
    });
  
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
  
    // Check if all required modal values are present for active special flags
    const newErrors = validateForm(flagMap, modalValues);
    setFormErrors(newErrors);
  
    // Update hasChanges
    setHasChanges(flagChanges || otherChanges || 
      Object.keys(modalValues).some(key => modalValues[key] !== undefined));
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

  const prepareFields = (
    fieldNames: string[],
    constraints: Record<string, { min?: number; max?: number }>
  ) => {
    return textFields
      .filter(field => fieldNames.includes(field.textName))
      .map(field => ({
        ...field,
        ...constraints[field.textName],
        required: false
      }));
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

      //  textField payload
      const formValues = form.getFieldsValue();

      const textFieldPayload = textFields.map(field => ({
        textName: field.textName,
        textViewName: field.textViewName,
        textLevel: field.textLevel,
        textType: field.textType,
        textValue: formValues[field.textName]?.toString() || ''
      }));
      
  
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
      textField: textFieldPayload,
      ...modalValues,
      ...(flagMap['isInterFlagEnabled'] === true && { 
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
    <Form form={form}
    onValuesChange={() => setHasChanges(true)}
    validateTrigger={['onChange', 'onBlur']}
     
     >
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
      fields={prepareFields(['displayDays'], {
        displayDays: { min: 1, max: 15 }
      })}
      form={form}
    />
      
      <FieldCard
        title="B2B Settings"
        fields={prepareFields(['largeCap', 'largeThreshold'], {
          largeCap: { min: 0, max: 100 },
          largeThreshold: { min: 1, max: 999 }
        })}
        form={form}
      />

    </Form>
  );
};

export default DropdownInputCard;