import React from 'react';
import { Card, Form, InputNumber, Row, Col } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { getFieldValidationRules } from '../util';

interface FieldConfig {
  textName: string;
  textViewName: string;
  min?: number;
  max?: number;
  required?: boolean;
}

interface FieldCardProps {
  title?: string;
  fields: FieldConfig[];
  form: FormInstance;
}

const FieldCard: React.FC<FieldCardProps> = ({ title, fields }) => (
  <Card title={title} style={{ marginTop: 16 }}>
    <Row gutter={16}>
      {fields.map(field => (
        <Col span={12} key={field.textName}>
          <Form.Item
            name={field.textName}
            label={field.textViewName}
            rules={getFieldValidationRules(field)}
            validateTrigger="onBlur"
          >
            <InputNumber
              min={field.min}
              max={field.max}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
      ))}
    </Row>
  </Card>
);

export default FieldCard;
