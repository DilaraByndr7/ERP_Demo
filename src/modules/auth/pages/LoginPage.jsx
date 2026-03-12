import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Typography, message, Card, Alert } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { login } from '../../../store/auth/actions'

const { Title } = Typography

function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector((state) => state.auth)
  const [form] = Form.useForm()

  const handleFinish = async (values) => {
    try {
      await dispatch(login(values.username, values.password))
      message.success('Giriş başarılı')
      setTimeout(() => {navigate('/', { replace: true })}, 100)
    } catch (error) {
      message.error(error.message || 'Giriş yapılırken bir hata oluştu')
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card
        style={{
          width: 400,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
          ERP Sistemi
        </Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Kullanıcı Adı"
            name="username"
            rules={[{ required: true, message: 'Kullanıcı adı zorunludur' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Kullanıcı adı"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Şifre"
            name="password"
            rules={[{ required: true, message: 'Şifre zorunludur' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Şifre"
              size="large"
            />
          </Form.Item>

          {error && (
            <Alert
              type="error"
              message="Giriş Başarısız"
              description={
                <div>
                  <p>{error}</p>
                  <p style={{ marginTop: 8, fontSize: '12px', color: '#999' }}>
                    Lütfen kullanıcı adı ve şifrenizi kontrol edin.
                  </p>
                </div>
              }
              showIcon
              closable
              style={{ marginBottom: 16 }}
            />
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              Giriş Yap
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center', marginTop: 16, color: '#999' }}>
            <p>Demo Kullanıcılar:</p>
            <p>Admin: admin / admin123</p>
            <p>User: user / user123</p>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default LoginPage
