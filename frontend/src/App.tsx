import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import SubmitArticle from './pages/SubmitArticle';
import ArticleDetail from './pages/ArticleDetail';
import ClaimReview from './pages/ClaimReview';
import TimeSensitive from './pages/TimeSensitive';

function App() {
  return (
    <Router>
      <nav className="bg-white shadow-lg border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-red-600 hover:text-red-700 transition-colors">
                TimeTravel
              </Link>
            </div>
            <div className="flex space-x-6 items-center">
              <Link to="/" className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Dashboard
              </Link>
              <Link to="/submit" className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Submit
              </Link>
              <Link to="/review" className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors bg-red-50 border border-red-200">
                Review ({/* Add claim count later */})
              </Link>
              <Link to="/time-sensitive" className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors bg-orange-50 border border-orange-200">
                Time Sensitive
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="pb-8">
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
          <Route path="/time-sensitive" element={
            <Layout>
              <TimeSensitive />
            </Layout>
          } />
          <Route path="*" element={
            <Layout>
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
                  <Link to="/" className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors">
                    Back to Dashboard
                  </Link>
                </div>
              </div>
            </Layout>
          } />
        </Routes>
      </main>
    </Router>
  );
}

export default App;