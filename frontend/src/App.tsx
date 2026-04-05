import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import SubmitArticle from './pages/SubmitArticle';
import ArticleDetail from './pages/ArticleDetail';
import ClaimReview from './pages/ClaimReview';
import TimelessRewrite from './pages/TimelessRewrite';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <Layout>
            <Dashboard />
          </Layout>
        } />
        <Route path="/submit" element={
          <Layout>
            <SubmitArticle />
          </Layout>
        } />
        <Route path="/articles/:id" element={
          <Layout>
            <ArticleDetail />
          </Layout>
        } />
        <Route path="/review" element={
          <Layout>
            <ClaimReview />
          </Layout>
        } />
        <Route path="/timeless-rewrite" element={
          <Layout>
            <TimelessRewrite />
          </Layout>
        } />
        <Route path="*" element={
          <Layout>
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
                <button 
                  onClick={() => window.location.href = '/'}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </Layout>
        } />
      </Routes>
    </Router>
  );
}

export default App;