import { Input } from './ui/input';

const AddressBar = ({ url }: { url: string }): JSX.Element => (
  <nav className="text-white border-b-dark w-full h-full" id="drag">
    <div className=" flex justify-center items-center w-full">
      <Input
        type="url"
        className="text-black w-1/3 text-center bg-white"
        id="no-drag"
        value={url}
        onChange={() => {}}
      />
    </div>
  </nav>
);

export default AddressBar;
