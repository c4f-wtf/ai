import React, { useState, useEffect } from 'react';
import store, { File, Project } from '@store';
import { autorun } from 'mobx';

import Tree from 'rc-tree';
import { DataNode } from 'rc-tree/lib/interface';

import 'rc-tree/assets/index.css';
import './animation.css';
import './contextmenu.css';
import { ListGroup, Popover } from 'react-bootstrap';

const motion = {
    motionName: 'node-motion',
    motionAppear: false,
    onAppearStart: () => ({ height: 0 }),
    onAppearActive: (node: any) => ({ height: node.scrollHeight }),
    onLeaveStart: (node: any) => ({ height: node.offsetHeight }),
    onLeaveActive: () => ({ height: 0 }),
};

const defaultExpanded = ['project'];

type Menu = {
    filename: React.ReactNode;
    id: number;
    x: number;
    y: number;
};

export function FileTree(props: { project: Project }) {
    const [files, setFiles] = useState<DataNode[]>([]);
    const [selected, setSelected] = useState<string | number>();
    const [menu, setMenu] = useState<Menu | null>(null);

    let closed = false;
    useEffect(() => {
        autorun(async () => {
            store.project.lastFileTreeChange;

            const [projectFiles, globalFiles] = await Promise.all([
                store.project.getProjectFiles(props.project.id),
                store.project.getProjectFiles(0),
            ]);

            !closed && setFiles(getTreeData(projectFiles, globalFiles));
        });
        return () => {
            closed = true;
        };
    }, []);

    function onRightClick(info: {
        event: React.MouseEvent<Element, MouseEvent>;
        node: DataNode;
    }) {
        setMenu({
            filename: info.node.title,
            id: Number(info.node.key) || 0,
            x: info.event.pageX + 10,
            y: info.event.pageY - 45,
        });
        document.addEventListener('click', () => setMenu(null), { once: true });
    }

    return (
        <div>
            {menu ? (
                <Popover id="contextMenu" style={{ top: menu.y, left: menu.x }}>
                    <Popover.Title as="h3">{menu.filename}</Popover.Title>
                    <Popover.Content>
                        <ListGroup>
                            <ListGroup.Item
                                action
                                onClick={() => {
                                    createFile(props.project.id, menu.id);
                                }}
                            >
                                Create File
                            </ListGroup.Item>
                            <ListGroup.Item action>Upload File</ListGroup.Item>
                            <ListGroup.Item action>
                                Download File
                            </ListGroup.Item>
                        </ListGroup>
                    </Popover.Content>
                </Popover>
            ) : null}
            <Tree
                onRightClick={onRightClick}
                treeData={files}
                motion={motion}
                defaultExpandedKeys={defaultExpanded}
            />
        </div>
    );
}

function createFile(projectId: number, parentId: number) {
    console.log('create file', projectId, parentId);
}

function fileToDataNode(file: File): DataNode {
    return {
        key: file.id,
        title: file.name,
    };
}

function getTreeData(projectFiles: File[], globalFiles: File[]): DataNode[] {
    // const errors = store.project.activeProject?.errors || {};
    // if (!store.project.activeFile) {
    //     throw Error('thisShouldNotHappen');
    // } else {
    //     //await fileTree.updateFiles(globalFiles, projectFiles, projectStore.activeFile, errors);
    // }
    // console.log(projectFiles, globalFiles);
    return [
        {
            key: 'global',
            title: 'global',
            children: globalFiles.map(fileToDataNode),
        },
        {
            key: 'project',
            title: 'project',
            children: projectFiles.map(fileToDataNode),
        },
    ];
}

export default FileTree;

// import { html, LitElement } from 'lit-element';
// import { autorun, toJS } from 'mobx';
// import projectStore from '@store/project-store';
// import appStore from '@store/app-store';
// import { Defer, dispatchIframeEvents, thisShouldNotHappen } from '@src/utils';

// import { Modals, ModalAbort } from '@element/c4f-modal';
// import { createFileTemplate, deleteFileTemplate, uploadFileTemplate } from '@modal/templates';
// import { JSTreeWindow } from '@iframe/jstree';
// import { File } from '@store/types';
// import { saveAs } from 'file-saver';

// import db from '@localdb';

// // @ts-ignore
// import sharedStyles from '@shared-styles';
// // @ts-ignore
// import style from './file-tree.css';
// //const jstreeStyles = unsafeCSS(require('jstree/dist/themes/default/style.css').toString());
// //const icons32 = require('jstree/dist/themes/default/32px.png');
// //const icons40 = require('jstree/dist/themes/default/40px.png');
// //const iconsThrobber = require('jstree/dist/themes/default/throbber.gif');

// class FileTree extends LitElement {
//     #fileTree = new Defer<JSTreeWindow>();

//     static get styles() {
//         return [
//             sharedStyles,
//             style,
//         ];
//     }

//     render() {
//         return html`<iframe id="filetree" src="jstree.html"></iframe>`;
//     }

//     async onDelete(file: File) {
//         if(projectStore.activeProject){
//             try {
//                 await appStore.showModal(Modals.GENERIC, deleteFileTemplate(file));
//                 const selectFile = await db.loadFileByName(projectStore.activeProject.id, 'index.js');
//                 await projectStore.openFile(selectFile.id);
//                 await projectStore.deleteFile(file.id);
//             }
//             catch (error) {
//                 if( ! (error instanceof ModalAbort) )
//                     console.error(error);
//             }
//         }
//     }

//     onFile(file: File) {
//         if(projectStore.activeProject){
//             if(file.id){
//                 projectStore.openFile(file.id);
//             }
//             else{
//                 projectStore.openVirtualFile(file);
//             }
//         }

//     }

//     onAddFile() {
//         if(projectStore.activeProject)
//             this.addFile();
//     }

//     async onUploadFile() {
//         try {
//             const modal = await appStore.showModal(Modals.GENERIC, uploadFileTemplate(projectStore.activeProject?.id || 0));
//             const id = await projectStore.createFile(modal.name, modal.projectId, modal.content);
//             projectStore.openFile(id);
//         }
//         catch (error) {
//             if( ! (error instanceof ModalAbort) )
//                 console.error(error);
//         }
//     }

//     onDownloadFile(file: File) {
//         if(file.content instanceof Blob){
//             saveAs(file.content, file.name);
//         }
//         else{
//             const content = new Blob([file.content || ''], {
//                 type: 'text/plain'
//             });
//             saveAs(content, file.name);
//         }
//     }

//     async addFile() {
//         try {
//             const modal = await appStore.showModal(Modals.GENERIC, createFileTemplate(projectStore.activeProject?.id || 0));
//             console.log(modal);
//             const id = await projectStore.createFile(`${modal.name}.${modal.type}`, Number(modal.projectId), '');
//             projectStore.openFile(id);
//         }
//         catch (error) {
//             if( ! (error instanceof ModalAbort) )
//                 console.error(error);
//         }
//     }

//     async firstUpdated() {
//         const iframe = this.shadowRoot?.getElementById('filetree') as HTMLIFrameElement;
//         if(iframe){
//             iframe.onload = async () => {
//                 if(iframe.contentWindow){
//                     this.#fileTree.resolve(iframe.contentWindow as JSTreeWindow)
//                     const fileTree = await this.#fileTree.promise;
//                     fileTree.onFile = this.onFile.bind(this);
//                     fileTree.onAddFile = this.onAddFile.bind(this);
//                     fileTree.onDownloadFile = this.onDownloadFile.bind(this);
//                     fileTree.onUploadFile = this.onUploadFile.bind(this);
//                     fileTree.onDelete = this.onDelete.bind(this);
//                     dispatchIframeEvents(iframe);

//                     autorun(async _ => {
//                         projectStore.lastFileTreeChange;
//                         const project = projectStore.activeProject;
//                         if(project){
//                             await this.updateTree();
//                         }
//                     });

//                     autorun(async _ => {
//                         const file = projectStore.activeFile;
//                         if(file){
//                             await fileTree.selectFile(file);
//                         }
//                     });

//                     autorun(async _ => {
//                         const errors = toJS(projectStore.activeProject?.errors) || {};
//                         await fileTree.setErrors(errors);
//                     });
//                 }
//                 else{
//                     thisShouldNotHappen();
//                 }
//             }
//         }
//         else{
//             thisShouldNotHappen();
//         }
//     }

//     async updateTree() {
//         let fileTree, projectFiles, globalFiles;
//         [fileTree, projectFiles, globalFiles] = await Promise.all([
//             this.#fileTree.promise,
//             projectStore.activeProject ? db.getProjectFiles(projectStore.activeProject.id) : [],
//             db.getProjectFiles(0),
//         ]);
//         projectFiles = projectFiles.sort(this.sort);
//         globalFiles = globalFiles.sort(this.sort);

//         const errors = projectStore.activeProject?.errors || {};
//         if(!projectStore.activeFile){
//             thisShouldNotHappen();
//         }
//         else{
//             await fileTree.updateFiles(globalFiles, projectFiles, projectStore.activeFile, errors);
//         }
//     }

//     sort(fileA: File, fileB: File) {
//         // sort first by file endings, then by name
//         const endingA = fileA.name.split('.').pop();
//         const endingB = fileB.name.split('.').pop();
//         let comp = endingA?.localeCompare(endingB || '');
//         if( comp === 0 ){
//             comp = fileA.name.localeCompare(fileB.name);
//         }
//         return comp || 0;
//     }
// }

// window.customElements.define('file-tree', FileTree);
