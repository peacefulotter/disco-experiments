import fs from "fs/promises";

export async function POST(req: Request) {
  const save = await req.json();
  const res = await fs.writeFile('./save.json', JSON.stringify(save))
  return Response.json(res);
}
