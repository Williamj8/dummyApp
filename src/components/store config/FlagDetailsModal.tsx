import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Form, Input, Table, Select, Button } from 'antd';
import axios from 'axios';
import { validators } from '../util';

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
  const [canSubmit, setCanSubmit] = useState(false);

  // Memoized validation function
  const handleFormChange = useCallback(() => {
    const hasErrors = form.getFieldsError().some(({ errors }) => errors.length);
    setCanSubmit(!hasErrors && Object.keys(form.getFieldsValue()).length > 0);
  }, [form]);



  // Initialize form
  useEffect(() => {
    if (visible) {
      form.resetFields();
      if (initialValues) {
        form.setFieldsValue(initialValues);
      }

      handleFormChange(); // trigger initial validation state

      if (flag?.flagName === 'is3PFlagEnabled') {
        fetch3POptions();
      }
    }
  }, [visible]);

  const fetch3POptions = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/ref3pp.json');
      setOptions(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching options:', error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const formattedValues = getFormattedValues(flag.flagName, values);
      onOk(formattedValues);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const getFormattedValues = (flagName: string, values: any) => {
    const formatters = {
      isGF2agEnabled: () => ({
        tpl: [{
          seqId: values.seqId || "1",
          ventor: values.ventor || "Door"
        }]
      }),
      is3PFlagEnabled: () => ({
        tplP: values.tplP ? [values.tplP] : []
      }),
      isWfcFlagEnabled: () => ({
        wfcId: values.wfcId
      }),
      isOAmandaFlagEnabled: () => ({
        editLevel: values.editLevel
      }),
      isPipSpFlagEnabled: () => ({
        slow: {
          risk: values.risk,
          highrisk: values.highrisk,
          lowrisk: values.lowrisk
        }
      })
    };

    // return formatters[flagName as keyof typeof formatters]?.(values) ?? values;
    return (formatters as Record<string, (v: any) => any>)[flagName]?.(values) ?? values;
  };

  const renderModalContent = () => {
    if (!flag) return null;

    const fieldComponents = {
      isGF2agEnabled: (
        <Form.Item label="tpl">
          <Table
            dataSource={[{ key: '1', seq: 'DOOR', sid: '1' }]}
            columns={[
              { title: 'seq', dataIndex: 'seq', key: 'seq' },
              {
                title: 'Sid',
                dataIndex: 'sid',
                key: 'sid',
                render: () => (
                  <Form.Item
                    name="seqId"
                    rules={[{ required: true }]}
                    initialValue="1"
                  >
                    <Select>
                      <Option value="1">1</Option>
                    </Select>
                  </Form.Item>
                )
              }
            ]}
            pagination={false}
          />
        </Form.Item>
      ),
      is3PFlagEnabled: (
        <Form.Item
          label="tplP"
          name="tplP"
          rules={[{ required: true }]}
        >
          <Select
            mode="multiple"
            loading={loading}
            placeholder={loading ? 'Loading...' : 'Select values'}
          >
            {options.map(opt => (
              <Option key={opt} value={opt}>{opt}</Option>
            ))}
          </Select>
        </Form.Item>
      ),
      isWfcFlagEnabled: (
        <Form.Item
          label="WFC"
          name="wfcId"
          rules={[
            { required: true },
            { pattern: /^\d{1,8}$/, message: 'Must be 1-8 digits' }
          ]}
        >
          <Input type="number" min={1} max={99999999} />
        </Form.Item>
      ),
      isOAmandaFlagEnabled: (
        <Form.Item
          label="OP"
          name="editLevel"
          rules={[{ required: true }]}
        >
          <Select>
            {['OP_0', 'OP_0_5', 'OP_1', 'OP_2', 'OP_3', 'OP_4', 'OP_5', 'OP_6'].map(op => (
              <Option key={op} value={op}>{op}</Option>
            ))}
          </Select>
        </Form.Item>
      ),
      isPipSpFlagEnabled: (
        <>
          <Form.Item
            label="Risk (1-10)"
            name="risk"
            rules={[
              { required: true },
              { validator: validators.risk }
            ]}
          >
            <Input type="number" min={1} max={10} />
          </Form.Item>
          <Form.Item
            label="High Risk (1-100)"
            name="highrisk"
            rules={[
              { required: true },
              { validator: validators.highLowRisk },
              { validator: validators.highRiskGreaterThan(form) }
            ]}
          >
            <Input type="number" min={1} max={100} />
          </Form.Item>
          <Form.Item
            label="Low Risk (1-100)"
            name="lowrisk"
            rules={[
              { required: true },
              { validator: validators.highLowRisk },
              { validator: validators.lowRiskLessThan(form) }
            ]}
          >
            <Input type="number" min={1} max={100} />
          </Form.Item>
        </>
      )
    };

    return fieldComponents[flag.flagName as keyof typeof fieldComponents] || null;
  };

  return (
    <Modal
      title={`Configure ${flag?.flagViewName}`}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleOk}
          disabled={!canSubmit}
        >
          Apply
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        // onValuesChange={handleFormChange}
        onFieldsChange={handleFormChange}
      >
        {renderModalContent()}
      </Form>
    </Modal>
  );
};

export default SharedModal;