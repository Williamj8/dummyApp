import React, { useState } from 'react';
import { Card, Form, Input, Row, Col, FormInstance } from 'antd';
import { Rule } from 'antd/lib/form';
import {getFieldValidationRules} from '../util'

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

const FieldCard: React.FC<FieldCardProps> = ({ title, fields, form }) => {
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  return (
    <Card title={title} style={{ marginTop: 16 }}>
      <Row gutter={16}>
        {fields.map(field => (
          <Col span={12} key={field.textName}>
            <Form.Item
              name={field.textName}
              label={field.textViewName}
              rules={getFieldValidationRules(field)}
              validateTrigger="onChange"
            >
              <Input
                style={{ width: '100%' }}
                onBlur={() => setTouchedFields(prev => ({
                  ...prev,
                  [field.textName]: true
                }))}
                pattern="[0-9]*"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  e.target.value = e.target.value.replace(/[^0-9]/g, '');
                }}
              />
            </Form.Item>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

// Validation utility with proper typing

export default FieldCard;