import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Form, Input, Table, Select, Button, message } from 'antd';
import axios from 'axios';

const { Option } = Select;

interface SharedModalProps {
  flag: any;
  visible: boolean;
  onOk: (values: any) => void;
  onCancel: () => void;
  initialValues?: any;
}

const SharedModal: React.FC<SharedModalProps> = ({
  flag,
  visible,
  onOk,
  onCancel,
  initialValues
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [isFormValid, setIsFormValid] = useState(false);
  const [validationTimeout, setValidationTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (visible && flag) {
      form.resetFields();
      if (initialValues) {
        form.setFieldsValue(initialValues);
        validateForm();
      }
      
      if (flag.flagName === 'is3PFlagEnabled') {
        fetch3POptions();
      }
    }
    return () => {
      if (validationTimeout) clearTimeout(validationTimeout);
    };
  }, [visible, flag]);

  const fetch3POptions = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/ref3pp.json');
      if (Array.isArray(response?.data)) {
        setOptions(response.data);
      } else {
        console.error('Expected array but got:', response.data);
        setOptions([]);
      }
    } catch (error) {
      console.error('Error fetching options:', error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = useCallback(() => {
    if (validationTimeout) clearTimeout(validationTimeout);
    
    const timeout = setTimeout(async () => {
      try {
        await form.validateFields();
        setIsFormValid(true);
      } catch {
        setIsFormValid(false);
      }
    }, 300);
    
    setValidationTimeout(timeout);
  }, [form, validationTimeout]);


  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      let formattedValues = {};
      
      switch (flag.flagName) {
        case 'isGF2agEnabled':
          formattedValues = {
            tpl: [{
              seqId: values.seqId || "1",
              ventor: values.ventor || "Door"
            }]
          };
          break;
        case 'is3PFlagEnabled':
          formattedValues = {
            tplP: values.tplP ? [values.tplP] : []
          };
          break;
        case 'isWfcFlagEnabled':
          formattedValues = {
            wfcId: values.wfcId
          };
          break;
        case 'isOAmandaFlagEnabled':
          formattedValues = {
            editLevel: values.editLevel
          };
          break;
        case 'isPipSpFlagEnabled':
          formattedValues = {
            slow: {
              risk: values.risk,
              highrisk: values.highrisk,
              lowrisk: values.lowrisk
            }
          };
          break;
        default:
          formattedValues = values;
      }
      
      onOk(formattedValues);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const validateHighRisk = (_: any, value: string) => {
    const lowRisk = form.getFieldValue('lowrisk');
    if (value && lowRisk && parseInt(value) <= parseInt(lowRisk)) {
      return Promise.reject('High risk must be greater than low risk');
    }
    return Promise.resolve();
  };

  const renderModalContent = () => {
    if (!flag) return null;

    switch (flag.flagName) {
      case 'isGF2agEnabled':
        return (
          <Form.Item label="tpl">
            <Table 
              dataSource={[{ key: '1', seq: 'DOOR', sid: '1' }]}
              columns={[
                { title: 'seq', dataIndex: 'seq', key: 'seq' },
                { 
                  title: 'Sid', 
                  dataIndex: 'sid', 
                  key: 'sid',
                  render: (_, record) => (
                    <Form.Item
                      name="seqId"
                      rules={[{ required: true, message: 'Please select a value' }]}
                      initialValue="1"
                    >
                      <Select onChange={validateForm}>
                        <Option value="1">1</Option>
                      </Select>
                    </Form.Item>
                  )
                }
              ]}
              pagination={false}
            />
          </Form.Item>
        );
      case 'is3PFlagEnabled':
        return (
          <Form.Item
            label="tplP"
            name="tplP"
            rules={[{ required: true, message: 'Please select at least one value' }]}
          >
            <Select
              mode="multiple"
              loading={loading}
              placeholder={loading ? 'Loading...' : 'Select values'}
              onChange={validateForm}
            >
              {Array.isArray(options) && options.map(opt => (
                <Option key={opt} value={opt}>{opt}</Option>
              ))}
            </Select>
          </Form.Item>
        );
      case 'isWfcFlagEnabled':
        return (
          <Form.Item
            label="WFC"
            name="wfcId"
            rules={[
              { required: true, message: 'Please enter a value' },
              { pattern: /^\d{1,8}$/, message: 'Must be 1-8 digits' }
            ]}
          >
            <Input 
              type="number" 
              min={1} 
              max={99999999}
              onChange={validateForm}
            />
          </Form.Item>
        );
      case 'isOAmandaFlagEnabled':
        return (
          <Form.Item
            label="OP"
            name="editLevel"
            rules={[{ required: true, message: 'Please select a value' }]}
          >
            <Select onChange={validateForm}>
              {['OP_0', 'OP_0_5', 'OP_1', 'OP_2', 'OP_3', 'OP_4', 'OP_5', 'OP_6'].map(op => (
                <Option key={op} value={op}>{op}</Option>
              ))}
            </Select>
          </Form.Item>
        );
      case 'isPipSpFlagEnabled':
        return (
          <>
            <Form.Item
              label="risk Input1"
              name="risk"
              rules={[
                { required: true, message: 'Please enter a value' },
                { type: 'number', min: 1, max: 10, message: 'Must be between 1-10' }
              ]}
            >
              <Input type="number" min={1} max={10} onChange={validateForm} />
            </Form.Item>
            <Form.Item
              label="highrisk Input2"
              name="highrisk"
              rules={[
                { required: true, message: 'Please enter a value' },
                { type: 'number', min: 1, max: 100, message: 'Must be between 1-100' },
                { validator: validateHighRisk }
              ]}
            >
              <Input type="number" min={1} max={100} onChange={validateForm} />
            </Form.Item>
            <Form.Item
              label="lowrisk Input3"
              name="lowrisk"
              rules={[
                { required: true, message: 'Please enter a value' },
                { type: 'number', min: 1, max: 100, message: 'Must be between 1-100' }
              ]}
            >
              <Input type="number" min={1} max={100} onChange={validateForm} />
            </Form.Item>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      title={`Configure ${flag?.flagViewName}`}
      visible={visible}
      onOk={handleOk}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Cancel
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          onClick={handleOk}
          disabled={!isFormValid}
        >
          Apply
        </Button>,
      ]}
    >
      <Form 
        form={form} 
        layout="vertical"
      >
        {renderModalContent()}
      </Form>
    </Modal>
  );
};

export default SharedModal;