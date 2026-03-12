import { Table, Tag, Button, Popconfirm, Empty, message } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { deleteCari } from '../../../store/cari/actions'
import CariExpandedRow from './CariExpandedRow'

function CariTable({ items, isAdmin, onUploadClick, onDeleteDocument, hasActiveFilters }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const columns = [
    {
      title: 'Kod',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Ad',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Tür',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Borç/Alacak',
      dataIndex: 'balanceType',
      key: 'balanceType',
    },
    {
      title: 'Bakiye',
      dataIndex: 'balance',
      key: 'balance',
      render: (value, record) => {
        if (value == null) return '-'
        const isBorc = record.balanceType === 'Borç'
        const absValue = Math.abs(value)
        const formatted = absValue.toLocaleString('tr-TR')
        const sign = absValue === 0 ? '' : isBorc ? '-' : '+'
        return `${sign}${formatted} ₺`
      },
    },
    {
      title: 'Gecikme',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (_, record) => {
        if (!record.dueDate) return '-'
        const due = new Date(record.dueDate)
        const today = new Date()
        const isOverdue = due < today && record.balance > 0
        return isOverdue ? <Tag color="red">Gecikmiş</Tag> : <Tag color="green">Zamanında</Tag>
      },
    },
    {
      title: 'Risk',
      dataIndex: 'isRisky',
      key: 'isRisky',
      render: (isRisky) => (
        <Tag color={isRisky ? 'red' : 'green'}>
          {isRisky ? 'Riskli' : 'Normal'}
        </Tag>
      ),
    },
    {
      title: 'Telefon',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'E-posta',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_, record) => (
        <>
          {isAdmin ? (
            <>
              <Button
                type="link"
                onClick={() => navigate(`/cari/${record.id}`, { state: record })}
              >
                Düzenle
              </Button>
              <Popconfirm
                title="Bu cariyi silmek istediğinize emin misiniz?"
                okText="Evet"
                cancelText="Hayır"
                onConfirm={async () => {
                  try {
                    await dispatch(deleteCari(record.id))
                    message.success('Cari silindi')
                  } catch {
                    message.error('Cari silinirken bir hata oluştu')
                  }
                }}
              >
                <Button type="link" danger>
                  Sil
                </Button>
              </Popconfirm>
            </>
          ) : (
            <span style={{ color: '#999' }}>Görüntüleme modu</span>
          )}
        </>
      ),
    },
  ]

  if (items.length === 0) {
    if (hasActiveFilters) {
      return (
        <Empty
          image={<SearchOutlined style={{ fontSize: 48, color: '#bfbfbf' }} />}
          description={
            <div>
              <p style={{ fontSize: 16, color: '#595959' }}>Aramanızla eşleşen cari hesap bulunamadı</p>
              <p style={{ color: '#8c8c8c' }}>Farklı bir arama terimi veya filtre deneyebilirsiniz</p>
            </div>
          }
          style={{ padding: '60px 0' }}
        />
      )
    }

    return (
      <Empty
        description={
          <div>
            <p>Henüz cari hesabı bulunmamaktadır</p>
            {isAdmin && (
              <Button type="primary" onClick={() => navigate('/cari/new')} style={{ marginTop: 16 }}>
                İlk Cari Hesabını Oluştur
              </Button>
            )}
          </div>
        }
        style={{ padding: '60px 0' }}
      />
    )
  }

  return (
    <Table
      rowKey="id"
      dataSource={items}
      columns={columns}
      pagination={false}
      expandable={{
        expandedRowRender: (record) => (
          <CariExpandedRow
            record={record}
            isAdmin={isAdmin}
            onUploadClick={onUploadClick}
            onDeleteDocument={onDeleteDocument}
          />
        ),
      }}
    />
  )
}

export default CariTable
