import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Typography, Spin, Alert, Button, Pagination, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { fetchCariList, addDocumentToCari, deleteDocumentFromCari } from '../../../store/cari/actions'
import CariFilters from '../components/CariFilters'
import CariTable from '../components/CariTable'
import DocumentUploadModal from '../components/DocumentUploadModal'

const { Title } = Typography

function CariListPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items, loading, error, pagination } = useSelector((state) => state.cari)
  const { user } = useSelector((state) => state.auth)
  const isAdmin = user?.role === 'admin'

  const [searchText, setSearchText] = useState('')
  const [typeFilter, setTypeFilter] = useState(null)
  const [onlyRisky, setOnlyRisky] = useState(false)
  const [typeCounts, setTypeCounts] = useState({ all: 0, İşveren: 0, Taşeron: 0, Tedarikçi: 0 })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [uploadModalVisible, setUploadModalVisible] = useState(false)
  const [selectedCariId, setSelectedCariId] = useState(null)

  useEffect(() => {
    const filters = {}
    if (searchText) filters.search = searchText
    if (typeFilter) filters.type = typeFilter
    if (onlyRisky) filters.onlyRisky = 'true'

    dispatch(fetchCariList(currentPage, pageSize, filters, 'createdAt', 'desc'))
  }, [dispatch, currentPage, pageSize, searchText, typeFilter, onlyRisky])

  useEffect(() => {
    if (!typeFilter && !searchText && !onlyRisky && items.length > 0) {
      const counts = {
        all: pagination?.total || items.length,
        İşveren: items.filter((item) => item.type === 'İşveren').length,
        Taşeron: items.filter((item) => item.type === 'Taşeron').length,
        Tedarikçi: items.filter((item) => item.type === 'Tedarikçi').length,
      }
      setTypeCounts((prev) => {
        if (counts.all !== prev.all || counts.İşveren !== prev.İşveren || counts.Taşeron !== prev.Taşeron || counts.Tedarikçi !== prev.Tedarikçi) {
          return counts
        }
        return prev
      })
    }
  }, [items, pagination, typeFilter, searchText, onlyRisky])

  const getTypeCount = (type) => (type === null ? typeCounts.all : typeCounts[type]) || 0

  const refreshList = () => {
    const filters = {}
    if (searchText) filters.search = searchText
    if (typeFilter) filters.type = typeFilter
    if (onlyRisky) filters.onlyRisky = 'true'
    dispatch(fetchCariList(currentPage, pageSize, filters, 'createdAt', 'desc'))
  }

  const handleUploadClick = (cariId) => {
    setSelectedCariId(cariId)
    setUploadModalVisible(true)
  }

  const handleUploadDocument = async (file, documentData) => {
    await dispatch(addDocumentToCari(selectedCariId, file, documentData))
    message.success({ content: 'Doküman başarıyla eklendi', duration: 3 })
    setUploadModalVisible(false)
    refreshList()
  }

  const handleDeleteDocument = async (cariId, documentId) => {
    try {
      await dispatch(deleteDocumentFromCari(cariId, documentId))
      message.success({ content: 'Doküman başarıyla silindi', duration: 3 })
      refreshList()
    } catch (err) {
      message.error({
        content: err.message || 'Doküman silinirken bir hata oluştu.',
        duration: 5,
      })
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert
        type="error"
        message="Veri yüklenirken bir hata oluştu"
        description={
          <div>
            <p>{error}</p>
            <Button type="primary" onClick={refreshList} style={{ marginTop: 8 }}>
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Cari &amp; Tedarikçi Listesi
          </Title>
          {pagination && pagination.total > 0 && (
            <div style={{ color: '#666', fontSize: '14px', marginTop: 4 }}>
              Toplam: {pagination.total} cari hesabı
            </div>
          )}
        </div>
        {isAdmin && (
          <Button type="primary" onClick={() => navigate('/cari/new')}>
            Yeni Cari Ekle
          </Button>
        )}
      </div>

      <CariFilters
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        searchText={searchText}
        onSearchChange={setSearchText}
        onlyRisky={onlyRisky}
        onRiskyChange={setOnlyRisky}
        getTypeCount={getTypeCount}
      />

      <CariTable
        items={items}
        isAdmin={isAdmin}
        onUploadClick={handleUploadClick}
        onDeleteDocument={handleDeleteDocument}
        hasActiveFilters={!!(searchText || typeFilter || onlyRisky)}
      />

      <DocumentUploadModal
        visible={uploadModalVisible}
        onClose={() => setUploadModalVisible(false)}
        onUpload={handleUploadDocument}
      />

      {pagination && pagination.total > 0 && (
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Pagination
            current={pagination.page}
            pageSize={pagination.limit}
            total={pagination.total}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) => `${range[0]}-${range[1]} / ${total} kayıt`}
            onChange={(page, size) => {
              setCurrentPage(page)
              setPageSize(size)
            }}
            onShowSizeChange={(_current, size) => {
              setCurrentPage(1)
              setPageSize(size)
            }}
          />
        </div>
      )}
    </div>
  )
}

export default CariListPage
