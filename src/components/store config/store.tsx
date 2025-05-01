// DropdownInputCard.tsx
import React, { useEffect, useState, useRef } from 'react';
import { Button, message } from 'antd';
import axios from 'axios';
import DropdownInput from './input';
import StoreTable from './storeTable';

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
  const [selectedDiv, setSelectedDiv] = useState<DivType | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [idList, setIdList] = useState<number[]>([]);
  const [flags, setFlags] = useState<FlagType[]>([]);
  const [flagMap, setFlagMap] = useState<Record<string, boolean | null>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const initialFlagValues = useRef<Record<string, boolean | null>>({});

  useEffect(() => {
    axios.get('/api/storeGet.json').then((res) => {
      setFlags(res.data.flags);
      
      // Initialize flag map and store initial values
      const initialMap: Record<string, boolean | null> = {};
      res.data.flags.forEach((flag: FlagType) => {
        initialMap[flag.flagName] = flag.flagValue ?? null;
      });
      setFlagMap(initialMap);
      initialFlagValues.current = {...initialMap};
    }).catch(() => {
      message.error('Failed to load data');
    });
  }, []);

  const handleSelectDiv = (value: string) => {
    if (value) {
      setSelectedDiv({
        value: value.toLowerCase().replace(/\s+/g, '-'),
        viewValue: value
      });
      setIdList([]); // clear input
    } else {
      setSelectedDiv(null);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && inputValue.trim()) {
      e.preventDefault();
      const num = parseInt(inputValue.trim(), 10);
      if (!isNaN(num)) {
        if (!idList.includes(num)) {
          setIdList([...idList, num]);
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
    const newFlagMap = { ...flagMap, [flagName]: parsedValue };
    setFlagMap(newFlagMap);
    
    // Check if any flag has changed from its initial value
    const changesExist = Object.keys(newFlagMap).some(key => 
      newFlagMap[key] !== initialFlagValues.current[key]
    );
    setHasChanges(changesExist);
  };

  const handleUpdate = () => {
    // Only include changed flags in the payload
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
      tpl: [],
      tplP: [],
      editLevel: '',
      intra: { hours: null, util: null, item: null },
      slow: { risk: null, highrisk: null, lowrisk: null },
      textField: []
    };

    axios.post('/api/storePayload.json', payload)
      .then(() => {
        message.success('Updated successfully');
        initialFlagValues.current = {...flagMap};
        setHasChanges(false);
      })
      .catch(() => message.error('Failed to update'));
  };

  return (
    <>
      <DropdownInput
        dropdownApiUrl="/api/storeGet.json"
        dropdownApiDataPath="div"
        dropdownPlaceholder="Select division"
        inputPlaceholder="Enter numeric IDs"
        onDropdownSelect={handleSelectDiv}
        onInputChange={setInputValue}
        onInputKeyDown={handleInputKeyDown}
        onRemoveId={removeId}
        selectedItem={selectedDiv}
        inputValue={inputValue}
        idList={idList}
        inputDisabled={!!selectedDiv}
      />

      <Button 
        type="primary" 
        onClick={handleUpdate} 
        style={{ margin: '16px 0' }}
        disabled={!hasChanges}
      >
        Update
      </Button>

      <StoreTable flags={flags} flagMap={flagMap} onFlagChange={handleFlagChange} />
    </>
  );
};

export default DropdownInputCard;