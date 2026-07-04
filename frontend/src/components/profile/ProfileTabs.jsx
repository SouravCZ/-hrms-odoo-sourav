export default function ProfileTabs({ active, onChange, showSalary }) {
  const tabs = ['Resume', 'Private Info', ...(showSalary ? ['Salary Info'] : [])];

  return (
    <div className="tabs-row">
      {tabs.map((tab) => (
        <div
          key={tab}
          className={`tab-item ${active === tab ? 'active' : ''}`}
          onClick={() => onChange(tab)}
        >
          {tab}
        </div>
      ))}
    </div>
  );
}
