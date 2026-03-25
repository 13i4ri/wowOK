import { StoryViewer } from './components/StoryViewer'
import { storyConfig } from './content/story'
import './App.css'

function App() {
  return <StoryViewer story={storyConfig} />
}

export default App
