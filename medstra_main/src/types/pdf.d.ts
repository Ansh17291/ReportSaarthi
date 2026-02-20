declare module 'pdfjs-dist/build/pdf.js' {
  export * from 'pdfjs-dist';
}

declare module 'pdfjs-dist/build/pdf.worker.js' {
  const worker: any;
  export default worker;
} 