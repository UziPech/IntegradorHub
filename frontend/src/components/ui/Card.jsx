export function Card({ children, className = '', hover = false, elevated = false, ...props }) {
  return (
    <div
      className={`
        bg-white rounded-2xl border border-gray-100
        transition-all duration-200
        ${hover ? 'hover:border-gray-200 hover:shadow-lg cursor-pointer' : ''}
        ${elevated ? 'shadow-xl border-none' : 'shadow-sm'}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`px-6 py-5 border-b border-gray-50 ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = '' }) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`px-6 py-4 border-t border-gray-50 ${className}`}>
      {children}
    </div>
  );
}
