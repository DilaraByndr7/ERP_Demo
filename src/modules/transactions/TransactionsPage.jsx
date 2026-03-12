import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Table,
  Tag,
  Typography,
  Input,
  Select,
  Space,
  Card,
  Row,
  Col,
  Statistic,
  DatePicker,
  Spin,
  Alert,
  Button,
} from 'antd'
import { SearchOutlined, FileTextOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import 'dayjs/locale/tr'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { fetchTransactionList } from '../../store/transactions/actions'
import { fetchCariList } from '../../store/cari/actions'

dayjs.extend(customParseFormat)
dayjs.locale('tr')

const { Title } = Typography
const { RangePicker } = DatePicker

function TransactionsPage() {
  const dispatch = useDispatch()
  const { items, loading, error, pagination } = useSelector((state) => state.transactions)
  const { items: cariItems } = useSelector((state) => state.cari)

  const [searchText, setSearchText] = useState('')
  const [searchApplied, setSearchApplied] = useState('')
  const [typeFilter, setTypeFilter] = useState()
  const [statusFilter, setStatusFilter] = useState()
  const [cariFilter, setCariFilter] = useState()
  const [dateRange, setDateRange] = useState()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortField, setSortField] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')
  const [sortActive, setSortActive] = useState(true)

  // Cari dropdown için cari listesini yükle (sadece id, code, name gerekli)
  useEffect(() => {
    dispatch(fetchCariList(1, 500, {}, 'name', 'asc'))
  }, [dispatch])

  // Filtreler veya sayfa değişince API'den işlem listesini çek
  const loadTransactions = useCallback(() => {
    const filters = {}
    if (searchApplied) filters.search = searchApplied
    if (typeFilter) filters.type = typeFilter
    if (statusFilter) filters.status = statusFilter
    if (cariFilter) filters.cariId = cariFilter
    if (dateRange && dateRange.length === 2) {
      filters.startDate = dateRange[0].format('YYYY-MM-DD')
      filters.endDate = dateRange[1].format('YYYY-MM-DD')
    }
    dispatch(
      fetchTransactionList(currentPage, pageSize, filters, sortField, sortOrder),
    )
  }, [dispatch, currentPage, pageSize, searchApplied, typeFilter, statusFilter, cariFilter, dateRange, sortField, sortOrder])

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  const handleSearch = (value) => {
    setSearchApplied(value || '')
    setCurrentPage(1)
  }

  const handleFilterChange = () => {
    setCurrentPage(1)
  }

  // İstatistikler: toplam sayı backend'den (pagination.total), tutar ve tür sayıları mevcut sayfadan
  const stats = {
    total: pagination?.total ?? 0,
    totalAmount: items.reduce((sum, t) => sum + (t.amount || 0), 0),
    siparisCount: items.filter((t) => t.type === 'Sipariş').length,
    teklifCount: items.filter((t) => t.type === 'Teklif').length,
    ihaleCount: items.filter((t) => t.type === 'İhale').length,
  }

  const columns = [
    {
      title: 'Tarih',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      sorter: true,
      sortOrder: sortActive && sortField === 'date' ? (sortOrder === 'asc' ? 'ascend' : 'descend') : null,
    },
    {
      title: 'Cari',
      dataIndex: 'cariName',
      key: 'cariName',
      width: 180,
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{record.cariCode}</div>
        </div>
      ),
    },
    {
      title: 'Tür',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => {
        const colorMap = {
          Sipariş: 'blue',
          Teklif: 'orange',
          İhale: 'purple',
        }
        return <Tag color={colorMap[type] || 'default'}>{type}</Tag>
      },
    },
    {
      title: 'Referans',
      dataIndex: 'reference',
      key: 'reference',
      width: 150,
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Tutar',
      dataIndex: 'amount',
      key: 'amount',
      width: 130,
      align: 'right',
      sorter: true,
      sortOrder: sortActive && sortField === 'amount' ? (sortOrder === 'asc' ? 'ascend' : 'descend') : null,
      render: (amount) => (
        <span style={{ fontWeight: 500 }}>
          {(amount ?? 0).toLocaleString('tr-TR')} ₺
        </span>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const statusColorMap = {
          Tamamlandı: 'green',
          'Kabul Edildi': 'green',
          Kazanıldı: 'green',
          Beklemede: 'orange',
          Reddedildi: 'red',
          Kaybedildi: 'red',
        }
        return <Tag color={statusColorMap[status] || 'default'}>{status}</Tag>
      },
    },
  ]

  const handleTableChange = (_, __, sorter) => {
    const single = Array.isArray(sorter) ? sorter[0] : sorter
    const order = single?.order
    const field = single?.field ?? single?.column?.dataIndex

    if (order === null || order === undefined || order === false) {
      setSortActive(false)
      setSortField('date')
      setSortOrder('desc')
      setCurrentPage(1)
      return
    }

    if (!field) return

    setSortActive(true)
    setSortField(field)
    setSortOrder(order === 'ascend' ? 'asc' : 'desc')
    setCurrentPage(1)
  }

  if (error) {
    return (
      <Alert
        type="error"
        message="İşlem listesi yüklenirken hata oluştu"
        description={
          <div>
            <p>{error}</p>
            <Button type="primary" onClick={loadTransactions} style={{ marginTop: 8 }}>
              Tekrar Dene
            </Button>
          </div>
        }
        showIcon
        closable
      />
    )
  }

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        Geçmiş İşlemler
      </Title>

      {/* İstatistikler */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Toplam İşlem"
              value={stats.total}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Toplam Tutar (mevcut sayfa)"
              value={stats.totalAmount}
              precision={0}
              suffix="₺"
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="Sipariş (sayfada)" value={stats.siparisCount} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="Teklif (sayfada)" value={stats.teklifCount} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="İhale (sayfada)" value={stats.ihaleCount} />
          </Card>
        </Col>
      </Row>

      {/* Filtreler */}
      <Card
        style={{
          marginBottom: 24,
          padding: 16,
          backgroundColor: '#fafafa',
          borderRadius: 8,
        }}
      >
        <Space wrap style={{ width: '100%' }}>
          <Input.Search
            placeholder="Referans, açıklama veya cari adı ile ara"
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={handleSearch}
            style={{ width: 280 }}
            prefix={<SearchOutlined />}
          />
          <Select
            allowClear
            placeholder="Tür filtrele"
            style={{ width: 140 }}
            value={typeFilter}
            onChange={(v) => {
              setTypeFilter(v)
              handleFilterChange()
            }}
            options={[
              { label: 'Sipariş', value: 'Sipariş' },
              { label: 'Teklif', value: 'Teklif' },
              { label: 'İhale', value: 'İhale' },
            ]}
          />
          <Select
            allowClear
            placeholder="Durum filtrele"
            style={{ width: 150 }}
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(v)
              handleFilterChange()
            }}
            options={[
              { label: 'Tamamlandı', value: 'Tamamlandı' },
              { label: 'Kabul Edildi', value: 'Kabul Edildi' },
              { label: 'Kazanıldı', value: 'Kazanıldı' },
              { label: 'Beklemede', value: 'Beklemede' },
              { label: 'Reddedildi', value: 'Reddedildi' },
              { label: 'Kaybedildi', value: 'Kaybedildi' },
            ]}
          />
          <Select
            allowClear
            placeholder="Cari seç"
            style={{ width: 200 }}
            value={cariFilter}
            onChange={(v) => {
              setCariFilter(v)
              handleFilterChange()
            }}
            options={(cariItems || []).map((cari) => ({
              label: `${cari.code} - ${cari.name}`,
              value: cari.id,
            }))}
          />
          <RangePicker
            placeholder={['Başlangıç', 'Bitiş']}
            value={dateRange}
            onChange={(dates) => {
              setDateRange(dates)
              handleFilterChange()
            }}
            style={{ width: 240 }}
          />
        </Space>
      </Card>

   
      {loading && items.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <Spin size="large" />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            {searchApplied || typeFilter || statusFilter || cariFilter || (dateRange && dateRange.length === 2)
              ? 'Filtre kriterlerine uygun işlem bulunamadı'
              : 'Henüz işlem kaydı bulunmuyor'}
          </div>
        </Card>
      ) : (
        <Table
          dataSource={items}
          columns={columns}
          rowKey="id"
          loading={loading}
          onChange={handleTableChange}
          pagination={{
            current: pagination?.page ?? 1,
            pageSize: pagination?.limit ?? 10,
            total: pagination?.total ?? 0,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} işlem`,
            onChange: (page, size) => {
              setCurrentPage(page)
              setPageSize(size || 10)
            },
            onShowSizeChange: (_, size) => {
              setCurrentPage(1)
              setPageSize(size)
            },
          }}
          scroll={{ x: 1000 }}
        />
      )}
    </div>
  )
}

export default TransactionsPage
