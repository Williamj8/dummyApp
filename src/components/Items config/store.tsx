import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Card, Row, Col, Select, Tag, Button, message, Form } from 'antd';
import axios from 'axios';
import InputComponent from './input';
import StoreTable from './storeTable';
import FieldCard from './DisplayDaysCard';
import { formatSpecialFlagPayload } from './util';
import { SPECIAL_FLAGS } from './types';
import './StoreTable.css';
import './StoreTable.css';

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


    SPECIAL_FLAGS.forEach(flagName => {
      if (currentFlagMap[flagName] === true) {
        const formattedValue = currentModalValues[flagName] || formatSpecialFlagPayload(flagName, {});


        switch (flagName) {
          case 'isGF2agEnabled':
            errors[flagName] = !formattedValue.tpl?.length;
            break;
          case 'is3PFlagEnabled':
            errors[flagName] = !formattedValue.tplP?.length;
            break;
          case 'isWfcFlagEnabled':
            errors[flagName] = formattedValue.wfcId === null || formattedValue.wfcId === undefined;
            break;
          case 'isOAmandaFlagEnabled':
            errors[flagName] = formattedValue.editLevel === null || formattedValue.editLevel === undefined;
            break;
          case 'isPipSpFlagEnabled':
            errors[flagName] = !formattedValue.slow || (
              formattedValue.slow.risk === undefined ||
              formattedValue.slow.highrisk === undefined ||
              formattedValue.slow.lowrisk === undefined
            );
            break;
          case 'isInterFlagEnabled':
            errors[flagName] = !formattedValue.intraConfig || (
              formattedValue.intraConfig.hours === null ||
              formattedValue.intraConfig.perc === null ||
              formattedValue.intraConfig.items === null
            );
            break;
          default:
            errors[flagName] = false;
        }
      } else {
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
    const formattedValues = formatSpecialFlagPayload(flagName, values);
    setModalValues(prev => ({ ...prev, [flagName]: formattedValues }));
  };



  const handleUpdate = () => {
    const currentErrors = validateForm(flagMap, modalValues);
    setFormErrors(currentErrors);


    if (Object.values(currentErrors).some(error => error)) {
      message.error('Please complete all required fields');
      return;
    }


    // textField payload
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


    // Build payload with all special flags
    const specialFlagsPayload = SPECIAL_FLAGS.reduce((acc, flagName) => {
      const formattedValue = modalValues[flagName] || formatSpecialFlagPayload(flagName, {});
      return { ...acc, ...formattedValue };
    }, {});


    const payload = {
      selectAll: false,
      divCode: selectedDiv?.value || null,
      divName: selectedDiv?.viewValue || null,
      idList: idList.map(String),
      flags: changedFlags,
      textField: textFieldPayload,
      ...specialFlagsPayload
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

// Main component
<Card style={{ width: '100%' }}>
  <Row gutter={16} align="middle" style={{ minHeight: '64px' }}>
    {/* Input Column - 60% width */}
    <Col xs={24} sm={14} md={14} lg={14}>
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

    {/* Divider Column - Hidden on mobile */}
    <Col xs={0} sm={1} md={1} lg={1}>
      <div style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          borderLeft: '1px solid #E5E5E5',
          height: '56px'
        }} />
      </div>
    </Col>

    {/* Select Column - 40% width */}
    <Col xs={24} sm={9} md={9} lg={9}>
      {selectedDiv ? (
        <Tag closable onClose={handleClearDiv}>
          {selectedDiv.viewValue}
        </Tag>
      ) : (
        <Select
          placeholder={loading ? 'Loading...' : 'Select division'}
          style={{ width: '100%' }}
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

    
<Row gutter={[16, 24]} style={{ marginBottom: 24 }}>
  <Col xs={24} sm={24} md={12} lg={12} xl={12}>

    <FieldCard
      title="Display Settings"
      fields={prepareFields(['displayDays'], {
        displayDays: { min: 1, max: 15 }
      })}
      form={form}
    />
  </Col>

  <Col xs={24} sm={24} md={12} lg={12} xl={12}>
    <FieldCard
      title="B2B Settings"
      fields={prepareFields(['largeCap', 'largeThreshold'], {
        largeCap: { min: 0, max: 100 },
        largeThreshold: { min: 1, max: 999 }
      })}
      form={form}
    />
  </Col>
</Row>

    </Form>
  );
};

export default DropdownInputCard;