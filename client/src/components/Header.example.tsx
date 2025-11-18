import Header from './Header';

/**
 * Header Component Example
 * 
 * 显示应用标题和状态的头部组件
 */

// Example 1: 无文档时的Header
export function HeaderEmpty() {
  return (
    <Header 
      documentCount={0} 
      onClearAll={() => console.log('Clear all clicked')} 
    />
  );
}

// Example 2: 有文档时的Header（显示清空按钮）
export function HeaderWithDocuments() {
  return (
    <Header 
      documentCount={5} 
      onClearAll={() => {
        if (confirm('确定要清空所有数据吗？')) {
          console.log('Clearing all documents...');
        }
      }} 
    />
  );
}

// Example 3: 在实际应用中使用
export function HeaderInApp() {
  const handleClearAll = () => {
    // 显示确认对话框
    if (confirm('确定要清空所有数据吗？此操作不可恢复。')) {
      // 清空文档、配对、警告等数据
      console.log('Clearing all data...');
    }
  };

  return (
    <Header 
      documentCount={10} 
      onClearAll={handleClearAll} 
    />
  );
}
