import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { ImageUpIcon, XIcon, AlertCircleIcon } from "lucide-react";

export default function DragDropUploader({ onFileUpload }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    if (fileRejections.length > 0) {
      setError("File type not accepted or file too large (max 5MB)");
      return;
    }
    setError("");
    setFile(acceptedFiles[0]);
    onFileUpload(acceptedFiles[0]);
  }, [onFileUpload]);

const { getRootProps, getInputProps, isDragActive } = useDropzone({
  onDrop,
  accept: [
    ".pdf",
    ".txt",
    ".doc",
    ".docx",
    ".ppt",
    ".pptx"
  ],
  maxSize: 50 * 1024 * 1024,
  multiple: true
});

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
<div
  {...getRootProps()}
  role="button"
  tabIndex={0}
  style={{
    border: "3px dotted #9C9C9C",      // border-dashed, border color
    borderRadius: "15%",                // rounded-xl
    padding: "30px 90px",               // p-4 (16px), extra horizontal padding for width
    minHeight: "13rem",                 // min-h-52
    display: "flex",                    // flex
    flexDirection: "column",            // flex-col
    alignItems: "center",               // items-center
    justifyContent: "center",           // justify-center
    overflow: "hidden",                 // overflow-hidden
    backgroundColor: isDragActive ? "#222" : "rgba(156,156,156,0.1)", // hover:bg-accent/50
    transition: "background-color 0.3s",// transition-colors
    cursor: "pointer",                  // cursor-pointer
    textAlign: "center"                 // text-center
  }}
>
  <input {...getInputProps()} className="sr-only" aria-label="Upload file" />
<div className="flex flex-col items-center justify-center px-4 py-3 text-center w-full h-full">
  <div className="flex flex-col items-center justify-center w-full max-w-md">
    <div
                className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
                aria-hidden="true"
              >
                <ImageUpIcon className="size-4 opacity-60" />
              </div>
    <p className="mb-2 text-sm font-medium text-gray-200">
      Drop your file here or click to browse
    </p>
    <p className="text-muted-foreground text-xs mb-4">
      Max size: 5MB
    </p>
    
    {file && (
      <div className="flex flex-col items-center w-full max-w-xs relative bg-gray-800/50 rounded-lg p-3">
        <p className="text-sm font-medium text-gray-100 pr-6 truncate w-full text-center">{file.name}</p>
        <div className="absolute top-2 right-2">
          <button
            type="button"
            className="z-50 flex size-6 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition outline-none hover:bg-black/80"
            onClick={e => { e.stopPropagation(); setFile(null); onFileUpload(null); }}
            aria-label="Remove file"
          >
            <XIcon className="size-3" aria-hidden="true" />
          </button>
        </div>
      </div>
    )}
  </div>
</div>
</div>
      </div>
      {error && (
        <div className="text-destructive flex items-center gap-1 text-xs" role="alert">
          <AlertCircleIcon className="size-3 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}