import { useState, useEffect } from 'react'
import { Input, Switch, Space, Tooltip } from 'antd'

const TYPE_TABS = [
  { label: 'All', value: null },
  { label: 'İşveren', value: 'İşveren' },
  { label: 'Taşeron', value: 'Taşeron' },
  { label: 'Tedarikçi', value: 'Tedarikçi' },
]

function CariFilters({ typeFilter, onTypeChange, searchText, onSearchChange, onlyRisky, onRiskyChange, getTypeCount }) {
  const [localSearch, setLocalSearch] = useState(searchText)

  useEffect(() => {
    setLocalSearch(searchText)
  }, [searchText])
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #e8e8e8',
          paddingBottom: 12,
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', gap: 32 }}>
          {TYPE_TABS.map((tab) => {
            const count = getTypeCount(tab.value)
            const isActive = typeFilter === tab.value
            return (
              <div
                key={tab.value || 'all'}
                onClick={() => onTypeChange(tab.value)}
                style={{
                  cursor: 'pointer',
                  paddingBottom: 12,
                  marginBottom: -12,
                  borderBottom: isActive ? '2px solid #1890ff' : '2px solid transparent',
                  color: isActive ? '#1890ff' : '#666',
                  fontWeight: isActive ? 500 : 400,
                  fontSize: '14px',
                  transition: 'all 0.2s',
                }}
              >
                {tab.label} ({count})
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Tooltip title="Cari kod veya adına göre arama yapın (Enter ile arayın)">
            <Input.Search
              placeholder="Kod veya ada göre ara"
              allowClear
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value)
                if (e.target.value === '') onSearchChange('')
              }}
              onSearch={(value) => onSearchChange(value)}
              style={{ width: 220 }}
            />
          </Tooltip>
          <Tooltip title="Sadece riskli cari hesaplarını göster">
            <Space>
              <span style={{ fontSize: '14px' }}>Sadece riskli</span>
              <Switch checked={onlyRisky} onChange={onRiskyChange} />
            </Space>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}

export default CariFilters
