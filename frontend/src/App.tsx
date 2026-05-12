import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Enrollment from './pages/Enrollment'
import Verification from './pages/Verification'
import Identification from './pages/Identification'
import UserDetail from './pages/UserDetail'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/users/:id" element={<UserDetail />} />
          <Route path="/enrollment" element={<Enrollment />} />
          <Route path="/verification" element={<Verification />} />
          <Route path="/identification" element={<Identification />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
