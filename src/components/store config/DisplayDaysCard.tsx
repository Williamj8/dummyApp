import React from 'react';
import { Card, Form, InputNumber, Row, Col } from 'antd';

interface FieldConfig {
  name: string;
  label: string;
  min?: number;
  max?: number;
}

interface FieldCardProps {
  title?: string;
  fields: FieldConfig[];
  values: Record<string, number | undefined>;
  onChange: (name: string, value: number | undefined) => void;
}

const FieldCard: React.FC<FieldCardProps> = ({ title, fields, values, onChange }) => (
  <Card title={title} style={{ marginTop: 16 }}>
    <Row gutter={16}>
      {fields.map((field) => (
        <Col span={12} key={field.name}>
          <Form.Item
            label={field.label}
            name={field.name}
            rules={[
              { required: true, message: `Please enter ${field.label}` },
              { type: 'number', min: field.min, max: field.max }
            ]}
          >
            <InputNumber
              min={field.min}
              max={field.max}
              style={{ width: '100%' }}
              value={values[field.name]}
              onChange={(val) => onChange(field.name, val ?? undefined)}
            />
          </Form.Item>
        </Col>
      ))}
    </Row>
  </Card>
);

export default FieldCard;