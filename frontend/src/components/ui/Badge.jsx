const variants = {
  default: 'bg-gray-100 text-gray-700',
  dark: 'bg-gray-900 text-white',
  success: 'bg-green-50 text-green-700',
  warning: 'bg-yellow-50 text-yellow-700',
  error: 'bg-red-50 text-red-700',
  blue: 'bg-blue-50 text-blue-700'
};

export function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span className={`
      inline-flex items-center gap-1
      px-2.5 py-1
      text-xs font-medium
      rounded-full
      ${variants[variant]}
      ${className}
    `}>
      {children}
    </span>
  );
}
