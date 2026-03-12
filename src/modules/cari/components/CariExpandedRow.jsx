import { Descriptions, Tabs, Button, List, Space, Tag, Popconfirm, message } from 'antd'
import { UploadOutlined, DeleteOutlined, FileOutlined } from '@ant-design/icons'
import { apiClient } from '../../../lib/apiClient'

function CariExpandedRow({ record, isAdmin, onUploadClick, onDeleteDocument }) {
  const documents = record.documents || []

  const buildFileUrl = (rawUrl) => {
    if (!rawUrl || rawUrl === '#' || rawUrl === 'undefined') return null
    if (rawUrl.startsWith('http')) return rawUrl
    if (rawUrl.startsWith('/')) return rawUrl
    return `/${rawUrl}`
  }

  const handleViewDocument = async (doc) => {
    const path = buildFileUrl(doc.fileUrl)
    if (!path) {
      message.error("Dosya URL'i bulunamadı")
      return
    }
    try {
      const res = await apiClient.get(path, { responseType: 'blob' })
      const blobUrl = URL.createObjectURL(res.data)
      window.open(blobUrl, '_blank')
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000)
    } catch {
      message.error('Dosya açılamadı veya yetkiniz yok')
    }
  }

  return (
    <Tabs
      items={[
        {
          key: 'details',
          label: 'Detaylar',
          children: (
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Adres">{record.address || '-'}</Descriptions.Item>
              <Descriptions.Item label="Vergi No">{record.taxNo || '-'}</Descriptions.Item>
              <Descriptions.Item label="Vergi Dairesi">{record.taxOffice || '-'}</Descriptions.Item>
              <Descriptions.Item label="Son Vade Tarihi">{record.dueDate || '-'}</Descriptions.Item>
              <Descriptions.Item label="Ödeme Planı - Sonraki Tarih">{record.nextPaymentDate || '-'}</Descriptions.Item>
              <Descriptions.Item label="Ödeme Planı - Tutar">
                {record.nextPaymentAmount
                  ? `${record.nextPaymentAmount.toLocaleString('tr-TR')} ₺`
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Notlar">{record.notes || '-'}</Descriptions.Item>
            </Descriptions>
          ),
        },
        {
          key: 'documents',
          label: `Dokümanlar (${documents.length})`,
          children: (
            <div>
              {isAdmin && (
                <div style={{ marginBottom: 16 }}>
                  <Button
                    type="primary"
                    icon={<UploadOutlined />}
                    onClick={() => onUploadClick(record.id)}
                  >
                    Yeni Doküman Ekle
                  </Button>
                </div>
              )}
              {documents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>
                  Henüz doküman eklenmemiş
                </div>
              ) : (
                <List
                  dataSource={documents}
                  renderItem={(doc) => (
                    <List.Item
                      actions={[
                        <Button
                          key="view"
                          type="link"
                          icon={<FileOutlined />}
                          onClick={() => handleViewDocument(doc)}
                        >
                          Görüntüle
                        </Button>,
                        isAdmin && (
                          <Popconfirm
                            key="delete"
                            title="Bu dokümanı silmek istediğinize emin misiniz?"
                            okText="Evet"
                            cancelText="Hayır"
                            onConfirm={() => onDeleteDocument(record.id, doc.id)}
                          >
                            <Button type="link" danger icon={<DeleteOutlined />}>
                              Sil
                            </Button>
                          </Popconfirm>
                        ),
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<FileOutlined style={{ fontSize: 24 }} />}
                        title={doc.name}
                        description={
                          <Space>
                            <Tag>{doc.type}</Tag>
                            <span style={{ color: '#999' }}>Yüklenme: {doc.uploadDate}</span>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </div>
          ),
        },
      ]}
    />
  )
}

export default CariExpandedRow
