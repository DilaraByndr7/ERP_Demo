import { useState, useEffect } from 'react'
import { Layout, Menu, Typography, Button, Space, Avatar, Dropdown } from 'antd'
import { TeamOutlined, DashboardOutlined, FileTextOutlined, LogoutOutlined, UserOutlined, CheckCircleOutlined, MenuOutlined } from '@ant-design/icons'
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import CariListPage from './modules/cari/pages/CariListPage.jsx'
import CariFormPage from './modules/cari/pages/CariFormPage.jsx'
import DashboardPage from './modules/dashboard/DashboardPage.jsx'
import TransactionsPage from './modules/transactions/TransactionsPage.jsx'
import LoginPage from './modules/auth/pages/LoginPage.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { logout } from './store/auth/actions'

const { Header, Sider, Content } = Layout
const { Title } = Typography

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const [siderCollapsed, setSiderCollapsed] = useState(false)

  // If the user is not logged in, it redirects them to the login page
  useEffect(() => {
    if (!isAuthenticated && location.pathname !== '/login') {
      const timer = setTimeout(() => { navigate('/login', { replace: true })}, 0)
      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, location.pathname, navigate])

  const getSelectedKey = () => {
    if (location.pathname.startsWith('/cari')) return 'cari'
    if (location.pathname.startsWith('/transactions')) return 'transactions'
    return 'dashboard'
  }

  const selectedKey = getSelectedKey()

  const handleLogout = () => {
    dispatch(logout())
    setTimeout(() => {navigate('/login', { replace: true })}, 100)
  }

 
  if (location.pathname === '/login') {
    return <LoginPage />
  }

 
  if (!isAuthenticated) {
    return <LoginPage />
  }
  
  //Which items would be in the left-hand menu
  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/">Dashboard</Link>,
    },
    {
      key: 'cari',
      icon: <TeamOutlined />,
      label: <Link to="/cari">Cari &amp; Tedarikçi</Link>,
    },
    {
      key: 'transactions',
      icon: <FileTextOutlined />,
      label: <Link to="/transactions">Geçmiş İşlemler</Link>,
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh', height: '100vh', overflow: 'hidden' }}>
      <Sider  
        breakpoint="lg" 
        collapsedWidth="0"
        collapsible
        collapsed={siderCollapsed}
        onBreakpoint={(broken) => {
          setSiderCollapsed(broken)
        }}
        onCollapse={(collapsed) => {
          setSiderCollapsed(collapsed)
        }}
        width={250}
        style={{ 
          display: 'flex', 
          flexDirection: 'column',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          overflow: 'hidden',
          zIndex: 100,
        }}
      >
        <div
          style={{
            height: 64,
            padding: '0 16px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            fontWeight: 600,
            fontSize: '16px',
            flexShrink: 0,
          }}
        >
          ERP Demo
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          style={{ 
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            borderRight: 0,
            minHeight: 0,
            paddingBottom: user ? '120px' : 0, 
          }}
        />
        
        {user && (   // User Info Part
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'white',
              background: '#001529',
              zIndex: 10,
            }}
          >
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Space>
                <Avatar icon={<UserOutlined />} size="small" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: '14px', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.username}
                    </span>
                    <CheckCircleOutlined style={{ color: '#52c41a', flexShrink: 0 }} />
                  </div>
                  {user.email && (
                    <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.65)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.email}
                    </div>
                  )}
                  <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginTop: 2 }}>
                    {user.role === 'admin' ? 'Yönetici' : 'Kullanıcı'}
                  </div>
                </div>
              </Space>
              <Button  //Logout Button
                type="text"
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                style={{ width: '100%', color: 'rgba(255, 255, 255, 0.85)', textAlign: 'left', marginTop: 8 }}
                size="small"
              >
                Çıkış Yap
              </Button>
            </Space>
          </div>
        )}
      </Sider>
      <Layout style={{ marginLeft: siderCollapsed ? 0 : 250, minHeight: '100vh', height: '100vh', transition: 'margin-left 0.2s' }}>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #f0f0f0',
            position: 'sticky',
            top: 0,
            zIndex: 1,
            flexShrink: 0,
          }}
        >
          <Space size="middle">
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setSiderCollapsed(!siderCollapsed)}
              style={{ fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label={siderCollapsed ? 'Menüyü aç' : 'Menüyü kapat'}
            />
            <Title level={4} style={{ margin: 0 }}>
              İnşaat ERP - Cari Yönetimi Demo
            </Title>
          </Space>
        </Header>
          <Content style={{ margin: '24px', background: '#fff', padding: 24, overflowY: 'auto', height: 'calc(100vh - 112px)' }}> {/*Main content area*/}
          <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cari"
                element={
                  <ProtectedRoute>
                    <CariListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cari/new"
                element={
                  <ProtectedRoute>
                    <CariFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cari/:id"
                element={
                  <ProtectedRoute>
                    <CariFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transactions"
                element={
                  <ProtectedRoute>
                    <TransactionsPage />
                  </ProtectedRoute>
                }
              />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
