import React, { useEffect } from "react";
import { Form, Modal, Select, Input } from "antd";
import {daysOptions, validatess} from './Items config/util';

interface SettingsDialogProps {
  visible: boolean;
  onClose: () => void;
  onApply: (data: any) => void;
}

interface DayData {
  capPool1?: number | string;
  capPool2?: number | string;
  capPool3?: number | string;
  dumm?: number | string;
}

const defaultDayOptions: DayData = {
  capPool1: 100,
  capPool2: 0,
  capPool3: 0,
  dumm: 20
};

const wholeIntRegExPattern = "^[0-9]*$";

const CapacityManagementSettingsDialog: React.FC<SettingsDialogProps> = ({
  visible,
  onClose,
  onApply,
}) => {
  const [form] = Form.useForm();
  const formValues = Form.useWatch([], form);
  const [dayData, setDayData] = React.useState<DayData>(defaultDayOptions);

  useEffect(() => {
    if (visible) {
      setDayData(defaultDayOptions);
      form.resetFields();
    }
  }, [visible, form]);

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        let globalData: Record<string, DayData> = {};
        values.days.forEach((day: string) => {
          globalData[day] = { ...dayData };
        });
        onApply(globalData);
        onClose();
      })
      .catch((error) => {
        console.error("Validation failed:", error);
      });
  };

  const selectProps = {
    showSearch: true,
    value: form.getFieldValue("days"),
    onChange: (value: string[]) => form.setFieldsValue({ days: value }),
    options: daysOptions,
  };

  const handleInputChange = (key: keyof DayData, val: string) => {
    let updatedDayData = { ...dayData };
  
    if (val === "") {
      updatedDayData[key] = val;
      setDayData(updatedDayData);
      return;
    }
  
    let parsed = Number(val);
    if (isNaN(parsed)) return;
  
    // Clamp only capPool2 & capPool3
    if (key === "capPool2" || key === "capPool3") {
      parsed = Math.min(100, Math.max(0, parsed));
      updatedDayData[key] = parsed;
   
      const cap2 = Number(updatedDayData.capPool2) || 0;
      const cap3 = Number(updatedDayData.capPool3) || 0;
      const cap1 = 100 - cap2 - cap3;
  
      updatedDayData.capPool1 = cap1; // ✅ allow negative values!
    } else {
      updatedDayData[key] = parsed;
    }
  
    setDayData(updatedDayData);
  };
  
  
  
  

  const isFieldInvalid = (key: keyof DayData, value: any): boolean => {
    if (value === "" || value === undefined) return true;
    const numValue = Number(value);
    return isNaN(numValue) || numValue < 0 || numValue > 100;
  };

  const isFormValid = (): boolean => {
    if (
      !formValues?.days ||
      formValues?.days.length === 0 ||
      formValues?.days.includes(undefined)
    ) {
      return false;
    }
  
    const cap1 = Number(dayData.capPool1);
    const cap2 = Number(dayData.capPool2);
    const cap3 = Number(dayData.capPool3);
  
    const total = cap1 + cap2 + cap3;
  
    // CapPool1 must not be negative, and all values must be in [0, 100]
    if (cap1 < 0 || cap2 < 0 || cap3 < 0) return false;
    if (cap2 > 100 || cap3 > 100) return false;
    if (isNaN(cap1) || isNaN(cap2) || isNaN(cap3)) return false;
  
    return total === 100;
  };
  
  

  const handleMouseWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    e.currentTarget.blur();
  };

  const handleInvalidKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["e", "E", "+", "-", "."].includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      okButtonProps={{ disabled: !isFormValid() }}
      title="Capacity Management Settings"
    >
      <div className="pt5 pr16 pl16">
        <Form form={form} name="control-hooks" onFinish={handleSubmit}>
          <Form.Item
            label="Days"
            name="days"
            rules={[{ required: true, message: "This is a required field." }]}
          >
            <Select mode="multiple" {...selectProps} />
          </Form.Item>

          <div className="last-drop-exception-Modal">
            <Form.Item label="CapPool1 *">
              <div className="field-wrapper mb20">
                <Input
                  className={
                    isFieldInvalid("capPool1", dayData.capPool1)
                      ? "invalid-input" 
                      : "valid-input"
                  }
                  onChange={(e) =>
                    handleInputChange("capPool1", e.target.value)
                  }
                  value={dayData.capPool1}
                  type="number"
                  pattern={wholeIntRegExPattern}
                  min={0}
                  max={100}
                  onWheel={handleMouseWheel}
                  onKeyDown={handleInvalidKeys}
                  disabled 
                />
              </div>
            </Form.Item>
          </div>

          <div className="last-drop-exception-Modal">
            <Form.Item label="CapPool2 *">
              <div className="field-wrapper mb20 input-wrapper">
                <Input
                  className={
                    isFieldInvalid("capPool2", dayData.capPool2)
                      ? "invalid-input"
                      : "valid-input"
                  }
                  onChange={(e) =>
                    handleInputChange("capPool2", e.target.value)
                  }
                  value={dayData.capPool2}
                  type="number"
                  pattern={wholeIntRegExPattern}
                  min={0}
                  max={100}
                  onWheel={handleMouseWheel}
                  onKeyDown={handleInvalidKeys}
                />
              </div>
            </Form.Item>
          </div>

          <div className="last-drop-exception-Modal">
            <Form.Item label="CapPool3 *">
              <div className="field-wrapper mb20 input-wrapper">
                <Input
                  className={
                    isFieldInvalid("capPool3", dayData.capPool3)
                      ? "invalid-input"
                      : "valid-input"
                  }
                  onChange={(e) =>
                    handleInputChange("capPool3", e.target.value)
                  }
                  value={dayData.capPool3}
                  type="number"
                  pattern={wholeIntRegExPattern}
                  min={0}
                  max={100}
                  onWheel={handleMouseWheel}
                  onKeyDown={handleInvalidKeys}
                />
              </div>
            </Form.Item>
          </div>

          <div className="last-drop-exception-Modal">
            <Form.Item label="dumm">
              <div className="field-wrapper mb20 input-wrapper">
                <Input
                  className={
                    isFieldInvalid("dumm", dayData.dumm)
                      ? "invalid-input"
                      : "valid-input"
                  }
                  onChange={(e) =>
                    handleInputChange("dumm", e.target.value)
                  }
                  value={dayData.dumm}
                  type="number"
                  pattern={wholeIntRegExPattern}
                  min={0}
                  max={100}
                  onWheel={handleMouseWheel}
                  onKeyDown={handleInvalidKeys}
                />
              </div>
            </Form.Item>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default CapacityManagementSettingsDialog;
