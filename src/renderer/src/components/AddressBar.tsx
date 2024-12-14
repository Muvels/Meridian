import { Input } from './ui/input'

const AddressBar = ({
  url,
  setUrl
}: {
  url: string
  setUrl: React.Dispatch<React.SetStateAction<string>>
}): JSX.Element => {
  return (
    <nav className="text-white border-b-dark w-full h-full" id="drag">
      <div className=" flex justify-center items-center w-full">
        <Input
          type="url"
          className="text-black w-1/3 text-center bg-white"
          id="no-drag"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>
    </nav>
  )
}

export default AddressBar
