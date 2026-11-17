import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './app'
import './index.css'

// 必须用 HashRouter：静态托管（花生壳文件托管）没有 404 重写，BrowserRouter 刷新会白屏
createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <App />
  </HashRouter>,
)
