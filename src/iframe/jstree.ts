import { Defer } from '@util';
import { File, ProjectErrors } from '@store/types';

import { docs } from '@doc/docs';

declare var window: JSTreeWindow;

type Node = {
    id: string,
    parent: string,
    text: string,
    data: File,
    state: {
        opened: boolean,
    }
}

type NodeData = {
    node: Node,
    instance: JSTree,
};



let jstree = new Defer<JSTree>();

window.onFile = (_: File) => {};
window.onAddFileGlobal = () => {};
window.onAddFileProject = () => {};
window.onDelete = async (_: File) => {};

let preventSelectNodeEvent = false;

onload = () => {
    $('#jstree').jstree({
        plugins: [ 'contextmenu' ],
        contextmenu: {
            items: contextMenu,
            show_at_node: true,
        },
        'core': {
            'multiple': false,
        }
    });
    jstree.resolve($('#jstree').jstree(true));

    $('#jstree').on('refresh.jstree', () => {
        jstree.resolve($('#jstree').jstree(true));
    });

    let lastSelected: Node | undefined = undefined;
    $('#jstree').on('select_node.jstree', (event, data: NodeData) => {
        const evt: any =  window.event || event;
        const button = evt?.which || evt?.button;
        if(data.node.parent === '#' || data.node.text === 'assets'){
            if(button === 1){
                data.instance.deselect_node(data.node);
                if(data.node.state.opened){
                    $('#jstree').jstree('close_node', data.node);
                }
                else{
                    $('#jstree').jstree('open_node', data.node);
                }
                preventSelectNodeEvent = true;
                data.instance.select_node(lastSelected);
                preventSelectNodeEvent = false;
            }
        }
        else{
            if(window.onFile && !preventSelectNodeEvent && lastSelected?.id !== data.node.id){
                window.onFile(data.node.data);
            }
            lastSelected = data.node;
        }
        
    });


}

function contextMenu(node: Node){
    let remove = undefined;
    let download = undefined;
    
    let parent = node.parent;
    if(! ['index.js', 'assets'].includes(node.text) && !['#', 'docs'].includes(parent)){
        remove = {
            label: `delete&nbsp;file`,
            icon: '../assets/interface/trash.svg',
            action: () => window.onDelete(node.data),
        }
    }
    if(! ['assets'].includes(node.text) && !['#', 'docs'].includes(parent)){
        download = {
            label: `download&nbsp;file`,
            icon: '../assets/interface/download.svg',
            action: () => window.onDownloadFile(node.data),
        }
    }
    
    return {
        create: {
            label: 'create&nbsp;file',
            icon: '../assets/interface/add.svg',
            action: () => window.onAddFile(),
        },
        upload: {
            label: 'upload&nbsp;file',
            icon: '../assets/interface/upload.svg',
            action: () => window.onUploadFile(),
        },
        download,
        remove,
    }
}

function getEnding(fileName: string){
    const parts = fileName.split('.');
    if(parts.length < 1)
        return 'unknown';
    return parts[parts.length-1];
}

window.updateFiles = async function(global: File[], project: File[], activeFile: File, errors: ProjectErrors = []){
    const projectFiles = project.filter(file => !/\.(png|jpe?g)$/.test(file.name));
    const projectAssets = project.filter(file => /\.(png|jpe?g)$/.test(file.name));
    const globalFiles = global.filter(file => !/\.(png|jpe?g)$/.test(file.name));
    const globalAssets = global.filter(file => /\.(png|jpe?g)$/.test(file.name));

    const assetFolders: object[] = [];
    if(projectAssets.length){
        assetFolders.push({
            id: 'projectAssets',
            parent: 'project',
            text: 'assets',
            state: {
                opened: false,
                selected: false
            }
        });
    }
    if(globalAssets.length){
        assetFolders.push({
            id: 'globalAssets',
            parent: 'global',
            text: 'assets',
            state: {
                opened: false,
                selected: false
            }
        });
    }

    const allDocs = Array.from(docs).map(([key, value]) => {
        let ending = getEnding(key);
        return {
            id: `docs/${key}`,
            parent: 'docs',
            text: key,
            icon: `../assets/filetree/${ending}.svg`,
            data: {
                id: 0,
                projectId: 0,
                name: `docs/${key}`,
                content: value,
            } as File,
        }
    });

    const data = [
        ...allDocs,
        ...assetFolders,
        {
            id: 'docs',
            parent: '#',
            text: 'docs',
            state: {
               opened: false,
               selected: false
            }
        },
        {
            id: 'global',
            parent: '#',
            text: 'global',
            state: {
               opened: true,
               selected: false
            }
        },
        {
            id: 'project',
            parent: '#',
            text: 'project',
            state: {
               opened: true,
               selected: false
            }
        },
        ...projectFiles.map(file => {
            let ending = getEnding(file.name);
            return {
                id: file.id,
                parent: 'project',
                text: file.name,
                icon: `../assets/filetree/${ending}.svg`,
                data: file,
            }
        }),
        ...projectAssets.map(file => {
            let ending = getEnding(file.name);
            return {
                id: file.id,
                parent: 'projectAssets',
                text: file.name,
                icon: `../assets/filetree/${ending}.svg`,
                data: file,
            }
        }),
        ...globalFiles.map(file => {
            let ending = getEnding(file.name);
            return {
                id: file.id,
                parent: 'global',
                text: file.name,
                icon: `../assets/filetree/${ending}.svg`,
                data: file,
            }
        }),
        ...globalAssets.map(file => {
            let ending = getEnding(file.name);
            return {
                id: file.id,
                parent: 'globalAssets',
                text: file.name,
                icon: `../assets/filetree/${ending}.svg`,
                data: file,
            }
        }),
    ];

    const tree = await jstree.promise;
    if(tree.settings)
        tree.settings.core.data = data;
    tree.refresh();
    jstree = new Defer<JSTree>();
    window.setErrors(errors);
    window.selectFile(activeFile);
}

window.selectFile = async function (file: File){
    if(file){
        const tree = await jstree.promise;
        preventSelectNodeEvent = true;
        if(file.id){
            tree.activate_node(file.id, undefined);
        }
        else{
            tree.activate_node(file.name, undefined);
        }
        preventSelectNodeEvent = false;
    }
}

const currentErrorNodes: {[fileId: string]: Node} = {};
window.setErrors = async function (errors: ProjectErrors){
    const tree = await jstree.promise;
    for(const fileId of Object.keys(errors)){
        const node = tree.get_node(fileId);
        if(node){
            tree.set_icon(node, `../assets/filetree/error.svg`);
            currentErrorNodes[fileId] = node;
        }
    }
    for(const node of Object.values(currentErrorNodes)){
        if(!errors[Number(node.id)]){
            const ending = getEnding(node.text);
            tree.set_icon(node, `../assets/filetree/${ending}.svg`);
            delete currentErrorNodes[node.id];
        }
    }
}


export type JSTreeWindow = Window & {
    onFile: (file: File) => void;
    onAddFileGlobal: () => void;
    onAddFileProject: () => void;
    onAddFile: () => void;
    onUploadFile: () => void;
    onDownloadFile: (file: File) => void;
    onDelete: (file: File) => Promise<void>;

    updateFiles: (global: File[], project: File[], activeFile: File, errors: ProjectErrors) => Promise<void>;
    selectFile: (file: File) => Promise<void>;
    setErrors: (errors: ProjectErrors) => Promise<void>;
};