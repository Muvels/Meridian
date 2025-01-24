import React, { useCallback, useEffect, useState } from 'react';
import { ArrowRight, Folders, Globe, Search, SlashSquare } from 'lucide-react';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut
} from '@renderer/components/ui/command';
import useTabGroupStore from '@renderer/store/tabs';
import { settingsDescription } from 'shared/defaults/settings.description';
import { useSettingsStore } from '@renderer/store/settings';
import { useSidebarStore } from '@renderer/store/sidebar';

interface CommandBoxProps {
  defaultInput?: string;
  handleUrlChange: (url: string) => void;
}

export const CommandBox = ({ defaultInput, handleUrlChange }: CommandBoxProps): JSX.Element => {
  const { tabGroups, setActiveTabGroup, activeTabGroup, updateTabUrl, getTabGroupById } =
    useTabGroupStore();
  const { hotkeys } = useSettingsStore();
  const { isCmdOpen, setCmdOpen } = useSidebarStore();
  const [searchTerm, setSearchTerm] = useState({ term: '', input: defaultInput });
  const [isWebsearch, setIsWebsearch] = React.useState(false);
  const [autocompleteResults, setAutocompleteResults] = useState<Array<{ phrase: string }>>([
    { phrase: 'Google' }
  ]);
  // Fetch DuckDuckGo autocomplete whenever searchTerm changes
  useEffect(() => {
    if (!searchTerm.input.includes('!ws')) return;
    if (searchTerm.input.includes('!url')) return;
    // Only fetch if user has typed something
    if (searchTerm.term === '') {
      setAutocompleteResults([{ phrase: 'Google' }]);
      return;
    }

    const fetchAutocomplete = async (): Promise<void> => {
      try {
        const data = await window.nativeApi.suggest(encodeURIComponent(searchTerm.term));
        // Data is typically an array of objects: [{ phrase: "result1" }, { phrase: "result2" }, ...]
        setAutocompleteResults(data as Array<{ phrase: string }>);
      } catch (error) {
        console.error('Error fetching autocomplete:', error);
      }
    };

    void fetchAutocomplete();
  }, [searchTerm]);

  const handleValueChange = useCallback((search: string) => {
    const webSubstrings = ['!ws', '!url'];
    const containsSubstring = webSubstrings.some((substring) => search.includes(substring));
    setIsWebsearch(containsSubstring);
    const term = containsSubstring
      ? webSubstrings.reduce((result, substring) => result.replace(substring, '').trim(), search)
      : search;
    setSearchTerm({ input: search, term: term });
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (!searchTerm.input?.includes('!url')) return;
    if (e.key !== 'Enter') return;
    handleUrlChange(searchTerm.term);
    setCmdOpen(!isCmdOpen);
  };

  return (
    <div className="absolute z-[999] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  w-full flex justify-center items-center bg-opacity-70 text-white">
      <Command
        className="rounded-2xl shadow-md bg-gray-900 bg-opacity-60 w-2/3 h-2/5 backdrop-blur-2xl outline-none"
        shouldFilter={!isWebsearch}
      >
        <CommandInput
          className="py-4"
          value={searchTerm.input}
          onValueChange={handleValueChange}
          onKeyDown={handleKeyDown}
          placeholder="Search through the web..."
        >
          {isWebsearch ? (
            <Globe strokeWidth={1.5} className="h-4 w-4 shrink-0 opacity-70" />
          ) : (
            <SlashSquare strokeWidth={1} className="h-4 w-4 shrink-0 opacity-70" />
          )}
        </CommandInput>
        <CommandList className="tabs-scroll-container">
          {/*
            -------------- Search results --------------
            Display the fetched DuckDuckGo suggestions here.
          */}
          {isWebsearch && (
            <>
              <CommandGroup heading="Search results">
                <CommandEmpty>Type something to get suggestions</CommandEmpty>
                {autocompleteResults.map((result, index) => (
                  <CommandItem
                    className="hover:bg-slate-200 hover:bg-opacity-20"
                    key={index}
                    onMouseDown={() => {
                      handleUrlChange(
                        `https://duckduckgo.com/?t=h_&q=${encodeURIComponent(result.phrase)}&ia=web`
                      );
                      setCmdOpen(!isCmdOpen);
                    }}
                  >
                    <div className="flex gap-2 items-center justify-between truncate w-full">
                      <div className="flex justify-center items-center gap-2">
                        <div className="bg-gray-300 bg-opacity-20 px-2 py-1.5 rounded-lg font-bold">
                          <Globe />
                        </div>
                        <span className="">{result.phrase}</span>
                      </div>
                      <div className="flex justify-center items-center gap-2">
                        <span className="text-gray-300 font-medium text-xs">
                          Open search result
                        </span>
                        <div className="bg-gray-300 bg-opacity-20 px-2 py-2 rounded-lg font-bold">
                          <Search />
                        </div>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {!searchTerm.input.includes('!ws') && (
            <>
              {/* -------------- Other tabs -------------- */}
              {tabGroups.length > 0 && (
                <>
                  <CommandGroup heading="Other tabs">
                    {tabGroups
                      .filter((tabGroup) => tabGroup.id !== activeTabGroup)
                      .map((tabGroup) => (
                        <CommandItem
                          className="hover:bg-slate-500 hover:bg-opacity-20"
                          key={tabGroup.id}
                          onMouseDown={() =>
                            activeTabGroup !== tabGroup.id && setActiveTabGroup(tabGroup)
                          }
                        >
                          <div className="flex gap-2 items-center justify-between truncate w-full">
                            <div className="flex justify-center items-center gap-2">
                              <div className="bg-gray-300 bg-opacity-20 px-2 py-1 rounded-lg font-bold">
                                {!(tabGroup.tabs.length > 1) ? (
                                  tabGroup.active.title?.charAt(0).toUpperCase()
                                ) : (
                                  <Folders />
                                )}
                              </div>
                              <span className="">
                                {!(tabGroup.tabs.length > 1)
                                  ? tabGroup.active.title
                                  : `Tab Group: ${tabGroup.active.title}`}
                              </span>
                            </div>
                            <div className="flex justify-center items-center gap-2">
                              <span className="text-gray-300 font-medium text-xs">
                                Switch to tab
                              </span>
                              <div className="bg-gray-300 bg-opacity-20 px-2 py-2 rounded-lg font-bold">
                                <ArrowRight />
                              </div>
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                  <CommandSeparator />
                </>
              )}

              {/* -------------- Hotkey Lookup -------------- */}
              <CommandGroup heading="Hotkey - Lookup">
                {Object.entries(settingsDescription.settings.hotkeys).map(
                  ([categoryName, categoryActions]) =>
                    Object.entries(categoryActions).map(([actionName, actionDetails]) => (
                      <CommandItem key={actionName}>
                        <div className="w-full flex justify-between items-center">
                          <div className="flex items-center justify-center gap-2 ">
                            <div className="bg-gray-300 bg-opacity-10 px-2 py-0.5 rounded-md">
                              <CommandShortcut>{categoryName}</CommandShortcut>
                            </div>
                            <span className="">{actionDetails.name}</span>
                          </div>
                          <div className="flex justify-center items-center gap-2 ">
                            <span className="text-xs">{actionDetails.description}</span>
                            <div className="bg-gray-300 bg-opacity-10 px-2 py-0.5 rounded-md">
                              <CommandShortcut className="text-xs">
                                {hotkeys[categoryName][actionName]}
                              </CommandShortcut>
                            </div>
                          </div>
                        </div>
                      </CommandItem>
                    ))
                )}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </Command>
    </div>
  );
};
