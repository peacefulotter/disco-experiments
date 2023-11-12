import fs from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  const { dir, file } = await req.json();
  console.log(path.join(dir, file));
  const content = await fs.readFile(path.join(dir, file), {
    encoding: "utf8",
  });
  return Response.json({ content });
}
