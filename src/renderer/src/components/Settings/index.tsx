import React, { ReactNode, useState } from 'react';
import clsx from 'clsx';
import { SettingsIcon } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useSettingsStore } from '@renderer/store/settings';
import { settingsDescription } from 'shared/defaults/settings.description';

import { Checkbox } from '../ui/checkbox';

interface SettingsProps {
  children?: ReactNode;
}

const suggestedColors = [
  '#b7a153',
  '#7393B3',
  '#d1b6c6',
  '#cccccc',
  '#CAF1DE',
  '#ACDDDE',
  '#F7D8BA',
  '#ECDEAA'
];

const Settings: React.FC<SettingsProps> = () => {
  const { backgroundColor, adBlocker, setBackgroundColor, setAdBlocker, hotkeys, setHotkey } =
    useSettingsStore();
  const [tempHotkeys, setTempHotkeys] = useState(hotkeys);

  const handleInputChange = (categoryName, actionName, value): void => {
    setTempHotkeys((prev) => ({
      ...prev,
      [categoryName]: {
        ...prev[categoryName],
        [actionName]: value
      }
    }));
  };

  const handleInputSave = (categoryName, actionName): void => {
    const value = tempHotkeys[categoryName][actionName];
    setHotkey(categoryName as string, actionName as string, value as string);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4 md:px-6">
      <div className="space-y-4">
        <div>
          <div className="flex gap-3 items-center mb-1">
            <div className="bg-gray-200 p-2 rounded-md">
              <SettingsIcon />
            </div>
            <h1 className="text-3xl font-bold text-black ">Settings</h1>
          </div>
          <p className="text-muted-foreground pt-1">Customize the browser to your preferences.</p>

          <hr className="my-3" />
        </div>
        <div className="grid gap-8">
          <Card className="rounded-md">
            <CardHeader>
              <CardTitle>Welcome Tab</CardTitle>
              <CardDescription>
                Change your name, so the browser can greet you when opening.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" placeholder="Enter your username" />
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-md">
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel of the browser.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center space-x-3">
                {suggestedColors.map((color, index) => (
                  <button
                    key={index}
                    className={clsx(
                      `h-10 w-10 rounded-full`,
                      backgroundColor === color && 'ring-2 ring-black'
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setBackgroundColor(color)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-md">
            <CardHeader>
              <CardTitle>Experimental</CardTitle>
              <CardDescription>
                Advanced features, i can not guarantee that they always work
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <form className="-mx-2 flex items-start gap-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
                <Checkbox id="airplane-mode" checked={adBlocker} onCheckedChange={setAdBlocker} />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Adblocker</p>
                  <p className="text-sm text-muted-foreground">
                    This is a builtin AdBlocker, when swithcing it on/off the browser needs to be
                    restarted.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
          <Card className="rounded-md">
            <CardHeader>
              <CardTitle>Keyboard Shortcuts</CardTitle>
              <CardDescription>Map your own key combinations to the hotkeys</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <form className="-mx-2 flex flex-col gap-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
                {Object.entries(settingsDescription.settings.hotkeys).map(
                  ([categoryName, categoryActions]) =>
                    Object.entries(categoryActions).map(([actionName, actionDetails]) => (
                      <div
                        key={actionName}
                        className="w-full flex gap-3 justify-between items-center"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">{actionDetails.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {actionDetails.description}
                          </p>
                        </div>
                        <div className="">
                          <Input
                            className="text-center"
                            value={tempHotkeys[categoryName][actionName]}
                            onChange={(e) =>
                              handleInputChange(categoryName, actionName, e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleInputSave(categoryName, actionName);
                              }
                            }}
                          />
                        </div>
                      </div>
                    ))
                )}
              </form>
            </CardContent>
          </Card>
          <Card className="rounded-md">
            <CardHeader>
              <CardTitle>Installed Extensions</CardTitle>
              <CardDescription>Look at installed plugin from the Chrome Web Store.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="-mx-2 flex items-start gap-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
                <BellIcon className="mt-px h-5 w-5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Coming soon</p>
                  <p className="text-sm text-muted-foreground">
                    I currently work on a solution to implement Plugins from Chrome Web Store.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

function BellIcon(props): JSX.Element {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}
export default Settings;
