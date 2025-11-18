export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={`${sizeClasses[size]} border-blue-200 border-t-blue-600 rounded-full animate-spin ${className}`}
      role="status"
      aria-label="加载中"
    >
      <span className="sr-only">加载中...</span>
    </div>
  );
}

export interface LoadingOverlayProps {
  message?: string;
  transparent?: boolean;
}

export function LoadingOverlay({ message = '加载中...', transparent = false }: LoadingOverlayProps) {
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${transparent ? 'bg-black/30' : 'bg-white/90'}`}>
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-lg font-medium text-gray-700">{message}</p>
      </div>
    </div>
  );
}

export interface InlineLoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function InlineLoading({ message, size = 'md' }: InlineLoadingProps) {
  return (
    <div className="flex items-center gap-3">
      <Spinner size={size} />
      {message && <span className="text-sm text-gray-600">{message}</span>}
    </div>
  );
}
