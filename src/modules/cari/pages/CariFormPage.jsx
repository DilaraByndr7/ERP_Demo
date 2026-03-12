import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { Button, Form, Input, InputNumber, Select, Typography, message, Breadcrumb, Tooltip, Space, Alert, Row, Col } from 'antd'
import { HomeOutlined, ArrowLeftOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { createCari, updateCari } from '../../../store/cari/actions'

const { Title, Text } = Typography

function CariFormPage() {
  const [form] = Form.useForm()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { id } = useParams()
  const { state } = useLocation()
  const { user } = useSelector((state) => state.auth)
  const { loading } = useSelector((state) => state.cari)
  const isAdmin = user?.role === 'admin'
  const [submitting, setSubmitting] = useState(false)

  const isEditMode = Boolean(id)

 
  if (!isAdmin) {
    message.warning('Bu işlem için yetkiniz yok')
    return <Navigate to="/cari" replace />
  }

  useEffect(() => {
    if (isEditMode && state) {
      form.setFieldsValue({
        ...state,
        isRisky: state.isRisky ? 'riskli' : 'normal',
        balanceType: state.balanceType || 'Alacak',
      })
    }
  }, [form, isEditMode, state])

  const handleFinish = async (values) => {
    setSubmitting(true)
    try {
      const payload = {
        ...values,
        balance: Number(values.balance || 0),
        isRisky: values.isRisky === 'riskli',
      }

      if (isEditMode) {
        await dispatch(updateCari(id, payload))
        message.success({
          content: 'Cari hesabı başarıyla güncellendi',
          duration: 3,
        })
      } else {
        await dispatch(createCari(payload))
        message.success({
          content: 'Yeni cari hesabı başarıyla oluşturuldu',
          duration: 3,
        })
      }

      navigate('/cari')
    } catch (error) {
      
      if (error.details && Array.isArray(error.details)) {
       
        const fieldErrors = {}
        error.details.forEach((detail) => {
          if (detail.path) {
            fieldErrors[detail.path] = detail.msg || detail.message
          }
        })
        
        if (Object.keys(fieldErrors).length > 0) {
          form.setFields(
            Object.keys(fieldErrors).map((field) => ({
              name: field,
              errors: [fieldErrors[field]],
            })),
          )
        }
        
       
        message.error({
          content: error.message || 'Lütfen formdaki hataları düzeltin ve tekrar deneyin',
          duration: 5,
        })
      } else {
        message.error({
          content: error.message || 'İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.',
          duration: 5,
        })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          {
            href: '/',
            title: <><HomeOutlined /> Ana Sayfa</>,
          },
          {
            href: '/cari',
            title: 'Cari & Tedarikçi',
          },
          {
            title: isEditMode ? 'Cari Güncelle' : 'Yeni Cari Ekle',
          },
        ]}
      />

      
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/cari')}
        style={{ marginBottom: 16 }}
      >
        Geri Dön
      </Button>

      <Title level={3}>
        {isEditMode ? 'Cari / Tedarikçi Güncelle' : 'Yeni Cari / Tedarikçi Ekle'}
      </Title>

   
      <Alert
        message={isEditMode ? 'Cari bilgilerini güncelleyin' : 'Yeni bir cari hesabı oluşturun'}
        description="Zorunlu alanlar (*) ile işaretlenmiştir. Tüm bilgileri doğru şekilde doldurun."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
        closable
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ type: 'İşveren', isRisky: 'normal', balanceType: 'Alacak' }}
      >
        <Row gutter={24}>
          {/* Sol Sütun */}
          <Col xs={24} sm={24} md={12} lg={12}>
            <Form.Item
              label={
                <Space>
                  <span>Kod *</span>
                  <Tooltip title="Cari hesabının benzersiz tanımlayıcı kodu (örn: CARI-001)">
                    <InfoCircleOutlined style={{ color: '#1890ff', cursor: 'help' }} />
                  </Tooltip>
                </Space>
              }
              name="code"
              rules={[{ required: true, message: 'Kod zorunludur' }]}
              tooltip="Benzersiz bir kod girin. Bu kod sistem genelinde tek olmalıdır."
            >
              <Input placeholder="Örn: CARI-004" />
            </Form.Item>

            <Form.Item
              label={
                <Space>
                  <span>Ad *</span>
                  <Tooltip title="Firma veya kişinin tam adı">
                    <InfoCircleOutlined style={{ color: '#1890ff', cursor: 'help' }} />
                  </Tooltip>
                </Space>
              }
              name="name"
              rules={[{ required: true, message: 'Ad zorunludur' }]}
            >
              <Input placeholder="Firma adı" />
            </Form.Item>

            <Form.Item
              label={
                <Space>
                  <span>Tür</span>
                  <Tooltip title="Cari hesabının türü: İşveren (bizden iş alan), Taşeron (bizim için çalışan), Tedarikçi (malzeme sağlayan)">
                    <InfoCircleOutlined style={{ color: '#1890ff', cursor: 'help' }} />
                  </Tooltip>
                </Space>
              }
              name="type"
            >
              <Select
                options={[
                  { label: 'İşveren', value: 'İşveren' },
                  { label: 'Taşeron', value: 'Taşeron' },
                  { label: 'Tedarikçi', value: 'Tedarikçi' },
                ]}
              />
            </Form.Item>

            <Form.Item label="Vergi No" name="taxNo">
              <Input />
            </Form.Item>

            <Form.Item label="Vergi Dairesi" name="taxOffice">
              <Input />
            </Form.Item>

            <Form.Item
              label={
                <Space>
                  <span>Telefon</span>
                  <Tooltip title="İletişim telefon numarası (10-15 haneli)">
                    <InfoCircleOutlined style={{ color: '#1890ff', cursor: 'help' }} />
                  </Tooltip>
                </Space>
              }
              name="phone"
              rules={[
                {
                  pattern: /^\+?[0-9\s-]{10,15}$/,
                  message: 'Lütfen geçerli bir telefon numarası girin (örn: +90 5xx xxx xx xx)',
                },
              ]}
            >
              <Input placeholder="+90 5xx xxx xx xx" />
            </Form.Item>

            <Form.Item
              label={
                <Space>
                  <span>E-posta</span>
                  <Tooltip title="İletişim e-posta adresi (opsiyonel)">
                    <InfoCircleOutlined style={{ color: '#1890ff', cursor: 'help' }} />
                  </Tooltip>
                </Space>
              }
              name="email"
              rules={[
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve() 
                    if (!value.includes('@')) {
                      return Promise.reject(new Error('E-posta adresi @ işareti içermelidir'))
                    }
                    
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                    if (!emailRegex.test(value)) {
                      return Promise.reject(new Error('Geçerli bir e-posta adresi girin (örn: ornek@firma.com)'))
                    }
                    return Promise.resolve()
                  },
                },
              ]}
            >
              <Input type="email" placeholder="ornek@firma.com" />
            </Form.Item>

            <Form.Item label="Adres" name="address">
              <Input.TextArea rows={3} />
            </Form.Item>
          </Col>

          {/* Sağ Sütun */}
          <Col xs={24} sm={24} md={12} lg={12}>
            <Form.Item
              label={
                <Space>
                  <span>Bakiye</span>
                  <Tooltip title="Cari hesabının mevcut bakiyesi (TL)">
                    <InfoCircleOutlined style={{ color: '#1890ff', cursor: 'help' }} />
                  </Tooltip>
                </Space>
              }
              name="balance"
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                }
                parser={(value) => value.replace(/\./g, '')}
                placeholder="0"
              />
            </Form.Item>

            <Form.Item
              label={
                <Space>
                  <span>Bakiye Türü</span>
                  <Tooltip title="Alacak: Müşteriden alacağımız para | Borç: Tedarikçiye/taşerona borcumuz">
                    <InfoCircleOutlined style={{ color: '#1890ff', cursor: 'help' }} />
                  </Tooltip>
                </Space>
              }
              name="balanceType"
            >
              <Select
                options={[
                  { label: 'Alacak (müşteriden alacağımız)', value: 'Alacak' },
                  { label: 'Borç (tedarikçiye/taşerona borcumuz)', value: 'Borç' },
                ]}
              />
            </Form.Item>

            <Form.Item
              label={
                <Space>
                  <span>Risk Durumu</span>
                  <Tooltip title="Riskli: Ödeme gecikmesi veya sorun yaşanan hesaplar">
                    <InfoCircleOutlined style={{ color: '#1890ff', cursor: 'help' }} />
                  </Tooltip>
                </Space>
              }
              name="isRisky"
            >
              <Select
                options={[
                  { label: 'Normal', value: 'normal' },
                  { label: 'Riskli', value: 'riskli' },
                ]}
              />
            </Form.Item>

            <Form.Item label="Son Vade Tarihi" name="dueDate">
              <Input type="date" />
            </Form.Item>

            <Form.Item label="Ödeme Planı - Sonraki Tarih" name="nextPaymentDate">
              <Input type="date" />
            </Form.Item>

            <Form.Item label="Ödeme Planı - Tutar" name="nextPaymentAmount">
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                }
                parser={(value) => value.replace(/\./g, '')}
              />
            </Form.Item>

            <Form.Item label="Notlar" name="notes">
              <Input.TextArea rows={3} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ marginTop: 24 }}>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting || loading}
              disabled={submitting || loading}
            >
              {submitting || loading ? 'Kaydediliyor...' : isEditMode ? 'Güncelle' : 'Kaydet'}
            </Button>
            <Button
              onClick={() => {
                if (form.isFieldsTouched()) {
                
                  const confirmed = window.confirm('Yaptığınız değişiklikler kaydedilmeyecek. Emin misiniz?')
                  if (confirmed) {
                    navigate('/cari')
                  }
                } else {
                  navigate('/cari')
                }
              }}
              disabled={submitting || loading}
            >
              Vazgeç
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  )
}

export default CariFormPage

