# 用户体验优化组件

本文档介绍了为提升用户体验而创建的UI组件。

## 组件列表

### 1. Toast 通知组件

**文件**: `Toast.tsx`

**用途**: 显示临时通知消息，自动消失或手动关闭。

**特性**:
- 支持4种类型：success、error、info、warning
- 自动消失（可配置时长）
- 手动关闭按钮
- 滑入动画效果
- 响应式设计

**使用示例**:
```tsx
import { Toast, ToastType } from './components/Toast';

const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

// 显示通知
const showToast = (message: string, type: ToastType = 'info') => {
  setToast({ message, type });
};

// 渲染
{toast && (
  <Toast
    message={toast.message}
    type={toast.type}
    duration={5000}
    onClose={() => setToast(null)}
  />
)}
```

### 2. Spinner 加载组件

**文件**: `Spinner.tsx`

**用途**: 显示加载状态，提供视觉反馈。

**组件**:
- `Spinner`: 基础旋转加载器
- `LoadingOverlay`: 全屏加载遮罩
- `InlineLoading`: 内联加载状态

**特性**:
- 3种尺寸：sm、md、lg
- 可自定义样式
- 支持透明背景
- 可配置加载消息

**使用示例**:
```tsx
import { Spinner, LoadingOverlay, InlineLoading } from './components/Spinner';

// 基础Spinner
<Spinner size="md" />

// 全屏加载
<LoadingOverlay message="正在处理..." transparent />

// 内联加载
<InlineLoading message="加载中..." size="sm" />

// 按钮中的加载状态
<button className="flex items-center gap-2">
  <Spinner size="sm" className="border-white border-t-white/50" />
  <span>处理中...</span>
</button>
```

### 3. ConfirmDialog 确认对话框

**文件**: `ConfirmDialog.tsx`

**用途**: 在执行重要操作前请求用户确认。

**特性**:
- 2种变体：danger（危险操作）、primary（主要操作）
- 模态遮罩
- 缩放动画效果
- 可自定义按钮文本
- 响应式设计

**使用示例**:
```tsx
import { ConfirmDialog } from './components/ConfirmDialog';

const [confirmDialog, setConfirmDialog] = useState<{
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
} | null>(null);

// 显示确认对话框
const handleDelete = () => {
  setConfirmDialog({
    isOpen: true,
    title: '删除数据',
    message: '确定要删除所有数据吗？此操作不可恢复。',
    onConfirm: () => {
      // 执行删除操作
      deleteData();
      setConfirmDialog(null);
    },
  });
};

// 渲染
{confirmDialog && (
  <ConfirmDialog
    isOpen={confirmDialog.isOpen}
    title={confirmDialog.title}
    message={confirmDialog.message}
    confirmText="确认"
    cancelText="取消"
    confirmVariant="danger"
    onConfirm={confirmDialog.onConfirm}
    onCancel={() => setConfirmDialog(null)}
  />
)}
```

## 响应式设计优化

所有组件都已针对移动端进行优化：

### 布局调整
- 使用 `sm:` 前缀的Tailwind类实现响应式
- 移动端减小内边距和字体大小
- 桌面端使用更大的间距和字体

### 触摸优化
- 按钮和可点击元素有足够的触摸区域（最小44x44px）
- 对话框和遮罩支持触摸关闭

### 性能优化
- 使用CSS动画而非JavaScript动画
- 组件按需加载
- 避免不必要的重渲染

## 动画效果

在 `index.css` 中定义了以下动画：

### slide-in
用于Toast通知的滑入效果
```css
@keyframes slide-in {
  0% { transform: translateX(100%); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}
```

### scale-in
用于对话框的缩放效果
```css
@keyframes scale-in {
  0% { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
```

### fade-in
用于遮罩的淡入效果
```css
@keyframes fade-in {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
```

## 最佳实践

### Toast通知
- 成功消息：绿色，简短肯定的文本
- 错误消息：红色，清晰的错误描述
- 警告消息：黄色，需要注意的信息
- 信息消息：蓝色，一般性提示

### 加载状态
- 短时操作（<1秒）：使用内联Spinner
- 中等操作（1-5秒）：使用带消息的Spinner
- 长时操作（>5秒）：使用全屏LoadingOverlay并显示进度

### 确认对话框
- 危险操作（删除、清空）：使用danger变体
- 重要操作（保存、提交）：使用primary变体
- 消息要清晰说明操作后果
- 按钮文本要具体（"删除"而非"确定"）

## 可访问性

所有组件都遵循可访问性最佳实践：

- 使用语义化HTML
- 提供aria-label属性
- 支持键盘导航
- 适当的颜色对比度
- 屏幕阅读器友好

## 示例文件

每个组件都有对应的示例文件：
- `Toast.example.tsx`
- `Spinner.example.tsx`
- `ConfirmDialog.example.tsx`

运行示例查看组件的实际效果和使用方法。
