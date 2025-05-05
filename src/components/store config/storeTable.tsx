import React, { useState } from 'react';
import { Card, Row, Col, Select } from 'antd';
import SearchInput from './searchFilter';

const { Option } = Select;

interface FlagType {
  flagName: string;
  flagViewName: string;
  flagLevel: string;
}

interface StoreTableProps {
  flags: FlagType[];
  flagMap: Record<string, boolean | null>;
  onFlagChange: (flagName: string, value: string) => void;
}

const StoreTable: React.FC<StoreTableProps> = ({ flags, flagMap, onFlagChange }) => {
  const [rootSearchValue, setRootSearchValue] = useState('');
  const [featureSearchValue, setFeatureSearchValue] = useState('');
  const flagOptions = ['none', 'on', 'off'];

  const renderFlagSelect = (flag: FlagType) => (
    <Row key={flag.flagName} style={{ marginBottom: 8 }}>
      <Col span={12}>{flag.flagViewName}</Col>
      <Col span={12}>
        <Select
          style={{ width: '100%' }}
          value={
            flagMap[flag.flagName] === true ? 'on' :
            flagMap[flag.flagName] === false ? 'off' : 'none'
          }
          onChange={(value) => onFlagChange(flag.flagName, value)}
        >
          {flagOptions.map(opt => (
            <Option key={opt} value={opt}>
              {opt}
            </Option>
          ))}
        </Select>
      </Col>
    </Row>
  );

  const filterFlags = (flags: FlagType[], searchValue: string) => {
    if (!searchValue) return flags;
    return flags.filter(flag => 
      flag.flagViewName.toLowerCase().includes(searchValue.toLowerCase())
    );
  };

  const rootFlags = flags.filter(f => f.flagLevel === 'root');
  const featureFlags = flags.filter(f => f.flagLevel === 'sFeature');

  const filteredRootFlags = filterFlags(rootFlags, rootSearchValue);
  const filteredFeatureFlags = filterFlags(featureFlags, featureSearchValue);

  return (
    <Row gutter={16}>
      <Col span={12}>
        <Card 
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Root Flags</span>
              <SearchInput
                onSearch={(value) => setRootSearchValue(value)}
                onReset={() => setRootSearchValue('')}
                placeholder="Search root flags"
              />
            </div>
          }
        >
          {filteredRootFlags.length > 0 ? 
            filteredRootFlags.map(renderFlagSelect) : 
            <div>No matching flags found</div>}
        </Card>
      </Col>
      <Col span={12}>
        <Card 
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Feature Flags</span>
              <SearchInput
                onSearch={(value) => setFeatureSearchValue(value)}
                onReset={() => setFeatureSearchValue('')}
                placeholder="Search feature flags"
              />
            </div>
          }
        >
          {filteredFeatureFlags.length > 0 ? 
            filteredFeatureFlags.map(renderFlagSelect) : 
            <div>No matching flags found</div>}
        </Card>
      </Col>
    </Row>
  );
};

export default StoreTable;