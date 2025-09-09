import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const FILEDATA_DIR = path.join(process.cwd(), "filedata");
const UPLOAD_DIR = path.join(FILEDATA_DIR, "uploads");

function getTimestampUUID(ext: string) {
  return `${Date.now()}-${Math.floor(Math.random() * 100000)}.${ext}`;
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const chunk = form.get("chunk") as File | null;
    let filename = (form.get("filename") as string | null) || null;
    const chunkIndexStr = form.get("chunkIndex") as string | null;
    const totalChunksStr = form.get("totalChunks") as string | null;

    if (!chunk || chunk.size === 0) {
      return NextResponse.json(
        { error: "Missing file chunk" },
        { status: 400 }
      );
    }
    if (!chunkIndexStr || !totalChunksStr) {
      return NextResponse.json(
        { error: "Missing chunk indexes" },
        { status: 400 }
      );
    }

    // Ensure directories exist
    if (!fs.existsSync(FILEDATA_DIR))
      fs.mkdirSync(FILEDATA_DIR, { recursive: true });
    if (!fs.existsSync(UPLOAD_DIR))
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });

    // Determine extension and ensure filename present
    let ext = path.extname(filename || "").replace(".", "");
    if (!ext) {
      const original = (chunk as any).name as string | undefined;
      if (original && original.includes(".")) {
        ext = original.split(".").pop() as string;
      } else {
        ext = "bin";
      }
    }
    if (!filename) filename = getTimestampUUID(ext);

    const baseName = filename.replace(/\.[^/.]+$/, "");
    const chunkFolder = path.join(UPLOAD_DIR, `${baseName}_chunks`);
    if (!fs.existsSync(chunkFolder))
      fs.mkdirSync(chunkFolder, { recursive: true });

    // Write this chunk
    const buffer = Buffer.from(await chunk.arrayBuffer());
    const chunkPath = path.join(chunkFolder, `chunk_${chunkIndexStr}`);
    fs.writeFileSync(chunkPath, buffer);

    const idx = parseInt(chunkIndexStr, 10);
    const total = parseInt(totalChunksStr, 10);

    if (idx + 1 === total) {
      // Join chunks
      const finalPath = path.join(UPLOAD_DIR, filename);
      const ws = fs.createWriteStream(finalPath);
      try {
        for (let i = 0; i < total; i++) {
          const part = path.join(chunkFolder, `chunk_${i}`);
          if (!fs.existsSync(part)) {
            return NextResponse.json(
              { error: `Missing chunk_${i}` },
              { status: 500 }
            );
          }
          const data = fs.readFileSync(part);
          ws.write(data);
        }
        ws.end();
        await new Promise<void>((resolve, reject) => {
          ws.on("finish", () => resolve());
          ws.on("error", reject);
        });
      } finally {
        try {
          fs.rmSync(chunkFolder, { recursive: true, force: true });
        } catch {}
      }

      // Return relative path to be used with your /api/filedata route
      const relative = path.posix.join("uploads", filename);
      return NextResponse.json({ success: true, filename: relative });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Upload failed" },
      { status: 500 }
    );
  }
}
