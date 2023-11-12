import fs from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  const save = await req.json();
  const json = JSON.stringify(save, null, 4)
  const p = path.join(process.cwd(), 'save.json')
  await fs.writeFile(p, json, 'utf-8')
  return Response.json("ok");
}
