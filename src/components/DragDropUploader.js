import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { ImageUpIcon, XIcon, AlertCircleIcon } from "lucide-react";

export default function DragDropUploader({ onFileUpload }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    if (fileRejections.length > 0) {
      setError("File type not accepted or file too large (max 50MB)");
      return;
    }
    setError("");
    setFile(acceptedFiles[0]);
    onFileUpload(acceptedFiles[0]);
  }, [onFileUpload]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: false // Changed to false since you're only handling one file
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <div
          {...getRootProps()}
          role="button"
          tabIndex={0}
          style={{
            border: "2px dashed rgb(149, 120, 65)",
            borderRadius: "12px",
            padding: "40px 20px",
            textAlign: "center",
            background: "rgba(149, 120, 65, 0.05)",
            transition: "all 0.3s ease",
            cursor: "pointer",
            minHeight: "200px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            width: "100%",
            maxWidth: "400px",
            margin: "0 auto",
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
                Supported: PDF, DOC, DOCX, PPT, PPTX, TXT • Max size: 50MB
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