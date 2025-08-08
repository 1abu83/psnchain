// Global type declarations for Node.js globals
declare var console: Console;
declare var process: NodeJS.Process;
declare var require: NodeRequire;
declare var module: NodeModule;

interface Console {
  log(message?: any, ...optionalParams: any[]): void;
  error(message?: any, ...optionalParams: any[]): void;
}

interface NodeModule {
  exports: any;
  require: NodeRequire;
  id: string;
  filename: string;
  loaded: boolean;
  parent: any;
  children: NodeModule[];
}

interface Buffer extends Uint8Array {
  equals(otherBuffer: Buffer): boolean;
  toString(encoding?: string, start?: number, end?: number): string;
  toJSON(): { type: 'Buffer'; data: any[] };
}

interface BufferConstructor {
  from(array: Uint8Array): Buffer;
  from(arrayBuffer: ArrayBuffer, byteOffset?: number, length?: number): Buffer;
  from(buffer: Buffer): Buffer;
  from(str: string, encoding?: string): Buffer;
  concat(list: Buffer[], totalLength?: number): Buffer;
  byteLength(string: string, encoding?: string): number;
  isBuffer(obj: any): obj is Buffer;
}

declare var Buffer: BufferConstructor;

// Extend the global scope
declare global {
  var console: Console;
  var process: NodeJS.Process;
  var require: NodeRequire;
  var module: NodeModule;
  var Buffer: BufferConstructor;
}