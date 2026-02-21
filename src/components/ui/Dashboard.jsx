function StatsTile({ icon: Icon, label, value, variant = 'default' }) {
    const isPrimary = variant === 'primary';
    const baseClasses = 'border border-border rounded-xl p-5 min-w-[140px]';
  
    return (
      <div className={`${baseClasses}  bg-cyan-900 text-white flex gap-2 items-center`}>
        <div className="text-muted text-sm flex items-center gap-1.5">
          {Icon && (
            <Icon
              size={16}
              className={
                isPrimary
                  ? 'text-amber-500'
                  : label === 'Converted'
                    ? 'text-green-600'
                    : label === 'Assigned'
                        ? 'text-blue-500'
                        : label === 'Follow-up'
                          ? 'text-cyan-500'
                          : 'text-primary'
              }
            />
          )}
          <span className={'text-white'}>{label}</span>
        </div>
        <div className={`text-md font-semibold  ${isPrimary ? 'text-white' : ''}`}>{value}</div>
      </div>
    );
  }
  export default StatsTile;