import { HashRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Learn } from './pages/Learn'
import { ModulePage } from './pages/ModulePage'
import { LessonPage } from './pages/LessonPage'
import { Practice } from './pages/Practice'
import { PracticeSession } from './pages/PracticeSession'
import { ExamIntro } from './pages/ExamIntro'
import { ExamRun } from './pages/ExamRun'
import { ExamResultPage } from './pages/ExamResult'
import { Kennisbank } from './pages/Kennisbank'
import { Docent } from './pages/Docent'
import { Over } from './pages/Over'
import { NotFound } from './pages/NotFound'

/** HashRouter: werkt op GitHub Pages zonder serverconfiguratie. */
export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="leren" element={<Learn />} />
          <Route path="leren/:moduleId" element={<ModulePage />} />
          <Route path="les/:lessonId" element={<LessonPage />} />
          <Route path="oefenen" element={<Practice />} />
          <Route path="oefenen/sessie" element={<PracticeSession />} />
          <Route path="proefexamen" element={<ExamIntro />} />
          <Route path="proefexamen/bezig" element={<ExamRun />} />
          <Route path="proefexamen/uitslag" element={<ExamResultPage />} />
          <Route path="kennisbank" element={<Kennisbank />} />
          <Route path="docent" element={<Docent />} />
          <Route path="over" element={<Over />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
