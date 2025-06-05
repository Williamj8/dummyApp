import { FormInstance } from "antd";
import { Rule } from 'antd/lib/form';


export const daysOptions = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];


export const validatess = (values: {capPool2: number; capPool3: number}) :
 { isValid: boolean; capPool1: number} => {
    const {capPool2, capPool3} = values;
    const capPool1 = 100 - (capPool2 + capPool3);

    return {
        isValid: capPool1 >= 0 && capPool1 <=100,
        capPool1,
    }
 }


//  ---------------------------Store Bulk PiP-------------------------------------------------------

// utils/formValidations.ts


type ValidatorFn = (rule: any, value: any) => Promise<void>;

export const validateNumberRange = (min: number, max: number, fieldName?: string): ValidatorFn => 
  async (_, value) => {
    const num = Number(value);
    if (isNaN(num)) {
      throw new Error(`${fieldName || 'Value'} must be a number`);
    }
    if (num < min || num > max) {
      throw new Error(`${fieldName || 'Value'} must be between ${min}-${max}`);
    }
  };

export const createDependentValidator = (
  form: FormInstance,
  compareField: string,
  validate: (value: number, compareValue: number) => string | null
): ValidatorFn => async (_, value) => {
  const compareValue = Number(form.getFieldValue(compareField));
  const currentValue = Number(value);
  
  if (isNaN(currentValue) || isNaN(compareValue)) return;
  
  const error = validate(currentValue, compareValue);
  if (error) throw new Error(error);
};

//  ---------------------------Store Bulk PiP-------------------------------------------------------

export const validators = {
  risk: validateNumberRange(1, 10, 'Risk'),
  highLowRisk: validateNumberRange(1, 100, 'Risk level'),
  highRiskGreaterThan: (form: FormInstance) => createDependentValidator(
    form,
    'lowrisk',
    (high, low) => high <= low ? 'High risk must be greater than low risk' : null
  ),
  lowRiskLessThan: (form: FormInstance) => createDependentValidator(
    form,
    'highrisk',
    (low, high) => low >= high ? 'Low risk must be less than high risk' : null
  ),

// intra
hours: (_: any, value: number) => {
  if (value === undefined || value === null) {
    return Promise.reject('Please enter a value');
  }
  if (value < 1 || value > 12) {
    return Promise.reject('Please enter value 1 to 12');
  }
  return Promise.resolve();
},

perc: (_: any, value: number) => {
  if (value === undefined || value === null) {
    return Promise.reject('Please enter a value');
  }
  if (value < 1 || value > 100) {
    return Promise.reject('Please enter value 1 to 100');
  }
  return Promise.resolve();
},

items: (_: any, value: number) => {
  if (value === undefined || value === null) {
    return Promise.reject('Please enter a value');
  }
  if (value <= 0) {
    return Promise.reject('Must be greater than zero');
  }
  return Promise.resolve();
}
};


//  ---------------------------Store Bulk txt fld-------------------------------------------------------

interface FieldConfig {
  textViewName: string;
  min?: number;
  max?: number;
  required?: boolean;
}

export const getFieldValidationRules = (field: FieldConfig): Rule[] => {
  const rules: Rule[] = [];
  
  if (field.required) {
    rules.push({
      required: true,
      message: `${field.textViewName} is required`,
    });
  }

  rules.push({
    validator: (_, value) => {
      if (!value) return Promise.resolve();
      
      if (isNaN(Number(value))) {
        return Promise.reject('Must be a number');
      }
      
      const num = Number(value);
      
      if (field.min !== undefined && num < field.min) {
        return Promise.reject(`Must be ≥ ${field.min}`);
      }
      if (field.max !== undefined && num > field.max) {
        return Promise.reject(`Must be ≤ ${field.max}`);
      }
      
      return Promise.resolve();
    },
  });

  return rules;
};


// ----------------------------------------spl flags-------------------------------------------------------------

export const formatSpecialFlagPayload = (flagName: string, values: any) => {
  const formatters: Record<string, (v: any) => any> = {
    isGF2agEnabled: () => ({
      tpl: [{
        seqId: values?.seqId || "1",
        ventor: values?.ventor || "Door"
      }]
    }),
    is3PFlagEnabled: () => ({
      tplP: values?.tplP ? [values.tplP] : []
    }),
    isWfcFlagEnabled: () => ({
      wfcId: values?.wfcId || null
    }),
    isOAmandaFlagEnabled: () => ({
      editLevel: values?.editLevel || null
    }),
    isPipSpFlagEnabled: () => ({
      slow: values?.risk ? {
        risk: values.risk,
        highrisk: values.highrisk,
        lowrisk: values.lowrisk
      } : null
    }),
    isInterFlagEnabled: () => ({
      intraConfig: values?.hours !== undefined ? {
        hours: values.hours || null,
        perc: values.perc || null,
        items: values.items || null
      } : null
    }),
  };

  return formatters[flagName]?.(values) ?? {};
};