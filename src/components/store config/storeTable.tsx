import React, { useState } from 'react';
import { Card, Row, Col, Select, Button, Form } from 'antd';
import SearchInput from './searchFilter';
import SharedModal from './FlagDetailsModal';
import './StoreTable.css';
import { SPECIAL_FLAGS } from './types';

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
  onModalSubmit: (flagName: string, values: any) => void;
  formErrors: Record<string, boolean>;
}

const StoreTable: React.FC<StoreTableProps> = ({
  flags,
  flagMap,
  onFlagChange,
  onModalSubmit,
  formErrors
}) => {
  const [rootSearchValue, setRootSearchValue] = useState('');
  const [featureSearchValue, setFeatureSearchValue] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [currentFlag, setCurrentFlag] = useState<FlagType | null>(null);
  const [modalValues, setModalValues] = useState<any>({});
  const flagOptions = ['none', 'on', 'off'];

  const showModal = (flag: FlagType) => {
    setCurrentFlag(flag);
    setModalVisible(true);
  };

  const handleModalOk = (values: any) => {
    if (currentFlag) {
      onModalSubmit(currentFlag.flagName, values);
      setModalValues((prev: any) => ({ ...prev, [currentFlag.flagName]: values }));
    }
    setModalVisible(false);
  };

  const isSpecialFlag = (flagName: string) => {
    return SPECIAL_FLAGS.includes(flagName);
  };

  
  const renderFlagSelect = (flag: FlagType) => {
    const isSpecial = isSpecialFlag(flag.flagName);
    const isFlagOn = flagMap[flag.flagName] === true;
    const hasError = isFlagOn && formErrors[flag.flagName];

    return (
      <Form.Item
        validateStatus={hasError ? 'error' : ''}
        help={hasError ? 'Please select the value in modal' : ''}
      >
        <Row key={flag.flagName} className='flagRow'>
          <Col span={12} className='flagName'>
            <div>{flag.flagViewName}</div>
            {isSpecial && isFlagOn && (
              <Button
                type="link"
                size="small"
                onClick={() => showModal(flag)}
                style={{ paddingLeft: 0, marginTop: 4 }}
              >
                Edit Config
              </Button>
            )}
          </Col>
          <Col span={12}>
            <Select
              className={`flagSelect ${hasError ? 'ant-select-status-error' : ''}`}
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
      </Form.Item>
    );
  };

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
    <div className='container'>
      <div className='cardContainer'>
        <Card
          title={
            <div className='cardHeader'>
              <span>Root Flags</span>
              <SearchInput
                onSearch={(value) => setRootSearchValue(value)}
                onReset={() => setRootSearchValue('')}
                placeholder="Search root flags"
              />
            </div>
          }
          className='cardBody'
        >
          {filteredRootFlags.length > 0 ?
            filteredRootFlags.map(renderFlagSelect) :
            <div className='noFlagsMessage'>No matching flags found</div>}
        </Card>
      </div>
      <div className='cardContainer'>
        <Card
          title={
            <div className='cardHeader'>
              <span>Feature Flags</span>
              <SearchInput
                onSearch={(value) => setFeatureSearchValue(value)}
                onReset={() => setFeatureSearchValue('')}
                placeholder="Search feature flags"
              />
            </div>
          }
          className="cardBody"
        >
          <SharedModal
            flag={currentFlag}
            visible={modalVisible}
            onOk={handleModalOk}
            onCancel={() => setModalVisible(false)}
            initialValues={currentFlag ? modalValues[currentFlag.flagName] : undefined}
          />
          {filteredFeatureFlags.length > 0 ?
            filteredFeatureFlags.map(renderFlagSelect) :
            <div className='noFlagsMessage'>No matching flags found</div>}
        </Card>
      </div>
    </div>
  );
};

export default StoreTable;