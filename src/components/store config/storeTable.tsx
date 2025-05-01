import React from 'react';
import { Card, Row, Col, Select } from 'antd';

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

  const rootFlags = flags.filter(f => f.flagLevel === 'root');
  const featureFlags = flags.filter(f => f.flagLevel === 'sFeature');

  return (
    <Row gutter={16}>
      <Col span={12}>
        <Card title="Root Flags">
          {rootFlags.map(renderFlagSelect)}
        </Card>
      </Col>
      <Col span={12}>
        <Card title="Feature Flags">
          {featureFlags.map(renderFlagSelect)}
        </Card>
      </Col>
    </Row>
  );
};

export default StoreTable;