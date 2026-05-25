import multer from "multer";
import { HttpException } from "../core/HttpException";

const imageMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

export const createImageUpload = (options?: {
  fieldName?: string;
  maxFiles?: number;
  maxFileSizeMb?: number;
}) => {
  const fieldName = options?.fieldName ?? "images";
  const maxFiles = options?.maxFiles ?? 10;
  const maxFileSizeMb = options?.maxFileSizeMb ?? 5;

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      files: maxFiles,
      fileSize: maxFileSizeMb * 1024 * 1024,
    },
    fileFilter: (_req, file, cb) => {
      if (!imageMimeTypes.has(file.mimetype)) {
        return cb(new HttpException(400, "Only image files can be uploaded."));
      }
      cb(null, true);
    },
  });

  return upload.array(fieldName, maxFiles);
};
