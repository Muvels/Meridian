import useTabGroupStore from '@renderer/store/tabs';

import { Input } from './ui/input';

const AddressBar = ({ url }: { url: string }): JSX.Element => {
  const { updateTabUrl, activeTabGroup: activeTabGroupId, getTabGroupById } = useTabGroupStore();
  const activeTabGroup = getTabGroupById(activeTabGroupId);

  return (
    <nav className="text-white border-b-dark w-full h-full" id="drag">
      <div className=" flex justify-center items-center w-full">
        <Input
          type="url"
          className="text-black w-1/3 text-center bg-white"
          id="no-drag"
          value={url}
          onChange={(e) =>
            activeTabGroup && updateTabUrl(activeTabGroup, activeTabGroup?.active, e.target.value)
          }
        />
      </div>
    </nav>
  );
};

export default AddressBar;
