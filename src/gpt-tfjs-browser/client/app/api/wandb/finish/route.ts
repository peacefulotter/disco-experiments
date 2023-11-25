import { wandb } from "@wandb/sdk";

export async function POST(req: Request) {
  await wandb.finish();
  return Response.json("");
}
