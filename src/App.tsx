import { useEffect, useRef, useState } from "react";
import { listen } from '@tauri-apps/api/event'
import "./App.css";
import ContentEditable from 'react-contenteditable';
import { confirm } from '@tauri-apps/api/dialog';
import { appWindow, PhysicalSize } from '@tauri-apps/api/window';
import { register, unregister } from '@tauri-apps/api/globalShortcut';
import { save } from '@tauri-apps/api/dialog';
import { writeTextFile, BaseDirectory, readTextFile } from '@tauri-apps/api/fs';
import { open } from '@tauri-apps/api/dialog';


function App() {
    const [text, setText] = useState('Woot! Hooks working');

    const contentEditableRef = useRef<any>(null);

    const saveFile = async (contents: any) => {
        const filePath = await save({
            filters: [{
                name: 'Untitled',
                extensions: ['txt']
            }]
        })
        if (filePath) {
            writeTextFile(filePath, contents, {dir: BaseDirectory.Document})
        }
    }

    const openFile = async (filePath: string) => {
        const contents = await readTextFile(filePath, {dir: BaseDirectory.Document});
        setText(contents);
    }

    useEffect(() => {

        const unlistenOpenClick = listen("open-click", (e) => {
            open({
                filters: [{
                    name: 'Untitled',
                    extensions: ['txt', 'sh', 'json']
                }]
            }).then((filePath) => {
                console.log(filePath);
                if (filePath) {
                    openFile(filePath as string)
                }
            });
        });

        const setCss = async () => {
            const size: PhysicalSize = await appWindow.innerSize();
            console.log('size', size);
            const preElement: HTMLPreElement = contentEditableRef.current!.el.current;
            // focus
            preElement.focus();
            preElement.style.height = size.height - 60 + 'px';
        };
        setCss();

        return () => {
            // document.removeEventListener('keydown', handleKeyDown);
            unlistenOpenClick.then(f => f());
        };

    }, []);

    useEffect(() => {

        //listen to a event
        const unlistenSaveClick = listen("save-click", (e) => {
            confirm('Save file?').then((res) => {
                console.log(res);
                if (res) {
                    saveFile(text)
                }
            });
        });

        return () => {
            unlistenSaveClick.then(f => f());
            unregister('Ctrl+S').then(() => {
                console.log('unregister Ctrl+S');
            });
        }
    }, [text]);

    const handleChange = (evt: any) => {
        setText(evt.target.value);
    };

    const handleBlur = () => {
        console.log(text);
    };


    return (
      <ContentEditable
          ref={contentEditableRef}
          html={text} // innerHTML of the editable div
          disabled={false}       // use true to disable editing
          onChange={handleChange} // handle innerHTML change
          onBlur={handleBlur}
          tagName='pre' // Use a custom HTML tag (uses a div by default)
      />
  );
}

export default App;
