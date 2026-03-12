import { useState } from 'react'
import { Modal, Form, Input, Select, Upload, Button, Space, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'

function DocumentUploadModal({ visible, onClose, onUpload }) {
  const [form] = Form.useForm()
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  const handleFinish = async (values) => {
    if (!selectedFile) {
      message.error({ content: 'Lütfen bir dosya seçin', duration: 3 })
      return
    }

    setUploading(true)
    try {
      await onUpload(selectedFile, {
        name: values.name || selectedFile.name,
        type: values.type,
      })
      form.resetFields()
      setSelectedFile(null)
    } catch (error) {
      message.error({
        content: error.message || 'Doküman eklenirken bir hata oluştu. Lütfen tekrar deneyin.',
        duration: 5,
      })
    } finally {
      setUploading(false)
    }
  }

  const handleCancel = () => {
    if (uploading) {
      message.warning('Dosya yükleniyor, lütfen bekleyin')
      return
    }
    form.resetFields()
    setSelectedFile(null)
    onClose()
  }

  return (
    <Modal
      title="Yeni Doküman Ekle"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      closable={!uploading}
      maskClosable={!uploading}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          label="Dosya Seç"
          rules={[{ required: true, message: 'Lütfen bir dosya seçin' }]}
        >
          <Upload
            beforeUpload={(file) => {
              setSelectedFile(file)
              form.setFieldsValue({ name: file.name })

              const fileName = file.name.toLowerCase()
              if (fileName.includes('sözleşme') || fileName.includes('sozlesme')) {
                form.setFieldsValue({ type: 'Sözleşme' })
              } else if (fileName.includes('protokol')) {
                form.setFieldsValue({ type: 'Ek Protokol' })
              } else if (fileName.includes('fatura')) {
                form.setFieldsValue({ type: 'Fatura' })
              }

              return false
            }}
            onRemove={() => {
              setSelectedFile(null)
              form.setFieldsValue({ name: '' })
            }}
            maxCount={1}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
          >
            <Button icon={<UploadOutlined />}>Dosya Seç</Button>
          </Upload>
          {selectedFile && (
            <div style={{ marginTop: 8, color: '#52c41a' }}>
              ✓ {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
            </div>
          )}
        </Form.Item>
        <Form.Item
          label="Doküman Adı"
          name="name"
          rules={[{ required: true, message: 'Doküman adı zorunludur' }]}
        >
          <Input placeholder="Dosya seçildiğinde otomatik doldurulur" />
        </Form.Item>
        <Form.Item
          label="Doküman Türü"
          name="type"
          rules={[{ required: true, message: 'Doküman türü zorunludur' }]}
        >
          <Select
            options={[
              { label: 'Sözleşme', value: 'Sözleşme' },
              { label: 'Ek Protokol', value: 'Ek Protokol' },
              { label: 'Fatura', value: 'Fatura' },
              { label: 'Diğer', value: 'Diğer' },
            ]}
          />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" disabled={!selectedFile} loading={uploading}>
              Kaydet
            </Button>
            <Button onClick={handleCancel} disabled={uploading}>
              İptal
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default DocumentUploadModal
