import useTabStore from '@renderer/store/tabs'
import { X, Info } from 'lucide-react'

interface ToolbarProps {
  id: string
}

export const Toolbar = ({ id }: ToolbarProps): JSX.Element => {
  const closeTab = useTabStore((state) => state.closeTab)

  return (
    <div className="h-full flex justify-center items-center gap-2 mr-2">
      <button onClick={() => alert(`Action for ${id}`)}>
        <Info width={17} />
      </button>
      <button className="" onClick={() => closeTab(id)}>
        <X width={17} />
      </button>
    </div>
  )
}
