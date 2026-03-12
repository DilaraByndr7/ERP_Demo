import { useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  Col,
  Row,
  Table,
  Tag,
  Alert,
  Typography,
  Space,
  Spin,
} from 'antd'
import { WarningOutlined, ExclamationCircleOutlined, ArrowRightOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { fetchCariList } from '../../store/cari/actions'

const { Title, Text } = Typography

/** Backend bakiyeyi pozitif saklar; işaret balanceType ile gelir. Borç = negatif, Alacak = pozitif. */
function getSignedBalance(item) {
  if (item.balanceType === 'Borç') return -(Number(item.balance) || 0)
  return Number(item.balance) || 0
}

function formatBalance(signedBalance, options = {}) {
  const { showSign = false } = options
  if (signedBalance == null) return '-'
  const abs = Math.abs(signedBalance)
  const formatted = abs.toLocaleString('tr-TR')
  if (!showSign) return `${formatted} ₺`
  const sign = abs === 0 ? '' : signedBalance >= 0 ? '+' : '-'
  return `${sign}${formatted} ₺`
}

function DashboardPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items, loading } = useSelector((state) => state.cari)

  
  useEffect(() => {
    dispatch(fetchCariList(1, 100, {}, 'createdAt', 'desc'))
  }, [dispatch])

  const totalCount = items.length
  const totalBalance = items.reduce((sum, item) => sum + getSignedBalance(item), 0)
  const riskyCount = items.filter((item) => item.isRisky).length
  const receivableTotal = items
    .filter((item) => item.balanceType === 'Alacak')
    .reduce((sum, item) => sum + (Number(item.balance) || 0), 0)
  const payableTotal = items
    .filter((item) => item.balanceType === 'Borç')
    .reduce((sum, item) => sum + (Number(item.balance) || 0), 0)

  
  const overdueItems = useMemo(() => {
    const today = new Date()
    return items
      .filter((item) => {
        if (!item.dueDate || item.balanceType !== 'Borç') return false
        const due = new Date(item.dueDate)
        const hasBalance = (Number(item.balance) || 0) > 0
        return due < today && hasBalance
      })
      .map((item) => {
        const due = new Date(item.dueDate)
        const daysOverdue = Math.floor((today - due) / (1000 * 60 * 60 * 24))
        return { ...item, daysOverdue, signedBalance: getSignedBalance(item) }
      })
      .sort((a, b) => b.daysOverdue - a.daysOverdue)
  }, [items])

  const overdueTotal = overdueItems.reduce((sum, item) => sum + getSignedBalance(item), 0)

  
  const riskyItems = useMemo(() => {
    return items.filter((item) => item.isRisky)
  }, [items])

 
  const top5Caris = useMemo(() => {
    return [...items]
      .map((item) => ({ ...item, signedBalance: getSignedBalance(item) }))
      .sort((a, b) => Math.abs(b.signedBalance) - Math.abs(a.signedBalance))
      .slice(0, 5)
  }, [items])

 
  const totalValue = receivableTotal + payableTotal
  const receivablePercentage = totalValue > 0 ? (receivableTotal / totalValue) * 100 : 0
  const payablePercentage = totalValue > 0 ? (payableTotal / totalValue) * 100 : 0

  
  const receivableCount = items.filter((item) => item.balanceType === 'Alacak').length
  const payableCount = items.filter((item) => item.balanceType === 'Borç').length

 
  if (loading && items.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <>
      {/* Segmentli Bar Chart */}
      <Row gutter={16}>
        <Col span={24}>
          <Card>
           
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: 24,
              paddingBottom: 16,
              borderBottom: '1px solid #e8e8e8'
            }}>
              <div>
                <Text style={{ fontSize: 14, color: 'rgba(0, 0, 0, 0.45)' }}>Toplam Bakiye:</Text>
                <div style={{ 
                  fontSize: 24, 
                  fontWeight: 600, 
                  color: 'rgba(0, 0, 0, 0.85)',
                  marginTop: 4,
                  lineHeight: 1.5
                }}>
                  {totalValue.toLocaleString('tr-TR')} ₺
                </div>
                <Text style={{ fontSize: 14, color: 'rgba(0, 0, 0, 0.45)', marginTop: 4 }}>
                  {totalCount} Cari Hesabı
                </Text>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Text style={{ fontSize: 14, color: 'rgba(0, 0, 0, 0.45)' }}>Net Durum:</Text>
                <div style={{ 
                  fontSize: 24, 
                  fontWeight: 600,
                  color: totalBalance >= 0 ? '#3f8600' : '#cf1322',
                  marginTop: 4,
                  lineHeight: 1.5
                }}>
                  {totalBalance.toLocaleString('tr-TR')} ₺
                </div>
              </div>
            </div>

           
            <div style={{ marginBottom: 32 }}>
              <div style={{
                width: '100%',
                height: 8,
                backgroundColor: '#f0f0f0',
                borderRadius: 4,
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
              }}>
                
                {receivablePercentage > 0 && (
                  <div
                    style={{
                      width: `${receivablePercentage}%`,
                      height: '100%',
                      backgroundColor: '#52c41a',
                      transition: 'width 0.3s ease',
                    }}
                  />
                )}
                
                {payablePercentage > 0 && (
                  <div
                    style={{
                      width: `${payablePercentage}%`,
                      height: '100%',
                      backgroundColor: '#ff4d4f',
                      transition: 'width 0.3s ease',
                    }}
                  />
                )}
              </div>
            </div>

            
            <div style={{ 
              display: 'flex', 
              gap: 32,
              flexWrap: 'wrap'
            }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#52c41a',
                  flexShrink: 0,
                }} />
                <div>
                  <Text strong style={{ fontSize: 14 }}>
                    Alacak
                  </Text>
                  <div style={{ fontSize: 14, color: 'rgba(0, 0, 0, 0.45)', marginTop: 2 }}>
                    {receivableCount} Cari • {receivableTotal.toLocaleString('tr-TR')} ₺
                  </div>
                </div>
              </div>

              
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#ff4d4f',
                  flexShrink: 0,
                }} />
                <div>
                  <Text strong style={{ fontSize: 14 }}>
                    Borç
                  </Text>
                  <div style={{ fontSize: 14, color: 'rgba(0, 0, 0, 0.45)', marginTop: 2 }}>
                    {payableCount} Cari • -{payableTotal.toLocaleString('tr-TR')} ₺
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

     
      <Row gutter={16} style={{ marginTop: 24 }}>
       
        <Col span={12}>
          <Card
            title={
              <Space>
                <ExclamationCircleOutlined style={{ color: '#cf1322' }} />
                <span>Gecikmiş Ödemeler</span>
                {overdueItems.length > 0 && (
                  <Tag color="red">{overdueItems.length} adet</Tag>
                )}
              </Space>
            }
            extra={
              overdueItems.length > 0 && (
                <a onClick={() => navigate('/cari')}>
                  Tümünü Gör <ArrowRightOutlined />
                </a>
              )
            }
          >
            {overdueItems.length === 0 ? (
              <Alert
                message="Gecikmiş ödeme bulunmuyor"
                type="success"
                showIcon
              />
            ) : (
              <Table
                dataSource={overdueItems}
                rowKey="id"
                pagination={false}
                size="small"
                onRow={(record) => ({
                  onClick: () => navigate(`/cari/${record.id}`, { state: record }),
                  style: { cursor: 'pointer' },
                })}
                columns={[
                  {
                    title: 'Cari',
                    dataIndex: 'name',
                    key: 'name',
                    render: (name, record) => (
                      <div>
                        <div style={{ fontWeight: 500 }}>{name}</div>
                        <div style={{ fontSize: 12, color: '#999' }}>
                          {record.code}
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: 'Gecikme',
                    key: 'daysOverdue',
                    width: 100,
                    render: (_, record) => (
                      <Tag color="red">
                        {record.daysOverdue} gün
                      </Tag>
                    ),
                  },
                  {
                    title: 'Tutar',
                    dataIndex: 'signedBalance',
                    key: 'balance',
                    align: 'right',
                    width: 120,
                    render: (signedBalance) => (
                      <Text strong style={{ color: '#cf1322' }}>
                        {formatBalance(signedBalance, { showSign: true })}
                      </Text>
                    ),
                  },
                ]}
              />
            )}
          </Card>
        </Col>

       
        <Col span={12}>
          <Card
            title={
              <Space>
                <WarningOutlined style={{ color: '#faad14' }} />
                <span>Riskli Cariler</span>
                {riskyItems.length > 0 && (
                  <Tag color="orange">{riskyItems.length} adet</Tag>
                )}
              </Space>
            }
            extra={
              riskyItems.length > 0 && (
                <a onClick={() => navigate('/cari')}>
                  Tümünü Gör <ArrowRightOutlined />
                </a>
              )
            }
          >
            {riskyItems.length === 0 ? (
              <Alert
                message="Riskli cari bulunmuyor"
                type="success"
                showIcon
              />
            ) : (
              <Table
                dataSource={riskyItems}
                rowKey="id"
                pagination={false}
                size="small"
                onRow={(record) => ({
                  onClick: () => navigate(`/cari/${record.id}`, { state: record }),
                  style: { cursor: 'pointer' },
                })}
                columns={[
                  {
                    title: 'Cari',
                    dataIndex: 'name',
                    key: 'name',
                    render: (name, record) => (
                      <div>
                        <div style={{ fontWeight: 500 }}>{name}</div>
                        <div style={{ fontSize: 12, color: '#999' }}>
                          {record.code}
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: 'Bakiye',
                    key: 'balance',
                    align: 'right',
                    width: 120,
                    render: (_, record) => {
                      const signed = getSignedBalance(record)
                      return (
                        <Text strong style={{ color: signed < 0 ? '#cf1322' : '#3f8600' }}>
                          {formatBalance(signed, { showSign: true })}
                        </Text>
                      )
                    },
                  },
                  {
                    title: 'Not',
                    dataIndex: 'notes',
                    key: 'notes',
                    ellipsis: true,
                    render: (notes) => notes || '-',
                  },
                ]}
              />
            )}
          </Card>
        </Col>
      </Row>

    
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card
            title={
              <Space>
                <span>En Yüksek Bakiyeli 5 Cari</span>
              </Space>
            }
            extra={
              <a onClick={() => navigate('/cari')}>
                Tüm Carileri Gör <ArrowRightOutlined />
              </a>
            }
          >
            <Table
              dataSource={top5Caris}
              rowKey="id"
              pagination={false}
              onRow={(record) => ({
                onClick: () => navigate(`/cari/${record.id}`, { state: record }),
                style: { cursor: 'pointer' },
              })}
              columns={[
                {
                  title: 'Sıra',
                  key: 'index',
                  width: 60,
                  render: (_, __, index) => index + 1,
                },
                {
                  title: 'Cari',
                  dataIndex: 'name',
                  key: 'name',
                  render: (name, record) => (
                    <div>
                      <div style={{ fontWeight: 500 }}>{name}</div>
                      <div style={{ fontSize: 12, color: '#999' }}>
                        {record.code} • {record.type}
                      </div>
                    </div>
                  ),
                },
                {
                  title: 'Bakiye Türü',
                  dataIndex: 'balanceType',
                  key: 'balanceType',
                  width: 120,
                  render: (type) => (
                    <Tag color={type === 'Alacak' ? 'green' : 'red'}>
                      {type}
                    </Tag>
                  ),
                },
                {
                  title: 'Bakiye',
                  dataIndex: 'signedBalance',
                  key: 'balance',
                  align: 'right',
                  width: 150,
                  sorter: (a, b) => Math.abs(b.signedBalance) - Math.abs(a.signedBalance),
                  render: (signedBalance) => (
                    <Text
                      strong
                      style={{
                        color: signedBalance >= 0 ? '#3f8600' : '#cf1322',
                        fontSize: 16,
                      }}
                    >
                      {formatBalance(signedBalance, { showSign: true })}
                    </Text>
                  ),
                },
                {
                  title: 'Risk',
                  dataIndex: 'isRisky',
                  key: 'isRisky',
                  width: 100,
                  render: (isRisky) => (
                    <Tag color={isRisky ? 'red' : 'green'}>
                      {isRisky ? 'Riskli' : 'Normal'}
                    </Tag>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default DashboardPage

