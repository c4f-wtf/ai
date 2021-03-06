export declare function storeJson(path: string, data: any): Promise<void>;
export declare function loadJson(path: string): Promise<any>;
export declare function getFileContent(path: string): Promise<string>;
export declare const localStorage: {
    length: number,
    key(n: number): string | null,
    setItem(key: string, value: any): void,
    getItem(key: string): any,
    removeItem(key: string): void,
    clear(): void,
}
export declare const console: Console;
export declare function getCanvas(id?: 0 | 1 | 2): OffscreenCanvas;
export declare function seedRandom(seed?: string): {
    (): number,
    quick(): number,
    int32(): number,
};
export declare function sleep(ms: number): Promise<void>
export declare function setMessages(html: string): Promise<void>;
export declare function addMessage(html: string): Promise<void>;
export declare function loadImages(paths: string[]): Promise<void>;
export declare function getImage(name: string): ImageBitmap | undefined;

export declare function onVideoFrameUpdate(callback: (data: ImageBitmap) => void): void;
//export declare function includeUrl(url: string, context = {}, parse = (content: string) => content ): Promise<any>;

export declare function onMouseDown(callback: (e?: MouseEvent) => void): void;
export declare function onMouseMove(callback: (e?: MouseEvent) => void): void;
export declare function onMouseUp(callback: (e?: MouseEvent) => void): void;