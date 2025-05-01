import React, { useState } from 'react';
import { Button } from 'antd';
import CapacityManagementSettingsDialog from './dialog';

const CapacityManagementButton: React.FC = () => {
  const [isDialogVisible, setIsDialogVisible] = useState(false);

  const handleOpenDialog = () => {
    setIsDialogVisible(true);
  };

  const handleCloseDialog = () => {
    setIsDialogVisible(false);
  };

  const handleApplySettings = (data: any) => {
    console.log('Applied settings:', data);
    // Here you would typically send the data to your API or state management
  };

  return (
    <div>
      <Button type="primary" onClick={handleOpenDialog}>
        Open Capacity Management
      </Button>
      
      <CapacityManagementSettingsDialog
        visible={isDialogVisible}
        onClose={handleCloseDialog}
        onApply={handleApplySettings}
      />
    </div>
  );
};

export default CapacityManagementButton;